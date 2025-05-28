import { RefObject } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";
import { exportGraphBlob } from "@/utils/exportGraphBlob";
import { Socket } from "socket.io-client"; // ✅ 추가된 코드

// ✅ socket 인자를 추가합니다
export const useLeaveMeeting = (
  meetingId: string,
  svgRef: RefObject<SVGSVGElement | null>,
  socket?: Socket // ✅ 선택적 인자로 socket 추가
) => {

  const navigate = useNavigate();

  const handleLeaveMeeting = async () => {
    console.log("🟡 handleLeaveMeeting 실행됨");
    if (!meetingId || !svgRef.current) return;

    try {
      const blob = await exportGraphBlob(svgRef.current);
      if (!blob) return;

      // 서버로 업로드
      const formData = new FormData();
      formData.append("image", blob, `graph-${meetingId}.png`);
      await axios.post(`/meetings/${meetingId}/graph-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("서버 업로드");

      // 회의 종료
      await axios.patch(`/${meetingId}/end`);

      console.log("🔍 emit 직전 socket.id:", socket?.id);

      // ✅ 회의 종료 후 모든 참가자에게 퇴장 요청
      socket?.emit("end-meeting", { meetingId }); // ✅ 추가된 코드
      socket?.disconnect(); // ✅ 명시적으로 연결 끊기


    } catch (err: any) {
      console.error("회의 종료 실패:", err);
    }

    navigate("/documents");
  };

  return handleLeaveMeeting;
};
