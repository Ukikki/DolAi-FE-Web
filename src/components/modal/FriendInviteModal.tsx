// FriendInviteModal.tsx
import { useState, useEffect } from "react";
import axios from "@/utils/axiosInstance";
import { X } from "lucide-react"; // X 아이콘 임포트
import "../modal/FriendInviteModal.css";

interface FriendInviteModalProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
  currentUserId: string;
  currentFriends: UserDto[];
}


interface UserDto {
  id: string;
  email: string;
  name: string;
  profile_image: string;
}

export default function FriendInviteModal({
  onClose,
  onSubmit,
  currentUserId,
  currentFriends,
}: FriendInviteModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [foundUsers, setFoundUsers] = useState<UserDto[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (emailInput.trim()) {
        axios
          .get(`/user/search?email=${encodeURIComponent(emailInput.trim())}`)
          .then((res) => {
            const data = res.data?.data ?? res.data;
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

  // ✅ 필터링: 나 자신과 이미 친구인 사람 제외
  const visibleUsers = foundUsers
    .filter(user => user.id !== currentUserId)
    .filter(user => !currentFriends.some(friend => friend.id === user.id));

  return (
    <div className="invite-modal-overlay">
      <div className="invite-modal-container">
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
        {visibleUsers.length > 0 && (
          <div className="user-suggestions">
            {visibleUsers.map((user) => (
              <div key={user.id} className="user-preview">
                <img src={user.profile_image} alt="프로필" width={50} height={50} style={{ borderRadius: "50%" }} />
                <p>{user.name} ({user.email})</p>
                <button className="add-btn" onClick={() => onSubmit(user.email)}>
                  추가
                </button>
              </div>
            ))}
          </div>
        )}
        {searchError && <p className="error-text">{searchError}</p>}
      </div>
    </div>
  );
}

