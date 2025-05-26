import { Camera, CameraOff, Mic, MicOff, UserPlus, MonitorUp, MessageSquareText, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "@/styles/meeting/Meeting.css";
import "@/components/dolai/ChatDolai.css";
import FriendInvite from "@/components/meeting/FriendInvite";
import ChatDolai from "@/components/dolai/ChatDolai";
import axios from "@/utils/axiosInstance";
import { useLeaveMeeting } from "@/hooks/useLeaveMeeting";
import { Rnd } from "react-rnd";
import Minutes from "@/components/meeting/Minutes";
import SttListener from "@/components/listeners/STTListener";
import Whiteboard from "@/components/meeting/Whiteboard";
import Message from "@/components/meeting/Message";
import RemoteVideo from "@/components/meeting/RemoteVideo";
import GraphViewing from "@/components/meeting/GraphViewing";
import ScreenShare from "@/components/meeting/ScreenShare";
import { useMediasoupSocket } from "@/hooks/mediasoup/useMediasoupSocket";
import { useMediasoupProducer } from "@/hooks/mediasoup/useMediasoupProducer";
import { useMediasoupConsumer, type MediaKind } from "@/hooks/mediasoup/useMediasoupConsumer";
import { useUser } from "@/hooks/user/useUser";
import { useGraph } from "@/hooks/useGraph";
import { useScreenShare } from "@/hooks/useScreenShare";
import { RemoteStreamEntry } from "@/types/remoteStreamEntry.ts";
import { useGraphPolling } from "@/hooks/useGraphPolling";


export default function Meetings() {
  // --- 미디어 토글 상태 ---
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isBoardOn, setIsBoardOn] = useState(false);
  const [isScreenOn, setIsScreenOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null); // 전역 스트림 참조
  const micRef = useRef<MediaStream | null>(null);
  const [showMinutes, setShowMinutes] = useState(false); // 회의록 버튼 상태
  const [minutesLog, setMinutesLog] = useState<{ speaker: string; text: string }[]>([]); // 회의록 아이템 상태
  const [selectedTransTab, setSelectedTransTab] = useState<"original" | "translated">("original"); // 원문/번역 본 토글 상태

  const { user } = useUser();

  // --- 친구 초대 상태 & 라우터 상태 ---
  const location = useLocation();
  const { meetingId, inviteUrl } = location.state; // meetingID, 초대 링크, ip 주소 받음
  const roomId = inviteUrl.split("/sfu/")[1];
  const sfuIp = inviteUrl.match(/^https?:\/\/([^:/]+)/)?.[1];
  const handleLeave = useLeaveMeeting(meetingId);

  // 그래프
  const { graph } = useGraph();
  const [showGraph, setShowGraph] = useState(false); // 그래프 버튼 상태
  const svgRef = useRef<SVGSVGElement | null>(null); // 그래프 저장용
  useGraphPolling(meetingId); 

  // 화면 공유
  const { screenShareStart, screenShareStop } = useScreenShare(meetingId, user?.id!);

  const [myStream, setMyStream] = useState<MediaStream | null>(null);

useEffect(() => {
  if (isCameraOn) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current && (videoRef.current.srcObject = stream);
      setMyStream(stream); // ✅ 상태 갱신
    });
  } else {
    if (videoRef.current) videoRef.current.srcObject = null;
    myStream?.getTracks().forEach((track) => track.stop());
    setMyStream(null); // ✅ 상태 초기화
  }
}, [isCameraOn]);


  

  // --- 기타 툴 상태 ---
  const [activeTool, setActiveTool] = useState<"invite" | "board" | "monitor" | "message" | null>(null);
  const toggleIconTool = async (tool: typeof activeTool) => {
    if (tool === "board") {
      const isNextOpen = activeTool !== "board";
      if (isNextOpen) {
        await axios.post(`/whiteboard/start/${meetingId}`);
        connectRoom?.socket?.emit("tldraw-start");
        setActiveTool("board");
        setIsBoardOn(true);
      } else {
        await axios.post(`/whiteboard/end/${meetingId}`);
        connectRoom?.socket?.emit("tldraw-end", { meetingId });
        setActiveTool(null);
        setIsBoardOn(false);
      }
    } else if (tool === "monitor") {
      const isMineSharing = activeTool === "monitor" && isScreenOn;
      if (isMineSharing) {
        await screenShareStop();
        setIsScreenOn(false);
        setActiveTool(null);
      } else {
        await screenShareStart();
        setIsScreenOn(true);
        setActiveTool("monitor");
      }
    } else {
      setActiveTool(prev => prev === tool ? null : tool);
    }
  };
  const iconStyle = { width: "2vw", height: "2vw", cursor: "pointer" };


  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamEntry[]>([]);

   // ✅ 여기에 바로 붙여 넣으세요!
   useEffect(() => {
    console.log("🟢 remoteStreams 상태:", remoteStreams);
  }, [remoteStreams]);

  useEffect(() => {
    console.log("📺 비디오 개수:", document.querySelectorAll(".video-container video").length);
  }, [remoteStreams]);

  const addStream = (
    stream: MediaStream,
    name: string,
    peerId: string,
    kind: MediaKind,
    mediaTag: string
  ) => {
    console.log("🟡 addStream 호출됨");
    console.log("ADD STREAM", { name, peerId, kind, mediaTag, stream });

    setRemoteStreams((prev) => {
      const key = `${peerId}-${mediaTag}`;
      if (prev.find((s) => `${s.peerId}-${s.mediaTag}` === key)) return prev;

      console.log("📺 ADDING stream:", key);
      return [...prev, { stream, name, peerId, kind, mediaTag }];
    });
  };
    // 화면 공유
  const screenStream = remoteStreams.find(s => s.mediaTag === "screen");

  // ─── 1) mediasoup 소켓 연결 & joinRoom ───
  const connectRoom = useMediasoupSocket(roomId, sfuIp, meetingId, user?.name || "익명", user?.id!); 

  useMediasoupProducer({ socket: connectRoom?.socket!, device: connectRoom?.device!, videoRef, isCameraOn, isMicOn, isBoardOn, isScreenOn });
  useMediasoupConsumer({ socket: connectRoom?.socket!, device: connectRoom?.device!, onStream: addStream, myUserId: user?.id!, allowedTags: ["camera", "board", "screen"] });

  // --- DolAi 채팅창 열림 상태 & 크기/위치 ---
  const [isDolAiOpen, setIsDolAiOpen] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x:  1500, y: 80 });   //Leave 밑에 돌아이 처음위치 100%->1500, 80%->2000
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


  // 화이트보드 시작
  useEffect(() => {
    const handleBoardStart = () => {
      console.log("📥 board-started 수신 → 화이트보드 열림");
  
      setActiveTool("board");
      setIsBoardOn(true);
  
      // 서버에 join-whiteboard 
      connectRoom?.socket?.emit("join-whiteboard", { meetingId });
    };
  
    connectRoom?.socket?.on("board-started", handleBoardStart);
    return () => {
      connectRoom?.socket?.off("board-started", handleBoardStart);
    };
  }, [connectRoom?.socket, meetingId]);

  // 화이트보드 종료
  useEffect(() => {
    const socket = connectRoom?.socket;
    if (!socket) return;
  
    const handleBoardEnd = ({ meetingId: endedId }: any) => {
      if (endedId === meetingId) {
        console.log("📥 board-ended 수신");
  
        // ✅ board 관련 스트림만 제거
        setRemoteStreams((prev) =>
          prev.filter((s) => s.mediaTag !== "board")
        );
  
        setActiveTool(null);
        setIsBoardOn(false);
      }
    };
  
    socket.on("board-ended", handleBoardEnd);
    return () => {
      socket.off("board-ended", handleBoardEnd);
    };
  }, [connectRoom?.socket, meetingId]);
    

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
                ? 'url("/images/meet_board.png")'
                : 'url("/images/meet_unBoard.png")',
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
            className="dolai-toggle-icon"
            onClick={() => setIsDolAiOpen(prev => !prev)}
          >
            <img
              src="/images/dolai.png"
              alt="DolAi"
              className="dolai-icon-image"
            />
          </div>

          {/* 펼쳐지는 채팅 내용 */}
          <div className={`dolai-chat-overlay ${isDolAiOpen ? 'open' : ''}`}>
        {isDolAiOpen && <ChatDolai />}
      </div>
        </div>
      </Rnd>

    {meetingId && (
      <SttListener
        meetingId={meetingId}
        onReceive={(log) => {
          setMinutesLog((prev) => {
            const isDuplicate = prev.some(p => p.speaker === log.speaker && p.text === log.text);
            return isDuplicate ? prev : [...prev, log];  
          });
        }}
      />
    )}
    
    {/* 카메라 화면 표시 */}
    <main className="video-container">
      {activeTool === "board" && isBoardOn && connectRoom?.socket ?(
      <Whiteboard
      meetingId={meetingId}
      socket={connectRoom?.socket}
      isCameraOn={isCameraOn}
      myStream={myStream} // ✅ 이걸 써야 합니다!
      remoteStreams={remoteStreams}
      myPeerId={user?.id!}
    />
     
      ) : activeTool === "monitor" && isScreenOn && screenStream ? (
        <ScreenShare
          stream={screenStream.stream}
          presenterName={screenStream.name}
          isLocal={screenStream.peerId === user?.id}
          localCameraStream={videoStreamRef.current ?? undefined}
          minutesLog={minutesLog}
        />
      ) : (
        <>
          {/* 내 비디오 */}
          <section className="main-video">
            {isCameraOn ? (
              <video ref={videoRef} autoPlay muted playsInline />
            ) : (
              <div className="video-off">
                <span>{user?.name}</span>
              </div>
            )}
          </section>

          {/* 참가자 영상 */}
          <aside className="video-sidebar">
            {remoteStreams.map((streamObj, _idx) => (
              <RemoteVideo
                key={`${streamObj.peerId}-${streamObj.mediaTag}`}
                stream={streamObj.stream}
                name={streamObj.name}
              />
            ))}
          </aside>

          {/* 회의록 */}
          <div className={`minutes-container-wrapper ${showMinutes ? "slide-in" : "slide-out"}`}>
          <div className="Transtab-container">
            <button
              className={`transtab ${selectedTransTab === 'original' ? 'selected' : ''}`}
              onClick={() => setSelectedTransTab("original")}
            > 
            원문 </button>
            <button
              className={`transtab ${selectedTransTab === 'translated' ? 'selected' : ''}`}
              onClick={() => setSelectedTransTab("translated")}
            > 
            번역 </button>
          </div>
            <Minutes minutes={minutesLog} selectedTab={selectedTransTab} /> 
          </div>

          {/* 그래프 */}
          <div className={`graph-container-wrapper ${showGraph ? "slide-in" : "slide-out"}`}>
          {graph && <GraphViewing graphData={graph} svgRef={svgRef} />}
          </div>

          {/* 회의록 토글 버튼 */}
          <button className="minutes-toggle-btn" onClick={() => setShowMinutes(prev => !prev)}
            style={{
              left: showMinutes ? "calc(0.1vw + 31.3vw)" : "0vw"
            }}>
            {showMinutes ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>

          {/* 그래프 토글 버튼 */}
          <button className="graph-toggle-btn" onClick={() => setShowGraph(prev => !prev)}
            style={{
              left: showGraph ? "calc(100vw - 31.3vw)" : "97vw"
            }}>
            {showGraph ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </>
      )}
    </main>

    {/* 초대 창 보여짐 */}
    {activeTool === "invite" && <FriendInvite isVisible={true} inviteUrl={inviteUrl} meetingId={meetingId} onClose={() => setActiveTool(null)} />}

    {/* 채팅 창 */}
    {activeTool === "message" && <Message isVisible={true} meetingId={meetingId} /> }
  </div>
  );
}