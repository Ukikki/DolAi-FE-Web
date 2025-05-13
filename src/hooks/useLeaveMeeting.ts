import { RefObject } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";
import { exportGraphBlob } from "@/utils/exportGraphBlob";

export const useLeaveMeeting = (meetingId: string, svgRef: RefObject<SVGSVGElement | null>) => {
  const navigate = useNavigate();

  const handleLeaveMeeting = async () => {
    if (!meetingId || !svgRef.current) return;

    try {
      // PNG Blob으로 변환
      const blob = await exportGraphBlob(svgRef.current);

      // 서버로 업로드
      const formData = new FormData();
      //formData.append("image", blob, `graph-${meetingId}.png`);
      await axios.post(`/meetings/${meetingId}/graph-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 회의 종료
      await axios.patch(`/${meetingId}/end`);
    } catch (err: any) {
      console.error("회의 종료 실패:", err);
    }

    navigate("/documents");
  };

  return handleLeaveMeeting;
};