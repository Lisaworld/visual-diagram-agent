import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useStyleContext } from '../contexts/StyleContextProvider';
import { DiagramData } from '../types/diagram';

interface MindMapViewProps {
  data: DiagramData;
}

interface HierarchyNode {
  id: string;
  text: string;
  children?: HierarchyNode[];
}

const convertToHierarchyData = (data: DiagramData): HierarchyNode => {
  const rootNode = data.nodes.find(node => 
    !data.edges.some(edge => edge.to === node.id)
  );

  if (!rootNode) {
    throw new Error('루트 노드를 찾을 수 없습니다.');
  }

  const findChildren = (parentId: string): HierarchyNode[] => {
    const childEdges = data.edges.filter(edge => edge.from === parentId);
    return childEdges.map(edge => {
      const childNode = data.nodes.find(node => node.id === edge.to);
      if (!childNode) return null;
      
      return {
        id: childNode.id,
        text: childNode.text,
        children: findChildren(childNode.id)
      };
    }).filter(Boolean) as HierarchyNode[];
  };

  return {
    id: rootNode.id,
    text: rootNode.text,
    children: findChildren(rootNode.id)
  };
};

export const MindMapView: React.FC<MindMapViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state: { isDarkMode } } = useStyleContext();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data) return;

    try {
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2.5;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

      const g = svg
        .append("g")
        .attr("transform", `translate(${centerX},${centerY})`);

      const hierarchyData = convertToHierarchyData(data);
      const root = d3.hierarchy(hierarchyData);

      // 레벨별 각도 조정을 위한 설정
      const levelAngles: Record<number, number> = {
        0: 2 * Math.PI,    // 루트 노드
        1: Math.PI * 1.8,  // 첫 번째 레벨
        2: Math.PI * 1.5,  // 두 번째 레벨
        3: Math.PI * 1.2   // 세 번째 레벨 이상
      };

      // 레벨별 반지름 조정
      const levelRadius: Record<number, number> = {
        0: 0,
        1: radius * 0.3,
        2: radius * 0.6,
        3: radius * 0.9
      };

      // 커스텀 레이아웃 설정
      const mindMapLayout = (root: d3.HierarchyNode<HierarchyNode>) => {
        const depth = root.height;
        root.descendants().forEach((node, i) => {
          const level = node.depth;
          const angle = levelAngles[Math.min(level, 3)] || Math.PI;
          const r = levelRadius[Math.min(level, 3)] || radius;
          
          if (level === 0) {
            node.x = 0;
            node.y = 0;
          } else if (level === 1) {
            const childCount = node.parent?.children?.length || 1;
            const idx = node.parent?.children?.indexOf(node) || 0;
            node.x = (idx - (childCount - 1) / 2) * (angle / childCount);
            node.y = r;
          } else {
            const parentAngle = node.parent?.x || 0;
            const siblings = node.parent?.children?.length || 1;
            const idx = node.parent?.children?.indexOf(node) || 0;
            const spread = angle / siblings;
            node.x = parentAngle + (idx - (siblings - 1) / 2) * spread;
            node.y = r;
          }
        });
        return root;
      };

      const mindMapData = mindMapLayout(root);

      // 연결선 생성기
      const linkGenerator = d3.linkRadial<any, d3.HierarchyLink<HierarchyNode>, d3.HierarchyNode<HierarchyNode>>()
        .angle(d => (d as any).x)
        .radius(d => (d as any).y);

      // 곡선 조정을 위한 커스텀 링크 생성
      const customLink = (d: d3.HierarchyLink<HierarchyNode>) => {
        const source = { 
          x: d.source.x || 0, 
          y: d.source.y || 0 
        };
        const target = { 
          x: d.target.x || 0, 
          y: d.target.y || 0 
        };
        const path = d3.path();
        
        const x1 = source.y * Math.cos(source.x);
        const y1 = source.y * Math.sin(source.x);
        const x2 = target.y * Math.cos(target.x);
        const y2 = target.y * Math.sin(target.x);
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dr = Math.sqrt(dx * dx + dy * dy) * 2;
        
        path.moveTo(x1, y1);
        path.arcTo(x2, y2, x2, y2, dr);
        
        return path.toString();
      };

      // 연결선 그리기
      g.append("g")
        .attr("fill", "none")
        .attr("stroke", isDarkMode ? "#666" : "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", function(this: SVGGElement, d: any) {
          return d && d.source && d.source.depth === 0 ? 2 : 1;
        })
        .selectAll("path")
        .data(mindMapData.links())
        .join("path")
        .attr("d", customLink)
        .attr("stroke", (d: d3.HierarchyLink<HierarchyNode>) => {
          if (d.target.depth === 1) {
            return isDarkMode ? "#6366f1" : "#4f46e5";
          }
          return isDarkMode ? "#666" : "#999";
        });

      // 디버깅을 위한 로깅 추가
      console.log('Links data:', mindMapData.links());
      console.log('Nodes data:', mindMapData.descendants());

      // 노드 그룹 생성
      const node = g.append("g")
        .selectAll("g")
        .data(mindMapData.descendants())
        .join("g")
        .attr("transform", (d: d3.HierarchyNode<HierarchyNode>) => {
          const x = Math.sin(d.x || 0) * (d.y || 0);
          const y = -Math.cos(d.x || 0) * (d.y || 0);
          return `translate(${x},${y})`;
        });

      // 노드 크기 설정
      const getNodeSize = (depth: number) => {
        switch(depth) {
          case 0: return { width: 160, height: 50 };
          case 1: return { width: 140, height: 45 };
          case 2: return { width: 120, height: 40 };
          default: return { width: 100, height: 35 };
        }
      };

      // 노드 배경 그리기
      node.append("rect")
        .attr("fill", d => {
          if (d.depth === 0) return isDarkMode ? "#4c51bf" : "#ebf4ff";
          if (d.depth === 1) return isDarkMode ? "#374151" : "#f3f4f6";
          return isDarkMode ? "#1f2937" : "#ffffff";
        })
        .attr("stroke", d => {
          if (d.depth === 0) return isDarkMode ? "#6366f1" : "#4f46e5";
          if (d.depth === 1) return isDarkMode ? "#4c51bf" : "#6366f1";
          return isDarkMode ? "#374151" : "#e5e7eb";
        })
        .attr("stroke-width", d => d.depth === 0 ? 2 : 1)
        .attr("rx", 10)
        .attr("ry", 10)
        .each(function(d) {
          const size = getNodeSize(d.depth);
          d3.select(this)
            .attr("x", -size.width / 2)
            .attr("y", -size.height / 2)
            .attr("width", size.width)
            .attr("height", size.height);
        });

      // 노드 텍스트 그리기
      node.append("text")
        .attr("dy", "0.31em")
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", isDarkMode ? "#fff" : "#000")
        .style("font-size", d => {
          if (d.depth === 0) return "16px";
          if (d.depth === 1) return "14px";
          return "12px";
        })
        .style("font-weight", d => d.depth <= 1 ? "bold" : "normal")
        .text(d => d.data.text)
        .clone(true)
        .lower()
        .attr("stroke", isDarkMode ? "#1e1e1e" : "#fff")
        .attr("stroke-width", 3);

      // 줌 기능
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 2])
        .on("zoom", (event) => {
          g.attr("transform", `translate(${centerX + event.transform.x},${centerY + event.transform.y}) scale(${event.transform.k})`);
        });

      svg.call(zoom);

    } catch (error) {
      console.error('마인드맵 초기화 오류:', error);
    }
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
      className="w-full h-[600px] flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900"
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}; 