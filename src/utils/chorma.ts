import chroma from "chroma-js";

const ColorMap = new Map<string, chroma.Color>();

export function getColor(type: "main" | "sub" | "content", parentId?: string): string {
  if ((type === "main" || type === "sub") && parentId) {
    const color = chroma.random();
    ColorMap.set(parentId, color); // 주주제 또는 소주제 색상
    return color.hex();
  }

  if (type === "main" && !parentId) {
    const color = chroma.random();
    ColorMap.set("main_num", color);
    return color.hex();
  }

  // 주주제와 소주제의 색상과 유사한 색을 가지며, 내용들끼리는 동일한 색상을 가짐
  if (type === "content" && parentId && ColorMap.has(parentId)) {
    const base = ColorMap.get(parentId)!; 
    return base
    .brighten(0.3 + Math.random() * 0.5)
    .saturate(0.5 + Math.random() * 0.5)
    .hex();
  }

  // fallback
  return chroma.random().hex();
}
