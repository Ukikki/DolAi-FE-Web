import { useEffect } from "react";
import { useUser } from "@/hooks/user/useUser";
import { sttSocketClient } from "@/utils/socketClients";

interface SttLog {
  speaker: string;
  text: string;
}

interface Props {
  meetingId: string;
  onReceive?: (log: SttLog) => void;
}

const SttListener: React.FC<Props> = ({ meetingId, onReceive }) => {
  const { user } = useUser();

  useEffect(() => {
    if (!user || !meetingId || !onReceive) return;
    sttSocketClient.subscribe(`/topic/stt/${meetingId}`, onReceive);

    return () => {
      sttSocketClient.unsubscribe(`/topic/stt/${meetingId}`);
      sttSocketClient.disconnect();
    };
  }, [user, meetingId, onReceive]);

  return null;
};

export default SttListener;