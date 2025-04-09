// Setting.tsx

import { useRef, useState, useEffect } from "react";
import { Home, Video, FileText, Pencil, Search } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { handleSocialLogout } from "../utils/logout";
import { getProfileImageUrl } from "../utils/getProfileImageUrl";
import NewNameModal from "../components/modal/NewName";
import "../styles/Setting.css";
import axios from "../utils/axiosInstance";

interface FriendRequest {
  requestId: number;
  id: string;
  email: string;
  name: string;
  profileImage?: string;
}

interface Friend {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
}

interface SettingProps {
  navigate: (path: string) => void;
}

export default function Setting({ navigate }: SettingProps) {
  const { user, refetch } = useUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isNewNameModal, setIsNewNameModal] = useState(false);
  const openModal = () => setIsNewNameModal(true);
  const closeModal = () => setIsNewNameModal(false);

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchText, setSearchText] = useState("");
  const [friendInviteInput, setFriendInviteInput] = useState("");

  useEffect(() => {
    fetchFriendRequests();
    fetchFriends();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const res = await axios.get("/friends/requests");
      const requests = res.data.data.requests || [];
      setFriendRequests(requests);
    } catch (err) {
      console.error("친구 요청 목록 불러오기 실패", err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get("/friends");
      const list = res.data.data.friends || [];
      setFriends(list);
    } catch (err) {
      console.error("친구 목록 불러오기 실패", err);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    try {
      await axios.patch("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      refetch();
    } catch (err) {
      console.error("프로필 이미지 업로드 실패", err);
    }
  };

  const handleNameUpdate = async (newName: string) => {
    try {
      await axios.patch("/user/rename", { name: newName });
      closeModal();
      refetch();
    } catch (err) {
      alert("이름 변경에 실패했습니다.");
    }
  };

  const handleAcceptReject = async (requestId: number, action: "accept" | "reject") => {
    try {
      await axios.patch(`/friends/respond/${requestId}`, { action });
      setFriendRequests((prev) => prev.filter((item) => item.requestId !== requestId));
      if (action === "accept") fetchFriends();
    } catch (err) {
      alert(`친구 요청 ${action}에 실패했습니다.`);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!friendInviteInput) {
      alert("친구의 이메일을 입력해주세요.");
      return;
    }
    try {
      const res = await axios.get(`/user/search?email=${encodeURIComponent(friendInviteInput)}`);
      const userFound = res.data.data;
      if (!userFound || !userFound.id) {
        alert("해당 이메일의 사용자를 찾을 수 없습니다.");
        return;
      }
      await axios.post("/friends/request", { targetUserId: userFound.id });
      alert("친구 요청을 보냈습니다.");
      setFriendInviteInput("");
    } catch (err) {
      alert("친구 요청 보내기에 실패했습니다.");
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchText.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="container">
      <header className="navbar">
        <div className="navbar-left">
          <img src="../images/main_logo.png" alt="DolAi Logo" />
        </div>
        <div className="navbar-center">
          <nav className="navbar-icons">
            <div className="icon-container" onClick={() => navigate("/")}>
              <Home style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            <div className="icon-container" onClick={() => navigate("/meetings")}>
              <Video style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            <div className="icon-container" onClick={() => navigate("/documents")}>
              <FileText style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
          </nav>
        </div>
        <div className="navbar-right">
          <div className="user-profile">
            <img
              src={getProfileImageUrl(user?.profile_image)}
              style={{ width: "2.1vw", height: "2.1vw", borderRadius: "10px" }}
              alt="프로필 이미지"
            />
          </div>
        </div>
      </header>

      <main className="main">
        <aside className="set-sides-section">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <div className="set-pHeader">프로필</div>
          <div className="set-user-profile" onClick={handleClick}>
            <img
              src={getProfileImageUrl(user?.profile_image)}
              style={{ width: "13vw", height: "13vw", borderRadius: "40px" }}
              alt="프로필 큰 이미지"
            />
          </div>
          <div className="set-user-name-wrapper">
            <div className="set-user-name">{user?.name}</div>
            <div className="set-userEdit-icon" onClick={openModal}>
              <Pencil style={{ width: "1.6vw", height: "1.6vw", cursor: "pointer" }} />
            </div>
          </div>
          <div className="set-user-email">{user?.email}</div>

          <div className="set-nHeader">알림 설정</div>
          <div className="toggle-setting">
            <div className="toggle-label">친구 요청</div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round" />
            </label>
          </div>
          <div className="toggle-setting">
            <div className="toggle-label">회의 알림</div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round" />
            </label>
          </div>
          <div className="toggle-setting">
            <div className="toggle-label">캘린더 추가</div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round" />
            </label>
          </div>
          <div className="logout-button" onClick={handleSocialLogout}>
            로그아웃
          </div>

          {isNewNameModal && (
            <NewNameModal
              currentName={user?.name || ""}
              onSave={handleNameUpdate}
              onClose={closeModal}
            />
          )}
        </aside>

        <section className="set-middle-section">
          <div className="set-pHeader">친구 요청 ({friendRequests.length})</div>
          <div className="friend-add-section">
            <input
              type="text"
              placeholder="친구 이메일을 입력하세요"
              value={friendInviteInput}
              onChange={(e) => setFriendInviteInput(e.target.value)}
              className="friend-add-input"
              style={{ marginRight: "1vw", padding: "0.5vh", fontSize: "1vw" }}
            />
            <button
              onClick={handleSendFriendRequest}
              className="friend-add-btn"
              style={{ padding: "0.5vh 1vw", fontSize: "1vw", cursor: "pointer" }}
            >
              친구 요청 보내기
            </button>
          </div>

          <div className="friend-requests-list">
            {friendRequests.length === 0 ? (
              <p>받은 친구 요청이 없습니다.</p>
            ) : (
              friendRequests.map((req) => (
                <div className="friend-request-item" key={req.requestId}>
                  <img
                    src={req.profileImage || "../images/default_profile.png"}
                    alt="프로필"
                    className="friend-request-profile"
                  />
                  <div className="friend-request-info">
                    <span className="friend-request-name">{req.name}</span>
                    <span className="friend-request-email">{req.email}</span>
                  </div>
                  <div className="friend-request-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleAcceptReject(req.requestId, "accept")}
                    >
                      수락
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleAcceptReject(req.requestId, "reject")}
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

         

          <div className="set-pHeader" style={{ marginTop: "3vh" }}>
            친구 ({filteredFriends.length})
          </div>

           {/* 친구 검색 */}
           <div className="search-friends-wrapper" style={{ marginTop: "2vh" }}>
            <Search className="set-friend-search-icon" />
            <input
              type="text"
              placeholder="검색"
              className="friend-search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="friend-requests-list">
            {filteredFriends.length === 0 ? (
              <p>친구가 없습니다.</p>
            ) : (
              filteredFriends.map((friend) => (
                <div className="friend-request-item" key={friend.id}>
                  <img
                    src={friend.profileImage || "../images/default_profile.png"}
                    alt="프로필"
                    className="friend-request-profile"
                  />
                  <div className="friend-request-info">
                    <span className="friend-request-name">{friend.name}</span>
                    <span className="friend-request-email">{friend.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="set-sides-section">
          <div className="set-pHeader">알림</div>
        </aside>
      </main>
    </div>
  );
}
