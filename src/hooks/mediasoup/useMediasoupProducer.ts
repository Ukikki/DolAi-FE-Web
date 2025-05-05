import { useEffect } from "react";
import { Device } from "mediasoup-client";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  rtpCapabilities: any;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function useMediasoupProducer({ socket, rtpCapabilities, videoRef }: Props) {
  useEffect(() => {
    const run = async () => {
      const device = new Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });

      // 1. 캠/마이크 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 2. Transport 생성 요청
      const { params } = await new Promise<any>((resolve) => {
        socket.emit("createWebRtcTransport", { consumer: false }, resolve);
      });

      // 3. Transport 생성
      const sendTransport = device.createSendTransport(params);

      // 4. DTLS 연결
      sendTransport.on("connect", ({ dtlsParameters }, callback) => {
        socket.emit("transport-connect", { dtlsParameters });
        callback();
      });

      // 5. produce 요청
      sendTransport.on("produce", ({ kind, rtpParameters }, callback) => {
        socket.emit("transport-produce", { kind, rtpParameters }, (res: { id: string }) => {
          callback({ id : res.id });
        });
      });

      // 6. 실제 produce (트랙 전송)
      for (const track of stream.getTracks()) {
        await sendTransport.produce({ track });
      }

      console.log("🎥 캠/마이크 produce 완료!");
    };

    if (socket && rtpCapabilities) {
      run();
    }
  }, [socket, rtpCapabilities, videoRef]);
}
