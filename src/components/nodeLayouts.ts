import dagre from 'dagre';
import { Node, Edge } from 'reactflow';

const MINDMAP_NODE_WIDTH = 200;
const MINDMAP_NODE_HEIGHT = 40;
const TREE_NODE_WIDTH = 180;
const TREE_NODE_HEIGHT = 36;
const FLOWCHART_NODE_WIDTH = 170;
const FLOWCHART_NODE_HEIGHT = 36;

interface LayoutOptions {
  direction?: 'TB' | 'LR';
  nodeSpacing?: number;
  rankSpacing?: number;
}

// 마인드맵 레이아웃 (중앙 기준 좌우 분할)
export const getMindmapLayout = (nodes: Node[], edges: Edge[], options: LayoutOptions = {}) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: 'LR',
    nodesep: options.nodeSpacing || 100,
    ranksep: options.rankSpacing || 150,
  });

  // 루트 노드 찾기 (들어오는 엣지가 없는 노드)
  const rootNode = nodes.find(node => 
    !edges.some(edge => edge.target === node.id)
  );

  if (!rootNode) return { nodes, edges };

  // 노드를 좌우로 분할
  const { leftNodes, rightNodes } = edges.reduce((acc, edge) => {
    if (edge.source === rootNode.id) {
      const targetNode = nodes.find(n => n.id === edge.target);
      if (targetNode) {
        const isLeft = acc.leftCount <= acc.rightCount;
        if (isLeft) {
          acc.leftNodes.push(targetNode);
          acc.leftCount++;
        } else {
          acc.rightNodes.push(targetNode);
          acc.rightCount++;
        }
      }
    }
    return acc;
  }, { leftNodes: [], rightNodes: [], leftCount: 0, rightCount: 0 });

  // 노드 위치 설정
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { 
      width: MINDMAP_NODE_WIDTH,
      height: MINDMAP_NODE_HEIGHT
    });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // 노드 위치 업데이트
  return {
    nodes: nodes.map(node => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const isRoot = node.id === rootNode.id;
      const isLeft = leftNodes.some(n => n.id === node.id);
      
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - MINDMAP_NODE_WIDTH / 2,
          y: nodeWithPosition.y - MINDMAP_NODE_HEIGHT / 2
        },
        data: {
          ...node.data,
          isRoot,
          isLeft
        }
      };
    }),
    edges
  };
};

// 트리 레이아웃 (계층적 구조)
export const getTreeLayout = (nodes: Node[], edges: Edge[], options: LayoutOptions = {}) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: 'TB',
    nodesep: options.nodeSpacing || 50,
    ranksep: options.rankSpacing || 80,
  });

  // 노드 깊이 계산
  const getNodeDepth = (nodeId: string, visited = new Set<string>()): number => {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);

    const parentEdges = edges.filter(e => e.target === nodeId);
    if (parentEdges.length === 0) return 0;

    return 1 + Math.max(...parentEdges.map(e => getNodeDepth(e.source, visited)));
  };

  // 노드별 깊이 계산 및 설정
  const nodeDepths = nodes.reduce((acc, node) => {
    acc[node.id] = getNodeDepth(node.id);
    return acc;
  }, {} as Record<string, number>);

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { 
      width: TREE_NODE_WIDTH,
      height: TREE_NODE_HEIGHT
    });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map(node => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const depth = nodeDepths[node.id];
      
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - TREE_NODE_WIDTH / 2,
          y: nodeWithPosition.y - TREE_NODE_HEIGHT / 2
        },
        data: {
          ...node.data,
          depth
        }
      };
    }),
    edges
  };
};

// 플로우차트 레이아웃
export const getFlowchartLayout = (nodes: Node[], edges: Edge[], options: LayoutOptions = {}) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: options.direction || 'TB',
    nodesep: options.nodeSpacing || 50,
    ranksep: options.rankSpacing || 70,
  });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { 
      width: FLOWCHART_NODE_WIDTH,
      height: FLOWCHART_NODE_HEIGHT
    });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map(node => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - FLOWCHART_NODE_WIDTH / 2,
          y: nodeWithPosition.y - FLOWCHART_NODE_HEIGHT / 2
        }
      };
    }),
    edges
  };
}; 