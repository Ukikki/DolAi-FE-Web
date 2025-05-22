import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Device } from "mediasoup-client";
import { RtpCapabilities } from "mediasoup-client/types";

interface MediasoupConnection {
  socket: Socket;
  device: Device;
  rtpCapabilities: RtpCapabilities;
}

export function useMediasoupSocket(
  roomId: string,
  sfuIp: string,
  meetingId: string,
  userName: string,
  userId: string
) {
  const [connection, setConnection] = useState<MediasoupConnection | null>(null);

  useEffect(() => {
    const socket = io(`wss://${sfuIp}:3000/mediasoup`, {
      transports: ["websocket"],
    });

    const joinRoom = (): Promise<{ rtpCapabilities: RtpCapabilities }> => {
      return new Promise((resolve, reject) => {
        socket.emit(
          "joinRoom",
          { roomName: roomId, meetingId, userName, userId },
          (response: { rtpCapabilities?: RtpCapabilities; error?: string }) => {
            if (response?.rtpCapabilities) {
              resolve({ rtpCapabilities: response.rtpCapabilities });
            } else {
              console.error("❌ joinRoom 실패:", response?.error);
              reject(new Error("joinRoom 응답 없음 또는 실패"));
            }
          }
        );
      });
    };

    const connect = async () => {
      try {
        await new Promise((resolve) => {
          if (socket.connected) return resolve(true);
          socket.on("connect", () => resolve(true));
        });

        const { rtpCapabilities } = await joinRoom();

        const device = new Device();
        await device.load({ routerRtpCapabilities: rtpCapabilities });

        setConnection({ socket, device, rtpCapabilities });
        console.log("🎥 mediasoup 연결 성공");
      } catch (err) {
        console.error("❌ mediasoup 연결 실패:", err);
        socket.disconnect();
      }
    };

    connect();

    return () => {
      socket.disconnect();
    };
  }, [roomId, sfuIp, meetingId, userName, userId]);

  return connection;
}