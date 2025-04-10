import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FriendInviteModal.css";

interface FriendInviteModalProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
}

interface UserDto {
  id: string;
  email: string;
  name: string;
  profileImage: string;
}

export default function FriendInviteModal({ onClose, onSubmit }: FriendInviteModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [foundUser, setFoundUser] = useState<UserDto | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 이메일 입력 변화 감지해서 검색
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (emailInput.trim()) {
        axios.get(`/api/users/search?email=${encodeURIComponent(emailInput.trim())}`)
          .then(res => {
            setFoundUser(res.data.data); // SuccessDataResponse 구조에 맞게
            setSearchError(null);
          })
          .catch(() => {
            setFoundUser(null);
            setSearchError("사용자를 찾을 수 없습니다.");
          });
      } else {
        setFoundUser(null);
        setSearchError(null);
      }
    }, 500); // 0.5초 뒤 검색

    return () => clearTimeout(delayDebounce);
  }, [emailInput]);

  const handleSubmit = () => {
    if (!emailInput.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    onSubmit(emailInput.trim());
  };

  return (
    <div className="invite-modal-overlay">
      <div className="invite-modal-container">
        <h2 className="invite-title">친구 추가</h2>
        <input
          type="text"
          placeholder="친구 이메일"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="invite-input"
        />

        {/* 검색 결과 보여주기 */}
        {foundUser && (
          <div className="user-preview">
            <img src={foundUser.profileImage} alt="프로필" width={50} height={50} style={{ borderRadius: "50%" }} />
            <p>{foundUser.name} ({foundUser.email})</p>
          </div>
        )}
        {searchError && <p className="error-text">{searchError}</p>}

        <div className="invite-modal-actions">
          <button onClick={handleSubmit}>보내기</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}
