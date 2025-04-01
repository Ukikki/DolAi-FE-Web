import "./FriendInvite.css";
import { Copy, Search } from "lucide-react";
import { useState } from "react";

interface FriendInviteProps {
  isVisible: boolean;
}

export default function FriendInvite({ isVisible }: FriendInviteProps) {
  if (!isVisible) return null;

  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  const handleCopy = () => {
    navigator.clipboard.writeText(""); // 추후 미팅룸 링크 추가
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2초 후 원래 텍스트로 복귀
  };
  const handleInvite = (email: string) => {
    setInvited((prev) => ({ ...prev, [email]: true }));
  };

  // 예시
  const friends = [
    { name: "송희", email: "sh2271121@hansung.ac.kr" },
    { name: "지혜", email: "zuzihe@hansung.ac.kr" },
    { name: "성현", email: "toby1117@hansung.ac.kr" },
    { name: "지운", email: "2291001@hansung.ac.kr" },
    { name: "인환", email: "ihjung@hansung.ac.kr" },
  ]

  // 친구예시 기준으로 필터링
  const filteredFriends = friends.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="friend-popup">
      <div className="copy-container" onClick={handleCopy}>
        {!copied && <Copy className="copy-icon" />}
        <span className="copy-text">{copied ? "Copied link!" : "Copy link"}</span>
      </div>

      <div className="friend-search-container">
        <input type="text" placeholder="Search by email" className="friend-search"
        value={search} onChange={ (e) => setSearch(e.target.value) }/>
      <Search className="friend-search-icon" />
      </div>
      <ul className="friend-list">
        {filteredFriends.length > 0 && filteredFriends.map((user, index) => (
          <li key={index} className="friend-item">
            <div className="friend-info">
              <span className="friend-name">{user.name}</span>
              <span className="friend-email">{user.email}</span>
            </div>
            <button
              className={`invite-btn ${invited[user.email] ? "invited" : ""}`}
              onClick={() => handleInvite(user.email)}
              disabled={invited[user.email]}
            >
              {invited[user.email] ? "요청중" : "초대"}
            </button>
          </li>
          ))
        }
      </ul>
    </div>
  );
}
