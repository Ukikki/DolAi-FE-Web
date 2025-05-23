import React from "react";
import "@/styles/meeting/Minutes.css";
import { useUser } from "@/hooks/user/useUser";

interface MinutesProps {
  minutes: {
    speaker: string;
    text: string;
    textKo?: string;
    textEn?: string;
    textZh?: string;
  }[];
  selectedTab: "original" | "translated";
}

const Minutes: React.FC<MinutesProps> = ({ minutes, selectedTab }) => {
  const { user } = useUser();
  const lang = user?.language ?? "KO";

  const getText = (log: (typeof minutes)[number]) => {
    if (selectedTab === "original") return log.text;

    switch (lang) {
      case "EN":
        return log.textEn || log.text;
      case "ZH":
        return log.textZh || log.text;
      case "KO":
      default:
        return log.textKo || log.text;
    }
  };

  return (
    <div className="minutes-container">
      <div className="minutes-list">
      {minutes.map((item, i) => (
          <div className="minutes-bubble-item" key={i}>
            <span className="minutes-speaker">{item.speaker}:</span>{" "}
            {getText(item)}
          </div>
        ))}
      </div>
    </div>
  );
};


export default Minutes;
