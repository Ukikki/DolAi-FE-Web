declare module "save-svg-as-png" {
  export function saveSvgAsPng(
    svgElement: SVGElement,
    fileName: string,
    options?: {
      scale?: number;
      backgroundColor?: string;
    }
  ): void;

  export function svgAsPngUri(
    svgElement: SVGElement,
    options?: {
      scale?: number;
      backgroundColor?: string;
    }
  ): Promise<string>;
}