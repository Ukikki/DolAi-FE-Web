import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface JoinRoomResult {
  socket: Socket;
  rtpCapabilities: any;
}

export function useMediasoupSocket(roomId: string, sfuIp: string) {
  const [connection, setConnection] = useState<JoinRoomResult | null>(null);

  useEffect(() => {
    const socket = io(`https://${sfuIp}:3000/mediasoup`, {
      transports: ["websocket"],
    });

    const connect = async () => {
      await new Promise((resolve) => {
        if (socket.connected) return resolve(true);
        socket.on("connect", () => resolve(true));
      });

      socket.emit("joinRoom", { roomName: roomId }, ({ rtpCapabilities }: { rtpCapabilities: any }) => {
        setConnection({ socket, rtpCapabilities });
        console.log("🎥 mediasoup 소켓 연결됨");
      });
    };

    connect();

    return () => {
      socket.disconnect();
    };
  }, [roomId, sfuIp]);

  return connection; 
}