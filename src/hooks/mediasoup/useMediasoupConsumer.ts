import { useEffect } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  rtpCapabilities: any;
  onStream: (stream: MediaStream) => void;
}

export function useMediasoupConsumer({ socket, rtpCapabilities, onStream }: Props) {
  useEffect(() => {
    const run = async () => {

      // 참가자들 ID 받아오기
      const producerIds: string[] = await new Promise((resolve) => {
        socket.emit("getProducers", resolve);
      });

      console.log("📦 받아올 producer 목록:", producerIds);

      for (const producerId of producerIds) {
        const { params } = await new Promise<any>((resolve) => {
          socket.emit("createWebRtcTransport", { consumer: true }, resolve);
        });

        const device = new Device();
        if (!device.loaded) {
          await device.load({ routerRtpCapabilities: rtpCapabilities });
        }

        const recvTransport = device.createRecvTransport(params);

        recvTransport.on("connect", ({ dtlsParameters }, callback) => {
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
              rtpCapabilities,
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

        // 스트림 구성 & video 태그에 붙이기
        const stream = new MediaStream([consumer.track]);
        onStream(stream);

        // 재생
        socket.emit("consumer-resume", {
          serverConsumerId: consumeParams.serverConsumerId,
        });

        console.log("✅ 소비자 연결 완료:", producerId);
      }
    };

    if (socket && rtpCapabilities) {
      run();
    }
  }, [socket, rtpCapabilities]);
}