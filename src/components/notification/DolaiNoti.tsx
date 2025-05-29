import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { registerDolaiHandler } from "@/components/listeners/NotificationListener";
import "./DolaiNoti.css";

export default function DolaiNotification() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // 메시지 오면 보이기
    registerDolaiHandler((msg) => {
      if (msg) {
        setMessage(msg);
        setVisible(true);
      } else {
        setVisible(false);
        setMessage(null);
      }
    });
  }, []);

  if (!visible || !message) return null;

  return (
    <div className="dolai-noti-container">
      <div className="dolai-noti-bubble">
        <X
          className="dolai-noti-close"
          onClick={() => {
            setVisible(false);
            setMessage(null);
          }}
        />
        <span className="dolai-noti-text">{message}</span>
        <div className="dolai-noti-tail" />
      </div>
    </div>
  );
}