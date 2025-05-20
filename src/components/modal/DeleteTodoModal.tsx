import React from "react";
import "../modal/ConfirmModal.css";

interface ConfirmModalProps {
  title?: string; // 모달 제목 (optional, 기본값 설정)
  message: string; // ex: 정말 <strong style="color:blue">박성현</strong>을 삭제하시겠습니까?
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = "삭제 확인",
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="confirm-modal-overlay">
      <div
        className="confirm-modal"
        style={{
          width: "350px",
          height:"200px",       // 전체 모달 너비 조정
          maxWidth: "90%",      // 화면에 맞춤
          padding: "16px",      // 내부 여백 줄임
          borderRadius: "8px"   // 테두리 둥글게 유지
        }}
      >
        <div
          className="confirm-modal-title"
          style={{ fontSize: "1.2rem", marginBottom: "8px" }} // 제목 글자 크기 축소
        >
          {title}
        </div>
        <div
          className="confirm-modal-message"
          style={{ fontSize: "0.9rem", marginBottom: "12px" }} // 메시지 글자 크기 축소
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <div className="confirm-modal-actions" style={{ gap: "8px" }}>
          <button
            className="cancel-button"
            onClick={onCancel}
            style={{ padding: "6px 12px", fontSize: "0.9rem" }}
          >
            취소
          </button>
          <button
            className="confirm-button"
            onClick={onConfirm}
            style={{ padding: "6px 12px", fontSize: "0.9rem" }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;