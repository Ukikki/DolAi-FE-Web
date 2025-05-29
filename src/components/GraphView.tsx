import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getColor } from "../utils/chorma";

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  color: string;
  size: number;
  type: "main" | "sub" | "content" | "team";
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
}

const GraphView = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null); // 부모 컨테이너 ref
  const [_size, setSize] = useState({ width: 0, height: 0 });

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

    const sizeMap: Record<"main" | "sub" | "content" | "team", number> = {
      main: 65,
      sub: 45,
      content: 35,
      team: 45,
    };

  const nodes: NodeDatum[] = [
    // Main
    { id: "main1", label: "Dolai", type: "main", color: getColor("utterances", "main1"), size: sizeMap.main },

    // Sub
    { id: "sub1", label: "Frontend", type: "sub", color: getColor("topics", "sub1"), size: sizeMap.sub },
    { id: "sub2", label: "SFU", type: "sub", color: getColor("topics", "sub2"), size: sizeMap.sub },
    { id: "sub3", label: "STT / AI", type: "sub", color: getColor("topics", "sub3"), size: sizeMap.sub },
    { id: "sub4", label: "Backend", type: "sub", color: getColor("topics", "sub4"), size: sizeMap.sub },


    // sub1 - Frontend
    { id: "msg1", label: "React", type: "content", color: getColor("keywords", "sub1"), size: sizeMap.content },
    { id: "msg4", label: "D3.js", type: "content", color: getColor("keywords", "sub1"), size: sizeMap.content },
    { id: "msg6", label: "Tldraw", type: "content", color: getColor("keywords", "sub1"), size: sizeMap.content },

    // sub2 - SFU
    { id: "msg7", label: "WebRTC", type: "content", color: getColor("keywords", "sub2"), size: sizeMap.content },
    { id: "msg8", label: "Mediasoup", type: "content", color: getColor("keywords", "sub2"), size: sizeMap.content },
    { id: "msg9", label: "TURN\\nServer", type: "content", color: getColor("keywords", "sub2"), size: sizeMap.content },

    // sub3 - STT / AI
    { id: "msg10", label: "OpenAI\\nWhisper", type: "content", color: getColor("keywords", "sub3"), size: sizeMap.content },
    { id: "msg11", label: "Azure\\nTranslator", type: "content", color: getColor("keywords", "sub3"), size: sizeMap.content },
    { id: "msg12", label: "Gemini\\nLLM", type: "content", color: getColor("keywords", "sub3"), size: sizeMap.content },

    // sub4 - Backend
    { id: "msg13", label: "Spring\\nBoot", type: "content", color: getColor("keywords", "sub4"), size: sizeMap.content },

    // Database
    { id: "sub6", label: "Database", type: "sub", color: getColor("topics", "sub6"), size: sizeMap.sub },
    { id: "msg19", label: "MySQL", type: "content", color: getColor("keywords", "sub6"), size: sizeMap.content },
    { id: "msg20", label: "Redis", type: "content", color: getColor("keywords", "sub6"), size: sizeMap.content },
    { id: "msg21", label: "ArangoDB", type: "content", color: getColor("keywords", "sub6"), size: sizeMap.content },

    // Team
    { id: "team1", label: "송희", type: "team", color: getColor("speakers", "송희"), size: sizeMap.team },
    { id: "team2", label: "성현", type: "team", color: getColor("speakers", "성현"), size: sizeMap.team },
    { id: "team3", label: "지운", type: "team", color: getColor("speakers", "지운"), size: sizeMap.team },
    { id: "team4", label: "지혜", type: "team", color: getColor("speakers", "지혜"), size: sizeMap.team },
  ];


    const links: LinkDatum[] = [
      // Main → Sub
      { source: "main1", target: "sub1" },
      { source: "main1", target: "sub2" },
      { source: "main1", target: "sub3" },
      { source: "main1", target: "sub4" },
      { source: "main1", target: "sub6" },

      // Sub → Content
      { source: "sub1", target: "msg1" },
      { source: "sub1", target: "msg4" },
      { source: "sub1", target: "msg6" },
      { source: "sub1", target: "msg7" },

      { source: "sub2", target: "msg8" },
      { source: "sub2", target: "msg9" },

      { source: "sub3", target: "msg10" },
      { source: "sub3", target: "msg11" },
      { source: "sub3", target: "msg12" },
      { source: "sub4", target: "msg13" },

      { source: "sub6", target: "msg19" },
      { source: "sub6", target: "msg20" },
      { source: "sub6", target: "msg21" },

      // 팀원 → 담당
      { source: "team1", target: "sub1" }, // 송희 → Frontend
      { source: "team2", target: "sub1" }, // 성현 → Frontend
      { source: "team3", target: "sub2" }, // 지운 → SFU
      { source: "team3", target: "sub4" }, // 지운 → Backend
      { source: "team3", target: "sub6" }, // 지운 → Database
      { source: "team4", target: "sub3" }, // 지혜 → STT/AI
      { source: "team4", target: "sub4" }, // 지혜 → Backend
      { source: "team4", target: "sub6" }, // 지혜 → Database
    ];

    const simulation = d3
      .forceSimulation<NodeDatum>(nodes)
      .force("link", d3.forceLink<NodeDatum, LinkDatum>(links).id((d) => d.id).distance(100).strength(1))
      .force("charge", d3.forceManyBody().strength(-210))
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
      .attr("dy", (_d, i) => i === 0 ? "0" : "1vw")
      .text((d) => d)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", function () {
        const group = this.parentNode as SVGGElement;
        const datum = d3.select(group).datum() as NodeDatum;
        const map = { main: "24px", sub: "20px", content: "14px", team: "22px"};
        return map[datum.type];
      })
      .attr("fill", "#fff")
      .attr("font-family", "Jamsil_M");

    nodeElements
      .on("mouseover", function (_event, d) {
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
          .attr("opacity", (n) => connectedNodeIds.has((n as NodeDatum).id) ? 1 : 0.1)
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
