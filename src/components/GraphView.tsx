import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getColor } from "../utils/chorma";

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  color: string;
  size: number;
  type: "main" | "sub" | "content";
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
}

const GraphView = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null); // 부모 컨테이너 ref
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const { clientWidth, clientHeight } = containerRef.current;
    const width = clientWidth;
    const height = clientHeight;
    setSize({ width, height }); // 크기 저장

    const minX = 50;
    const maxX = width - 50;
    const minY = 50;
    const maxY = height - 50;

    if (!svgRef.current) return;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    // ---- 이하 그래프 코드 동일 ----
    const sizeMap: Record<"main" | "sub" | "content", number> = {
      main: 70,
      sub: 50,
      content: 35,
    };

    const nodes: NodeDatum[] = [
      { id: "main1", label: "AI 서비스", type: "main", color: getColor("main", "main1"), size: sizeMap.main },
      { id: "sub1", label: "STT", type: "sub", color: getColor("sub", "sub1"), size: sizeMap.sub },
      { id: "sub2", label: "API", type: "sub", color: getColor("sub", "sub2"), size: sizeMap.sub },
      { id: "msg1", label: "OpenAI\\nWhisper", type: "content", color:  getColor("content", "sub1"), size: sizeMap.content },
      { id: "msg2", label: "Azure\\nTranslator", type: "content", color: getColor("content", "sub1"), size: sizeMap.content },
      { id: "msg3", label: "Gemini", type: "content", color:  getColor("content", "main1"), size: sizeMap.content },
      { id: "msg4", label: "헬로", type: "content", color:  getColor("content", "main1"), size: sizeMap.content }
    ];

    const links: LinkDatum[] = [
      { source: "main1", target: "sub1" },
      { source: "main1", target: "sub2" },
      { source: "sub1", target: "msg1" },
      { source: "sub1", target: "msg2" },
      { source: "main1", target: "msg3" },
      { source: "main1", target: "msg4" },
    ];

    const simulation = d3
      .forceSimulation<NodeDatum>(nodes)
      .force("link", d3.forceLink<NodeDatum, LinkDatum>(links).id((d) => d.id).distance(200).strength(1))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<NodeDatum>().radius(d => d.size + 10))
      .alphaDecay(0.015);

    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#333");

    const linkGroup = svg.append("g").attr("class", "links");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    const linkElements = linkGroup.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    const nodeElements = nodeGroup.selectAll<SVGGElement, NodeDatum>("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, NodeDatum>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = d.x;
            d.fy = null;
            simulation.alpha(0.09).restart();
          })
      );

    nodeElements.append("circle")
      .attr("r", (d) => d.size)
      .attr("fill", (d) => d.color);

    nodeElements.append("text")
      .selectAll("tspan")
      .data(d => d.label.split("\\n"))
      .enter()
      .append("tspan")
      .attr("x", 0)
      .attr("dy", (d, i) => i === 0 ? "0" : "1vw")
      .text((d) => d)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", (d, i, nodes) => {
        const datum = d3.select(nodes[i].parentNode!).datum() as NodeDatum;
        const map = { main: "24px", sub: "20px", content: "14px" };
        return map[datum.type];
      })
      .attr("fill", "#fff")
      .attr("font-family", "Jamsil_M");

    nodeElements
      .on("mouseover", function (event, d) {
        const connectedNodeIds = new Set<string>();
        connectedNodeIds.add(d.id);
        links.forEach((l) => {
          if (l.source === d.id || (typeof l.source !== "string" && l.source.id === d.id)) {
            connectedNodeIds.add(typeof l.target === "string" ? l.target : l.target.id);
          }
          if (l.target === d.id || (typeof l.target !== "string" && l.target.id === d.id)) {
            connectedNodeIds.add(typeof l.source === "string" ? l.source : l.source.id);
          }
        });

        nodeElements.selectAll("circle")
          .attr("opacity", (n) => connectedNodeIds.has(n.id) ? 1 : 0.1);
        linkElements
          .attr("opacity", (l) => connectedNodeIds.has(
            typeof l.source === "string" ? l.source : l.source.id
          ) && connectedNodeIds.has(
            typeof l.target === "string" ? l.target : l.target.id
          ) ? 1 : 0.05);
      })
      .on("mouseout", () => {
        nodeElements.selectAll("circle").attr("opacity", 1);
        linkElements.attr("opacity", 1);
      });

    simulation.on("tick", () => {
      nodes.forEach((d) => {
        d.x = Math.max(minX, Math.min(maxX, d.x!));
        d.y = Math.max(minY, Math.min(maxY, d.y!));
      });

      nodeElements.attr("transform", (d) => `translate(${d.x},${d.y})`);
      linkElements
        .attr("x1", (d) => (typeof d.source === "string" ? 0 : (d.source as NodeDatum).x!))
        .attr("y1", (d) => (typeof d.source === "string" ? 0 : (d.source as NodeDatum).y!))
        .attr("x2", (d) => (typeof d.target === "string" ? 0 : (d.target as NodeDatum).x!))
        .attr("y2", (d) => (typeof d.target === "string" ? 0 : (d.target as NodeDatum).y!));
    });

    return () => {
      svg.selectAll("*").remove();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default GraphView;
