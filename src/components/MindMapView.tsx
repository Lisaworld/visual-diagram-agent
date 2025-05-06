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
    // 컴포넌트 마운트 시 초기 크기 설정
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          renderMindMap();
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 초기 렌더링
    renderMindMap();

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, isDarkMode]);

  const renderMindMap = () => {
    if (!svgRef.current || !containerRef.current || !data) {
      console.warn('Required elements not ready:', {
        svg: !!svgRef.current,
        container: !!containerRef.current,
        data: !!data
      });
      return;
    }

    try {
      const container = containerRef.current;
      // 최소 크기 설정
      const width = Math.max(container.clientWidth || 800, 400);
      const height = Math.max(container.clientHeight || 600, 400);

      // 중심점 계산
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2.5;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // viewBox 설정 전 유효성 검사
      const viewBoxValues = [0, 0, width, height].map(value => 
        Number.isFinite(value) ? value : 0
      );
      
      svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", viewBoxValues.join(" "))
        .attr("preserveAspectRatio", "xMidYMid meet");

      const g = svg
        .append("g")
        .attr("transform", `translate(${centerX},${centerY})`);

      // 데이터 변환 및 검증
      let hierarchyData;
      try {
        hierarchyData = convertToHierarchyData(data);
      } catch (error) {
        console.error('Failed to convert data to hierarchy:', error);
        return;
      }

      const root = d3.hierarchy(hierarchyData);
      if (!root) {
        console.error('Failed to create hierarchy from data');
        return;
      }

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
            const angleValue = (idx - (childCount - 1) / 2) * (angle / childCount);
            // 각도 유효성 검사
            node.x = Number.isFinite(angleValue) ? angleValue : 0;
            node.y = r;
          } else {
            const parentAngle = node.parent?.x || 0;
            const siblings = node.parent?.children?.length || 1;
            const idx = node.parent?.children?.indexOf(node) || 0;
            const spread = angle / siblings;
            const angleValue = parentAngle + (idx - (siblings - 1) / 2) * spread;
            // 각도 유효성 검사
            node.x = Number.isFinite(angleValue) ? angleValue : parentAngle;
            node.y = r;
          }
        });
        return root;
      };

      const mindMapData = mindMapLayout(root);

      // 곡선 조정을 위한 커스텀 링크 생성
      const customLink = (d: d3.HierarchyLink<HierarchyNode>) => {
        const source = { x: d.source.x || 0, y: d.source.y || 0 };
        const target = { x: d.target.x || 0, y: d.target.y || 0 };
        
        const path = d3.path();
        const x1 = source.y * Math.cos(source.x);
        const y1 = source.y * Math.sin(source.x);
        const x2 = target.y * Math.cos(target.x);
        const y2 = target.y * Math.sin(target.x);
        
        // 좌표 유효성 검사
        if (!Number.isFinite(x1) || !Number.isFinite(y1) || 
            !Number.isFinite(x2) || !Number.isFinite(y2)) {
          console.warn('Invalid coordinates detected:', { x1, y1, x2, y2 });
          return '';
        }
        
        path.moveTo(x1, y1);
        
        // 곡선의 제어점 계산
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dr = Math.sqrt(dx * dx + dy * dy);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        // 베지어 곡선 사용
        path.quadraticCurveTo(
          midX + (dr * 0.2) * Math.cos(source.x + Math.PI/2),
          midY + (dr * 0.2) * Math.sin(source.x + Math.PI/2),
          x2,
          y2
        );
        
        return path.toString();
      };

      // 연결선 그리기
      g.append("g")
        .attr("fill", "none")
        .attr("stroke", isDarkMode ? "#666" : "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1.5)
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

      // 노드 그룹 생성
      const node = g.append("g")
        .selectAll("g")
        .data(mindMapData.descendants())
        .join("g")
        .attr("transform", (d: d3.HierarchyNode<HierarchyNode>) => {
          const x = Math.sin(d.x || 0) * (d.y || 0);
          const y = -Math.cos(d.x || 0) * (d.y || 0);
          
          // NaN 체크
          if (isNaN(x) || isNaN(y)) {
            console.error('Invalid node coordinates:', { x, y, node: d });
            return "translate(0,0)";
          }
          
          return `translate(${x},${y})`;
        });

      // 노드 크기 설정에 유효성 검사 추가
      const getNodeSize = (depth: number) => {
        const sizes: Record<number | 'default', { width: number; height: number }> = {
          0: { width: 160, height: 50 },
          1: { width: 140, height: 45 },
          2: { width: 120, height: 40 },
          default: { width: 100, height: 35 }
        };
        return sizes[depth] || sizes.default;
      };

      // 노드 배경 그리기 시 유효성 검사
      node.append("rect")
        .each(function(d) {
          const size = getNodeSize(d.depth);
          const rect = d3.select(this);
          
          // 크기가 유효한지 확인
          if (size.width > 0 && size.height > 0) {
            rect
              .attr("x", -size.width / 2)
              .attr("y", -size.height / 2)
              .attr("width", size.width)
              .attr("height", size.height);
          }
        })
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
        .attr("ry", 10);

      // 노드 텍스트 그리기
      node.append("text")
        .attr("dy", "0.31em")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("fill", isDarkMode ? "#fff" : "#000")
        .style("font-size", d => {
          if (d.depth === 0) return "16px";
          if (d.depth === 1) return "14px";
          return "12px";
        })
        .style("font-weight", d => d.depth <= 1 ? "bold" : "normal")
        .text(d => d.data.text || '')
        .clone(true)
        .lower()
        .attr("stroke", isDarkMode ? "#1e1e1e" : "#fff")
        .attr("stroke-width", 3);

    } catch (error) {
      console.error('Error rendering mind map:', error);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] min-w-[400px] relative"
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minWidth: '400px', minHeight: '400px' }}
      />
    </div>
  );
}; 