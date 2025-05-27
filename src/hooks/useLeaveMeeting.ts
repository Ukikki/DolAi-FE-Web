import { RefObject } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";
import { exportGraphBlob } from "@/utils/exportGraphBlob";

export const useLeaveMeeting = (meetingId: string, svgRef: RefObject<SVGSVGElement | null>) => {

  const navigate = useNavigate();

  const handleLeaveMeeting = async () => {
    console.log("🟡 handleLeaveMeeting 실행됨");
    if (!meetingId || !svgRef.current) return;

    try {
      const blob = await exportGraphBlob(svgRef.current);
      if(!blob) return;

      // 서버로 업로드
      const formData = new FormData();
      formData.append("image", blob, `graph-${meetingId}.png`);
      await axios.post(`/meetings/${meetingId}/graph-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("서버 업로드");

      // 회의 종료
      await axios.patch(`/${meetingId}/end`);


    } catch (err: any) {
      console.error("회의 종료 실패:", err);
    }

    navigate("/documents");
  };

  return handleLeaveMeeting;
};
