import { useEffect, useRef } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

type MediaKind = "audio" | "video" | "board" | "screen";

interface ProducerInfo {
  producerId: string;
  peerId: string;
  name: string;
  kind: MediaKind;
}

interface Props {
  socket: Socket;
  device: Device;
  onStream: (stream: MediaStream, name: string, peerId: string, kind: MediaKind) => void;
  myUserId: string;
}

export function useMediasoupConsumer({ socket, device, onStream, myUserId }: Props) {
  const consumedMap = useRef<Map<string, string>>(new Map()); // key: peerId-kind

  useEffect(() => {
    if (!socket || !device) return;

    const run = async ({ producerId, peerId, name, kind }: ProducerInfo) => {
      if (peerId === myUserId) return;

      const key = `${peerId}-${kind}`;
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

        recvTransport.on("connect", ({ dtlsParameters }, callback) => {
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
        onStream(stream, name, peerId, kind);

        socket.emit("consumer-resume", {
          serverConsumerId: consumeParams.serverConsumerId,
        });

        console.log(`✅ 소비자 연결 완료 → peerId=${peerId}, kind=${kind}`);
      } catch (err) {
        console.error("❌ consumer 연결 중 에러:", err);
      }
    };

    socket.emit("getProducers", (producers: ProducerInfo[]) => {
      console.log("📦 getProducers 수신:", producers);
      producers.forEach(run);
    });

    socket.on("new-producer", run);

    return () => {
      socket.off("new-producer", run);
      console.log("🧹 useMediasoupConsumer cleanup");
    };
  }, [socket, device, onStream, myUserId]);
}