import { useState } from "react";
import "./CreateMeetingModal.css";

interface Props {
  onCreate: (title: string, startTime: string) => void;
  onClose: () => void;
}

export default function CreateMeetingModal({ onCreate, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");

  const handleSubmit = () => {
    if (!title || !startTime) {
      alert("제목과 시작 시간을 입력하세요.");
      return;
    }
    onCreate(title, startTime);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>회의 생성</h2>
        <input
          type="text"
          placeholder="회의 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <button onClick={handleSubmit}>생성</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
}
