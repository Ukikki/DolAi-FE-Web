import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";

export const useLeaveMeeting = (meetingId: string) => {
  const navigate = useNavigate();

  const handleLeaveMeeting = async () => {
    if (!meetingId) {
      alert("회의 정보를 불러오지 못했어요.");
      return;
    }

    try {
      // host인지 확인하는 API가 필요하거나 무조건 종료 API 요청
      await axios.patch(`/${meetingId}/end`);
    } catch (err) {
      console.error("회의 종료 실패", err);
      alert("회의 종료에 실패했어요.");
      return;
    }

    navigate("/documents");
  };

  return handleLeaveMeeting;
};