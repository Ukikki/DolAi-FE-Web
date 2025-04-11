import "./NotiItem.css";

interface NotiItemProps {
  category: string;
  createdAt: string;
  title: string;
}

const NotiItem = ({ category, createdAt, title }: NotiItemProps) => {
  return (
    <div className="set-noti-item">
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
