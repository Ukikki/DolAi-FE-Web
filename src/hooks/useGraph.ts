import { useState, useCallback } from "react";
import axios from "@/utils/axiosInstance";
import { Node, Link, GraphData, NodeType, sizeMap } from "@/types/graph";
import { getColor } from "@/utils/chorma";

export const useGraph = () => {
  const [graph, setGraph] = useState<GraphData | null>(null);

  // 그래프 생성
  const fetchGraph = useCallback(async (meetingId: string) => {
    try {
      const res = await axios.get(`/graph/${meetingId}`);
      const raw = res.data;

      // 중복 edge 제거
      const uniqueEdges = Array.from(new Map(
          raw.edges.map((e: any) => [`${e.from}-${e.to}-${e.type}`, e])
        ).values()
      );
      
      const nodes: Node[] = raw.nodes.map((n: any) => {
        const parentUtteranceId = raw.edges.find(
          (e: any) => e.to === n.id && e.type.startsWith("utterance_to_")
        )?.from;
        
        const type = n.type as NodeType

        return {
          ...n,
          color: getColor(type, parentUtteranceId || n.id),
          size: sizeMap[type],
        };
      });

      const links: Link[] = uniqueEdges.map((e: any) => ({
        source: e.from,
        target: e.to,
        type: e.type
      }));

      setGraph({ nodes, links });
    } catch (err: any) {
      console.error(err?.response?.data?.message || "그래프 조회 실패");
    }
  }, []);

  const syncGraph = useCallback(async (meetingId: string) => {
    try {
      const res = await axios.post(`/graph/sync/${meetingId}`);
      return res.data;
    } catch (err: any) {
      console.error(err?.response?.data || "그래프 동기화 실패");
    }
  }, []);

  return { graph, fetchGraph, syncGraph };
};
