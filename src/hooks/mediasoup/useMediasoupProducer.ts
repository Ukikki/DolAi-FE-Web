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
      Object.values(producerRefs.current).forEach((producer) => producer?.close());
      sendTransportRef.current?.close();
      producerRefs.current = {};
      sendTransportRef.current = null;
      isTransportConnectedRef.current = false;
    };
  }, [socket, device]);

  const createProducer = async (mediaTag: string, constraints: MediaStreamConstraints) => {
    try {
      let stream;
      if (mediaTag === "camera") {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            aspectRatio: 16 / 9,
            width: { ideal: 640 },
            facingMode: "user",
          },
          audio: false,
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      const track =
        mediaTag === "mic" ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

      if (mediaTag === "camera" && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("canplay", function handler() {
          videoRef.current?.play().catch((err) => console.warn("🎥 play 에러:", err));
          videoRef.current?.removeEventListener("canplay", handler);
        });
      }

      const producer = await sendTransportRef.current.produce({
        track,
        appData: { mediaTag },
      });
      producerRefs.current[mediaTag] = producer;

      producer.on("trackended", () => {
        console.log(`🔌 track ended: ${mediaTag}`);
        producer.close();
        producerRefs.current[mediaTag] = null;
      });

      if (mediaTag === "mic") {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(new MediaStream([track]));
        source.connect(audioContext.destination);
        socket.emit("audio-toggle", { enabled: true });
      }
    } catch (e) {
      console.error(`❌ produce ${mediaTag} error`, e);
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