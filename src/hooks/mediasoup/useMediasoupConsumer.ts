import { useEffect, useRef } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

export type MediaKind = "audio" | "video" | "board" | "screen";

interface ProducerInfo {
  producerId: string;
  peerId: string;
  name: string;
  kind: MediaKind;
  mediaTag: string;
}

interface Props {
  socket: Socket;
  device: Device;
  onStream: (
    stream: MediaStream,
    name: string,
    peerId: string,
    kind: MediaKind,
    mediaTag: string
  ) => void;
  myUserId: string;
  allowedTags: string[];
}

export function useMediasoupConsumer({
  socket,
  device,
  onStream,
  myUserId,
  allowedTags,
}: Props) {
  const consumedMap = useRef<Map<string, string>>(new Map()); // key: peerId-mediaTag

  useEffect(() => {
    if (!socket || !device) return;

    const run = async ({
      producerId,
      peerId,
      name,
      kind,
      mediaTag,
    }: ProducerInfo) => {
      // 내 producer는 consume 안 함
      if (peerId === myUserId) return;

      // consume 허용된 태그가 아닌 경우 skip
      if (!allowedTags.includes(mediaTag)) return;

      const key = `${peerId}-${mediaTag}`;

      // 이미 같은 producerId를 consume했으면 skip
      if (consumedMap.current.get(key) === producerId) {
        console.log(`🔁 이미 consume한 producer: ${producerId}`);
        return;
      }

      consumedMap.current.set(key, producerId);

      try {
        const { params: transportParams } = await new Promise<any>((resolve) => {
          socket.emit("createWebRtcTransport", { consumer: true }, resolve);
        });

        const recvTransport = device.createRecvTransport(transportParams);

        recvTransport.on("connect", ({ dtlsParameters }, callback: () => void) => {
          socket.emit("transport-recv-connect", {
            dtlsParameters,
            serverConsumerTransportId: recvTransport.id,
          });
          callback();
        });

        const { params: consumeParams } = await new Promise<any>((resolve) => {
          socket.emit(
            "consume",
            {
              rtpCapabilities: device.rtpCapabilities,
              remoteProducerId: producerId,
              serverConsumerTransportId: recvTransport.id,
            },
            resolve
          );
        });

        const consumer = await recvTransport.consume({
          id: consumeParams.id,
          producerId: consumeParams.producerId,
          kind: consumeParams.kind,
          rtpParameters: consumeParams.rtpParameters,
        });

        const stream = new MediaStream([consumer.track]);

        // 디버깅 로그
        console.log("▶️ onStream 호출 직전:", {
          producerId,
          peerId,
          kind,
          mediaTag,
          stream,
        });

        onStream(stream, name, peerId, kind, mediaTag);

        socket.emit("consumer-resume", {
          serverConsumerId: consumeParams.serverConsumerId,
        });

        console.log(`✅ 소비자 연결 완료 → peerId=${peerId}, kind=${kind}, tag=${mediaTag}`);
      } catch (err) {
        console.error("❌ consumer 연결 중 에러:", err);
      }
    };

    // 최초 producer 목록 받아서 consume 시도
    socket.emit("getProducers", (producers: ProducerInfo[]) => {
      console.log("📦 getProducers 수신:", producers);
      producers.forEach(run);
    });

    // 새 producer 등장 시 consume 시도
    socket.on("new-producer", run);

    return () => {
      socket.off("new-producer", run);
      console.log("🧹 useMediasoupConsumer cleanup");
    };
  }, [socket, device, onStream, myUserId, allowedTags]);
}
