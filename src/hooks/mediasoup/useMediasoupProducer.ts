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
    if (!socket || !rtpCapabilities || (!isCameraOn && !isMicOn)) return;

    const init = async () => {
      const device = new Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      deviceRef.current = device;

      const { params } = await new Promise<any>((resolve) => {
        socket.emit("createWebRtcTransport", { consumer: false }, resolve);
      });

      const sendTransport = device.createSendTransport(params);
      sendTransportRef.current = sendTransport;

      sendTransport.on("connect", ({ dtlsParameters }, callback) => {
        socket.emit("transport-connect", { dtlsParameters });
        callback();
      });

      sendTransport.on("produce", ({ kind, rtpParameters }, callback) => {
        socket.emit("transport-produce", { kind, rtpParameters }, (res: { id: string }) => {
          callback({ id: res.id });
        });
      });

      if (isCameraOn) await produceVideo();
      if (isMicOn) await produceAudio();
    };

    init();

    return () => {
      videoProducerRef.current?.close();
      audioProducerRef.current?.close();
      sendTransportRef.current?.close();
    };
  }, [socket, rtpCapabilities, isCameraOn, isMicOn]);

  useEffect(() => {
    if (!sendTransportRef.current || !deviceRef.current) return;
    if (isMicOn) produceAudio();
    else {
      audioProducerRef.current?.close();
      audioProducerRef.current = null;
    }
  }, [isMicOn]);

  useEffect(() => {
    if (!sendTransportRef.current || !deviceRef.current) return;
    if (isCameraOn) produceVideo();
    else {
      videoProducerRef.current?.close();
      videoProducerRef.current = null;
    }
  }, [isCameraOn]);

  const produceVideo = async () => {
    if (videoProducerRef.current) return; // 중복 방지

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    if (videoRef.current) videoRef.current.srcObject = stream;

    const producer = await sendTransportRef.current.produce({ track });
    videoProducerRef.current = producer;
  };

  const produceAudio = async () => {
    if (audioProducerRef.current) return; // 중복 방지

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const track = stream.getAudioTracks()[0];

    const producer = await sendTransportRef.current.produce({ track });
    audioProducerRef.current = producer;
  };
}