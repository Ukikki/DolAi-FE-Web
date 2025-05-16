import axios from "@/utils/axiosInstance";

export const useScreenShare = (meetingId: string, userId: string) => {
  const screenShareStart = async () => {
    try {
      // 1️⃣ 상태 조회
      const statusRes = await axios.get(`/meetings/${meetingId}/screen-share/status`);
      if (statusRes.data?.active) {
        alert("이미 화면 공유 중입니다.");
        return;
      }

      // 화면 공유 시작
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = displayStream.getVideoTracks()[0];

      // 서버에 화면 공유 시작 알림
      const res = await axios.post(`/meetings/${meetingId}/screen-share/start`, {
        userId,
      });
      console.log("✅ 화면 공유 시작:", res.data);

      // 트랙이 종료되면 stop도 호출
      track.onended = () => {
        console.log("🛑 화면 공유 사용자 종료됨");
        screenShareStop();
      };

    } catch (err) {
      console.error("❌ 화면 공유 시작 실패:", err);
    }
  };

  const screenShareStop = async () => {
    try {
      const res = await axios.post(`/meetings/${meetingId}/screen-share/stop`, {
        userId,
      });
      console.log("🧼 화면 공유 종료:", res.data);

    } catch (err) {
      console.error("❌ 화면 공유 종료 실패:", err);
    }
  };

  return { screenShareStart, screenShareStop };
};