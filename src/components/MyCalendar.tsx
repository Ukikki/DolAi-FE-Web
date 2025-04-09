import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import "./Calendar.css";
import "./Card.css";

interface CalendarProps {
  addTodo: (task: string, time: string) => void;
}

// 공휴일 -> API로 변경 예정
const holidays = new Holidays("KR"); // 한국
const hd = holidays.getHolidays(new Date().getFullYear()).map(h => new Date(h.date).toLocaleDateString("sv-SE"));

const MyCalendar: React.FC<CalendarProps> = ({ addTodo }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // 예시
  const [events, setEvents] = useState([
    { title: "API 명세서 미팅", start: "2025-03-03T14:00" },
    { title: "ERD 설계 미팅", start: "2025-03-03T17:00" },
    { title: "ERD 설계 미팅", start: "2025-03-03T17:00" },
    { title: "UI 디자인 검토", start: "2025-03-15T10:00" },
  ]);
  const [filteredEvents, setFilteredEvents] = useState(events);

  // 다이얼로그
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(getCurrentDateTimeLocal());
  const [newTodo, setNewTodo] = useState("");
  const [newTodoTime, setNewTodoTime] = useState(getCurrentDateTimeLocal());
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  // 날짜 클릭 
  const handleDateClick = (date: Date) => {
    if (!date) return;
    const clickedDate = date.toLocaleDateString("sv-SE"); // YYYY-MM-DD 형식
    setSelectedDate(clickedDate);
    setFilteredEvents(events.filter(event => event.start.startsWith(clickedDate)));
  };

  // 캘린더 이벤트 추가
  const addEvent = () => {
    if (newEventTitle && newEventDate) {
      const updatedEvents = [...events, { title: newEventTitle, start: newEventDate }];
      setEvents(updatedEvents);
      setFilteredEvents(updatedEvents.filter(event => event.start.startsWith(selectedDate || "")));
      setNewEventTitle("");
      setNewEventDate("");
      closeDialog();
    }
  };

  // todo 이벤트 추가
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
    return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  }
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <Calendar
          onClickDay={handleDateClick}
          locale="ko-KR"
          calendarType="gregory"
          formatDay={(_, date) => (
            <div className="calendar-day"> {date.getDate()}</div>)}
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
            const isHoliday = hd.includes(dateStr);
            const isSaturday = date.getDay() === 6;
            const isSunday = date.getDay() === 0;

            if (isHoliday) return "holiday"; // 공휴일 (기본적으로 빨간색)
            if (isSunday) return "sun"; // 일요일 빨간색
            if (isSaturday) return "sat"; // 일반 토요일 파란색
            return "";
          }}
          tileContent={({ date }) => {
            const dateString = date.toLocaleDateString("sv-SE");
            const dayEvents = events.filter(event => event.start.startsWith(dateString));

            return dayEvents.slice(0, 3).map((_, index) => (
              <div key={index} className={`dot dot-${index + 1}`}></div>
            ));
          }}
        />
        <Plus className="plus-button" size="1.2vw" strokeWidth={3} onClick={openDialog} />
      </div>

      {/* 일정 표시 */}
      {selectedDate && (
        <div className="event-container">
          {filteredEvents.map((event, index) => (
            <div key={index} className="event-card">
              <span className="todo-time">{event.start.split("T")[1]}</span>
              <span className="meeting-title">{event.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* 다이얼로그 */}
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
                <input type="datetime-local" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} className="non-border"/>
                <input className="non-border" type="text" placeholder="초대할 사람(이름 또는 이메일)" />
                <div className="cal-btn-container">
                <button className="cal-close-btn" onClick={closeDialog}>닫기</button>
                <button className="cal-add-btn" onClick={addEvent}>추가</button>
              </div></div>
            )}
            {activeTab === 'tab2' && (
              <div className="cal-tab-content">
                <input type="text" placeholder="새로운 할 일" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
                <input type="datetime-local" value={newTodoTime} onChange={(e) => setNewTodoTime(e.target.value)} className="non-border"/>
                <div className="cal-btn-container">
                <button className="cal-close-btn" onClick={closeDialog}>닫기</button>
                <button className="cal-add-btn" onClick={handleAddTodo}>추가</button>
              </div></div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default MyCalendar;
