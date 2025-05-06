import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ReactFlowProvider
} from 'reactflow';
import dagre from 'dagre';
import { DiagramData } from '../types/diagram';
import { useStyleContext } from '../contexts/StyleContextProvider';
import 'reactflow/dist/style.css';

interface DiagramViewProps {
  data: DiagramData;
}

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB' });

  // 노드 크기 설정
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 40 });
  });

  // 엣지 설정
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 레이아웃 실행
  dagre.layout(dagreGraph);

  // 노드 위치 업데이트
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 75, // width/2
        y: nodeWithPosition.y - 20, // height/2
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const convertToReactFlowData = (data: DiagramData) => {
  const nodes: Node[] = data.nodes.map(node => ({
    id: node.id,
    data: { label: node.text },
    position: { x: node.x || 0, y: node.y || 0 },
    type: 'default'
  }));

  const edges: Edge[] = data.edges.map(edge => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    type: 'smoothstep',
    animated: true
  }));

  return getLayoutedElements(nodes, edges);
};

const DiagramContent: React.FC<DiagramViewProps> = ({ data }) => {
  const { state: { isDarkMode } } = useStyleContext();
  const { nodes, edges } = convertToReactFlowData(data);

  return (
    <div className="w-full h-[600px] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        className={isDarkMode ? 'dark' : ''}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color={isDarkMode ? '#444' : '#aaa'} gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

const DiagramView: React.FC<DiagramViewProps> = (props) => {
  return (
    <ReactFlowProvider>
      <DiagramContent {...props} />
    </ReactFlowProvider>
  );
};

export default DiagramView; 