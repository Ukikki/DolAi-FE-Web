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
    if (!ref.current) return;

    console.log("🔍 RemoteVideo stream tracks:", stream.getTracks());
  console.log("🔍 hasVideo 상태:", hasVideo);

    ref.current.srcObject = stream;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      setHasVideo(false);
      return;
    }

    setHasVideo(videoTrack.enabled);

    const handleMute = () => setHasVideo(false);
    const handleUnmute = () => setHasVideo(true);

    videoTrack.addEventListener("mute", handleMute);
    videoTrack.addEventListener("unmute", handleUnmute);

    return () => {
      videoTrack.removeEventListener("mute", handleMute);
      videoTrack.removeEventListener("unmute", handleUnmute);
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