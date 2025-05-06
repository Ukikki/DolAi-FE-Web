import { useState } from "react";
import "@/styles/common/modal/Modal.css";

interface Props {
  onCreate: (title: string, startTime: string) => void;
  onClose: () => void;
}

export default function CreateMeeting({ onCreate, onClose }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!title) {
      alert("제목을 입력하세요.");
      return;
    }
    const startTime = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString()
    onCreate(title, startTime);
  };

  return (
    <div className="set-modal-overlay">
      <div className="set-modal">
        <p>회의 생성</p>
        <input type="text" placeholder="회의 제목을 작성하세요" value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="set-btn-wrapper">
        <button className="set-close-btn" onClick={onClose}>취소</button>
        <button className="set-add-btn" onClick={handleSubmit}>생성</button>
      </div>
      </div>
    </div>
  );
}