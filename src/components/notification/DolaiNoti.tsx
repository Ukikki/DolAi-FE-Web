import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { notificationSocketClient } from "@/utils/socketClients";
import { useUser } from "@/hooks/user/useUser";
import "./DolaiNoti.css";

export default function DolaiNotification() {
  const { user } = useUser();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const topic = `/topic/notifications/dolai/${user.id}`;
    notificationSocketClient.subscribe(topic, (msg) => {
      const data = JSON.parse(msg.body);
      const title = data.title;

      setMessage(title);
      setVisible(true);
    });

    return () => {
      notificationSocketClient.unsubscribe(topic);
    };
  }, [user]);

  if (!visible) return null;

  return (
    <div className="dolai-noti-container">
      <div className="dolai-noti-bubble">
        <X className="dolai-noti-close" onClick={() => setVisible(false)} />
        <span className="dolai-noti-text">지피티야 죽어 님에게 할 일이 추가되었습니다.</span>
        <div className="dolai-noti-tail" />
      </div>
    </div>
  );
}