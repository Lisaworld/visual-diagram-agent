import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DiagramData } from '../types/diagram';
import { useStyleContext } from '../contexts/StyleContextProvider';

interface TreeViewProps {
  data: DiagramData;
}

interface HierarchyNode {
  id: string;
  text: string;
  children?: HierarchyNode[];
}

export const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state: { isDarkMode } } = useStyleContext();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data) return;

    // 데이터를 계층 구조로 변환
    const convertToHierarchy = (nodeId: string, visited = new Set<string>()): HierarchyNode | null => {
      if (visited.has(nodeId)) return null;
      visited.add(nodeId);

      const node = data.nodes.find(n => n.id === nodeId);
      if (!node) return null;

      const children = data.edges
        .filter(edge => edge.from === nodeId)
        .map(edge => convertToHierarchy(edge.to, new Set(visited)))
        .filter((n): n is HierarchyNode => n !== null);

      return {
        id: node.id,
        text: node.text,
        children: children.length > 0 ? children : undefined
      };
    };

    // 루트 노드 찾기
    const rootNode = data.nodes.find(node => 
      !data.edges.some(edge => edge.to === node.id)
    );

    if (!rootNode) return;

    const hierarchyData = convertToHierarchy(rootNode.id);
    if (!hierarchyData) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const root = d3.hierarchy(hierarchyData);

    const treeLayout = d3.tree()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

    const tree = treeLayout(root);

    // 링크 그리기
    g.selectAll("path.link")
      .data(tree.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", isDarkMode ? "#4a5568" : "#cbd5e0")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      );

    // 노드 그룹 생성
    const node = g.selectAll("g.node")
      .data(tree.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // 노드 배경
    node.append("rect")
      .attr("x", -50)
      .attr("y", -15)
      .attr("width", 100)
      .attr("height", 30)
      .attr("rx", 6)
      .attr("fill", isDarkMode ? "#2d3748" : "#ffffff")
      .attr("stroke", isDarkMode ? "#4a5568" : "#e2e8f0")
      .attr("stroke-width", 1);

    // 노드 텍스트
    node.append("text")
      .attr("dy", "0.32em")
      .attr("text-anchor", "middle")
      .attr("fill", isDarkMode ? "#e2e8f0" : "#2d3748")
      .text(d => d.data.text)
      .style("font-size", "12px");

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