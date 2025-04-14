import { useState } from "react";
import ToastNotification from "./ToastNoti";
import "@/styles/common/toast/ToastManager.css";
import { ToastContext, Toast } from "../../hooks/useToast";

let idCounter = 0;

const ToastManager = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, category: string) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, title, category }]);

    // 5초 뒤 알림 사라짐
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastManager;
