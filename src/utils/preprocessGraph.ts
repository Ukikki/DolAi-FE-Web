import { GraphData, Node, Link } from "@/types/graph";

// D3 그래프에서 utterance 제거하고 tooltip 처리하는 전처리 함수
export function preprocessGraphData(originalData: GraphData): GraphData {
  const nodes = originalData.nodes.filter(n => n.type !== "utterances");

  const nodeMap = new Map<string, Node>();
  originalData.nodes.forEach(n => nodeMap.set(n.id, n));

  // utteranceId -> speakerId / meetingId 추적용
  const utteranceSpeakerMap = new Map<string, string>();
  const utteranceMeetingMap = new Map<string, string>();

  originalData.links.forEach(link => {
    const fromId = typeof link.source === "string" ? link.source : link.source.id;
    const toId = typeof link.target === "string" ? link.target : link.target.id;

    if (link.type === "speaker_to_utterance" || link.type === "utterance_to_speaker") {
      utteranceSpeakerMap.set(fromId.startsWith("utterances/") ? fromId : toId, fromId.startsWith("speakers/") ? fromId : toId);
    } else if (link.type === "meeting_to_utterance") {
      utteranceMeetingMap.set(toId, fromId);
    }
  });

  const linkSet = new Set<string>();
  const links: Link[] = [];

  originalData.links.forEach(link => {
    const sourceId = typeof link.source === "string" ? link.source : link.source.id;
    const targetId = typeof link.target === "string" ? link.target : link.target.id;

    // utterance → keyword/topic 관계만 필터링
    if (sourceId.startsWith("utterances/") && (targetId.startsWith("keywords/") || targetId.startsWith("topics/"))) {
      const utterance = nodeMap.get(sourceId);
      const keywordOrTopic = nodeMap.get(targetId);
      if (!utterance || !keywordOrTopic) return;

      // tooltip에 utterance 내용 추가 (중복 제거)
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
          links.push({
            source: pid!,
            target: targetId,
            type: link.type,
          });
          linkSet.add(key);
        }
      }
    }
    // utterance 관계가 아닌 기존 link는 유지
    else if (!sourceId.startsWith("utterances/") && !targetId.startsWith("utterances/")) {
      // speaker 노드 관련 링크만 유지
      if (
        sourceId.startsWith("speakers/") ||
        targetId.startsWith("speakers/") ||
        sourceId.startsWith("meetings/") ||
        targetId.startsWith("meetings/") ||
        sourceId.startsWith("keywords/") ||
        targetId.startsWith("keywords/") ||
        sourceId.startsWith("topics/") ||
        targetId.startsWith("topics/")
      ) {
        links.push(link);
      }
    }
  });

  // meeting ↔ speaker 연결 추가
  utteranceSpeakerMap.forEach((speakerId, utteranceId) => {
    const meetingId = utteranceMeetingMap.get(utteranceId);
    if (!meetingId) return;

    const key = `${meetingId}->${speakerId}`;
    if (!linkSet.has(key)) {
      links.push({
        source: meetingId,
        target: speakerId,
        type: "meeting_to_speaker_via_utterance",
      });
      linkSet.add(key);
    }
  });

  return { nodes, links };
}
