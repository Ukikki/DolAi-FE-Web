import { useEffect } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  rtpCapabilities: any;
  onStream: (stream: MediaStream, name: string, peerId: string) => void;
}

export function useMediasoupConsumer({ socket, rtpCapabilities, onStream }: Props) {
  useEffect(() => {
    const run = async (producerInfo: { producerId: string; peerId: string; name: string }) => {
      const { producerId, peerId, name } = producerInfo;

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

      const stream = new MediaStream([consumer.track]);
      onStream(stream, name, peerId);

      socket.emit("consumer-resume", {
        serverConsumerId: consumeParams.serverConsumerId,
      });

      console.log("✅ 소비자 연결 완료:", producerId);
    };

    if (socket && rtpCapabilities) {
      // 기존 프로듀서
      socket.emit("getProducers", (producers: { producerId: string; peerId: string; name: string }[]) => {
        for (const p of producers) run(p);
      });

      // 새 프로듀서
      socket.on("new-producer", (info: { producerId: string; peerId: string; name: string }) => {
        console.log("📡 새 프로듀서 발견:", info);
        run(info);
      });
    }
  }, [socket, rtpCapabilities]);
}