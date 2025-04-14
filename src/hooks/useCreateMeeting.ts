import axios from "@/utils/axiosInstance";

export function useCreateMeeting() {
  const createMeeting = async ({ title, startTime } : {
    title: string;
    startTime: string;
  }) => {
    const response = await axios.post("/meetings", { title, startTime });
    const data = response.data;

    if (data && (data.status === "success" || data.id)) {
      return data;
    } else {
      throw new Error("회의 생성 실패");
    }
  };
  return { createMeeting };
}
