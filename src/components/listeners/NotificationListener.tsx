import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, over } from "stompjs";
import { useUser } from "@/hooks/user/useUser";
import { useToast } from "@/hooks/useToast";

const NotificationListener = () => {
  const { user } = useUser();
  const { addToast } = useToast();
  const stompClientRef = useRef<Client | null>(null);
  const subscribedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!user) return;
    if (stompClientRef.current?.connected && subscribedRef.current) return;

    const socket = new SockJS("http://localhost:8081/ws-notification");
    const stompClient = over(socket);
    stompClientRef.current = stompClient;
    subscribedRef.current = false;

    stompClient.connect({}, () => {
      if (!subscribedRef.current) {
        console.log("🔔 알림 소켓 연결됨");
        stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("🔔 알림:", data);
          addToast(data.title, data.category, data.url);
        });
        subscribedRef.current = true;
      }
    });

    return () => {
      // 연결된 경우에만 종료 시도
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect(() => {
          console.log("🛑 WebSocket 연결 종료");
        });
      }
    };
  }, [user]);

  return null;
};

export default NotificationListener;
