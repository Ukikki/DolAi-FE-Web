import { useNavigate } from "react-router-dom";
import { useCreateMeeting } from "@/hooks/useCreateMeeting";

export function useNavigateMeeting() {
  const navigate = useNavigate();
  const { createMeeting } = useCreateMeeting();

  const handleCreateMeeting = async (title: string, startTime: string, setShowModal?: (v: boolean) => void) => {
    try {
      const result = await createMeeting({ title, startTime });
      const inviteUrl = result.inviteUrl;
      if (setShowModal) setShowModal(false);

      navigate("/meetings", {
        state: { showInvite: true, inviteUrl },
      });
    } catch (e) {
      alert("회의 생성에 실패했어요!");
    }
  };

  return { handleCreateMeeting };
}
