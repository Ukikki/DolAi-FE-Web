import { useState } from "react";
import "@/styles/common/modal/Modal.css";

interface Props {
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export default function NewName({ currentName, onSave, onClose }: Props) {
  const [name, setName] = useState(currentName);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    onSave(name.trim());
  };

  return (
    <div className="set-modal-overlay">
      <div className="set-modal">
        <p>이름 변경</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="set-btn-wrapper">
            <button className="set-close-btn" onClick={onClose}>닫기</button>
            <button className="set-add-btn" onClick={handleSubmit}>저장</button>
        </div>
      </div>
    </div>
  );
}
