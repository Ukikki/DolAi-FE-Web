import { Camera, CameraOff, Mic, MicOff, UserPlus, MonitorUp, MessageSquareText, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "@/styles/meeting/Meeting.css";
import "@/components/dolai/ChatDolai.css";
import FriendInvite from "@/components/modal/FriendInvite";
import ChatDolai from "@/components/dolai/ChatDolai";
import { useLeaveMeeting } from "@/hooks/useLeaveMeeting";
import { Rnd } from "react-rnd";
import Minutes from "@/components/meeting/Minutes";
import SttListener from "@/components/listeners/STTListener";
import { LiveKitRoom, useRoomContext } from '@livekit/components-react';
import { useMediasoupSocket } from "@/hooks/mediasoup/useMediasoupSocket";
import { useMediasoupProducer } from "@/hooks/mediasoup/useMediasoupProducer";
import { useMediasoupConsumer } from "@/hooks/mediasoup/useMediasoupConsumer";

export default function Meetings() {
  // --- 미디어 토글 상태 ---
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null); // 전역 스트림 참조
  const micRef = useRef<MediaStream | null>(null);
  const [showMinutes, setShowMinutes] = useState(false); // 회의록 버튼 상태
  const [minutesLog, setMinutesLog] = useState<{ speaker: string; text: string }[]>([]); // 회의록 아이템 상태

  // --- 친구 초대 상태 & 라우터 상태 ---
  const location = useLocation();
  const { meetingId, inviteUrl } = location.state; // meetingID, 초대 링크, ip 주소 받음
  const roomId = inviteUrl.split("/sfu/")[1];
  const sfuIp = inviteUrl.match(/^https?:\/\/([^:/]+)/)?.[1];

  const connectRoom = useMediasoupSocket(roomId, sfuIp);
  const handleLeave = useLeaveMeeting(meetingId);

  // --- 기타 툴 상태 ---
  const [activeTool, setActiveTool] = useState<"invite" | "board" | "monitor" | "message" | null>(null);
  const toggleIconTool = (tool: typeof activeTool) => {
    setActiveTool(prev => prev === tool ? null : tool); // 동일 아이콘 누르면 꺼지고, 다른 거 누르면 바뀜
  };
  const iconStyle = { width: "2vw", height: "2vw", cursor: "pointer" };

  // 참가자들 영상 리스트
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const addStream = (stream: MediaStream) => {
    setRemoteStreams((prev) => [...prev, stream]);
  };
  useMediasoupConsumer({ socket: connectRoom?.socket!, rtpCapabilities: connectRoom?.rtpCapabilities!, onStream: addStream })
  useMediasoupProducer({ socket: connectRoom?.socket!, rtpCapabilities: connectRoom?.rtpCapabilities!, videoRef, isCameraOn, isMicOn });

  // 화면 공유
  // const room = useRoomContext();

  // const handleScreenShare = async () => {
  //   if (!room) return;
  
  //   const isSharing = room.localParticipant.isScreenShareEnabled;
  //   await room.localParticipant.setScreenShareEnabled(!isSharing);
  // };
  

  // --- DolAi 채팅창 열림 상태 & 크기/위치 ---
  const [isDolAiOpen, setIsDolAiOpen] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x:  2000, y: 80 });   //Leave 밑에 돌아이 처음위치 100%->1500, 80%->2000
  const [chatSize, setChatSize] = useState({ width: 320, height: 450 });

 

  // --- 카메라 on/off 효과 ---
  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        videoStreamRef.current = stream;
      });
    } else {
      // 카메라 off 시 스트림 종료
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    return () => {
      // 컴포넌트 언마운트 시 스트림 종료
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraOn]);

  // --- 마이크 on/off 효과 ---
  useEffect(() => {
    if (isMicOn) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          micRef.current = stream;
          stream.getAudioTracks()[0].enabled = true;
        })
        .catch(err => console.error("마이크 접근 실패:", err));
    } else {
      micRef.current?.getTracks().forEach(t => t.stop());
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
    }, [connectRoom]);

  return (
    <div className="container">
      {/* 상단 네비게이션 */}
      <header className="meet-navbar">
        <img src="../images/main_logo.png" alt="DolAi Logo" />
        <nav className="meet-navbar-icons">
          {/* 카메라 토글 */}
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
          <div className="meet-icon-container" onClick={() => toggleIconTool("invite")}>
            <UserPlus style={{ ...iconStyle, color: activeTool === "invite" ? "black" : "#757575" }} />
          </div>

          {/* 화이트보드 */}
          <div className="meet-icon-container meet-board" onClick={() => toggleIconTool("board")}
            style={{
              backgroundImage: activeTool === "board"
                ? 'url("../images/meet_board.png")'
                : 'url("../images/meet_unBoard.png")',
            }}
          />
          {/* 화면 공유 */}
          <div className="meet-icon-container" onClick={() => toggleIconTool("monitor")}>
            <MonitorUp style={{ ...iconStyle, color: activeTool === "monitor" ? "black" : "#757575" }} />
          </div>

          {/* 채팅 토글 */}
          <div className="meet-icon-container" onClick={() => toggleIconTool("message")}>
            <MessageSquareText style={{ width: "2vw", height: "2vw", cursor: "pointer", color: activeTool === "message" ? "black" : "#757575" }} />
          </div>
          {/* 나가기 버튼 */}
          <div className="meet-icon-container meet-leave" onClick={handleLeave}></div>
        </nav>
      </header>

      {/* DolAi 채팅창 (드래그·리사이징 유지하되 위에서 아래로 열리도록 수정) */}
      <Rnd
        size={{ width: chatSize.width, height: isDolAiOpen ? chatSize.height : 59 }}
        position={chatPosition}
        minWidth={65}
        minHeight={59}
        bounds="parent"
        enableResizing={isDolAiOpen}
        onResizeStop={(_, __, ref, ___, pos) => {
          setChatSize({ width: ref.offsetWidth, height: ref.offsetHeight });
          setChatPosition({ x: pos.x, y: pos.y });
        }}
        onDragStop={(_, data) => {
          setChatPosition({ x: data.x, y: data.y });
        }}
        style={{
          zIndex: 9999,
          transition: "height 0.3s ease",
          overflow: "visible",
          padding: "20px"  // 아이콘이 컨테이너 밖으로 나가도록 패딩 추가
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          {/* 항상 보이는 DolAi 아이콘 - 우측 상단에 위치 */}
          <div
            onClick={() => setIsDolAiOpen(prev => !prev)}
            style={{
              position: "absolute",
              top: "2.1vw",
              right: "0vw",
              width: "3.4vw",
              height: "3.1vw",
              cursor: "pointer",
              zIndex: 1001,
              transform: "translateY(-50%)",
            }}
          >
            <img
              src="/images/dolai.png"
              alt="DolAi"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* 펼쳐지는 채팅 내용 */}
          <div
            style={{
              position: "absolute",
              top: "2.1vw",  // 아이콘이 일부 걸치도록 위치 조정
              left: 0,
              right:0,
              width: "100%",
              height: isDolAiOpen ? `calc(100% - 2.1vw)` : "0vw",
              overflow: "hidden",
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: "0.83vw",
              transition: "height 0.3s ease",
              zIndex: 1000
            }}
          >
            {isDolAiOpen && <ChatDolai />}
          </div>
        </div>
      </Rnd>
    
    {/* 카메라 화면 표시 */}
    <main className="video-container">
      {/* 내 화면 */}
    <div className="video-view">
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
    {activeTool === "invite" && <FriendInvite isVisible={true} inviteUrl={inviteUrl} meetingId={meetingId} onClose={() => setActiveTool(null)} />}

  </div>
  );
}