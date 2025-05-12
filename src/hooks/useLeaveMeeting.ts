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
      await axios.patch(`/${meetingId}/end`);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        console.warn("⚠️ 주최자가 아니므로 그냥 나가기");
      } else {
        alert("회의 종료에 실패했어요.");
        console.error("회의 종료 실패", err);
        return;
      }
    }

    navigate("/documents");
  };

  return handleLeaveMeeting;
};