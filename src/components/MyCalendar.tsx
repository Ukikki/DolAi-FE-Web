import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, X } from "lucide-react";
import "./Calendar.css";
import "./Card.css";
import { useUser } from "@/hooks/user/useUser";
import { useCalendar } from "@/hooks/useCalendar";
import { useHoliday } from "@/hooks/useHoliday";
import { formatTime, parseLocalDate } from "@/utils/formatTime";
import axios from "@/utils/axiosInstance";

interface CalendarProps {
  addTodo: (task: string, time: string) => void;
  onMeetingCardClick: (meetingId: string) => void;
}

const statusToImage: Record<string, string> = {
  SCHEDULED: "scheduled.png",
  ONGOING: "ongoing.png",
  ENDED: "ended.png",
};

const MyCalendar: React.FC<CalendarProps> = ({ addTodo, onMeetingCardClick }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { user } = useUser();
  const navigate = useNavigate(); 
  
  // 다이얼로그
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(getCurrentDateTimeLocal());
  const [newTodo, setNewTodo] = useState("");
  const [newTodoTime, setNewTodoTime] = useState(getCurrentDateTimeLocal());
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  // 현재 연/월
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  // 공휴일 가져오기
  const { holidays } = useHoliday(currentYear, currentMonth);

  // 일정 가져오기
  const { markedMap, dailyEvents, fetchMonthlyDots, fetchEventsByDate, reserveMeeting, deleteMeeting } = useCalendar(currentYear, currentMonth);

  useEffect(() => {
    const todayStr = today.toLocaleDateString("sv-SE");
    setSelectedDate(todayStr);
    fetchMonthlyDots();
    fetchEventsByDate(todayStr);
  }, [currentYear, currentMonth]);
  
  // 날짜 클릭
  const handleDateClick = (date: Date) => {
    const clickedDate = date.toLocaleDateString("sv-SE");
    setSelectedDate(clickedDate);
    fetchEventsByDate(clickedDate);
  };

  // 카드 클릭
  const handleCardClick = async (event: any) => {
    console.log("초대링크로 회의 참가 시도:", event.inviteUrl);

    if (event.status === "ONGOING") {
      try {

        const res = await axios.post("/join", {
          inviteUrl: event.inviteUrl,
          userId: user?.id,
        });

        if (res.data.status === "success") {
          const data = res.data.data;
          navigate("/meetings", {
            state: {
              meetingId: data.id,
              inviteUrl: data.inviteUrl,
              userName: user?.name,
            },
          });
        } else {
          alert(res.data.message || "회의에 참여할 수 없습니다.");
        }
      } catch (err: any) {
        console.error("❌ 회의 참가 실패:", err);
        alert(err?.response?.data?.message || "서버 오류로 회의에 참가할 수 없습니다.");
      }
    } else {
      onMeetingCardClick(event.id);
    }
  };

  // 캘린더 추가
  const handleAddEvent = async () => {
    if (!newEventTitle || !newEventDate) {
      alert("제목과 날짜를 입력하세요.");
      return;
    }
  
    try {
      await reserveMeeting({
        title: newEventTitle,
        startDateTime: newEventDate,
        participants: [],
      });
  
      setNewEventTitle("");
      setNewEventDate(getCurrentDateTimeLocal());
      closeDialog();
    } catch (e) {
      console.error("캘린더 일정 추가 실패:", e);
    }
  };  

  // 투두 추가
  const handleAddTodo = () => {
    if (newTodo && newTodoTime) {
      addTodo(newTodo, newTodoTime);
      setNewTodo("");
      setNewTodoTime("");
      closeDialog();
    }
  };

  function getCurrentDateTimeLocal() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  }

  if (!user) return null;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <Calendar
          onClickDay={handleDateClick}
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate) {
              setCurrentYear(activeStartDate.getFullYear());
              setCurrentMonth(activeStartDate.getMonth() + 1);
            }
          }}
          locale="ko-KR"
          calendarType="gregory"
          formatDay={() => ""}
          value={selectedDate}
          minDetail="month"
          maxDetail="month"
          showNeighboringMonth={false}
          prevLabel={<ChevronLeft size="1.2vw" strokeWidth={3} />}
          prev2Label={<ChevronsLeft size="1.2vw" strokeWidth={3} />}
          nextLabel={<ChevronRight size="1.2vw" strokeWidth={3} />}
          next2Label={<ChevronsRight size="1.2vw" strokeWidth={3} />}
          tileClassName={({ date }) => {
            const dateStr = date.toLocaleDateString("sv-SE");
            const isHoliday = holidays.includes(dateStr);
            const isSaturday = date.getDay() === 6;
            const isSunday = date.getDay() === 0;

            if (isHoliday) return "holiday";
            if (isSunday) return "sun";
            if (isSaturday) return "sat";
            return "";
          }}
          tileContent={({ date }) => {
            const day = date.getDate();
            const count = markedMap[day] || 0;
          
            const dots = Array(Math.min(count, 3)).fill(0).map((_, i) => (
              <div key={i} className={`dot dot-${i + 1}`} />
            ));
            
            return <>
              <div className="calendar-day">{date.getDate()}</div>
              {dots}
            </>;
          }}
        />
        <Plus className="plus-button" size="1.2vw" strokeWidth={3} onClick={openDialog} />
      </div>

      {selectedDate && (
        <div className="event-container">
          {dailyEvents.length === 0
        ? null
        : [...dailyEvents]
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .map((event, index) => {
              return (
                <div
                  key={index}
                  className="event-card"
                  onClick={() => handleCardClick(event)}
                >
                  <div className="event-content">
                    <span className="todo-time">{formatTime(parseLocalDate(event.start))}</span>
                    <span className="meeting-title">{event.title}</span>
                  </div>

                  {/* ✅ 이미지 + X 버튼 묶기 */}
                  <div className="event-actions">
                    {event.status && (
                      <img
                      src={`/images/${statusToImage[(event.status)]}`}
                        alt={event.status}
                        className="event-status-icon"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <X
                      className="event-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMeeting(event.meetingId, selectedDate!);
                      }}
                    />
                  </div>
                </div>
              );
            })}
      </div>
      )}


      {isDialogOpen && (
        <div className="cal-dialog-overlay">
          <div className="cal-dialog">
            <div className="cal-dialog-tabs">
              <button className={activeTab === 'tab1' ? 'active' : ''} onClick={() => setActiveTab('tab1')}>캘린더</button>
              <button className={activeTab === 'tab2' ? 'active' : ''} onClick={() => setActiveTab('tab2')}>To Do</button>
            </div>

            <div className="cal-dialog-content">
              {activeTab === 'tab1' && (
                <div className="cal-tab-content">
                  <input type="text" placeholder="새로운 일정" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} />
                  <input type="datetime-local" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} className="non-border" />
                  <input className="non-border" type="text" placeholder="초대할 사람(이름 또는 이메일)" />
                  <div className="cal-btn-container">
                    <button className="cal-close-btn" onClick={closeDialog}>닫기</button>
                    <button className="cal-add-btn" onClick={handleAddEvent}>추가</button>
                  </div>
                </div>
              )}
              {activeTab === 'tab2' && (
                <div className="cal-tab-content">
                  <input type="text" placeholder="새로운 할 일" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
                  <input type="datetime-local" value={newTodoTime} onChange={(e) => setNewTodoTime(e.target.value)} className="non-border" />
                  <div className="cal-btn-container">
                    <button className="cal-close-btn" onClick={closeDialog}>닫기</button>
                    <button className="cal-add-btn" onClick={handleAddTodo}>추가</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;