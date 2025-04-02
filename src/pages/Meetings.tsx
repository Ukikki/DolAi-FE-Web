import { Camera, CameraOff, Mic, MicOff, UserPlus, MonitorUp, MessageSquareText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import "../styles/Meeting.css";
import FriendInvite from "../components/FriendInvite";

interface MeetingsProps {
    navigate: (path: string) => void;
}

export default function Meetings({ navigate } : MeetingsProps) {
  const [isCameraOn, setIsCameraOn] = useState(false); // 카메라 아이콘 상태 on/off
  const [isMicOn, setIsMicOn] = useState(false);       // 마이크 아이콘 상태 on/off
  const [isUserPlus, setIsUserPlus] = useState(false); // 친구추가 아이콘 상태 on/off
  const [isBoard, setIsBoard] = useState(false);       // 화이트보드 아이콘 상태 on/off
  const [isMonitor, setIsMonitor] = useState(false);   // 화면 공유 아이콘 상태 on/off
  const [isMessage, setIsMessage] = useState(false);   // 채팅 아이콘 상태 on/off
  const videoRef = useRef<HTMLVideoElement>(null);     // 비디오 상태
  const micRef = useRef<MediaStream | null>(null);     // 마이크 상태

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

  return (
    <div className="container">
    {/* 상단 네비게이션 */}
    <header className= "meet-navbar">
      <img src="../images/main_logo.png" alt="DolAi Logo" />
      <nav className="meet-navbar-icons">
        <div className="meet-icon-container" onClick={() => setIsCameraOn(!isCameraOn)}>
        {isCameraOn ? (
          <Camera style={{ width: "2vw", height: "2vw", cursor: "pointer" }} />
        ) : (
          <CameraOff style={{ width: "2vw", height: "2vw", cursor: "pointer", color: "#757575" }} />
        )}
        </div>
        <div className="meet-icon-container" onClick={() => setIsMicOn(!isMicOn)}>
        {isMicOn ? (
          <Mic style={{ width: "2vw", height: "2vw", cursor: "pointer" }} />
        ) : (
          <MicOff style={{ width: "2vw", height: "2vw", cursor: "pointer", color: "#757575" }} />
        )}
        </div>
        <div className="meet-icon-container" onClick={() => setIsUserPlus(!isUserPlus)}>
          <UserPlus style={{ width: "2vw", height: "2vw", cursor: "pointer", color: isUserPlus? "black" : "#757575" }} />
        </div>
        <div className="meet-icon-container meet-board" onClick={() => setIsBoard(!isBoard)} style={{
            backgroundImage: isBoard
              ? 'url("../images/meet_board.png")'  // 클릭된 이미지
              : 'url("../images/meet_unBoard.png")', // 기본 이미지
          }}/>
        <div className="meet-icon-container" onClick={() => setIsMonitor(!isMonitor)}>
          <MonitorUp style={{ width: "2vw", height: "2vw", cursor: "pointer", color: isMonitor ? "black" : "#757575" }} />
        </div>
        <div className="meet-icon-container" onClick={() => setIsMessage(!isMessage)}>
          <MessageSquareText style={{ width: "2vw", height: "2vw", cursor: "pointer", color: isMessage ? "black" : "#757575"}} />
        </div>
        <div className="meet-icon-container meet-leave" onClick={() => navigate("/documents")}>
        </div>
      </nav>
    </header>
    
    {/* 카메라 화면 표시 */}
    <main className="video-container">
      {isCameraOn && <video ref={videoRef} autoPlay className="video-view"></video>}
    </main>
    {isUserPlus && <FriendInvite isVisible={isUserPlus} />}

  </div>
  );
}