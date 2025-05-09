import { useNavigate } from "react-router-dom";
import axios from "@/utils/axiosInstance";
import { useUser } from "@/hooks/user/useUser";

export function useNotiHandler() {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleNotiClick = async (category: string, url: string) => {
    if (category === "친구") {
      navigate("/settings/requestpage");
    } else if (category === "회의") {
        if (!url) {
            console.log("회의 정보가 잘못되었습니다.");
            return;
          }
      try {
        const res = await axios.post("/join", {
          inviteUrl: url,
          userId: user?.id, 
        });
        console.log(res.data.data);

        if (res.data.status === "success") {
          const { meetingId, inviteUrl } = res.data.data;
            navigate("/meetings", {
              state: { meetingId, inviteUrl },
            });
          } else {
            alert(res.data.message || "회의에 참여할 수 없습니다.");
          }
        } catch (err: any) {
          console.error("❌ 회의 참가 실패:", err);
          alert(err?.response?.data?.message || "서버 오류로 회의에 참가할 수 없습니다.");
        }
    } else if (category === "일정") {
      navigate("/");
    }
  };

  return { handleNotiClick };
}
