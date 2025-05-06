import { DiagramData, DiagramVariants } from '../types/diagram';

interface Position {
  x: number;
  y: number;
}

// 기본 레이아웃 설정
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const NODE_SPACING = 150;
const VERTICAL_SPACING = 100;

/**
 * 플로우차트 데이터 생성
 * 입력 텍스트를 기반으로 순차적인 프로세스를 표현
 */
export const generateFlowchartData = (input: string): DiagramData => {
  // Mock: 입력 텍스트를 줄바꿈으로 분리하여 각각을 노드로 변환
  const steps = input.split('\n').filter(step => step.trim());
  
  const nodes = steps.map((step, index) => ({
    id: `node-${index + 1}`,
    text: step.trim(),
    x: 100 + (index * NODE_SPACING),
    y: CANVAS_HEIGHT / 2
  }));

  const edges = nodes.slice(0, -1).map((_, index) => ({
    from: `node-${index + 1}`,
    to: `node-${index + 2}`
  }));

  return { nodes, edges };
};

/**
 * 마인드맵 데이터 생성
 * 중앙 노드를 기준으로 방사형 구조 생성
 */
export const generateMindmapData = (input: string): DiagramData => {
  // Mock: 첫 줄을 중앙 노드로, 나머지를 브랜치로 처리
  const lines = input.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { nodes: [], edges: [] };

  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;

  const nodes = lines.map((line, index) => {
    if (index === 0) {
      return {
        id: 'center',
        text: line.trim(),
        x: centerX,
        y: centerY
      };
    }

    const angle = ((2 * Math.PI) / (lines.length - 1)) * (index - 1);
    return {
      id: `branch-${index}`,
      text: line.trim(),
      x: centerX + Math.cos(angle) * NODE_SPACING,
      y: centerY + Math.sin(angle) * NODE_SPACING
    };
  });

  const edges = nodes.slice(1).map(node => ({
    from: 'center',
    to: node.id
  }));

  return { nodes, edges };
};

/**
 * 트리 데이터 생성
 * 계층적 구조를 표현
 */
export const generateTreeData = (input: string): DiagramData => {
  // Mock: 들여쓰기 수준에 따라 계층 구조 생성
  const lines = input.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { nodes: [], edges: [] };

  const nodes = lines.map((line, index) => {
    const level = line.search(/\S/) / 2; // 들여쓰기 수준 (2칸 기준)
    const x = CANVAS_WIDTH / 2 + (level - 1) * NODE_SPACING;
    const y = 100 + index * VERTICAL_SPACING;

    return {
      id: `node-${index}`,
      text: line.trim(),
      x,
      y
    };
  });

  // 부모-자식 관계 생성
  const edges: { from: string; to: string; }[] = [];
  const stack: number[] = [];

  lines.forEach((line, index) => {
    const level = line.search(/\S/) / 2;
    
    while (stack.length > level) {
      stack.pop();
    }
    
    if (stack.length > 0) {
      edges.push({
        from: `node-${stack[stack.length - 1]}`,
        to: `node-${index}`
      });
    }
    
    stack.push(index);
  });

  return { nodes, edges };
};

/**
 * 입력 텍스트를 기반으로 세 가지 도식 데이터 생성
 */
export const generateDiagramVariants = (input: string): DiagramVariants => {
  return {
    flowchart: generateFlowchartData(input),
    mindmap: generateMindmapData(input),
    tree: generateTreeData(input)
  };
}; 