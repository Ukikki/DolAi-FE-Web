import { svgAsPngUri } from "save-svg-as-png";

export const exportGraphBlob = async (
  svgEl: SVGSVGElement
): Promise<Blob> => {
  const uri = await svgAsPngUri(svgEl, {
    backgroundColor: "#ffffff",
    scale: 2,
  });

  const res = await fetch(uri);
  const blob = await res.blob();
  return blob;
};
