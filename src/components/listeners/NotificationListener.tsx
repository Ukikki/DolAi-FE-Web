import { useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";

const NotificationListener = () => {
  const { user } = useUser();
  const { addToast } = useToast();

  useEffect(() => {
    if (!user) return;

    const socket = new SockJS("http://localhost:8081/ws-notification");
    const stompClient = over(socket);

    stompClient.connect({}, () => {
      console.log("🔔 알림 소켓 연결됨");

      stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
        const data = JSON.parse(message.body);
        console.log("🔔 알림:", data);
        addToast(data.title, data.category);
      });
    });

    return () => {
      stompClient.disconnect(() => {
        console.log("🛑 WebSocket 연결 종료");
      });
    };
  }, [user]);

  return null;
};

export default NotificationListener;
