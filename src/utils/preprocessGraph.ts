import { GraphData, Node, Link } from "@/types/graph";

export function preprocessGraphData(originalData: GraphData): GraphData {
  // 1. 중복 제거 + 빈 label 제거 + utterance, 특정 label 제거
  const nodeMap = new Map<string, Node>();

  for (const n of originalData.nodes) {
    if (
      !n.id ||
      n.type === "utterances" ||
      n.label === "제시된 단계와" ||
      !n.label?.trim()
    ) {
      continue;
    }

    // speaker 중복 제거
    if (n.id.startsWith("speakers/")) {
      const baseId = n.id.split("(")[0].trim(); // "speakers/xxx (1)" → "speakers/xxx"
      if (!nodeMap.has(baseId)) {
        nodeMap.set(baseId, { ...n, id: baseId });
      }
    } else {
      nodeMap.set(n.id, n);
    }
  }

  const utteranceSpeakerMap = new Map<string, string>();
  const utteranceMeetingMap = new Map<string, string>();
  const linkSet = new Set<string>();
  const links: Link[] = [];

  originalData.links.forEach(link => {
    const sourceId = typeof link.source === "string" ? link.source : link.source.id;
    const targetId = typeof link.target === "string" ? link.target : link.target.id;

    // utterance → keyword/topic
    if (sourceId.startsWith("utterances/") && (targetId.startsWith("keywords/") || targetId.startsWith("topics/"))) {
      const utterance = originalData.nodes.find(n => n.id === sourceId);
      const keywordOrTopic = nodeMap.get(targetId);
      if (!utterance || !keywordOrTopic) return;

      keywordOrTopic.tooltipUtterances = Array.from(
        new Set([...(keywordOrTopic.tooltipUtterances ?? []), utterance.label])
      );

      const parentIds = [
        utteranceMeetingMap.get(sourceId),
        utteranceSpeakerMap.get(sourceId),
      ].filter(Boolean);

      for (const pid of parentIds) {
        const key = `${pid}->${targetId}`;
        if (!linkSet.has(key)) {
          links.push({ source: pid!, target: targetId, type: link.type });
          linkSet.add(key);
        }
      }
    }

    // 기본 유지 링크
    else if (
      !sourceId.startsWith("utterances/") &&
      !targetId.startsWith("utterances/") &&
      nodeMap.has(sourceId) &&
      nodeMap.has(targetId)
    ) {
      links.push({ source: sourceId, target: targetId, type: link.type });
    }

    // utterance 연결 추적용
    if (link.type === "speaker_to_utterance" || link.type === "utterance_to_speaker") {
      const utteranceId = sourceId.startsWith("utterances/") ? sourceId : targetId;
      const speakerId = sourceId.startsWith("speakers/") ? sourceId : targetId;
      utteranceSpeakerMap.set(utteranceId, speakerId.split("(")[0].trim());
    } else if (link.type === "meeting_to_utterance") {
      utteranceMeetingMap.set(targetId, sourceId);
    }
  });

  // speaker ↔ meeting 연결
  utteranceSpeakerMap.forEach((speakerId, utteranceId) => {
    const meetingId = utteranceMeetingMap.get(utteranceId);
    if (!meetingId) return;
    const key = `${meetingId}->${speakerId}`;
    if (!linkSet.has(key)) {
      links.push({ source: meetingId, target: speakerId, type: "meeting_to_speaker_via_utterance" });
      linkSet.add(key);
    }
  });

  // 연결된 노드만 남기기
  const connectedNodeIds = new Set<string>();
  links.forEach(link => {
    connectedNodeIds.add(typeof link.source === "string" ? link.source : link.source.id);
    connectedNodeIds.add(typeof link.target === "string" ? link.target : link.target.id);
  });

  const filteredNodes = Array.from(nodeMap.values()).filter(n => connectedNodeIds.has(n.id));

  return { nodes: filteredNodes, links };
}