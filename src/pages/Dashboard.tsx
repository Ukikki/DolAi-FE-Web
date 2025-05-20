import { useState, useEffect } from "react"; 
import { NavigateFunction } from "react-router-dom";
import { Card } from "@/components/Card";
import { ToDoList, useTodoList } from "@/components/ToDo";
import Calendar from "@/components/MyCalendar";
import GraphView from "@/components/GraphView";
import { Home, Video, FileText } from "lucide-react";
import { redirectToSocialAuth } from '@/services/authService';
import { useUser } from "@/hooks/user/useUser";
import { useNavigateMeeting } from "@/hooks/useNavigateMeeting";
import CreateMeeting from "@/components/modal/CreateMeeting";
import { getProfileImageUrl } from "@/utils/getProfileImageUrl";
import axios from "@/utils/axiosInstance"; 
//import dayjs from "dayjs";
import { List } from "lucide-react";



interface DashboardProps {
  selected: String;
  navigate: NavigateFunction;
}

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  inviteUrl: string;
  directoryId: number; // ✅ 추가됨
}

export default function Dashboard({ selected, navigate }: DashboardProps) {
  const { todos, addTodo, deleteTodo, updateStatus } = useTodoList();
  const { user, isLoggedIn } = useUser();
  const [showModal, setShowModal] = useState(false);
  const { handleCreateMeeting } = useNavigateMeeting();
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);

  const [showAllMeetingsModal, setShowAllMeetingsModal] = useState(false);
const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);


  useEffect(() => {
    const fetchRecentMeetings = async () => {
      try {
        const res = await axios.get("/meetings/history-recent");
        console.log("✅ recent meetings 응답:", res.data); // ← 로그 찍기
        const meetings = res.data?.data ?? [];
        setRecentMeetings(meetings);
      } catch (err) {
        console.error("❌ recent meetings 에러:", err); // ← 여기서 axios error response 확인
      }
    };
  
    fetchRecentMeetings();
  }, []);

  const fetchAllMeetings = async () => {
    try {
      console.log("📤 [Front] /meetings/history 호출 시작");
  
      const res = await axios.get("/meetings/history");
  
      console.log("📦 [Front] 전체 회의 응답:", res.data);
  
      setAllMeetings(res.data?.data ?? []);
      setShowAllMeetingsModal(true);
    } catch (err) {
      console.error("❌ [Front] 전체 회의 불러오기 실패:", err);
      
    }
  };
  

  
  
  
  

  return (
    <div className="container">
      {/* 상단 네비게이션 */}
      <header className="navbar">
        <div className="navbar-left">
          <img src="./images/main_logo.png" alt="DolAi Logo" />
        </div>

        <div className="navbar-center">
          <nav className="navbar-icons">
            <div className={`icon-container ${selected === "home" ? "selected" : ""}`} onClick={() => navigate("/")}>
              <Home style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            {showModal && (
              <CreateMeeting
                onCreate={(title, startTime) => handleCreateMeeting(title, startTime, setShowModal)}
                onClose={() => setShowModal(false)}
              />
            )}
            <div className={`icon-container ${selected === "video" ? "selected" : ""}`} onClick={() => setShowModal(true)}>
              <Video style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            <div className={`icon-container ${selected === "document" ? "selected" : ""}`} onClick={() => navigate("/documents")}>
              <FileText style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
          </nav>
        </div>

        <div className="navbar-right">
          <div className="user-profile">
            {user?.profile_image ? (
              <img
                src={getProfileImageUrl(user?.profile_image)}
                style={{ width: "2.1vw", borderRadius: "10px", cursor: "pointer" }}
                onClick={() => navigate("/settings")}
              />
            ) : (
              <div style={{ width: "2.1vw", borderRadius: "10px", cursor: "default" }} />
            )}
          </div>
        </div>
      </header>

      <main className="main">
        {/* 좌측 패널 (최근 회의) */}
        <aside className="left-section">
          <div className="left-panel">
            
          <div className="left-panel-title-wrapper">
 
  <List
    className="all-meetings-icon"
    onClick={fetchAllMeetings}
    aria-label="전체 회의 보기"
    style={{ marginLeft: "8px", cursor: "pointer" }}
  /> <p className="left-panel-title">최근 회의</p>
</div>
            {recentMeetings.length === 0 ? (
              <p>최근 회의가 없습니다.</p>
            ) : (
              recentMeetings.slice(0, 4).map((meeting) => (
                <Card key={meeting.id} onClick={() => navigate(`/folder/${meeting.directoryId}`)}>
                  <div className="meeting-content">
                    <span className="meeting-title">{meeting.title}</span>
                    <span className="meeting-date">
  {new Date(meeting.startTime).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })}
</span>

                  </div>
                </Card>
              ))
            )}
          </div>

          {/* 좌측 패널 (To Do 리스트) */}
          <div className="left-panel">
            <p>To Do</p>
            {todos.map((todo) => (
              <ToDoList
                key={todo.id}
                {...todo}
                onDelete={deleteTodo}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        </aside>

        {/* 그래프 영역 */}
        <section className="graph-section">
          {isLoggedIn ? (
            <GraphView />
          ) : (
            <div className="login-container">
              <img src="./images/login_bg.png" alt="login bg" className="login-bg" />
              <div className="login-form">
                <button className="login-btn" onClick={() => redirectToSocialAuth('kakao')} />
                <button className="login-btn2" onClick={() => redirectToSocialAuth('google')} />
              </div>
            </div>
          )}
        </section>

        {/* 캘린더 영역 */}
        <aside className="calendar-section">
          <Calendar addTodo={addTodo} />
        </aside>
      </main>

      {showAllMeetingsModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h2 className="modal-title">전체 회의</h2>
      <div className="modal-meeting-list">
        {allMeetings.length === 0 ? (
          <p>회의 내역이 없습니다.</p>
        ) : (
          allMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="modal-meeting-item"
              onClick={() => {
                navigate(`/folder/${meeting.directoryId}`);
                setShowAllMeetingsModal(false);
              }}
              style={{ cursor: "pointer", padding: "10px 0", borderBottom: "1px solid #ccc" }}
            >
              <strong>{meeting.title}</strong><br />
              <small>{new Date(meeting.startTime).toLocaleDateString("ko-KR")}</small>
            </div>
          ))
        )}
      </div>
      <div className="modal-button-wrapper">
  <button
    className="modal-cancel-button"
    onClick={() => setShowAllMeetingsModal(false)}
  >
    취소
  </button>
</div>
    </div>
  </div>
)}
    </div>
  );
}
