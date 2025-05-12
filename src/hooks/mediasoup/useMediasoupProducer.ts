//useMediasoupProducer.js
import { useEffect, useRef } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  rtpCapabilities: any;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  isMicOn: boolean;
}

export function useMediasoupProducer({
  socket,
  rtpCapabilities,
  videoRef,
  isCameraOn,
  isMicOn,
}: Props) {
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<any>(null);
  const videoProducerRef = useRef<any>(null);
  const audioProducerRef = useRef<any>(null);
  const isTransportConnectedRef = useRef<boolean>(false); // connect 중복 방지용

  // 1) Transport & Device 초기화
  useEffect(() => {
    if (!socket || !rtpCapabilities) return;
    let isMounted = true;

    const init = async () => {
      const device = new Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      if (!isMounted) return;
      deviceRef.current = device;

      const { params } = await new Promise<any>((resolve) => {
        socket.emit("createWebRtcTransport", { consumer: false }, resolve);
      });
      if (!isMounted) return;

      const sendTransport = device.createSendTransport(params);
      sendTransportRef.current = sendTransport;

      sendTransport.on("connect", ({ dtlsParameters }, callback) => {
        if (!isTransportConnectedRef.current) {
          socket.emit("transport-connect", {
            dtlsParameters,
            transportId: sendTransport.id,
          });
          isTransportConnectedRef.current = true;
        }
        callback();
      });

      sendTransport.on("produce", ({ kind, rtpParameters }, callback) => {
        socket.emit("transport-produce", { kind, rtpParameters }, (res: { id: string }) => {
          callback({ id: res.id });
        });
      });
    };

    init();

    return () => {
      isMounted = false;
      videoProducerRef.current?.close();
      videoProducerRef.current = null;
      audioProducerRef.current?.close();
      audioProducerRef.current = null;
      sendTransportRef.current?.close();
      sendTransportRef.current = null;
      deviceRef.current = null;
      isTransportConnectedRef.current = false;
    };
  }, [socket, rtpCapabilities]);

  // 카메라 토글
  useEffect(() => {
    if (!sendTransportRef.current) return;
  
    // ✅ 처음 들어왔는데 카메라 켜져 있으면 produce
    if (isCameraOn && !videoProducerRef.current) {
      produceVideo();
    }
  
    if (!isCameraOn && videoProducerRef.current) {
      videoProducerRef.current.pause(); // 혹시 살아있다면 정지
    }
  }, [isCameraOn]);

  // 마이크 토글
  useEffect(() => {
    if (!sendTransportRef.current) return;
  
    if (isMicOn) {
      if (!audioProducerRef.current) {
        console.log("🎙️ 마이크 ON → audio producer 생성");
        produceAudio();
      } else {
        console.log("🔊 audioProducer.resume()");
        audioProducerRef.current.resume();
      }
    } else {
      console.log("🔇 마이크 OFF → 서버에 알림 + pause");
      audioProducerRef.current?.pause();
    }
  
    // 서버에 마이크 상태 전송 (Whisper 연동용)
    socket.emit("audio-toggle", { enabled: isMicOn });
  }, [isMicOn]);

  // 영상 produce
  const produceVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 16 / 9,
          width: { ideal: 640 },
          facingMode: "user"
        },
        audio: true
      });
  
      const track = stream.getVideoTracks()[0];
      if (videoRef.current) {
        videoRef.current.srcObject = stream; 
        await videoRef.current.play().catch(err => console.warn("play 에러:", err));
      }  
      if (videoProducerRef.current) {
        await videoProducerRef.current.replaceTrack({ track });
      } else {
        const producer = await sendTransportRef.current.produce({ track });
        videoProducerRef.current = producer;
      }
    } catch (e) {
      console.error("🎥 produceVideo error", e);
    }
  };  

  // 오디오 produce
  const produceAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];

      const producer = await sendTransportRef.current.produce({ track });
      audioProducerRef.current = producer;
    } catch (e) {
      console.error("🎙️ produceAudio error", e);
    }
  };
}