import { useEffect, useRef, RefObject } from "react";
import * as d3 from "d3";
import { GraphData, Node, Link } from "@/types/graph";
import "@/styles/meeting/Meeting.css";

interface Props {
  graphData: GraphData;
  svgRef: RefObject<SVGSVGElement | null>;
}

const GraphViewing: React.FC<Props> = ({ graphData, svgRef }) => {
  const containerRef = useRef<HTMLDivElement>(null); // 화면 크기에 맞게

  useEffect(() => {
    if (!containerRef.current) return;

    //const react = containerRef.current.getBoundingClientRect();
    // const width = react.width;
    // const height = react.height;
    const width = 600;
    const height = 880;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
    svg.selectAll("*").remove(); // 기존 요소 제거

    // <svg> 설정 및 transform 그룹
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const container = svg.append("g"); // 모든 요소를 컨테이너에 담음

    // hand tool 사용
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 3])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        })
    );

    // 중앙 고정할 미팅 노드
    const centerNode = graphData.nodes.find(n => n.type === "meetings");
    if (centerNode) {
      centerNode.fx = width / 2;
      centerNode.fy = height / 2;
    }

    const simulation = d3.forceSimulation(graphData.nodes)
      .force("link", d3.forceLink<Node, Link>(graphData.links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<Node>().radius(d => (d.size ?? 10) + 8)); // 충돌 방지

    // 링크
    const linkGroup = container.append("g");
    const linkElements = linkGroup
      .selectAll("line")
      .data(graphData.links)
      .enter()
      .append("line")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("opacity", 1)
      .attr("x1", d => (typeof d.source === "string" ? 0 : d.source.x ?? 0))
      .attr("y1", d => (typeof d.source === "string" ? 0 : d.source.y ?? 0))
      .attr("x2", d => (typeof d.target === "string" ? 0 : d.target.x ?? 0))
      .attr("y2", d => (typeof d.target === "string" ? 0 : d.target.y ?? 0))
      .each(function (_, i) {
        const length = (this as SVGLineElement).getTotalLength();
        d3.select(this)
          .attr("stroke-dasharray", `${length} ${length}`)
          .attr("stroke-dashoffset", length)
          .transition()
          .delay(i * 50 + 300) // 노드와 맞춰서 시간 조정 가능
          .duration(600)
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0);
      });

    // 노드 그룹
    const nodeGroup = container.append("g")
      .selectAll<SVGGElement, Node>("g")
      .data(graphData.nodes)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, Node>()
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
            d.fx = null;
            d.fy = null;
          })
      );

    // 원 (노드 모양)
    const circleElements = nodeGroup;
    const circleSelection = nodeGroup
      .append("circle")
      .attr("fill", d => d.color || "#69b3a2")
      .attr("r", 0) // 반지름 0부터 시작 (애니메이션용)
      .attr("opacity", 0);

    // 원 애니메이션 등장 효과
    circleSelection
      .transition()
      .delay((_, i) => i * 50)
      .duration(600)
      .attr("r", d => d.size ?? 20)
      .attr("opacity", 1)
      .ease(d3.easeBackOut);

    // 텍스트 (노드 안 라벨)
    nodeGroup
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("pointer-events", "none")
    .attr("fill", "white")
    .attr("font-size", 10) 
    .text(d => {
      const label = d.label?.trim();
      if (
        !label ||
        label.toLowerCase() === "null" ||
        label.includes("응답하지") ||
        label.includes("답변하지") ||
        label.includes("(")
      ) return "";
  
      return label.length > 12 ? label.slice(0, 12) + "..." : label;
    });

    // 마우스 호버 시 전체 라벨 tooltip
    nodeGroup
      .append("title")
      .text(d => d.label);

    // 마우스오버 강조 효과
    nodeGroup
      .on("mouseover", (_event, d) => {
        const connectedIds = new Set<string>([d.id]);
        graphData.links.forEach(link => {
          const sourceId = typeof link.source === "string" ? link.source : link.source.id;
          const targetId = typeof link.target === "string" ? link.target : link.target.id;
          if (sourceId === d.id || targetId === d.id) {
            connectedIds.add(sourceId);
            connectedIds.add(targetId);
          }
        });

        circleElements.select("circle").attr("opacity", node => connectedIds.has((node as any).id) ? 1 : 0.1);
        linkElements.attr("opacity", link => {
          const s = typeof link.source === "string" ? link.source : link.source.id;
          const t = typeof link.target === "string" ? link.target : link.target.id;
          return connectedIds.has(s) && connectedIds.has(t) ? 1 : 0.05;
        });
      })
      .on("mouseout", () => {
        circleElements.select("circle").attr("opacity", 1);
        linkElements.attr("opacity", 1);
      });

    // 시뮬레이션 tick마다 위치 업데이트
    simulation.on("tick", () => {
      linkElements
        .attr("x1", d => (typeof d.source === "string" ? 0 : d.source.x!))
        .attr("y1", d => (typeof d.source === "string" ? 0 : d.source.y!))
        .attr("x2", d => (typeof d.target === "string" ? 0 : d.target.x!))
        .attr("y2", d => (typeof d.target === "string" ? 0 : d.target.y!));

      nodeGroup.attr("transform", (d: Node) => `translate(${d.x},${d.y})`);
    });
  }, [graphData]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default GraphViewing;