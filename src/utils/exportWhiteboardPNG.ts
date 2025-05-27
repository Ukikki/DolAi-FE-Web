import { Editor } from "tldraw"

export const exportWhiteboardPNG = async (editor: Editor): Promise<Blob> => {
  const shapeIds = Array.from(editor.getCurrentPageShapeIds())
  const svg = await editor.getSvg(shapeIds, {
    scale: 1,
  })

  if (!svg) throw new Error("❌ SVG 생성 실패")

  const svgString = new XMLSerializer().serializeToString(svg)
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })

  const url = URL.createObjectURL(svgBlob)
  const image = new Image()
  image.src = url

  await new Promise((resolve) => (image.onload = resolve))

  const canvas = document.createElement("canvas")
  const width = parseFloat(svg.getAttribute("width") ?? "1000")
  const height = parseFloat(svg.getAttribute("height") ?? "1000")

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
    }, "image/png")
  })
}