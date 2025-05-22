import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
import { useUser } from "@/hooks/user/useUser";

import "@/styles/meeting/Message.css";

interface MessageProps {
  isVisible: boolean;
  meetingId: string;
  onClose?: () => void;
}

interface MessageItem {
  senderId: string,
  sender: string;
  text: string;
}

export default function Message({ isVisible, meetingId }: MessageProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const { user } = useUser();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!isVisible || !user) return;

    const socket = new SockJS(`${VITE_BASE_URL}/ws-chat`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Connected Message WebSocket");

        client.subscribe(`/topic/chat/${meetingId}`, (message: IMessage) => {
          const body = JSON.parse(message.body);
          setMessages((prev) => [...prev, {
            senderId: body.senderId,
            sender: body.senderName,
            text: body.content,
          }]);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP Error", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [isVisible, meetingId, user]);

  // 메시지 추가될 때 스크롤 이동
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  if (!isVisible || !user) return null;

  const handleSend = () => {
    if (!input.trim() || !stompClientRef.current?.connected) return;

    const newMessage = {
      senderId: user?.id,
      senderName: user?.name,
      content: input,
    };

    stompClientRef.current.publish({
      destination: `/app/chat/${meetingId}`,
      body: JSON.stringify(newMessage),
    });

    setInput("");
  };

  return (
    <div className="meet-message-container">
      <div className="message-list">
        {messages.map((item, i) => (
          <div key={i}
            className={`message-item ${item.senderId === user?.id ? 'my-message' : 'other-message'}`}
          >
            <span className="message-sender">{item.sender}:</span>{item.text}
          </div>
        ))}
      <div ref={messageEndRef} />
      </div>

      <div className="message-input-wrapper">
        <input
          className="message-input" type="text" placeholder=""
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Send style={{ width: "1.6vw", height: "1.6vw", color: "white" }} onClick={handleSend} />
      </div>
    </div>
  );
}