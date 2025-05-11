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

      if (setShowModal) setShowModal(false);

      await axios.post(`/graph/sync/${meetingId}`);
      navigate("/meetings", {
        state: { showInvite: true, meetingId, inviteUrl },
      });
    } catch (e) {
      alert("회의 생성에 실패했어요!");
    }
  };

  return { handleCreateMeeting };
}
