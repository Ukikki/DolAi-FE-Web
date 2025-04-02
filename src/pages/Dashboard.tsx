import { Card } from "../components/Card";
import { ToDoList, useTodoList } from "../components/ToDo";
import Calendar from "../components/MyCalendar";
import { Home, Video, FileText } from "lucide-react";
import { redirectToSocialAuth } from '../services/authService';

interface DashboardProps {
  selected: String;
  navigate: (path: string) => void;
}

// 예시
const recentMeetings = [
  { id: 1, title: "DolAi UI/UX 디자인", date: "2024.12.31" },
  { id: 2, title: "DolAi API 명세서", date: "2025.01.02" },
  { id: 3, title: "DolAi ERD 설계", date: "2025.01.13" },
  { id: 4, title: "DolAi ERD 계획", date: "2025.01.20" },
];

// 최근 회의목록 임시
const handleCardClick = (id: number) => {
  alert(`${id}`);
};


export default function Dashboard({ selected, navigate } : DashboardProps) {
  const { todos, addTodo } = useTodoList(); // todos와 addTodo 함수

  return (
    <div className="container">
      {/* 상단 네비게이션 */}
      <header className="navbar">
        <img src="../images/main_logo.png" alt="DolAi Logo" />
        <nav className="navbar-icons">
          <div className={`icon-container ${selected === "home" ? "selected" : ""}`}
            onClick={() => navigate("/")}>
          <Home style={{ width: "1.71875vw", height: "1.71875vw", cursor: "pointer" }} />
          </div>

          <div className={`icon-container ${selected === "video" ? "selected" : ""}`}
            onClick={() => navigate("/meetings")}>
          <Video style={{ width: "1.71875vw", height: "1.71875vw", cursor: "pointer" }} />
          </div>

          <div className={`icon-container ${selected === "document" ? "selected" : ""}`}
            onClick={() => navigate("/documents")}>
            <FileText style={{ width: "1.71875vw", height: "1.71875vw", cursor: "pointer" }} />
          </div>
        </nav>
      </header>

      <main className="main">
        {/* 좌측 패널 (최근 회의) */}
        <aside className="left-section">
        <div className="left-panel">
          <p>최근 회의</p>
          {recentMeetings.slice(0, 4).map((meeting) => (
            <Card key={meeting.id} onClick={() => handleCardClick(meeting.id)}>
              <div className="meeting-content">
                <span className="meeting-title">{meeting.title}</span>
                <span className="meeting-date">{meeting.date}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* 좌측 패널 (To Do 리스트) */}
        <div className="left-panel">
          <p>To-Do</p>
          {todos.slice(0, 3).map((todo, index) => (
            <ToDoList key={index} {...todo} />
          ))}
        </div>
        </aside>

        {/* 그래프 영역 */}
        <section className="graph-section">
        <div className="login-container">
          <img src="../images/login_bg.png" alt="login bg" className="login-bg"/>
          <div className="login-form">
            <button className="login-btn" onClick={() => redirectToSocialAuth('kakao')} /> {/* 카카오 */}
            <button className="login-btn2" onClick={() => redirectToSocialAuth('google')} />{/* 구글 */}
          </div>
        </div>
        </section>

        {/* 캘린더 영역 */}
        <aside className="calendar-section">
          <Calendar addTodo={addTodo} />
        </aside>
      </main>
    </div>
  );
};
