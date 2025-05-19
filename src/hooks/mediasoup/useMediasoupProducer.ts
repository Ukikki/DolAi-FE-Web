import { useEffect, useRef } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  device: Device;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  isMicOn: boolean;
}

export function useMediasoupProducer({
  socket,
  device,
  videoRef,
  isCameraOn,
  isMicOn,
}: Props) {
  const sendTransportRef = useRef<any>(null);
  const videoProducerRef = useRef<any>(null);
  const audioProducerRef = useRef<any>(null);
  const isTransportConnectedRef = useRef(false);

  // 초기 transport + producer 설정
  useEffect(() => {
    if (!socket || !device) return;
    let isMounted = true;

    const init = async () => {
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

      sendTransport.on("produce", ({ kind, rtpParameters, appData }, callback) => {
        socket.emit("transport-produce", { kind, rtpParameters, appData }, (res: { id: string }) => {
          callback({ id: res.id });
        });
      });
    };

    init();

    return () => {
      isMounted = false;

      videoProducerRef.current?.close();
      audioProducerRef.current?.close();
      sendTransportRef.current?.close();
      videoProducerRef.current = null;
      audioProducerRef.current = null;
      sendTransportRef.current = null;
      isTransportConnectedRef.current = false;
    };
  }, [socket, device]);

  // 카메라 토글
  useEffect(() => {
    const transport = sendTransportRef.current;
    const producer = videoProducerRef.current;
    if (!transport) return;

    if (isCameraOn) {
      if (producer) {
        producer.resume();
      } else {
        produceVideo();
      }
    } else {
      producer?.pause();
    }
  }, [isCameraOn]);

  // 마이크 토글
  useEffect(() => {
    const transport = sendTransportRef.current;
    const producer = audioProducerRef.current;
    if (!transport) return;

    if (isMicOn) {
      if (producer) {
        producer.resume();
        socket.emit("audio-toggle", { enabled: true });
      } else {
        produceAudio();
      }
    } else {
      producer?.pause();
      socket.emit("audio-toggle", { enabled: false });
    }
  }, [isMicOn]);

  // 영상 producer 생성
  const produceVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 16 / 9,
          width: { ideal: 640 },
          facingMode: "user"
        },
        audio: false
      });

      const track = stream.getVideoTracks()[0];

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("canplay", function handler() {
          videoRef.current?.play().catch(err => console.warn("🎥 play 에러:", err));
          videoRef.current?.removeEventListener("canplay", handler);
        });
      }

      videoProducerRef.current?.close();
      const producer = await sendTransportRef.current.produce({
        track,
        appData: { mediaTag: "camera" }
      });
      videoProducerRef.current = producer;

      producer.on("trackended", () => {
        console.log("📵 video track ended");
        producer.close();
        videoProducerRef.current = null;
      });
    } catch (e) {
      console.error("🎥 produceVideo error", e);
    }
  };

  // 오디오 producer 생성 (+ AudioContext로 로컬 스피커 출력)
  const produceAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];

      // ✅ 로컬 오디오도 브라우저로 출력
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(new MediaStream([track]));
      source.connect(audioContext.destination); // 소리 출력

      audioProducerRef.current?.close();
      const producer = await sendTransportRef.current.produce({
        track,
        appData: { mediaTag: "mic" }
      });
      audioProducerRef.current = producer;

      socket.emit("audio-toggle", { enabled: true });

      producer.on("trackended", () => {
        console.log("🔇 audio track ended");
        producer.close();
        audioProducerRef.current = null;
      });
    } catch (e) {
      console.error("🎙️ produceAudio error", e);
    }
  };
}
