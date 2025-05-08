// src/components/meeting/Whiteboard.tsx
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import "@/styles/meeting/Whiteboard.css";

interface WhiteboardProps {
  meetingId: string;
}

export default function Whiteboard({ meetingId }: WhiteboardProps) {
  return (
    <div>
      <div className="wb-placeholder-list">
      <img src="/images/icon-left.png" alt="left" className="wb-icon-arrow-left" />
      <div className="wb-placeholder-items">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="wb-placeholder-box" />
          ))}
        </div>
        <img src="/images/icon-right.png" alt="right" className="wb-icon-arrow-right" />
      </div>
  
      <div className="whiteboard-container">
        <div className="tldraw__editor">
          <Tldraw persistenceKey={`meeting-${meetingId}`} />
        </div>
      </div>
    </div>
  );  
}
