// RequestPage.tsx
import { useState, useEffect } from "react";
import { Home, Video, FileText, Search } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { handleSocialLogout } from "../utils/logout";
import { getProfileImageUrl } from "../utils/getProfileImageUrl";
import axios from "../utils/axiosInstance";
import "../styles/RequestsPage.css";

interface FriendRequest {
  requestId: number;
  fromUserId: string; // 요청을 보낸 사용자 ID
  toUserId: string;   // 요청을 받은 사용자 ID
  email: string;
  name: string;
  profileImage?: string;
}

interface RequestsPageProps {
  navigate: (path: string) => void;
}

export default function RequestsPage({ navigate }: RequestsPageProps) {
  const { user } = useUser();

  const [friendRequestsReceived, setFriendRequestsReceived] = useState<FriendRequest[]>([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState<FriendRequest[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/friends/requests");
      console.log("전체 요청 응답:", res.data);
      const data = res.data.data;
      // 백엔드가 data.requests 배열로 모든 요청을 반환한다고 가정
      const requests: FriendRequest[] = data.requests || [];
      const myId = user?.id;
      const received = requests.filter(req => req.toUserId === myId);
      const sent = requests.filter(req => req.fromUserId === myId);
      setFriendRequestsReceived(received);
      setFriendRequestsSent(sent);
    } catch (err) {
      console.error("친구 요청 목록 불러오기 실패", err);
    }
  };

  const handleAcceptReject = async (requestId: number, action: "accept" | "reject") => {
    try {
      await axios.patch(`/friends/respond/${requestId}`, { action });
      setFriendRequestsReceived((prev) => prev.filter((req) => req.requestId !== requestId));
      alert(`친구 요청 ${action} 처리되었습니다.`);
      // 수락 후 Settings 페이지에서 친구 목록에 반영되도록 백엔드에서 생성되어야 함.
    } catch (err) {
      alert(`친구 요청 ${action}에 실패했습니다.`);
    }
  };

  const filteredReceived = friendRequestsReceived.filter(
    (req) =>
      req.name.toLowerCase().includes(searchText.toLowerCase()) ||
      req.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredSent = friendRequestsSent.filter(
    (req) =>
      req.name.toLowerCase().includes(searchText.toLowerCase()) ||
      req.email.toLowerCase().includes(searchText.toLowerCase())
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
          <div className="set-pHeader">프로필</div>
          <div className="set-user-profile">
            <img
              src={getProfileImageUrl(user?.profile_image)}
              style={{ width: "13vw", height: "13vw", borderRadius: "40px" }}
              alt="프로필 큰 이미지"
            />
          </div>
          <div className="set-user-name-wrapper">
            <div className="set-user-name">{user?.name}</div>
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
        </aside>
  
        <section className="requests-middle-section">
          <div className="set-pHeader" style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "Jamsil_B",
                fontSize: "1.6vw",
                color: "black",
                cursor: "pointer",
                marginRight: "1vw"
              }}
              onClick={() => navigate("/settings")}
            >
              &lt;요청목록
            </span>
          </div>
  
          <div className="requests-subheader">받은 요청</div>
          <div className="request-list">
            {filteredReceived.length === 0 ? (
              <p>받은 친구 요청이 없습니다.</p>
            ) : (
              filteredReceived.map((req) => (
                <div className="request-item" key={req.requestId}>
                  <img
                    src={req.profileImage || "../images/default_profile.png"}
                    alt="프로필"
                    className="request-profile"
                  />
                  <div className="request-info">
                    <span className="request-name">{req.name}</span>
                    <span className="request-email">{req.email}</span>
                  </div>
                  <div className="request-actions">
                    <button className="accept-btn" onClick={() => handleAcceptReject(req.requestId, "accept")}>
                      수락
                    </button>
                    <button className="reject-btn" onClick={() => handleAcceptReject(req.requestId, "reject")}>
                      거절
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
  
          <div className="requests-subheader">보낸 요청</div>
          <div className="request-list">
            {filteredSent.length === 0 ? (
              <p>보낸 친구 요청이 없습니다.</p>
            ) : (
              filteredSent.map((req) => (
                <div className="request-item" key={req.requestId}>
                  <img
                    src={req.profileImage || "../images/default_profile.png"}
                    alt="프로필"
                    className="request-profile"
                  />
                  <div className="request-info">
                    <span className="request-name">{req.name}</span>
                    <span className="request-email">{req.email}</span>
                  </div>
                  <div className="request-actions">
                    <button className="reject-btn">요청 취소</button>
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
