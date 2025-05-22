import React from "react";
import "./DeleteTodoModal.css"; // 별도 스타일 파일 분리

interface ConfirmModalProps {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteTodoModal: React.FC<ConfirmModalProps> = ({
  title = "삭제 확인",
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="delete-todo-modal-overlay">
      <div className="delete-todo-modal">
        <div className="delete-todo-title">{title}</div>
  
        {/* 메시지 추가 */}
        <div className="delete-todo-message">
          정말 삭제하시겠습니까?
        </div>
  
        <div className="delete-todo-actions">
          <button className="cancel-btn" onClick={onCancel}>취소</button>
          <button className="confirm-btn" onClick={onConfirm}>삭제</button>
        </div>
      </div>
    </div>
  );
  
};

export default DeleteTodoModal;
