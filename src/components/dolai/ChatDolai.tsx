import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "@/utils/axiosInstance";  // JWT 포함 설정된 axios 인스턴스
import "./ChatDolai.css";

interface Message {
  sender: "me" | "dolai";
  text: string;
}

interface LocationState {
  meetingId: string;
}

export default function ChatDolai() {
  const location = useLocation();
const meetingId = (location.state && (location.state as LocationState).meetingId) || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !meetingId) return;

    const question = inputText;
    setMessages(prev => [...prev, { sender: "me", text: question }]);
    setInputText("");
    setIsLoading(true);

    try {
      // JWT가 axiosInstance에 설정되어 있음
      const response = await axios.post<string>('/llm/ask', {
        meetingId,
        question: question,
      });

      // BE에서 반환한 답변
      setMessages(prev => [...prev, { sender: "dolai", text: response.data }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        sender: "dolai",
        text: '죄송합니다. AI 비서 응답을 가져오는 중 오류가 발생했습니다.'
      }]);
    } finally {
      setIsLoading(false);
    }
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

        <div className="chat-dolai-message me draft">
          <input
            className="chat-dolai-input-draft"
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyUp={e => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <button
            className="chat-dolai-send-button"
            onClick={handleSendMessage}
            aria-label="Send message"
            disabled={isLoading || !inputText.trim()}
          >
            <img
              src="/images/imgsend.png"
              alt="보내기"
              className="chat-dolai-send-icon"
            />
          </button>
        </div>

        {isLoading && (
          <div className="chat-dolai-message dolai loading">AI 비서 응답 중...</div>
        )}
      </div>
    </div>
  );
}
