import { useEffect, useRef } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  device: Device;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  isMicOn: boolean;
  isBoardOn: boolean;
  isScreenOn: boolean;
}

export function useMediasoupProducer({
  socket,
  device,
  videoRef,
  isCameraOn,
  isMicOn,
  isBoardOn,
  isScreenOn,
}: Props) {
  const sendTransportRef = useRef<any>(null);
  const producerRefs = useRef<Record<string, any>>({});
  const isTransportConnectedRef = useRef(false);
  const screenProduceLock = useRef(false); // 화면 공유 중복 방지용

  // transport 초기화
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
      Object.values(producerRefs.current).forEach((p) => p?.close());
      sendTransportRef.current?.close();
      sendTransportRef.current = null;
      producerRefs.current = {};
      isTransportConnectedRef.current = false;
    };
  }, [socket, device]);

  // Producer 생성 함수
  const createProducer = async (mediaTag: string, constraints: MediaStreamConstraints) => {
    try {
      if (!sendTransportRef.current) {
        console.warn(`⚠️ sendTransport 준비 안됨`);
        return;
      }

      if (producerRefs.current[mediaTag]) {
        console.warn(`⚠️ 이미 ${mediaTag} producer 있음`);
        return;
      }

      if (mediaTag === "screen" && screenProduceLock.current) return;
      if (mediaTag === "screen") screenProduceLock.current = true;

      let stream: MediaStream;
      if (mediaTag === "camera") {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            aspectRatio: 16 / 9,
            width: { ideal: 640 },
            facingMode: "user",
          },
          audio: false,
        });
        console.log(`🎥 카메라 stream 생성됨`, stream);
      } else if (mediaTag === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      const track =
        mediaTag === "mic" ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

      if (!track || track.readyState === "ended") {
        console.warn(`⚠️ ${mediaTag} 트랙이 유효하지 않음`);
        return;
      }

      if (mediaTag === "camera" && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch((err) => console.warn("🎥 play error:", err));
      }

      const producer = await sendTransportRef.current.produce({
        track,
        appData: { mediaTag },
      });

      console.log(`📤 producer 생성됨: ${mediaTag}`, producer);

      producerRefs.current[mediaTag] = producer;

      producer.on("trackended", () => {
        console.log(`🔌 track ended: ${mediaTag}`);
        producer.close();
        producerRefs.current[mediaTag] = null;
      });

      if (mediaTag === "mic") {
        socket.emit("audio-toggle", { enabled: true });
      }
    } catch (e) {
      console.error(`❌ produce ${mediaTag} error`, e);
    } finally {
      if (mediaTag === "screen") screenProduceLock.current = false;
    }
  };

  const toggleProducer = (mediaTag: string, isOn: boolean, constraints: MediaStreamConstraints) => {
    const producer = producerRefs.current[mediaTag];
    if (!sendTransportRef.current) return;

    if (isOn) {
      if (producer) {
        producer.resume();
      } else {
        createProducer(mediaTag, constraints);
      }
    } else {
      producer?.pause();
      if (mediaTag === "mic") socket.emit("audio-toggle", { enabled: false });
    }
  };

  useEffect(() => toggleProducer("camera", isCameraOn, { video: true }), [isCameraOn]);
  useEffect(() => toggleProducer("mic", isMicOn, { audio: true }), [isMicOn]);
  useEffect(() => toggleProducer("board", isBoardOn, { video: true }), [isBoardOn]);
  useEffect(() => toggleProducer("screen", isScreenOn, { video: true }), [isScreenOn]);
}