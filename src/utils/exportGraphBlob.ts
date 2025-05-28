import { svgAsPngUri } from "save-svg-as-png";

export const exportGraphBlob = async (
  svgEl: SVGSVGElement
): Promise<Blob> => {
  // SVG viewBox를 기반으로 크기 추출
  const viewBox = svgEl.getAttribute("viewBox")?.split(" ").map(Number);
  const width = viewBox ? viewBox[2] : svgEl.clientWidth;
  const height = viewBox ? viewBox[3] : svgEl.clientHeight;

  const uri = await svgAsPngUri(svgEl, {
    backgroundColor: "#ffffff",
    scale: 1,
    width,
    height,
  } as any); 

  const res = await fetch(uri);
  const blob = await res.blob();
  return blob;
};