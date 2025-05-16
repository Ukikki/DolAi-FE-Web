import { useState, useEffect } from "react";
import axios from "axios";

export const useHoliday = (year: number, month: number) => {
  const [holidays, setHolidays] = useState<string[]>([]);
  const HOLIDAY_API_KEY = import.meta.env.VITE_PUBLIC_HOLIDAY_API_KEY;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo", {
          headers: {
            Accept: "application/json",
          },
          params: {
            solYear: year,
            solMonth: String(month).padStart(2, "0"),
            ServiceKey: HOLIDAY_API_KEY,
          },
        });

        const items = res.data.response.body.items.item || [];

        const dateList = (Array.isArray(items) ? items : [items]).map((item) => {
          const y = item.locdate.toString().slice(0, 4);
          const m = item.locdate.toString().slice(4, 6);
          const d = item.locdate.toString().slice(6, 8);
          return `${y}-${m}-${d}`; // "2025-03-01"
        });

        setHolidays(dateList);
      } catch (err) {
        console.error("공휴일 API 실패:", err);
      }
    };

    fetch();
  }, [year, month]);

  return { holidays };
};
