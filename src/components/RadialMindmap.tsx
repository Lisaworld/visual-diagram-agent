import React, { useEffect, useRef } from 'react';

interface RadialMindmapProps {
  data: {
    text: string;
    children?: Array<{ text: string }>;
  };
  width: number;
  height: number;
}

export const RadialMindmap: React.FC<RadialMindmapProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear existing content
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // Create central node group
    const centralGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Central circle
    const centralCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centralCircle.setAttribute('cx', centerX.toString());
    centralCircle.setAttribute('cy', centerY.toString());
    centralCircle.setAttribute('r', '30');
    centralCircle.setAttribute('fill', '#4a5568');
    centralCircle.setAttribute('stroke', '#2d3748');
    centralCircle.setAttribute('stroke-width', '2');

    // Central text
    const centralText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centralText.textContent = data.text;
    centralText.setAttribute('x', centerX.toString());
    centralText.setAttribute('y', centerY.toString());
    centralText.setAttribute('text-anchor', 'middle');
    centralText.setAttribute('dominant-baseline', 'middle');
    centralText.setAttribute('fill', '#ffffff');
    centralText.setAttribute('font-size', '14');

    centralGroup.appendChild(centralCircle);
    centralGroup.appendChild(centralText);
    svgRef.current.appendChild(centralGroup);

    // Add child nodes
    if (data.children && data.children.length > 0) {
      const angleStep = (2 * Math.PI) / data.children.length;
      const radius = 150;

      data.children.forEach((child, index) => {
        const angle = index * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Create connection line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX.toString());
        line.setAttribute('y1', centerY.toString());
        line.setAttribute('x2', x.toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('stroke', '#718096');
        line.setAttribute('stroke-width', '2');
        svgRef.current?.appendChild(line);

        // Create child node group
        const childGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Child circle
        const childCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        childCircle.setAttribute('cx', x.toString());
        childCircle.setAttribute('cy', y.toString());
        childCircle.setAttribute('r', '25');
        childCircle.setAttribute('fill', '#718096');
        childCircle.setAttribute('stroke', '#4a5568');
        childCircle.setAttribute('stroke-width', '2');

        // Child text
        const childText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        childText.textContent = child.text;
        childText.setAttribute('x', x.toString());
        childText.setAttribute('y', y.toString());
        childText.setAttribute('text-anchor', 'middle');
        childText.setAttribute('dominant-baseline', 'middle');
        childText.setAttribute('fill', '#ffffff');
        childText.setAttribute('font-size', '12');

        childGroup.appendChild(childCircle);
        childGroup.appendChild(childText);
        svgRef.current?.appendChild(childGroup);
      });
    }
  }, [data, width, height]);

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