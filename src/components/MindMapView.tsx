import React, { useEffect, useRef, useState } from 'react';
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

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 400;

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
  const [dimensions, setDimensions] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // 컨테이너가 보이지 않는 경우 기본값 사용
      if (rect.width === 0 || rect.height === 0) {
        setDimensions({ 
          width: DEFAULT_WIDTH, 
          height: DEFAULT_HEIGHT 
        });
        return;
      }

      setDimensions({
        width: Math.max(rect.width, MIN_WIDTH),
        height: Math.max(rect.height, MIN_HEIGHT)
      });
    };

    // 초기 크기 설정
    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      renderMindMap();
    }
  }, [data, isDarkMode, dimensions]);

  const renderMindMap = () => {
    if (!svgRef.current || !containerRef.current || !data) {
      console.warn('Required elements not ready:', {
        svg: !!svgRef.current,
        container: !!containerRef.current,
        data: !!data,
        dimensions
      });
      return;
    }

    try {
      const { width, height } = dimensions;
      const centerX = Math.floor(width / 2);
      const centerY = Math.floor(height / 2);
      const radius = Math.floor(Math.min(width, height) / 2.2); // 더 큰 전체 반지름

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // viewBox 설정 전 유효성 검사
      if (!Number.isFinite(width) || !Number.isFinite(height)) {
        console.error('Invalid dimensions:', dimensions);
        return;
      }

      svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
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

      // 레벨별 반지름 조정 - 더 넓은 간격
      const levelRadius: Record<number, number> = {
        0: 0,
        1: radius * 0.45,  // 첫 번째 레벨 노드들을 중심에서 더 멀리
        2: radius * 0.75,  // 두 번째 레벨도 더 멀리
        3: radius * 0.95   // 세 번째 레벨은 거의 최대 반지름까지
      };

      // 레벨별 각도 조정 - 더 넓은 분포
      const levelAngles: Record<number, number> = {
        0: 2 * Math.PI,    // 루트 노드
        1: 2 * Math.PI,    // 첫 번째 레벨은 360도 전체 사용
        2: Math.PI * 0.8,  // 두 번째 레벨은 부모 기준 144도
        3: Math.PI * 0.6   // 세 번째 레벨은 부모 기준 108도
      };

      // 커스텀 레이아웃 설정
      const mindMapLayout = (root: d3.HierarchyNode<HierarchyNode>) => {
        root.descendants().forEach((node, i) => {
          const level = node.depth;
          const r = levelRadius[Math.min(level, 3)] || radius;
          
          if (level === 0) {
            node.x = 0;
            node.y = 0;
          } else if (level === 1) {
            const childCount = node.parent?.children?.length || 1;
            const idx = node.parent?.children?.indexOf(node) || 0;
            // 첫 번째 레벨은 완전한 원형으로 배치
            const angleStep = (2 * Math.PI) / childCount;
            const startAngle = -Math.PI / 2 - (angleStep * (childCount - 1)) / 2;
            node.x = startAngle + angleStep * idx;
            node.y = r;
          } else {
            const parentAngle = node.parent?.x || 0;
            const siblings = node.parent?.children?.length || 1;
            const idx = node.parent?.children?.indexOf(node) || 0;
            const angle = levelAngles[Math.min(level, 3)] || Math.PI;
            
            // 부모 노드 기준으로 부채꼴 형태로 배치
            const angleSpread = angle * 0.8; // 부모 각도의 80%만 사용
            const angleStep = angleSpread / siblings;
            const startAngle = parentAngle - angleSpread / 2;
            node.x = startAngle + angleStep * (idx + 0.5);
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
        const x1 = source.y * Math.sin(source.x);
        const y1 = -source.y * Math.cos(source.x);
        const x2 = target.y * Math.sin(target.x);
        const y2 = -target.y * Math.cos(target.x);
        
        path.moveTo(x1, y1);
        
        // 곡선의 제어점 계산 - 더 부드러운 곡선
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 제어점을 중심쪽으로 더 많이 휘도록 조정
        const curvature = 0.4;
        const controlX = midX + curvature * dist * Math.cos(source.x + Math.PI/2);
        const controlY = midY + curvature * dist * Math.sin(source.x + Math.PI/2);
        
        path.quadraticCurveTo(controlX, controlY, x2, y2);
        
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
          const x = (d.y || 0) * Math.sin(d.x || 0);
          const y = -(d.y || 0) * Math.cos(d.x || 0);
          return `translate(${x},${y})`;
        });

      // 노드 크기 설정
      const getNodeSize = (depth: number) => {
        const sizes: { [key: number]: { width: number; height: number } } & { default: { width: number; height: number } } = {
          0: { width: 160, height: 50 },
          1: { width: 140, height: 45 },
          2: { width: 120, height: 40 },
          default: { width: 100, height: 35 }
        };
        return sizes[depth] || sizes.default;
      };

      // 노드 배경 그리기
      node.append("rect")
        .each(function(d) {
          const size = getNodeSize(d.depth);
          d3.select(this)
            .attr("x", -size.width / 2)
            .attr("y", -size.height / 2)
            .attr("width", size.width)
            .attr("height", size.height)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", () => {
              if (d.depth === 0) return isDarkMode ? "#4c51bf" : "#ebf4ff";
              if (d.depth === 1) return isDarkMode ? "#374151" : "#f3f4f6";
              return isDarkMode ? "#1f2937" : "#ffffff";
            })
            .attr("stroke", () => {
              if (d.depth === 0) return isDarkMode ? "#6366f1" : "#4f46e5";
              if (d.depth === 1) return isDarkMode ? "#4c51bf" : "#6366f1";
              return isDarkMode ? "#374151" : "#e5e7eb";
            })
            .attr("stroke-width", d.depth === 0 ? 2 : 1);
        });

      // 노드 텍스트 그리기
      node.append("text")
        .attr("dy", "0.31em")
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
      className="w-full h-[600px] min-h-[400px] min-w-[400px] relative bg-white dark:bg-gray-900 rounded-lg"
      style={{ height: '600px' }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minWidth: '400px', minHeight: '400px' }}
      />
    </div>
  );
}; 