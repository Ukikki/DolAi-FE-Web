import { Camera, CameraOff, Mic, MicOff, UserPlus, MonitorUp, MessageSquareText, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "@/styles/meeting/Meeting.css";
import FriendInvite from "@/components/modal/FriendInvite";
import { useLeaveMeeting } from "@/hooks/useLeaveMeeting";
import Minutes from "@/components/meeting/Minutes";
import SttListener from "@/components/listeners/STTListener";
import { LiveKitRoom, useRoomContext } from '@livekit/components-react';
import { useMediasoupSocket } from "@/hooks/mediasoup/useMediasoupSocket";
import { useMediasoupConsumer } from "@/hooks/mediasoup/useMediasoupConsumer";

export default function Meetings() {
  const [isCameraOn, setIsCameraOn] = useState(false); // 카메라 아이콘 상태 on/off
  const [isMicOn, setIsMicOn] = useState(false);       // 마이크 아이콘 상태 on/off
  const videoRef = useRef<HTMLVideoElement>(null);     // 비디오 상태
  const micRef = useRef<MediaStream | null>(null);     // 마이크 상태
  const [showMinutes, setShowMinutes] = useState(false); // 회의록 버튼 상태
  const [minutesLog, setMinutesLog] = useState<{ speaker: string; text: string }[]>([]); // 회의록 아이템 상태

  const location = useLocation();
  const { meetingId, inviteUrl, sfuIp } = location.state; // meetingID, 초대 링크, ip 주소 받음
  const roomId = sfuIp.split("/sfu/")[1];

  const connectRoom = useMediasoupSocket(roomId, sfuIp);
  const handleLeave = useLeaveMeeting(meetingId);

  // 친구, 화이트보드, 공유, 메시지는 한 개만 동작
  const [activeTool, setActiveTool] = useState<"invite" | "board" | "monitor" | "message" | null>(null);
  const toggleTool = (tool: typeof activeTool) => {
    setActiveTool(prev => prev === tool ? null : tool); // 동일 아이콘 누르면 꺼지고, 다른 거 누르면 바뀜
  };
  const iconStyle = { width: "2vw", height: "2vw", cursor: "pointer" };

  // 참가자들 영상 리스트
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const addStream = (stream: MediaStream) => {
    setRemoteStreams((prev) => [...prev, stream]);
  };
  useMediasoupConsumer({ socket: connectRoom?.socket!, rtpCapabilities: connectRoom?.rtpCapabilities!, onStream: addStream })

  // 화면 공유
  // const room = useRoomContext();

  // const handleScreenShare = async () => {
  //   if (!room) return;
  
  //   const isSharing = room.localParticipant.isScreenShareEnabled;
  //   await room.localParticipant.setScreenShareEnabled(!isSharing);
  // };
  
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


  useEffect(() => {
    if (!connectRoom) return;
  
    const { socket, rtpCapabilities } = connectRoom;
  
    console.log("🎉mediasoup 연결 성공:", socket.id);
    console.log("📡 서버 RTP Capabilities:", rtpCapabilities);
  
    // 이제 여기서 produce() or consume() 시작하면 됨
  }, [connectRoom]);

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
          <div className="meet-icon-container">
            <MonitorUp style={{ ...iconStyle, color: activeTool === "monitor" ? "black" : "#757575" }} />
          </div>

          {/* 채팅 */}
          <div className="meet-icon-container" onClick={() => toggleTool("message")}>
            <MessageSquareText style={{ ...iconStyle, color: activeTool === "message" ? "black" : "#757575" }} />
          </div>

        <div className="meet-icon-container meet-leave" onClick={ handleLeave }>
        </div>
      </nav>
    </header>
    
    {/* 카메라 화면 표시 */}
    <main className="video-container">
      {/* 내 화면 */}
    <div className="video-box">
      <video ref={videoRef} autoPlay muted playsInline />
    </div>

      {/* 참가자들 */}
    {remoteStreams.map((stream, idx) => (
      <div className="video-box" key={idx}>
        <video autoPlay playsInline ref={(el) => {
            if (el) el.srcObject = stream;
          }}/>
      </div>
    ))}

    {/* STT 리스너 */}
    {meetingId && (
      <SttListener
        meetingId={meetingId}
        onReceive={(log) => {
          setMinutesLog((prev) => [...prev, { speaker: log.speaker, text: log.text }]);
        }}
      />
    )}

    {/* 회의록 뷰 */}
    <div className={`minutes-container-wrapper ${showMinutes ? "slide-in" : "slide-out"}`}>
      <Minutes minutes={minutesLog} /> 
    </div>

    {/* 화살표 버튼 */}
    <button className="minutes-toggle-btn" onClick={() => setShowMinutes(prev => !prev)}
      style={{
        left: showMinutes ? "calc(0.1vw + 31.3vw)" : "0vw"
    }}>
      {showMinutes ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>

      {isCameraOn && <video ref={videoRef} autoPlay className="video-view"></video>}
    </main>
    {activeTool === "invite" && <FriendInvite isVisible={true} inviteUrl={inviteUrl} onClose={() => setActiveTool(null)} />}

  </div>
  );
}