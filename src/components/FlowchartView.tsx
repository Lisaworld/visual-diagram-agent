import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DiagramData } from '../types/diagram';
import { useStyleContext } from '../contexts/StyleContextProvider';

interface FlowchartViewProps {
  data: DiagramData;
}

export const FlowchartView: React.FC<FlowchartViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state: { isDarkMode } } = useStyleContext();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // 노드 위치 계산
    const nodeWidth = 180;
    const nodeHeight = 40;
    const nodeSpacing = 60;
    
    // 레벨별 노드 그룹화
    const levels: { [key: number]: string[] } = {};
    const visited = new Set<string>();
    
    const calculateLevels = (nodeId: string, level: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      if (!levels[level]) levels[level] = [];
      levels[level].push(nodeId);
      
      const children = data.edges
        .filter(edge => edge.from === nodeId)
        .map(edge => edge.to);
      
      children.forEach(childId => calculateLevels(childId, level + 1));
    };
    
    // 루트 노드 찾기
    const rootNode = data.nodes.find(node => 
      !data.edges.some(edge => edge.to === node.id)
    );
    
    if (rootNode) {
      calculateLevels(rootNode.id, 0);
    }

    // 노드 위치 매핑
    const nodePositions = new Map();
    Object.entries(levels).forEach(([level, nodeIds]) => {
      const levelNum = parseInt(level);
      const levelWidth = nodeIds.length * (nodeWidth + nodeSpacing);
      const startX = (width - levelWidth) / 2 + nodeWidth / 2;
      
      nodeIds.forEach((nodeId, index) => {
        nodePositions.set(nodeId, {
          x: startX + index * (nodeWidth + nodeSpacing),
          y: levelNum * (nodeHeight + nodeSpacing) + 50
        });
      });
    });

    // 엣지 그리기
    const g = svg.append("g");
    
    g.selectAll("path")
      .data(data.edges)
      .join("path")
      .attr("d", d => {
        const sourcePos = nodePositions.get(d.from);
        const targetPos = nodePositions.get(d.to);
        
        if (!sourcePos || !targetPos) return "";
        
        return `M ${sourcePos.x} ${sourcePos.y + nodeHeight / 2}
                C ${sourcePos.x} ${(sourcePos.y + targetPos.y) / 2},
                  ${targetPos.x} ${(sourcePos.y + targetPos.y) / 2},
                  ${targetPos.x} ${targetPos.y - nodeHeight / 2}`;
      })
      .attr("fill", "none")
      .attr("stroke", isDarkMode ? "#4a5568" : "#cbd5e0")
      .attr("stroke-width", 2);

    // 노드 그리기
    const nodes = g.selectAll("g.node")
      .data(data.nodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => {
        const pos = nodePositions.get(d.id);
        return pos ? `translate(${pos.x - nodeWidth / 2},${pos.y - nodeHeight / 2})` : "";
      });

    // 노드 배경
    nodes.append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 6)
      .attr("fill", isDarkMode ? "#2d3748" : "#ffffff")
      .attr("stroke", isDarkMode ? "#4a5568" : "#e2e8f0")
      .attr("stroke-width", 1);

    // 노드 텍스트
    nodes.append("text")
      .attr("x", nodeWidth / 2)
      .attr("y", nodeHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", isDarkMode ? "#e2e8f0" : "#2d3748")
      .text(d => d.text);

    // 줌 기능 추가
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

  }, [data, isDarkMode]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-300">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-[600px] bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}; 