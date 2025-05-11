import chroma from "chroma-js";

const ColorMap = new Map<string, chroma.Color>();

export function getColor(
  type: "utterances" | "topics" | "keywords" | "meetings" | "speakers",
  parentId?: string
): string {
  // 연관된 키워드는 색상 비슷하게
  const key = type === "utterances" ? parentId! : parentId ?? `${type}_fallback`;

  // utterances
  if (type === "utterances") {
    if (!ColorMap.has(key)) {
      ColorMap.set(key, chroma.random());
    }
    return ColorMap.get(key)!.hex();
  }

  // topics, keywords → utterance 기반 색에서 변형
  if ((type === "topics" || type === "keywords") && parentId && ColorMap.has(parentId)) {
    const base = ColorMap.get(parentId)!;
    return base.brighten(0.3 + Math.random() * 0.3).saturate(0.3 + Math.random() * 0.3).hex();
  }

  // speakers, meetings, fallback
  if (!ColorMap.has(key)) {
    ColorMap.set(key, chroma.random());
  }
  return ColorMap.get(key)!.hex();
}

export function resetColorMap() {
  ColorMap.clear();
}