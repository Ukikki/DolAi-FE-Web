import { GraphData, Node, Link } from "@/types/graph";

// 라벨 유효성 검사 함수
function isMeaningfulLabel(label?: string): boolean {
  const trimmed = label?.trim();
  if (!trimmed) return false;

  return (
    trimmed.toLowerCase() !== "null" &&
    !trimmed.includes("응답하지") &&
    !trimmed.includes("답변하지") &&
    !trimmed.includes("아무것도") &&
    !trimmed.includes("않았습니다.") &&
    !trimmed.includes("텍스트 추출") &&
    !trimmed.includes("Thank you") &&
    !trimmed.includes("Bye") &&
    !trimmed.includes("핵심 키워드")
  );
}

export function preprocessGraphData(originalData: GraphData): GraphData {
  const nodeMap = new Map<string, Node>();

  // 노드 필터링 (utterances 제외, label 없는 노드 제거, speaker 중복 제거)
  originalData.nodes.forEach(n => {
    if (n.type === "utterances") return;
    if (!isMeaningfulLabel(n.label)) return;

    const isSpeaker = n.id.startsWith("speakers/");
    const baseId = isSpeaker ? n.id.split("(")[0].trim() : n.id;

    if (!nodeMap.has(baseId)) {
      nodeMap.set(baseId, { ...n, id: baseId });
    }
  });

  // utterance 관계 맵
  const utteranceSpeakerMap = new Map<string, string>();
  const utteranceMeetingMap = new Map<string, string>();

  originalData.links.forEach(link => {
    const fromId = typeof link.source === "string" ? link.source : link.source.id;
    const toId = typeof link.target === "string" ? link.target : link.target.id;

    if (link.type === "speaker_to_utterance" || link.type === "utterance_to_speaker") {
      const utteranceId = fromId.startsWith("utterances/") ? fromId : toId;
      const rawSpeakerId = fromId.startsWith("speakers/") ? fromId : toId;
      const speakerId = rawSpeakerId.split("(")[0].trim();
      utteranceSpeakerMap.set(utteranceId, speakerId);
    } else if (link.type === "meeting_to_utterance") {
      utteranceMeetingMap.set(toId, fromId);
    }
  });

  // 링크 구성
  const linkSet = new Set<string>();
  const links: Link[] = [];

  originalData.links.forEach(link => {
    const sourceId = typeof link.source === "string" ? link.source : link.source.id;
    const targetId = typeof link.target === "string" ? link.target : link.target.id;

    // utterance → keyword/topic 변환
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

    // 일반 링크 유지
    else if (
      !sourceId.startsWith("utterances/") &&
      !targetId.startsWith("utterances/") &&
      nodeMap.has(sourceId) &&
      nodeMap.has(targetId)
    ) {
      links.push({ source: sourceId, target: targetId, type: link.type });
    }
  });

  // meeting ↔ speaker 연결 추가
  utteranceSpeakerMap.forEach((speakerId, utteranceId) => {
    const meetingId = utteranceMeetingMap.get(utteranceId);
    if (!meetingId) return;
    const key = `${meetingId}->${speakerId}`;
    if (!linkSet.has(key)) {
      links.push({ source: meetingId, target: speakerId, type: "meeting_to_speaker_via_utterance" });
      linkSet.add(key);
    }
  });

  // 고아 노드 제거
  const connectedNodeIds = new Set<string>();
  links.forEach(link => {
    const s = typeof link.source === "string" ? link.source : link.source.id;
    const t = typeof link.target === "string" ? link.target : link.target.id;
    connectedNodeIds.add(s);
    connectedNodeIds.add(t);
  });

  const filteredNodes = Array.from(nodeMap.values());

  return { nodes: filteredNodes, links };
}