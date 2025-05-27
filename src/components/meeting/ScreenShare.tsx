import { useEffect, useRef } from "react";
import "@/styles/meeting/ScreenShare.css";
import RemoteVideo from "@/components/meeting/RemoteVideo";
import { RemoteStreamEntry } from "@/types/remoteStreamEntry";

interface Props {
  stream?: MediaStream;
  isLocal: boolean;
  localCameraStream?: MediaStream;
  minutesLog: { speaker: string; text: string }[];
  remoteStreams: RemoteStreamEntry[];
}

export default function ScreenShare({
  stream,
  isLocal,
  localCameraStream,
  minutesLog,
  remoteStreams,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) =>
        console.warn("❌ 공유영상 재생 실패:", err)
      );
    }
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    if (cameraRef.current && localCameraStream) {
      cameraRef.current.srcObject = localCameraStream;
      cameraRef.current.play().catch((err) =>
        console.warn("❌ 카메라 재생 실패:", err)
      );
    }
    return () => {
      if (cameraRef.current) cameraRef.current.srcObject = null;
    };
  }, [localCameraStream]);

  return (
    <div className="screen-share-overlay">
      {/* 공유 화면 메인 */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="screen-share-video"
        />
      ) : (
        <div className="screen-share-video-placeholder">공유 화면 없음</div>
      )}

      {/* 우측 사이드바 참가자 카메라 영상 */}
      <div className="participant-sidebar">
        {remoteStreams
          .filter((s) => s.mediaTag === "camera")
          .map((streamObj) => (
            <div key={`${streamObj.peerId}-${streamObj.mediaTag}`} className="participant-video-block">
              <RemoteVideo
                stream={streamObj.stream}
                name={streamObj.name}
              />
            </div>
          ))}
      </div>

      {/* 자막 (최근 2개만) */}
      <div className="stt-log-overlay">
        {minutesLog.slice(-2).map((log, idx) => (
          <div key={idx} className="stt-line">
            <b>{log.speaker}:</b> {log.text}
          </div>
        ))}
      </div>
    </div>
  );
}