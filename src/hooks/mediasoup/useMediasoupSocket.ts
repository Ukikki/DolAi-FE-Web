import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Device } from "mediasoup-client";

interface MediasoupConnection {
  socket: Socket;
  device: Device;
  stream: MediaStream;
  sendTransport: any;
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
    const socket = io(`https://${sfuIp}:3000/mediasoup`, {
      transports: ["websocket"],
    });

    let device: Device;
    let stream: MediaStream;

    const connect = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 360, facingMode: "user" },
      });

      socket.emit("getRouterRtpCapabilities", { roomName: roomId }, async (res: any) => {
        if (!res?.routerRtpCapabilities) {
          console.error("❌ getRouterRtpCapabilities 실패");
          return;
        }

        device = new Device();
        await device.load({ routerRtpCapabilities: res.routerRtpCapabilities });

        await joinRoomAndProduce();
      });
    };

    const joinRoomAndProduce = async () => {
      socket.emit(
        "joinRoom",
        {
          roomName: roomId,
          meetingId,
          userName,
          userId,
          rtpCapabilities: device.rtpCapabilities,
        },
        async () => {
          const audioTrack = stream.getAudioTracks()[0];

          socket.emit("createWebRtcTransport", { consumer: false }, async (res: any) => {
            const { id, iceParameters, iceCandidates, dtlsParameters } = res.params;

            const sendTransport = device.createSendTransport({
              id,
              iceParameters,
              iceCandidates,
              dtlsParameters,
            });

            sendTransport.on("connect", ({ dtlsParameters }, callback) => {
              socket.emit("transport-connect", {
                dtlsParameters,
                transportId: sendTransport.id,
              });
              callback();
            });
            sendTransport.on("produce", ({ kind, rtpParameters }, callback) => {
              if (kind !== "audio") return;
              socket.emit(
                "transport-produce",
                {
                  kind,
                  rtpParameters,
                  appData: { mediaTag: "mic" },
                },
                ({ id }: any) => {
                  callback({ id });
                  setTimeout(() => {
                    socket.emit("audio-toggle", { enabled: true });
                  }, 500);
                }
              );
            });            

            const audioProducer = await sendTransport.produce({
              track: audioTrack,
              appData: { mediaTag: "mic",  trace: true,},
            });
            
            console.log("🎙️ 마이크 produce 완료");
            
            socket.emit("audio-toggle", { enabled: true }); // ✅ 이거 꼭 넣자!!
            
            setConnection({
              socket,
              device,
              stream,
              sendTransport,
            });            

            console.log("✅ Mediasoup 연결 및 joinRoom 완료");
          });
        }
      );
    };

    // 🔄 재연결 대응 (새로고침 포함)
    socket.on("connect", async () => {
      console.log("🔌 WebSocket 재연결됨");

      if (device && stream) {
        console.log("♻️ 새로고침 후 자동 재입장 중...");
        await joinRoomAndProduce();
      } else {
        await connect();
      }
    });

    connect();

    return () => {
      socket.disconnect();
    };
  }, [roomId, sfuIp, meetingId, userName, userId]);

  return connection;
}
