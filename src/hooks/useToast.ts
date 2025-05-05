// hooks/useToast.ts
import { createContext, useContext } from "react";

export interface Toast {
  id: number;
  title: string;
  category: string;
  url: string;
}

export interface ToastContextcategory {
  toasts: Toast[];
  addToast: (title: string, category: string, url: string) => void;
  removeToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextcategory | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("ToastProvider 내부에서만 사용되어야 합니다.");
  return context;
};