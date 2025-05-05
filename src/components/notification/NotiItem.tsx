import "./NotiItem.css";
import { useNotiHandler } from "@/hooks/useNotiHandler";

interface NotiItemProps {
  category: string;
  createdAt: string;
  title: string;
  url: string;
}

const NotiItem = ({ category, createdAt, title, url }: NotiItemProps) => {
  const { handleNotiClick } = useNotiHandler();

  return (
    <div className="set-noti-item" onClick={() => handleNotiClick(category, url)}>
      <div className="set-noti-header">
        <span>{category}</span> <div className="set-noti-dot" />
        <span>{createdAt}</span>
      </div>
      <div className="set-noti-title">{title}</div>
      <div className="set-noti-divider" />
    </div>
  );
};

export default NotiItem;
