import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axios from "@/utils/axiosInstance";
import "@/styles/meeting/Message.css";
import { useUser } from "@/hooks/user/useUser";

interface MessageProps {
  isVisible: boolean;
  meetingId: string;
  onClose?: () => void;
}

interface MessageItem {
  sender: string;
  text: string;
}

export default function Message({ isVisible, meetingId }: MessageProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    { sender: "지혜", text: "다들 학식에서 먹고 싶은 거 있나요?" },
    { sender: "승희", text: "학식 말고 맘스터치 먹어요. 학식 맛없어!!! ㅠㅠㅜㅜㅜㅜㅜㅜㅜㅜ" },
    { sender: "지혜", text: "ㄴㄴ 학식" },
  ]);
  const [input, setInput] = useState("");
  const { user } = useUser();
  const messageEndRef = useRef<HTMLDivElement>(null);

  // 메시지 추가될 때 스크롤 이동
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  if (!isVisible || !user) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { sender: user?.name, text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  return (
    <div className="meet-message-container">
      <div className="message-list">
        {messages.map((item, i) => (
          <div key={i}
            className={`message-item ${item.sender === user?.name ? 'my-message' : 'other-message'}`}
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