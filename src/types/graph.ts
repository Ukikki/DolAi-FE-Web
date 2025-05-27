import { SimulationNodeDatum, SimulationLinkDatum } from "d3";

// D3 그래프 노드
export interface Node extends SimulationNodeDatum {
  id: string;
  label: string;
  type: NodeType;

  // null 값일 수 있음 최상위 노드
  keywords?: string[]; 
  topics?: string[];
  color?: string;
  size?: number;
  tooltipUtterances?: string[];
}

// D3 그래프 엣지
export interface Link extends SimulationLinkDatum<Node> {
  source: string | Node; // from
  target: string | Node; // to
  type: string;   // type
}

// 전체 그래프 구조
export interface GraphData {
  nodes: Node[];
  links: Link[];
}

// 노드 타입
export const NODE_TYPES = ["meetings", "utterances", "keywords", "topics", "speakers"] as const;
export type NodeType = typeof NODE_TYPES[number];

export const sizeMap: Record<NodeType, number> = {
  meetings: 55,
  utterances: 0,
  speakers: 50,
  topics: 40,
  keywords: 30,
};