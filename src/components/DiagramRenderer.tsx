'use client';

import React, { useEffect, useRef } from 'react';
import { DiagramData } from '../types/diagram';
import { DiagramTheme } from '../types/style';

interface DiagramRendererProps {
  data: DiagramData;
  theme: DiagramTheme;
  width?: number;
  height?: number;
  editingNode?: string | null;
  onNodeClick?: (nodeId: string) => void;
  onTextChange?: (nodeId: string, newText: string) => void;
  onNodeDrag?: (nodeId: string, x: number, y: number) => void;
  onEditComplete?: () => void;
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  data,
  theme,
  width = 800,
  height = 600,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes || !data.edges) return;

    // Clear existing content
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }

    // Create edges group
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Draw edges
    data.edges.forEach(edge => {
      const fromNode = data.nodes.find(n => n.id === edge.from);
      const toNode = data.nodes.find(n => n.id === edge.to);
      
      if (fromNode?.x != null && fromNode?.y != null && 
          toNode?.x != null && toNode?.y != null) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromNode.x.toString());
        line.setAttribute('y1', fromNode.y.toString());
        line.setAttribute('x2', toNode.x.toString());
        line.setAttribute('y2', toNode.y.toString());
        line.setAttribute('stroke', theme.edgeStyle.stroke);
        line.setAttribute('stroke-width', theme.edgeStyle.strokeWidth.toString());
        edgesGroup.appendChild(line);
      }
    });

    svgRef.current.appendChild(edgesGroup);

    // Create nodes group
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Draw nodes
    data.nodes.forEach(node => {
      if (node.x == null || node.y == null) return;

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${node.x},${node.y})`);
      
      if (onNodeClick) {
        group.addEventListener('click', () => onNodeClick(node.id));
      }

      // Create circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '30');
      circle.setAttribute('fill', theme.nodeStyle.fill);
      circle.setAttribute('stroke', theme.nodeStyle.stroke);
      circle.setAttribute('stroke-width', theme.nodeStyle.strokeWidth.toString());

      // Create text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.textContent = node.text;
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-family', theme.nodeStyle.fontFamily);
      text.setAttribute('font-size', theme.nodeStyle.fontSize.toString());
      text.setAttribute('fill', theme.nodeStyle.fill === '#ffffff' ? '#000000' : '#ffffff');

      group.appendChild(circle);
      group.appendChild(text);
      nodesGroup.appendChild(group);
    });

    svgRef.current.appendChild(nodesGroup);
  }, [data, theme, onNodeClick]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
    />
  );
};

DiagramRenderer.displayName = 'DiagramRenderer';

export default DiagramRenderer; 