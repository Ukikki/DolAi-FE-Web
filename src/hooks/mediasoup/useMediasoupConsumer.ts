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
    const run = async (producerId: string) => {
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
      onStream(stream);
  
      socket.emit("consumer-resume", {
        serverConsumerId: consumeParams.serverConsumerId,
      });
  
      console.log("✅ 소비자 연결 완료:", producerId);
    };
  
    if (socket && rtpCapabilities) {
      // 처음 들어왔을 때 기존 Producer들 받아오기
      socket.emit("getProducers", (producerIds: string[]) => {
        for (const pid of producerIds) run(pid);
      });
  
      // 🔥 여기! 새 Producer 들어오면 즉시 consume
      socket.on("new-producer", ({ producerId }) => {
        console.log("📡 새 프로듀서 발견:", producerId);
        run(producerId);
      });
    }
  }, [socket, rtpCapabilities]);
}  