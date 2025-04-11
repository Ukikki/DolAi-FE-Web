import './ToastNoti.css';
import { X } from "lucide-react";

interface ToastNotiProps {
  id: number;
  title: string;
  category: string;
  onClose: (id: number) => void;
}

const ToastNoti = ({ id, category, title, onClose }: ToastNotiProps) => {
  return (
    <div className="toast-noti">
      <X className="toast-noti-close" onClick={() => onClose(id)} />
        <span className="toast-noti-category">{category}</span>
        <span className="toast-noti-title">{title}</span>
    </div>
  );
};

export default ToastNoti;
