import { Camera, CameraOff, Mic, MicOff, UserPlus, MonitorUp, MessageSquareText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "@/styles/Meeting.css";
import FriendInvite from "@/components/modal/FriendInvite";

interface MeetingsProps {
    navigate: (path: string) => void;
}

export default function Meetings({ navigate } : MeetingsProps) {
  const [isCameraOn, setIsCameraOn] = useState(false); // 카메라 아이콘 상태 on/off
  const [isMicOn, setIsMicOn] = useState(false);       // 마이크 아이콘 상태 on/off
  const videoRef = useRef<HTMLVideoElement>(null);     // 비디오 상태
  const micRef = useRef<MediaStream | null>(null);     // 마이크 상태

  const location = useLocation();
  const inviteUrl = location.state?.inviteUrl; // 초대 링크 받음

  // 친구, 화이트보드, 공유, 메시지는 한 개만 동작
  const [activeTool, setActiveTool] = useState<"invite" | "board" | "monitor" | "message" | null>(null);
  const toggleTool = (tool: typeof activeTool) => {
    setActiveTool(prev => prev === tool ? null : tool); // 동일 아이콘 누르면 꺼지고, 다른 거 누르면 바뀜
  };
  const iconStyle = { width: "2vw", height: "2vw", cursor: "pointer" };

  useEffect(() => {
    if (isCameraOn) { // 카메라 켜기
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("카메라 접근 실패:", err));
    } else { // 카메라 끄기
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop()); // 스트림 정지
      }
    }
  }, [isCameraOn]);

  // 마이크 상태 변화
  useEffect(() => {
    if (isMicOn) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          micRef.current = stream;
          const audioTrack = stream.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.enabled = true;
          }
        })
        .catch((err) => console.error("마이크 접근 실패:", err));
    } else {
      if (micRef.current) {
        micRef.current.getTracks().forEach((track) => track.stop()); // 마이크 끄기
      }
    }
  }, [isMicOn]);

  useEffect(() => {
    if (location.state?.showInvite) {
      setActiveTool("invite");
    }
  }, [location.state]);

  return (
    <div className="container">
    {/* 상단 네비게이션 */}
    <header className= "meet-navbar">
      <img src="../images/main_logo.png" alt="DolAi Logo" />
      <nav className="meet-navbar-icons">
        {/* 카메라 */}
        <div className="meet-icon-container" onClick={() => setIsCameraOn(!isCameraOn)}>
            {isCameraOn ? (
              <Camera style={iconStyle} />
            ) : (
              <CameraOff style={{ ...iconStyle, color: "#757575" }} />
            )}
          </div>

          {/* 마이크 */}
          <div className="meet-icon-container" onClick={() => setIsMicOn(!isMicOn)}>
            {isMicOn ? (
              <Mic style={iconStyle} />
            ) : (
              <MicOff style={{ ...iconStyle, color: "#757575" }} />
            )}
          </div>

          {/* 친구 초대 */}
          <div className="meet-icon-container" onClick={() => toggleTool("invite")}>
            <UserPlus style={{ ...iconStyle, color: activeTool === "invite" ? "black" : "#757575" }} />
          </div>

          {/* 화이트보드 */}
          <div className="meet-icon-container meet-board" onClick={() => toggleTool("board")}
            style={{
              backgroundImage: activeTool === "board"
                ? 'url("../images/meet_board.png")'
                : 'url("../images/meet_unBoard.png")',
            }}
          />

          {/* 화면 공유 */}
          <div className="meet-icon-container" onClick={() => toggleTool("monitor")}>
            <MonitorUp style={{ ...iconStyle, color: activeTool === "monitor" ? "black" : "#757575" }} />
          </div>

          {/* 채팅 */}
          <div className="meet-icon-container" onClick={() => toggleTool("message")}>
            <MessageSquareText style={{ ...iconStyle, color: activeTool === "message" ? "black" : "#757575" }} />
          </div>

        <div className="meet-icon-container meet-leave" onClick={() => navigate("/documents")}>
        </div>
      </nav>
    </header>
    
    {/* 카메라 화면 표시 */}
    <main className="video-container">
      {isCameraOn && <video ref={videoRef} autoPlay className="video-view"></video>}
    </main>
    {activeTool === "invite" && <FriendInvite isVisible={true} inviteUrl={inviteUrl} onClose={() => setActiveTool(null)} />}

  </div>
  );
}