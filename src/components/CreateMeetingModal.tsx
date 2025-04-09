import { useState } from "react";
import "./Modal.css";

interface Props {
  onCreate: (title: string, startTime: string) => void;
  onClose: () => void;
}

export default function CreateMeetingModal({ onCreate, onClose }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!title) {
      alert("제목을 입력하세요.");
      return;
    }
    const startTime = new Date().toISOString();
    onCreate(title, startTime);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>회의 생성</h2>
        <input type="text" placeholder="회의 제목을 작성하세요" value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="set-btn-wrapper">
        <button className="set-add-btn" onClick={handleSubmit}>생성</button>
        <button className="set-close-btn" onClick={onClose}>취소</button>
      </div>
      </div>
    </div>
  );
}
