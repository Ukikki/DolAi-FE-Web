import React from "react";
import "../styles/ConfirmModal.css";

interface ConfirmModalProps {
  message: string; // ex: 정말 <strong style="color:blue">박성현</strong>을 삭제하시겠습니까?
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-title">친구 삭제</div>
        <div
          className="confirm-modal-message"
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <div className="confirm-modal-actions">
          <button className="cancel-button" onClick={onCancel}>취소</button>
          <button className="confirm-button" onClick={onConfirm}>삭제</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
