import { useEffect, useRef } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  device: Device;
  stream: MediaStream;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  isMicOn: boolean;
}

export function useMediasoupProducer({
  socket,
  device,
  videoRef,
  stream,
  isCameraOn,
  isMicOn,
}: Props) {
  const sendTransportRef = useRef<any>(null);
  const videoProducerRef = useRef<any>(null);
  const audioProducerRef = useRef<any>(null);
  const isTransportConnectedRef = useRef(false);
  const isProducingAudioRef = useRef(false);

  useEffect(() => {
    if (!socket || !device) return;
    let isMounted = true;

    const init = async () => {
      console.log("🛠️ [useMediasoupProducer] transport 생성 요청");
      const { params } = await new Promise<any>((resolve) => {
        socket.emit("createWebRtcTransport", { consumer: false }, resolve);
      });
      if (!isMounted) return;

      const sendTransport = device.createSendTransport(params);
      sendTransportRef.current = sendTransport;

      console.log("🚀 [useMediasoupProducer] sendTransport 생성 완료");

      sendTransport.on("connect", ({ dtlsParameters }, callback) => {
        if (!isTransportConnectedRef.current) {
          console.log("🔗 [transport] connect 요청 전송");
          socket.emit("transport-connect", {
            dtlsParameters,
            transportId: sendTransport.id,
          });
          isTransportConnectedRef.current = true;
        }
        callback();
      });

      sendTransport.on("produce", ({ kind, rtpParameters }, callback) => {
        console.log(`📤 [transport] produce 요청: kind=${kind}`);
        socket.emit(
          "transport-produce",
          { kind, rtpParameters, appData: { mediaTag: kind === "audio" ? "mic" : "cam" } },
          (res: { id: string }) => {
            callback({ id: res.id });
          }
        );
      });
    };

    init();

    return () => {
      isMounted = false;
      console.log("🧹 [useMediasoupProducer] 정리 중");
      videoProducerRef.current?.close();
      audioProducerRef.current?.close();
      sendTransportRef.current?.close();
      videoProducerRef.current = null;
      audioProducerRef.current = null;
      sendTransportRef.current = null;
      isTransportConnectedRef.current = false;
    };
  }, [socket, device]);

  useEffect(() => {
    const transport = sendTransportRef.current;
    const producer = videoProducerRef.current;
    if (!transport) return;

    if (isCameraOn) {
      console.log("🎥 [카메라] ON 요청");
      if (producer) {
        producer.resume();
      } else {
        produceVideo();
      }
    } else {
      producer?.pause();
    }
  }, [isCameraOn]);

  useEffect(() => {
    const transport = sendTransportRef.current;
    const producer = audioProducerRef.current;
    if (!transport) return;

    if (isMicOn) {
      console.log("🎙️ [마이크] ON 요청");
      if (producer) {
        producer.resume();
        console.log("🎙️ 이미 생성된 producer resume");
        socket.emit("audio-toggle", { enabled: true });
      } else {
        produceAudio();
      }
    } else {
      console.log("🎙️ [마이크] OFF 요청");
      if (producer) {
        producer.pause();
        socket.emit("audio-toggle", { enabled: false });
      } else if (isProducingAudioRef.current) {
        console.warn("⏳ audioProducer 생성 중 → OFF emit 대기 처리");
        const interval = setInterval(() => {
          if (audioProducerRef.current) {
            audioProducerRef.current.pause();
            socket.emit("audio-toggle", { enabled: false });
            clearInterval(interval);
          }
        }, 200);
      } else {
        console.warn("❗ audioProducer 없어서 OFF emit 생략");
      }
    }
  }, [isMicOn]);

  const produceVideo = async () => {
    try {
      const track = stream.getVideoTracks()[0];

      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([track]);
        videoRef.current.addEventListener("canplay", function handler() {
          videoRef.current?.play().catch((err) => console.warn("🎥 play 에러:", err));
          videoRef.current?.removeEventListener("canplay", handler);
        });
      }

      videoProducerRef.current?.close();
      const producer = await sendTransportRef.current.produce({ track, trace: true });
      videoProducerRef.current = producer;

      console.log("✅ [카메라] producer 생성 완료");

      producer.on("trackended", () => {
        console.log("📵 [카메라] track ended");
        producer.close();
        videoProducerRef.current = null;
      });
    } catch (e) {
      console.error("🎥 produceVideo error", e);
    }
  };

  const produceAudio = async () => {
    try {
      if (!stream || !stream.getAudioTracks || stream.getAudioTracks().length === 0) {
        console.error("❌ 스트림에서 오디오 트랙을 찾을 수 없습니다.");
        return;
      }

      isProducingAudioRef.current = true;

      const track = stream.getAudioTracks()[0];
      console.log("🎙️ 트랙 enabled:", track.enabled);
      console.log("🎙️ 트랙 readyState:", track.readyState);
      console.log("🎙️ 트랙 mute:", track.muted);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(new MediaStream([track]));
      source.connect(audioContext.destination);

      audioProducerRef.current?.close();
      const producer = await sendTransportRef.current.produce({ track, trace: true });
      audioProducerRef.current = producer;

      console.log("✅ [마이크] producer 생성 완료");

      socket.emit("audio-toggle", { enabled: true });

      producer.on("trace", (trace: any) => {
        console.log("📡 [Producer Trace]", trace);
      });

      producer.on("trackended", () => {
        console.log("🔇 [마이크] track ended");
        producer.close();
        audioProducerRef.current = null;
      });
    } catch (e) {
      console.error("🎙️ produceAudio error", e);
    } finally {
      isProducingAudioRef.current = false;
    }
  };
}