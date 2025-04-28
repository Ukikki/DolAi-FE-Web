// FriendInviteModal.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react"; // X 아이콘 임포트
import "../modal/FriendInviteModal.css";

interface FriendInviteModalProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
}

interface UserDto {
  id: string;
  email: string;
  name: string;
  profile_image: string;
}

export default function FriendInviteModal({ onClose, onSubmit }: FriendInviteModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [foundUsers, setFoundUsers] = useState<UserDto[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 이메일 입력 변화 감지 후 500ms 딜레이 후 검색 수행
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

  // "보내기" 버튼은 그대로 남겨둘 수 있고, 개별 사용자의 추가 버튼도 사용합니다.
  const handleSubmit = () => {
    if (!emailInput.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    const matchedUser = foundUsers.find((user) => user.email === emailInput.trim());
    if (!matchedUser) {
      alert("해당 이메일의 사용자를 찾을 수 없습니다.");
      return;
    }
    onSubmit(matchedUser.email); // 이메일을 초대 콜백으로 전달
  };

  return (
    <div className="invite-modal-overlay">
      <div className="invite-modal-container">
        {/* 우측 상단 X 버튼 */}
        <button className="modal-close-btn" onClick={onClose}>
          <X style={{ width: "24px", height: "24px", cursor: "pointer" }} />
        </button>

        <h2 className="invite-title">친구 추가</h2>
        <input
          type="text"
          placeholder="친구 이메일"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="invite-input"
        />

        {/* 검색 결과 목록 (각 친구 미리보기 오른쪽에 "추가" 버튼 추가) */}
        {foundUsers.length > 0 && (
          <div className="user-suggestions">
            {foundUsers.map((user) => (
              <div key={user.id} className="user-preview">
                <img
                  src={user.profile_image}
                  alt="프로필"
                  width={50}
                  height={50}
                  style={{ borderRadius: "50%" }}
                />
                <p>
                  {user.name} ({user.email})
                </p>
                <button className="add-btn" onClick={() => onSubmit(user.email)}>
                  추가
                </button>
              </div>
            ))}
          </div>
        )}

        {searchError && <p className="error-text">{searchError}</p>}

        {/* 기존 "보내기" 버튼도 원하면 추가하고, 그렇지 않다면 취소 버튼만 남깁니다.
            여기서는 취소 버튼은 위의 X 버튼으로 대체했으므로 별도 버튼은 제거하였습니다. */}
      </div>
    </div>
  );
}
