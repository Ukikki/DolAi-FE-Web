// Setting.tsx
import { useRef, useState, useEffect } from "react";
import { Home, Video, FileText, Pencil, Search, X } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { handleSocialLogout } from "../utils/logout";
import { getProfileImageUrl } from "../utils/getProfileImageUrl";
import NewNameModal from "../components/modal/NewName";
import FriendInviteModal from "../pages/FriendInviteModal";
import ConfirmModal from "../pages/ConfirmModal";
import NotiList from "../components/notification/NotiList";
import "../styles/Setting.css";
import axios from "../utils/axiosInstance";

interface Friend {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  status?: string;
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

  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState<string | null>(null); // 추가
  const [friendToDeleteName, setFriendToDeleteName] = useState<string | null>(null); // 수정된 부분

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await axios.get("/friends");
      console.log("전체 응답 데이터:", res.data);
      const list: Friend[] = res.data.data.friends || [];
      console.log("서버에서 받은 친구 목록:", JSON.stringify(list, null, 2));
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
    console.log(file);
    try {
      const res = await axios.patch("/user/profile", formData, { });
  
      const newImageUrl = res.data.data.profileImage;
      console.log("✅ 프로필 이미지 업로드 성공:", newImageUrl);
      refetch();
      } catch (err) {
      console.error("❌ 프로필 이미지 업로드 실패", err);
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

  const handleInviteSubmit = async (email: string) => {
    try {
      const res = await axios.get(`/user/search?email=${encodeURIComponent(email)}`);
      const userFound = res.data.data;
      if (!userFound || !userFound.id) {
        alert("해당 이메일의 사용자를 찾을 수 없습니다.");
        return;
      }
      await axios.post("/friends/request", { targetUserId: userFound.id });
      alert("친구 요청을 보냈습니다.");
      setShowInviteModal(false);
    } catch (err) {
      alert("친구 요청 보내기에 실패했습니다.");
    }
  };

  // 친구 삭제 클릭 시
  const handleDeleteFriendClick = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (friend) {
      setFriendToDelete(friendId);
      setFriendToDeleteName(friend.name);
      setShowDeleteConfirm(true);
    }
  };

  // 삭제 확정 시
  const handleConfirmDelete = async () => {
    if (friendToDelete) {
      try {
        await axios.delete(`/friends/${friendToDelete}`);
        setFriends((prev) => prev.filter((friend) => friend.id !== friendToDelete));
        alert("친구가 삭제되었습니다.");
      } catch (err) {
        alert("친구 삭제에 실패하였습니다.");
      } finally {
        setShowDeleteConfirm(false);
        setFriendToDelete(null);
        setFriendToDeleteName(null);
      }
    }
  };

  // 삭제 취소 시
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setFriendToDelete(null);
    setFriendToDeleteName(null);
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
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
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
          <div className="set-pHeader" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>친구 ({filteredFriends.length})</span>
            <div>
              <button onClick={() => setShowInviteModal(true)} style={{ marginRight: "10px" }}>
                친구요청
              </button>
              <button onClick={() => navigate("/settings/requestpage")}>요청목록</button>
            </div>
          </div>
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
                    src={friend.profileImage}
                    alt="프로필"
                    className="friend-request-profile"
                  />
                  <div className="friend-request-info">
                    <span className="friend-request-name">{friend.name}</span>
                    <span className="friend-request-email">{friend.email}</span>
                  </div>
                  <div className="friend-delete-action">
                    <button className="friend-delete-btn" onClick={() => handleDeleteFriendClick(friend.id)}>
                      <X style={{ width: "1.4vw", height: "1.4vw", cursor: "pointer" }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 알림 부분 */}
        <aside className="set-sides-section">
          <div className="set-pHeader">알림</div>
          <div className="set-noti-list-wrapper">
            <NotiList /></div>
        </aside>
      </main>

      {showInviteModal && (
        <FriendInviteModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInviteSubmit}
        />
      )}

      {showDeleteConfirm && friendToDeleteName && (
        <ConfirmModal
          message={`정말 <strong style="color:#1976f9">'${friendToDeleteName}'</strong>을 삭제하시겠습니까?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
