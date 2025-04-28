import "./FriendInvite.css";
import { Link, Search, Check } from "lucide-react";
import { useState } from "react";
import { useFriend } from "@/hooks/useFriend";
import axios from "@/utils/axiosInstance";

interface FriendInviteProps {
  isVisible: boolean;
  inviteUrl: string;
  onClose?: () => void;
}

export default function FriendInvite({ isVisible, inviteUrl }: FriendInviteProps) {
  if (!isVisible) return null;

  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const { friends } = useFriend(isVisible);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl); // 추후 미팅룸 링크 추가
    setCopied(true);
    setTimeout(() => setCopied(false), 3000); // 3초 후 원래 텍스트로 복귀
    console.error("inviteUrl", inviteUrl);
  };

const handleInvite = async (email: string) => {
  try {
    const res = await axios.post("/join", {
      email,
      inviteUrl,
    });
    setInvited((prev) => ({ ...prev, [email]: true }));
    console.log("✅ 초대 성공:", res.data);
  } catch (error) {
    console.error("초대 실패:", error);
  }
};

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase()) ||
      friend.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="meet-friend-popup">
      <div className="link-container" onClick={handleCopy}>
        {!copied && <Link className="link-icon" />}
        <span className="copy-text">{copied ? "Copied link!" : "Copy link"}</span>
      </div>

      <div className="meet-friend-search-container">
        <Search className="meet-friend-search-icon" />
        <input type="text" placeholder="Search by email" className="meet-friend-search"
        value={search} onChange={ (e) => setSearch(e.target.value) }/>
      </div>
      <div className="meet-friend-list">
        {filteredFriends.length > 0 && filteredFriends.map((user, index) => (
          <div key={index} className="meet-friend-item">
          <img className="meet-friend-profile" src={user.profile_image}/>
            <div className="meet-friend-info">
              <span className="meet-friend-name">{user.name}</span>
              <span className="meet-friend-email">{user.email}</span>
            </div>
            <button
              className={`meet-invite-btn ${invited[user.email] ? "invited" : ""}`}
              onClick={() => handleInvite(user.email)}
              disabled={invited[user.email]}
            >
            {invited[user.email] ? <Check color="white" style={{ width: "1.6vw", height: "1.6vw", cursor: "pointer" }}/> : "초대"}
            </button>
          </div>
          ))
        }
      </div>
    </div>
  );
}