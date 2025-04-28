import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import "../styles/RequestsPage.css";
import { ChevronLeft, X } from "lucide-react";

type NavigateFunction = (path: string) => void;

interface FriendRequest {
  requestId: number;
  fromUserId: string;
  toUserId: string;
  email: string;
  name: string;
  profile_image: string;
}

interface RequestsPageProps {
  onBack: () => void;
  navigate: NavigateFunction;
}

export default function RequestsPage({ onBack, navigate }: RequestsPageProps) {
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
      setFriendRequestsReceived((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
      alert(`친구 요청을 ${action === "accept" ? "수락" : "거절"}했습니다.`);
    } catch (err) {
      alert("요청 처리에 실패했습니다.");
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await axios.delete(`/friends/requests/${requestId}`);
      setFriendRequestsSent((prev) =>
        prev.filter((req) => req.requestId !== requestId)
      );
      alert("보낸 친구 요청을 취소했습니다.");
    } catch (err) {
      alert("요청 취소에 실패했습니다.");
    }
  };

  return (
    // 중앙 영역에 표시할 요청 콘텐츠 영역 (상단에 53px 간격 적용)
    <div className="requests-content" >
      <span className="requests-header" onClick={onBack}>
        <ChevronLeft style={{ width: "1.6vw", height: "1.6vw" }} strokeWidth={3} /> 
        요청목록
      </span>

      {/* 받은 요청 섹션 */}
      <div className="section-block" style={{ marginTop: "2.3vw" }}>
        <div className="section-header">
          받은 요청 ({friendRequestsReceived.length})
        </div>
        {friendRequestsReceived.length === 0 ? (
          <div className="empty-message">받은 친구 요청이 없습니다.</div>
        ) : (
          friendRequestsReceived.map((req, index) => (
            <React.Fragment key={req.requestId}>
              <div className="request-item">
                <div className="item-info">
                  <div className="avatar">
                    <img src={req.profile_image} alt={req.name} />
                  </div>
                  <div className="item-text">
                    <div className="item-name">{req.name}</div>
                    <div className="item-email">{req.email}</div>
                  </div>
                </div>
                <div className="item-actions">
                  <button
                    className="request-accept-btn"
                    onClick={() => handleAcceptReject(req.requestId, "accept")}
                  >
                    수락
                  </button>
                  <button
                    className="request-reject-btn"
                    onClick={() => handleAcceptReject(req.requestId, "reject")}
                  >
                    거절
                  </button>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>

      {/* 보낸 요청 섹션 */}
      <div className="section-block">
        <div className="section-header">
          보낸 요청 ({friendRequestsSent.length})
        </div>
        {friendRequestsSent.length === 0 ? (
          <div className="empty-message">보낸 친구 요청이 없습니다.</div>
        ) : (
          friendRequestsSent.map((req, index) => (
            <React.Fragment key={req.requestId}>
              <div className="request-item">
                <div className="item-info">
                  <div className="avatar">
                    <img
                      src={req.profile_image}
                      alt={req.name}
                    />
                  </div>
                  <div className="item-text">
                    <div className="item-name">{req.name}</div>
                    <div className="item-email">{req.email}</div>
                  </div>
                </div>
                <X
                  className="delete-icon"
                  onClick={() => handleCancelRequest(req.requestId)}
                />
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
