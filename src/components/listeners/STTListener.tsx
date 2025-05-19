import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, over } from "stompjs";
import { useUser } from "@/hooks/user/useUser";
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

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
  const stompClientRef = useRef<Client | null>(null);
  const onReceiveRef = useRef<((log: SttLog) => void) | undefined>(undefined);

  useEffect(() => {
    onReceiveRef.current = onReceive;
  }, [onReceive]);

  useEffect(() => {
    if (!user || !meetingId) return;

    const socket = new SockJS(`${VITE_BASE_URL}/ws-stt`);
    const stompClient = over(socket);
    stompClientRef.current = stompClient;
    let subscription: any;

    stompClient.connect({}, () => {
      console.log("🎙️ STT 소켓 연결됨");

      subscription = stompClient.subscribe(`/topic/stt/${meetingId}`, (message) => {
        const data: SttLog = JSON.parse(message.body);
        console.log("📝 STT 메시지:", data);
        onReceiveRef.current?.(data);
      });
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe(); // ✅ 중복 구독 해제
      }
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect(() => {
          console.log("🛑 STT WebSocket 연결 종료");
        });
      }
    };
  }, [user, meetingId]); // ⚠️ onReceive는 빠짐

  return null;
};

export default SttListener;