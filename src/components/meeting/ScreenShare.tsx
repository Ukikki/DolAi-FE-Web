import { useEffect, useRef } from "react";
import "@/styles/meeting/ScreenShare.css";

interface Props {
  stream?: MediaStream;
  presenterName?: string;
  isLocal: boolean;
  localCameraStream?: MediaStream;
  minutesLog: { speaker: string; text: string }[];
}

export default function ScreenShare({
  stream,
  presenterName,
  isLocal,
  localCameraStream,
  minutesLog,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.warn("❌ 공유영상 재생 실패:", err));
    }
  }, [stream]);

  useEffect(() => {
    if (cameraRef.current && localCameraStream) {
      cameraRef.current.srcObject = localCameraStream;
      cameraRef.current.play().catch(err => console.warn("❌ 카메라 재생 실패:", err));
    }
  }, [localCameraStream]);

  return (
    <div className="screen-share-overlay">
      {/* 화면 공유 메인 */}
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal}
        playsInline
        className="screen-share-video"
      />

      {/* 카메라 PIP (본인이 공유자일 경우) */}
      {isLocal && localCameraStream && (
        <div className="my-video-pip">
          <video ref={cameraRef} autoPlay muted playsInline />
        </div>
      )}

      {/* 자막 표시 (최근 2개만) */}
      <div className="stt-log-overlay">
        {minutesLog.slice(-2).map((log, idx) => (
          <div key={idx} className="stt-line">
            <b>{log.speaker}:</b> {log.text}
          </div>
        ))}
      </div>

      {/* 공유자 이름 */}
      {presenterName && (
        <div className="presenter-name-overlay">
          {presenterName}님의 화면을 공유 중입니다
        </div>
      )}
    </div>
  );
}
