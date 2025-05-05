import { useNavigate } from "react-router-dom";
import { useCreateMeeting } from "@/hooks/useCreateMeeting";
import axios from "@/utils/axiosInstance";

export function useNavigateMeeting() {
  const navigate = useNavigate();
  const { createMeeting } = useCreateMeeting();

  const handleCreateMeeting = async (title: string, startTime: string, setShowModal?: (v: boolean) => void) => {
    try {
      const result = await createMeeting({ title, startTime });
      console.log(result);
      const meetingId = result.id;
      const inviteUrl = result.inviteUrl;

      // sfu-ip 받기
      const sfuRes = await axios.get("/sfu-ip");
      const sfuIp = sfuRes.data.ip;

      if (setShowModal) setShowModal(false);

      navigate("/meetings", {
        state: { showInvite: true, meetingId, inviteUrl, sfuIp },
      });
    } catch (e) {
      alert("회의 생성에 실패했어요!");
    }
  };

  return { handleCreateMeeting };
}
