import { Home, Video, FileText } from "lucide-react";

interface MeetingsProps {
    selected: String;
    navigate: (path: string) => void;
}

export default function Meetings({ selected, navigate } : MeetingsProps) {
    return (
        <div className="container">
          {/* 상단 네비게이션 */}
          <header className="navbar">
            <img src="../images/main_logo.png" alt="DolAi Logo" />
            <nav className="navbar-icons">
              <div className={`icon-container ${selected === "home" ? "selected" : ""}`}
                onClick={() => navigate("/")}>
              <Home size={33} style={{ cursor: "pointer" }} />
              </div>
    
              <div className={`icon-container ${selected === "video" ? "selected" : ""}`}
                onClick={() => navigate("/meetings")}>
              <Video size={33} style={{ cursor: "pointer" }} />
              </div>
    
              <div className={`icon-container ${selected === "document" ? "selected" : ""}`}
                onClick={() => navigate("/documents")}>
                <FileText size={33} style={{ cursor: "pointer" }} />
              </div>
            </nav>
          </header>
    
          <p>미팅룸 화면</p>

          
        </div>
      );
    }