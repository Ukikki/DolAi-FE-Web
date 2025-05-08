import React from "react";
import "@/styles/meeting/minutes/Minutes.css"

interface MinutesProps {
  minutes: {
    speaker: string;
    text: string;
  }[];
}

const Minutes: React.FC<MinutesProps> = ({ minutes }) => {
  return (
    <div className="minutes-container">
      <div className="minutes-list">
        {minutes.map((item, index) =>  (
          <div className="minutes-bubble-item" key={index}>
            <span className="minutes-speaker">{item.speaker}: </span> {item.text}
          </div>
        ))}
      </div>
    </div>
  );
};


export default Minutes;
