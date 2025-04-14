import "@/styles/common/toast/ToastNoti.css";
import { X } from "lucide-react";

interface ToastNotiProps {
  id: number;
  title: string;
  category: string;
  onClose: (id: number) => void;
}

const highlightIndex = (text: string): React.ReactNode[] => {
  const regex = /(‘[^’]+’)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // 색상 하이라이팅
    parts.push(
      <span key={match.index} className="toast-noti-highlight"> {match[0]} </span>
    );    

    lastIndex = regex.lastIndex;
    console.log(match);
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

const ToastNoti = ({ id, category, title, onClose }: ToastNotiProps) => {
  console.log(highlightIndex(title));

  return (
    <div className="toast-noti">
      <X className="toast-noti-close" onClick={() => onClose(id)} />
        <span className="toast-noti-category">{category}</span>
        <span className="toast-noti-title">{highlightIndex(title)}</span>

    </div>
  );
};

export default ToastNoti;
