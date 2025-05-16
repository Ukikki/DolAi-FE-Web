import { useState } from "react";
import axios from "@/utils/axiosInstance";
import { isAxiosError } from "axios";

export interface CalendarEvent {
  title: string;
  start: string;
}

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
}

export interface MeetingRequest {
  title: string;
  startDateTime: string;
  participants: string[];
}

export const useCalendar = (year: number, month: number) => {
  const [markedMap, setMarkedMap] = useState<{ [day: number]: number }>({});
  const [dailyEvents, setDailyEvents] = useState<CalendarEvent[]>([]);

  // 월별 회의 개수 가져오기
  const fetchMonthlyDots = async () => {
    try {
      const res = await axios.get(`/calendar/${year}/${month}`);
      const dayList = res.data.data.dates || [];
    
      const dayMap: { [day: number]: number } = {};
      dayList.forEach((item: { day: number; count?: number }) => {
        dayMap[item.day] = item.count ?? 0;
      });
        setMarkedMap(dayMap);
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 500) return; 
      }
      console.error("❌ 월간 일정 가져오기 실패:", err);
    }
  };
  
  // 일별 회의 가져오기
  const fetchEventsByDate = async (date: string) => {
    const res = await axios.get(`/calendar/day/${date}`);
    const meetings = res.data.data.meetings || [];
    const events = meetings.map((m: Meeting) => ({
      title: m.title,
      start: m.startTime,
    }));
    setDailyEvents(events);
  };

  // 회의 예약 요청 + 일정/초록점 새로고침
  const reserveMeeting = async (data: MeetingRequest) => {
    await axios.post("/calendar/reserve", data);

    const dateOnly = data.startDateTime.split("T")[0]; // "YYYY-MM-DD"
    await fetchEventsByDate(dateOnly);
    await fetchMonthlyDots();
  };

  return {
    markedMap, 
    dailyEvents,
    fetchMonthlyDots,
    fetchEventsByDate,
    reserveMeeting, 
  };
};