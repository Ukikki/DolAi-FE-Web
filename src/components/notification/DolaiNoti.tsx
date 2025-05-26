import { useState } from "react"
import { X } from "lucide-react"
import "./DolaiNoti.css"

export default function DolaiNotification() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="dolai-noti-container">
      <div className="dolai-noti-bubble">
        <X className="dolai-noti-close" onClick={() => setVisible(false)} />
        <span className="dolai-noti-text">
        </span>
        <div className="dolai-noti-tail" />
      </div>
    </div>
  )
}