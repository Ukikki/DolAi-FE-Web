import { useRef, useState } from "react";
import { Home, Video, FileText, Pencil, Search } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { handleSocialLogout } from "../utils/logout";
import { getProfileImageUrl } from "../utils/getProfileImageUrl";
import NewNameModal from "../components/modal/NewName";
import "../styles/Setting.css";
import axios from "../utils/axiosInstance";

interface SettingProps {
  navigate: (path: string) => void;
}

export default function Setting({ navigate } : SettingProps)  {
  const { user, refetch } = useUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 이름 편집 모달
  const [isNewNameModal, setIsNewNameModal] = useState(false);
  const openModal = () => setIsNewNameModal(true);
  const closeModal = () => setIsNewNameModal(false);
  
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
      const res = await axios.patch("http://localhost:8081/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
  
      const newImageUrl = res.data.data.profileImage;
      console.log("✅ 프로필 이미지 업로드 성공:", newImageUrl);
      refetch();
      } catch (err) {
      console.error("❌ 프로필 이미지 업로드 실패", err);
    }
  };

  // 이름 변경
  const handleNameUpdate = async (newName: string) => {
    try {
      const res = await axios.patch("http://localhost:8081/user/rename", { name: newName });
      console.log("✅ 이름 변경 성공:", res.data);
      closeModal();
      refetch();
    } catch (err) {
      console.error("❌ 이름 변경 실패", err);
      alert("이름 변경에 실패했습니다.");
    }
  };

  return (
    <div className="container">
      {/* 상단 네비게이션 */}
      <header className="navbar">
        <div className="navbar-left">
          <img src="../images/main_logo.png" alt="DolAi Logo" />
        </div>

        <div className="navbar-center">
          <nav className="navbar-icons">
            <div className={`icon-container`} onClick={() => navigate("/")}>
              <Home style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            <div className={`icon-container`} onClick={() => navigate("/meetings")}>
              <Video style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            <div className={`icon-container`} onClick={() => navigate("/documents")}>
              <FileText style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
          </nav>
        </div>

        <div className="navbar-right">
          <div className="user-profile">
            <img src={getProfileImageUrl(user?.profile_image)} style={{ width: "2.1vw", height: "2.1vw", borderRadius: "10px"}} />
          </div>
        </div>
      </header>

      <main className="main">
        {/* 프로필, 설정 영역 */}
        <aside className="set-sides-section">
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
        <div className="set-pHeader">프로필</div>
          <div className="set-user-profile" onClick={handleClick}>
          <img src={getProfileImageUrl(user?.profile_image)} style={{ width: "13vw", height: "13vw", borderRadius: "40px" }} />
          </div>
          <div className="set-user-name-wrapper">
            <div className="set-user-name">{user?.name}</div>

            <div className="set-userEdit-icon" onClick={openModal}><Pencil style={{ width: "1.6vw", height: "1.6vw", cursor: "pointer" }} /></div>
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
          <div className="logout-button" onClick={handleSocialLogout}> 로그아웃 </div>

          {isNewNameModal && ( <NewNameModal
              currentName={user?.name || ""}
              onSave={handleNameUpdate}
              onClose={closeModal}
            />
          )}
        </aside>

        {/* 친구 영역 */}
        <section className="set-middle-section">
        <div className="set-pHeader">친구</div>
          <div className="search-friends-wrapper">
          <Search className="set-friend-search-icon" />
          <input type="text" placeholder="검색" className="friend-search" />
          </div>
        </section>

        {/* 알림 영역 */}
        <aside className="set-sides-section">
        <div className="set-pHeader">알림</div>
        </aside>
      </main>
    </div>
  );
}