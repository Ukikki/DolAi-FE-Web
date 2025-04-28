import { useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { useUser } from "@/hooks/useUser";

interface SttLog {
  speaker: string;
  text: string;
}

interface SttListenerProps {
  meetingId: string;
  onReceive?: (log: SttLog) => void;
}

const SttListener: React.FC<SttListenerProps> = ({ meetingId, onReceive }) => {
  const { user } = useUser();

  useEffect(() => {
    if (!user || !meetingId) return;

    const socket = new SockJS("http://localhost:8081/ws-stt");
    const stompClient = over(socket);

    stompClient.connect({}, () => {
      console.log("🎙️ STT 소켓 연결됨");

      stompClient.subscribe(`/topic/stt/${meetingId}`, (message) => {
        const data = JSON.parse(message.body);
        console.log("📝 STT 메시지:", data);
        onReceive?.(data);
      });
    });

    return () => {
      stompClient.disconnect(() => {
        console.log("🛑 STT WebSocket 연결 종료");
      });
    };
  }, [user, meetingId]);

  return null;
};

export default SttListener;
