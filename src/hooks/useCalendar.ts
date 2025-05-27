import { useState } from "react";
import axios from "@/utils/axiosInstance";
import { isAxiosError } from "axios";
import { Meeting } from "@/types/meeting";
import { CalendarEvent } from "@/types/calendar";

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
    try {
      const res = await axios.get(`/calendar/day/${date}`);
      const meetings = res.data.data.meetings || [];

      const events = meetings.map((m: Meeting) => ({
        id: m.meetingId,
        title: m.title,
        start: m.startTime,
      }));
      setDailyEvents(events);
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 500) return;
      }
      console.error("❌ 일별 일정 가져오기 실패:", err);
    }
  };

  // 회의 예약 요청 + 일정/초록점 새로고침
  const reserveMeeting = async (data: MeetingRequest) => {
    await axios.post("/calendar/reserve", data);

    const dateOnly = data.startDateTime.split("T")[0]; // "YYYY-MM-DD"
    await fetchEventsByDate(dateOnly);
    await fetchMonthlyDots();
  };

  // 회의 삭제
  const deleteMeeting = async (meetingId: string, date: string) => {
    try {
      await axios.delete(`/calendar/reserve/${meetingId}`);
      
      await fetchEventsByDate(date);
    } catch (err) {
      console.error("회의 삭제 실패:", err);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  return {
    markedMap, 
    dailyEvents,
    fetchMonthlyDots,
    fetchEventsByDate,
    reserveMeeting, 
    deleteMeeting,
  };
};