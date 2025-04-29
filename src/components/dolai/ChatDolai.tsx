import { useState } from "react";
import "./ChatDolai.css";

interface ChatDolaiProps {
  onClose: () => void;
}

export default function ChatDolai({ onClose }: ChatDolaiProps) {
  const [messages, setMessages] = useState<{ sender: "me" | "dolai"; text: string }[]>([]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { sender: "me", text: inputText }]);
    setInputText("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: "dolai",
        text: `DolAi 답변: "${inputText}" 에 대한 답변입니다.`
      }]);
    }, 500);
  };

  return (
    <div className="chat-dolai-container">
      <header className="chat-dolai-header">&nbsp;&nbsp;&nbsp;&nbsp;DolAi 채팅</header>

      <div className="chat-dolai-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.sender === "me"
                ? "chat-dolai-message me"
                : "chat-dolai-message dolai"
            }
          >
            {msg.text}
          </div>
        ))}

        {/* ★ 여기에 draft 말풍선 */}
        <div className="chat-dolai-message me draft">
          <input
            className="chat-dolai-input-draft"
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendMessage()}
          />
          <button
            className="chat-dolai-send-button"
            onClick={handleSendMessage}
            aria-label="Send message"
          >
            <img
              src="/images/imgsend.png"
              alt="보내기"
              className="chat-dolai-send-icon"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
