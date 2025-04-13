import React, { useState, useEffect } from "react";
import { Home, Video, FileText } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { handleSocialLogout } from "../utils/logout";
import { getProfileImageUrl } from "../utils/getProfileImageUrl";
import axios from "../utils/axiosInstance";
import "../styles/RequestsPage.css";

interface FriendRequest {
  requestId: number;
  fromUserId: string;
  toUserId: string;
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

  useEffect(() => {
    fetchReceivedRequests();
    fetchSentRequests();
  }, []);

  const fetchReceivedRequests = async () => {
    try {
      const res = await axios.get("/friends/requests");
      const received: FriendRequest[] = res.data.data.requests || [];
      setFriendRequestsReceived(received);
    } catch (err) {
      console.error("받은 요청 불러오기 실패:", err);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const res = await axios.get("/friends/requests/sent");
      const sent: FriendRequest[] = res.data.data.sentRequests || [];
      setFriendRequestsSent(sent);
    } catch (err) {
      console.error("보낸 요청 불러오기 실패:", err);
    }
  };

  const handleAcceptReject = async (requestId: number, action: "accept" | "reject") => {
    try {
      await axios.patch(`/friends/respond/${requestId}`, { action });
      setFriendRequestsReceived((prev) => prev.filter((req) => req.requestId !== requestId));
      alert(`친구 요청을 ${action === "accept" ? "수락" : "거절"}했습니다.`);
    } catch (err) {
      alert("요청 처리에 실패했습니다.");
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await axios.delete(`/friends/requests/${requestId}`);
      setFriendRequestsSent((prev) => prev.filter((req) => req.requestId !== requestId));
      alert("보낸 친구 요청을 취소했습니다.");
    } catch (err) {
      alert("요청 취소에 실패했습니다.");
    }
  };

  return (
    <div className="container">
      {/* 좌측 상단 네비게이션 바 */}
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
            <img src={getProfileImageUrl(user?.profile_image)} alt="프로필 이미지" className="profile-img" />
          </div>
        </div>
      </header>

      <main className="main">
        {/* 좌측 사이드바: 프로필 영역 */}
        <aside className="set-sides-section">
          <div className="set-pHeader">프로필</div>
          <div className="set-user-profile">
            <img src={getProfileImageUrl(user?.profile_image)} alt="프로필 큰 이미지" className="profile-large" />
          </div>
          <div className="set-user-name-wrapper">
            <div className="set-user-name">{user?.name}</div>
          </div>
          <div className="set-user-email">{user?.email}</div>
          <div className="set-nHeader">알림 설정</div>
          {/* 토글 등 기타 설정 내용 */}
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

        {/* 중앙 영역: 요청목록 페이지 (리스트 스타일) */}
        <section className="requests-middle-section">
          <div className="requests-header-container">
            <span className="requests-header" onClick={() => navigate("/settings")}>
              &lt; 요청목록
            </span>
          </div>
          <hr className="divider" />

          <div className="requests-content">
            <div className="section-header">받은 요청 ({friendRequestsReceived.length})</div>
            {friendRequestsReceived.length === 0 ? (
              <p className="empty-message">받은 친구 요청이 없습니다.</p>
            ) : (
              friendRequestsReceived.map((req) => (
                <div key={req.requestId} className="request-item">
                  <div className="item-info">
                    <div className="avatar">
                      <img src={req.profileImage || "/images/default_profile.png"} alt={req.name} />
                    </div>
                    <div className="item-text">
                      <div className="item-name">{req.name}</div>
                      <div className="item-email">{req.email}</div>
                    </div>
                  </div>
                  <div className="item-actions">
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

            <div className="section-header">보낸 요청 ({friendRequestsSent.length})</div>
            {friendRequestsSent.length === 0 ? (
              <p className="empty-message">보낸 친구 요청이 없습니다.</p>
            ) : (
              friendRequestsSent.map((req) => (
                <div key={req.requestId} className="request-item">
                  <div className="item-info">
                    <div className="avatar">
                      <img src={req.profileImage || "/images/default_profile.png"} alt={req.name} />
                    </div>
                    <div className="item-text">
                      <div className="item-name">{req.name}</div>
                      <div className="item-email">{req.email}</div>
                    </div>
                  </div>
                  <div className="item-actions">
                    <img className="delete-icon" alt="Delete" src="/streamline-delete-1.svg" onClick={() => handleCancelRequest(req.requestId)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 우측 사이드바: 알림 영역 */}
        <aside className="set-sides-section">
          <div className="set-pHeader">알림</div>
        </aside>
      </main>
    </div>
  );
}
