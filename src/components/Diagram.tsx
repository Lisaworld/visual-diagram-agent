import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
  Panel,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import { useAgentContext } from '../contexts/AgentContextProvider';
import { useStyleContext } from '../contexts/StyleContextProvider';
import CustomNode from './CustomNode';
import { getMindmapLayout, getTreeLayout, getFlowchartLayout } from './nodeLayouts';
import 'reactflow/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
};

const DiagramContent = () => {
  const { diagramVariants, selectedTab } = useAgentContext();
  const { state: { currentTheme } } = useStyleContext();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const isDarkMode = currentTheme.name === 'dark';

  useEffect(() => {
    if (!diagramVariants || !diagramVariants[selectedTab]) return;

    const currentDiagram = diagramVariants[selectedTab];
    
    // 노드 변환
    const initialNodes: Node[] = currentDiagram.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      data: { label: node.text },
      position: { x: 0, y: 0 },
    }));

    // 엣지 변환
    const initialEdges: Edge[] = currentDiagram.edges.map((edge) => ({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: isDarkMode ? '#888' : '#64748b',
      },
    }));

    // 레이아웃 계산
    let layoutedElements;
    switch (selectedTab) {
      case 'mindmap':
        layoutedElements = getMindmapLayout(initialNodes, initialEdges);
        break;
      case 'tree':
        layoutedElements = getTreeLayout(initialNodes, initialEdges);
        break;
      default:
        layoutedElements = getFlowchartLayout(initialNodes, initialEdges);
    }

    setNodes(layoutedElements.nodes);
    setEdges(layoutedElements.edges);

    // 노드가 설정된 후 전체 뷰에 맞추기
    setTimeout(() => {
      fitView({ padding: 0.5, duration: 200 });
    }, 0);
  }, [diagramVariants, selectedTab, setNodes, setEdges, fitView, isDarkMode]);

  const onLayout = useCallback(() => {
    let layoutedElements;
    switch (selectedTab) {
      case 'mindmap':
        layoutedElements = getMindmapLayout(nodes, edges);
        break;
      case 'tree':
        layoutedElements = getTreeLayout(nodes, edges);
        break;
      default:
        layoutedElements = getFlowchartLayout(nodes, edges);
    }

    setNodes([...layoutedElements.nodes]);
    setEdges([...layoutedElements.edges]);
    
    setTimeout(() => {
      fitView({ padding: 0.5, duration: 200 });
    }, 0);
  }, [nodes, edges, selectedTab, setNodes, setEdges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.5 }}
      minZoom={0.1}
      maxZoom={4}
      connectionMode={ConnectionMode.Loose}
      className={isDarkMode ? 'dark' : ''}
    >
      <Controls className="dark:bg-gray-800 dark:border-gray-700" />
      <MiniMap 
        nodeColor={(node) => {
          return node.type === 'custom' ? '#ffffff' : '#eee';
        }}
        nodeStrokeWidth={3}
        nodeStrokeColor={isDarkMode ? '#666' : '#999'}
        style={{
          backgroundColor: isDarkMode ? '#1e1e1e' : '#f8f9fa',
          borderRadius: '0.5rem',
          border: `1px solid ${isDarkMode ? '#404040' : '#e2e8f0'}`,
        }}
        maskColor={isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
        zoomable 
        pannable 
      />
      <Background 
        variant={BackgroundVariant.Dots} 
        gap={12} 
        size={1}
        color={isDarkMode ? '#333' : '#e2e8f0'}
      />
      <Panel position="top-right">
        <button
          onClick={onLayout}
          className={`px-4 py-2 text-sm rounded transition-colors ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          레이아웃 재정렬
        </button>
      </Panel>
    </ReactFlow>
  );
};

const Diagram = () => {
  return (
    <div className="w-full h-[600px]">
      <ReactFlowProvider>
        <DiagramContent />
      </ReactFlowProvider>
    </div>
  );
};

export default Diagram; 