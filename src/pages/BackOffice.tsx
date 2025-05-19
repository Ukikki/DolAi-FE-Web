import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { AlarmClock, Monitor, User, ChartNoAxesColumn } from "lucide-react";
import "@/styles/BackOffice.css";

import CustomTooltip from "@/components/CustomTooltip";
import { handleSocialLogout } from "@/utils/logout";

export default function BackOffice() {
  const lastWeekAiCallData = [
    { name: "월", value: 90 }, { name: "화", value: 110 },
    { name: "수", value: 130 }, { name: "목", value: 170 },
    { name: "금", value: 260 }, { name: "토", value: 210 },
    { name: "일", value: 320 },
  ];

  const thisWeekAiCallData = [
    { name: "월", value: 140 }, { name: "화", value: 100 },
    { name: "수", value: 140 }, { name: "목", value: 90 },
    { name: "금", value: 280 }, { name: "토", value: 0 },
    { name: "일", value: 0 },
  ];

  const lastWeekMeetingData = [
    { hour: "0", count: 2 }, { hour: "4", count: 3 },
    { hour: "8", count: 6 }, { hour: "12", count: 4 },
    { hour: "14", count: 11 }, { hour: "16", count: 7 },
    { hour: "18", count: 8 }, { hour: "20", count: 3 },
  ];

  const thisWeekMeetingData = [
    { hour: "0", count: 0 }, { hour: "4", count: 2 },
    { hour: "8", count: 4 }, { hour: "12", count: 0 },
    { hour: "14", count: 14 }, { hour: "16", count: 0 },
    { hour: "18", count: 5 }, { hour: "20", count: 0 },
  ];

  const lastWeekStats = {
    scheduled: 68,
    completed: 112,
    newUsers: 24,
    engagementRate: 66,
    devices: [
      { name: "Desktop", value: 60 },
      { name: "Mobile", value: 40 }
    ]
  };

  const thisWeekStats = {
    scheduled: 82,
    completed: 21,
    newUsers: 10,
    engagementRate: 79,
    devices: [
      { name: "Desktop", value: 26 },
      { name: "Mobile", value: 10 }
    ]
  };

  const [selectedTab, setSelectedTab] = useState<"last" | "this">("last");
  const [activeMenu, setActiveMenu] = useState("대시보드");

  const aiCallData = selectedTab === "last" ? lastWeekAiCallData : thisWeekAiCallData;
  const timeMeetingData = selectedTab === "last" ? lastWeekMeetingData : thisWeekMeetingData;
  const currentStats = selectedTab === "last" ? lastWeekStats : thisWeekStats;
  const previousStats = selectedTab === "last" ? thisWeekStats : lastWeekStats;
  const deviceData = currentStats.devices;
  
  const getChange = (key: keyof typeof currentStats) => {
    if (key === "devices") return { direction: "", percent: "" };
    const current = currentStats[key] as number;
    const previous = previousStats[key] as number;
    const change = current - previous;
    const percent = Math.abs(((change) / previous) * 100).toFixed(0);
    const direction = change >= 0 ? "up" : "down";
    return { direction, percent };
  };

  return (
    <div className="BO-container">
      <aside className="BO-sidebar">
        <img src="/images/BO_logo.png" alt="admin logo" className="admin-logo" />
        <nav className="BO-nav">
          <ul>
            {['대시보드', '회의목록', '사용자 분석'].map((menu) => (
              <li
                key={menu}
                className={activeMenu === menu ? "active" : ""}
                onClick={() => setActiveMenu(menu)}
              >
              {menu}
              </li>
            ))}
          </ul>
        </nav>
        <div className="BO-logout" onClick={handleSocialLogout}>로그아웃</div>
      </aside>

      <div className="BO-inner-container">
      <div className="BO-header-row">
        <span className="BO-title">회의 대시보드</span>
        <div className="BO-tab-container">
          <button className={`BO-tab ${selectedTab === 'last' ? 'selected' : ''}`} onClick={() => setSelectedTab('last')}>지난 주</button>
          <button className={`BO-tab ${selectedTab === 'this' ? 'selected' : ''}`} onClick={() => setSelectedTab('this')}>이번 주</button>
        </div>
      </div>
      <div className="BO-card-wrapper">
        <div className="BO-card">
          <AlarmClock className="BO-card-icon" />
          <div className="BO-card-title">예약된 회의</div>
          <div className="BO-card-value-row">
            <div className="BO-card-value">{currentStats.scheduled}</div>
            <div className={`BO-arrow-${getChange("scheduled").direction}`} />
            <span className={`BO-percent-${getChange("scheduled").direction}`}>{getChange("scheduled").percent}%</span>
          </div>
        </div>
        <div className="BO-card">
          <Monitor className="BO-card-icon" />
          <div className="BO-card-title">완료된 회의</div>
          <div className="BO-card-value-row">
            <div className="BO-card-value">{currentStats.completed}</div>
            <div className={`BO-arrow-${getChange("completed").direction}`} />
            <span className={`BO-percent-${getChange("completed").direction}`}>{getChange("completed").percent}%</span>
          </div>
        </div>
        <div className="BO-card">
          <User className="BO-card-icon" />
          <div className="BO-card-title">신규 사용자</div>
          <div className="BO-card-value-row">
            <div className="BO-card-value">{currentStats.newUsers}</div>
            <div className={`BO-arrow-${getChange("newUsers").direction}`} />
            <span className={`BO-percent-${getChange("newUsers").direction}`}>{getChange("newUsers").percent}%</span>
          </div>
        </div>
        <div className="BO-card">
          <ChartNoAxesColumn className="BO-card-icon" />
          <div className="BO-card-title">평균 접이율</div>
          <div className="BO-card-value">{currentStats.engagementRate}%</div>
        </div>
        
          <div className="BO-device-card">
            <div className="BO-card-title">기기 타입</div>

            <div className="BO-device-content">
              <div className="BO-device-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: "#C690FF" }} />
                  <span className="legend-label">Desktop</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: "#3572EF" }} />
                  <span className="legend-label">Mobile</span>
                </div>
              </div>

              {/* 도넛 차트 */}
              <div className="BO-device-chart">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={deviceData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={70}
                      innerRadius={50}
                      stroke="none"
                      label={false}
                      labelLine={false}
                      isAnimationActive={true}
                      animationEasing="ease-out"
                    >
                      {deviceData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#8B83F2" : "#3572EF"}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
    
        <div className="BO-chart-wrapper">
        <div className="BO-chart-card">
          <span className="BO-card-title" style={{ marginTop: "2.1vw",marginLeft: "1.8vw" }}>AI 호출 횟수</span>
          <ResponsiveContainer style={{marginTop: "1vw" }} width="90%" height={240}>
            <LineChart data={aiCallData}>
            <CartesianGrid stroke="#777" vertical={false} /> 
              <XAxis dataKey="name" stroke="#777" axisLine={false} tickLine={false} />
              <YAxis stroke="#777" axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#ED6486" strokeWidth={ 4 } dot={false} isAnimationActive={true}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="BO-chart-card">
          <span className="BO-card-title" style={{ marginTop: "2.1vw",marginLeft: "1.8vw" }}>시간대별 회의 수</span>
            <ResponsiveContainer style={{marginTop: "1vw" }} width="90%" height={240}>
              <BarChart data={timeMeetingData}>
              <CartesianGrid stroke="#777" vertical={false} /> 
                <XAxis dataKey="hour" stroke="#777" axisLine={false} tickLine={false} />
                <YAxis stroke="#777" axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                <Bar dataKey="count" fill="#FFB76E" activeBar={false}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
    );
  }