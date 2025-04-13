import { useState, useEffect } from "react";
import axios from "axios";
import "../modal/FriendInviteModal.css";

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
  const [foundUsers, setFoundUsers] = useState<UserDto[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ✅ 이메일 입력 변화 감지해서 검색
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (emailInput.trim()) {
        axios
        .get(`/api/user/search?email=${encodeURIComponent(emailInput.trim())}`)
          .then((res) => {
            const data = res.data?.data ?? res.data;
            console.log("🔍 API 응답 데이터:", data);

            if (Array.isArray(data)) {
              setFoundUsers(data);
              setSearchError(data.length === 0 ? "사용자를 찾을 수 없습니다." : null);
            } else {
              setFoundUsers([]);
              setSearchError("잘못된 응답입니다.");
            }
          })
          .catch(() => {
            setFoundUsers([]);
            setSearchError("사용자를 찾을 수 없습니다.");
          });
      } else {
        setFoundUsers([]);
        setSearchError(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [emailInput]);

  const handleSubmit = () => {
    if (!emailInput.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
  
    // ✨ foundUsers 배열에서 일치하는 유저 찾기
    const matchedUser = foundUsers.find((user) => user.email === emailInput.trim());
  
    if (!matchedUser) {
      alert("해당 이메일의 사용자를 찾을 수 없습니다.");
      return;
    }
  
    onSubmit(matchedUser.email); // 또는 matchedUser.id 를 넘기도록 구조 조정 가능
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
        {foundUsers.length > 0 && (
          <div className="user-suggestions">
            {foundUsers.map((user) => (
              <div
                key={user.id}
                className="user-preview"
                onClick={() => setEmailInput(user.email)}
              >
                <img
                  src={user.profileImage}
                  alt="프로필"
                  width={50}
                  height={50}
                  style={{ borderRadius: "50%" }}
                />
                <p>
                  {user.name} ({user.email})
                </p>
              </div>
            ))}
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
