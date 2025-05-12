import { useEffect, useRef, useState } from "react";
import "@/styles/meeting/Meeting.css";

interface Props {
  stream: MediaStream;
  name: string;
}

export default function RemoteVideo({ stream, name }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }

    const videoTrack = stream.getVideoTracks()[0];
    setHasVideo(videoTrack?.enabled ?? false); // enabled=false면 꺼진 상태

    // track 상태 변경 시 감지
    videoTrack?.addEventListener("mute", () => setHasVideo(false));
    videoTrack?.addEventListener("unmute", () => setHasVideo(true));

    return () => {
      videoTrack?.removeEventListener("mute", () => setHasVideo(false));
      videoTrack?.removeEventListener("unmute", () => setHasVideo(true));
    };
  }, [stream]);

  return (
    <div className="video-box">
      {hasVideo ? (
        <video ref={ref} autoPlay playsInline />
      ) : (
        <div className="video-off">
          <span>{name}</span>
        </div>
      )}
    </div>
  );
}
