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

  useEffect(() => {
    if (!socket || !rtpCapabilities || typeof rtpCapabilities !== "object") return;
    if (!isCameraOn && !isMicOn) return;

    const run = async () => {
      const device = new Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      deviceRef.current = device;

      const { params } = await new Promise<any>((resolve) => {
        socket.emit("createWebRtcTransport", { consumer: false }, resolve);
      });

      // transport 생성
      const sendTransport = device.createSendTransport(params);
      sendTransportRef.current = sendTransport;

      sendTransport.on("connect", ({ dtlsParameters }, callback) => {
        socket.emit("transport-connect", { dtlsParameters });
        callback();
      });

      sendTransport.on("produce", ({ kind, rtpParameters }, callback) => {
        socket.emit("transport-produce", { kind, rtpParameters }, ( res: {id: string } ) => {
          callback({ id: res.id });
        });
      });

      if (isCameraOn) await produceVideo();
      if (isMicOn) await produceAudio();
    };

    run();

    // 언마운트
    return () => {
      videoProducerRef.current?.close();
      audioProducerRef.current?.close();
      sendTransportRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!sendTransportRef.current || !deviceRef.current) return;
    if (isCameraOn) {
      produceVideo();
    } else {
      videoProducerRef.current?.close();
      videoProducerRef.current = null;
    }
  }, [isCameraOn]);

  useEffect(() => {
    if (!sendTransportRef.current || !deviceRef.current) return;
    if (isMicOn) {
      produceAudio();
    } else {
      audioProducerRef.current?.close();
      audioProducerRef.current = null;
    }
  }, [isMicOn]);

  const produceVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    if (videoRef.current) videoRef.current.srcObject = stream;

    const producer = await sendTransportRef.current.produce({ track });
    videoProducerRef.current = producer;
  };

  const produceAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const track = stream.getAudioTracks()[0];

    const producer = await sendTransportRef.current.produce({ track });
    audioProducerRef.current = producer;
  };
}