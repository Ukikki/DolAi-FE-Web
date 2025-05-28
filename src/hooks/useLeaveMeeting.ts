import { RefObject } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";
import { exportGraphBlob } from "@/utils/exportGraphBlob";

export const useLeaveMeeting = (meetingId: string, svgRef: RefObject<SVGSVGElement | null>) => {
  const navigate = useNavigate();

  const handleLeaveMeeting = async () => {
    console.log("🟡 handleLeaveMeeting 시작됨");
    if (!meetingId || !svgRef.current) {
      console.warn("⚠️ meetingId나 svgRef가 비어 있음");
      return;
    }

    try {
      const blob = await exportGraphBlob(svgRef.current);
      if (!blob) {
        console.warn("⚠️ exportGraphBlob 결과가 null임");
        return;
      }

      const formData = new FormData();
      formData.append("image", blob, `graph-${meetingId}.png`);

      console.log("📤 서버에 업로드 요청 보냄: /meetings/" + meetingId + "/graph-image");
      console.log("🧾 formData 파일 타입:", blob.type);

      // ❗ headers 제거 (자동으로 boundary 포함되도록)
      await axios.post(`/meetings/${meetingId}/graph-image`, formData);

      console.log("✅ 그래프 이미지 업로드 성공");

    } catch (uploadErr) {
      console.error("❌ 그래프 이미지 업로드 실패:", uploadErr);
    }

    try {
      await axios.patch(`/${meetingId}/end`);
      console.log("✅ 회의 종료 완료");
    } catch (endErr) {
      console.error("❌ 회의 종료 실패:", endErr);
    }

    navigate("/documents");
  };

  return handleLeaveMeeting;
};
