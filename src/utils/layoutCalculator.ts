import { DiagramData, DiagramType } from '../types/diagram';

// 레이아웃 상수
const CONSTANTS = {
  NODE_SPACING: {
    flowchart: { x: 200, y: 150 },
    mindmap: { x: 250, y: 100 },
    tree: { x: 200, y: 150 }
  },
  INITIAL_POSITION: {
    flowchart: { x: 100, y: 100 },
    mindmap: { x: 400, y: 200 },
    tree: { x: 400, y: 100 }
  }
};

const CANVAS_PADDING = 50;
const NODE_SPACING = 200;
const LEVEL_HEIGHT = 150;
const CENTER_X = 400;
const CENTER_Y = 300;

export function calculateLayout(data: DiagramData, type: DiagramType): DiagramData {
  const { nodes, edges } = data;
  
  switch (type) {
    case 'flowchart':
      return calculateFlowchartLayout(data);
    case 'mindmap':
      return calculateMindmapLayout(data);
    case 'tree':
      return calculateTreeLayout(data);
    default:
      return data;
  }
}

export function calculateFlowchartLayout(data: DiagramData): DiagramData {
  const nodes = [...data.nodes];
  const edges = [...data.edges];
  
  // 노드들의 레벨(깊이) 계산
  const levels = new Map<string, number>();
  const startNodes = nodes.filter(node => 
    !edges.some(edge => edge.to === node.id)
  );
  
  function calculateLevels(nodeId: string, level: number) {
    levels.set(nodeId, level);
    const childEdges = edges.filter(edge => edge.from === nodeId);
    childEdges.forEach(edge => {
      if (!levels.has(edge.to) || levels.get(edge.to)! < level + 1) {
        calculateLevels(edge.to, level + 1);
      }
    });
  }
  
  startNodes.forEach(node => calculateLevels(node.id, 0));
  
  // 각 레벨별 노드 수 계산
  const nodesPerLevel = new Map<number, number>();
  levels.forEach((level, nodeId) => {
    nodesPerLevel.set(level, (nodesPerLevel.get(level) || 0) + 1);
  });
  
  // 노드 위치 계산
  return {
    nodes: nodes.map(node => {
      const level = levels.get(node.id) || 0;
      const nodesInLevel = nodesPerLevel.get(level) || 1;
      const nodeIndex = nodes.filter(n => levels.get(n.id) === level)
        .findIndex(n => n.id === node.id);
      
      return {
        ...node,
        x: CANVAS_PADDING + level * NODE_SPACING,
        y: CANVAS_PADDING + (nodeIndex * LEVEL_HEIGHT) + 
           (LEVEL_HEIGHT * (4 - nodesInLevel) / 2)
      };
    }),
    edges
  };
}

export function calculateMindmapLayout(data: DiagramData): DiagramData {
  const nodes = [...data.nodes];
  const edges = [...data.edges];
  
  // 중심 노드 찾기
  const rootNode = nodes.find(node => 
    !edges.some(edge => edge.to === node.id)
  );
  
  if (!rootNode) return data;
  
  // 각 노드의 자식 수 계산
  const childCount = new Map<string, number>();
  nodes.forEach(node => {
    const children = edges.filter(edge => edge.from === node.id);
    childCount.set(node.id, children.length);
  });
  
  // 방사형 레이아웃 계산
  function calculateRadialPosition(nodeId: string, angle: number, radius: number, angleSpan: number) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const children = edges.filter(edge => edge.from === nodeId)
      .map(edge => edge.to);
    
    node.x = CENTER_X + Math.cos(angle) * radius;
    node.y = CENTER_Y + Math.sin(angle) * radius;
    
    if (children.length > 0) {
      const childAngleStep = angleSpan / children.length;
      children.forEach((childId, index) => {
        const childAngle = angle - (angleSpan / 2) + (childAngleStep * (index + 0.5));
        calculateRadialPosition(childId, childAngle, radius + NODE_SPACING, childAngleStep);
      });
    }
  }
  
  calculateRadialPosition(rootNode.id, Math.PI / 2, 0, Math.PI * 2);
  
  return { nodes, edges };
}

export function calculateTreeLayout(data: DiagramData): DiagramData {
  const nodes = [...data.nodes];
  const edges = [...data.edges];
  
  // 루트 노드 찾기
  const rootNode = nodes.find(node => 
    !edges.some(edge => edge.to === node.id)
  );
  
  if (!rootNode) return data;
  
  // 트리 깊이와 각 레벨의 너비 계산
  const levels = new Map<string, number>();
  const nodesAtLevel = new Map<number, string[]>();
  
  function calculateDepth(nodeId: string, level: number) {
    levels.set(nodeId, level);
    nodesAtLevel.set(level, [...(nodesAtLevel.get(level) || []), nodeId]);
    
    const children = edges.filter(edge => edge.from === nodeId)
      .map(edge => edge.to);
    
    children.forEach(childId => calculateDepth(childId, level + 1));
  }
  
  calculateDepth(rootNode.id, 0);
  
  // 노드 위치 계산
  const maxLevel = Math.max(...Array.from(levels.values()));
  
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    const nodesInLevel = nodesAtLevel.get(level) || [];
    const nodeIndex = nodesInLevel.indexOf(node.id);
    const levelWidth = nodesInLevel.length;
    
    node.x = CANVAS_PADDING + (level * NODE_SPACING);
    node.y = CANVAS_PADDING + (nodeIndex * LEVEL_HEIGHT) + 
             (LEVEL_HEIGHT * (4 - levelWidth) / 2);
  });
  
  return { nodes, edges };
} 