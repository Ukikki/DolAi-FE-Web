import { useEffect, useRef } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

interface ProducerInfo {
  producerId: string;
  peerId: string;
  name: string;
}

interface Props {
  socket: Socket;
  device: Device;
  onStream: (stream: MediaStream, name: string, peerId: string) => void;
  myUserId: string; // 로그인한 사용자 ID
}

export function useMediasoupConsumer({ socket, device, onStream, myUserId }: Props) {
  const consumedProducers = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!socket || !device) return;

    console.log("🎬 useMediasoupConsumer 초기화됨");
    consumedProducers.current.clear();
    

    const run = async ({ producerId, peerId, name }: ProducerInfo) => {
      if (peerId === myUserId) {
        console.log("⛔ 내 producer라 skip");
        return;
      }

      const already = consumedProducers.current.get(peerId);
      if (already === producerId) {
        console.log(`🔁 중복 run 방지됨: peerId=${peerId}, producerId=${producerId}`);
        return;
      }

      consumedProducers.current.set(peerId, producerId);
      console.log(`📡 run() 시작 → peerId=${peerId}, producerId=${producerId}`);

      try {
        // consumer transport 생성
        const { params: transportParams } = await new Promise<any>((resolve) => {
          socket.emit("createWebRtcTransport", { consumer: true }, resolve);
        });
        console.log("🚚 consumer transport 생성 완료:", transportParams.id);

        const recvTransport = device.createRecvTransport(transportParams);

        recvTransport.on("connect", ({ dtlsParameters }, callback) => {
          console.log("🔐 consumer transport connect 요청");
          socket.emit("transport-recv-connect", {
            dtlsParameters,
            serverConsumerTransportId: recvTransport.id,
          });
          callback();
        });

        // consume 요청
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

        if (consumeParams?.error) {
          console.warn("❌ consume 실패:", consumeParams.error);
          return;
        }

        const consumer = await recvTransport.consume({
          id: consumeParams.id,
          producerId: consumeParams.producerId,
          kind: consumeParams.kind,
          rtpParameters: consumeParams.rtpParameters,
        });

        const stream = new MediaStream([consumer.track]);
        console.log(`🎥 stream 생성 완료 → peerId=${peerId}, name=${name}`);
        onStream(stream, name, peerId);

        socket.emit("consumer-resume", {
          serverConsumerId: consumeParams.serverConsumerId,
        });

        console.log(`✅ 소비자 연결 완료 → peerId=${peerId}, producerId=${producerId}`);
      } catch (err) {
        console.error("❌ consumer 연결 중 에러:", err);
      }
    };

    // 기존 producer 목록 가져와서 run()
    socket.emit("getProducers", (producers: ProducerInfo[]) => {
      //console.log("📦 getProducers 수신:", producers);
      producers.forEach(run);
    });

    // 새로운 producer 등장 시 run()
    socket.on("new-producer", (info: ProducerInfo) => {
      console.log("📥 new-producer 수신:", info);
      run(info);
    });

    return () => {
      socket.off("new-producer");
      console.log("🧹 useMediasoupConsumer cleanup");
    };
  }, [socket, device, onStream, myUserId]);
}