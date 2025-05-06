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
      const message = err?.response?.data?.message || "";

      if (message === "회의 주최자만 회의를 종료할 수 있어요") {
        console.warn("⚠️ 주최자가 아니므로 종료 대신 나가기 처리");
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