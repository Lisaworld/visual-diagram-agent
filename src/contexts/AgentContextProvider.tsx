'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { DiagramVariants } from '../types/diagram';
import { DiagramAgent } from '../agents/DiagramAgent';
import { AgentState, AgentMemory } from '../types/agent';
import { DiagramExportData } from '../types/export';

interface AgentContextType {
  userInput: string;
  setUserInput: (input: string) => void;
  processUserInput: (input: string) => Promise<void>;
  diagramVariants: DiagramVariants | null;
  selectedTab: 'flowchart' | 'mindmap' | 'tree';
  setSelectedTab: (tab: 'flowchart' | 'mindmap' | 'tree') => void;
  isProcessing: boolean;
  error: string | null;
  agentState: AgentState;
  hasGeneratedDiagrams: boolean;
  updatePreferences: (preferences: Partial<AgentMemory['context']['preferences']>) => Promise<void>;
  importDiagram: (data: DiagramExportData) => void;
  isMindmapDisabled: boolean;
}

const AgentContext = createContext<AgentContextType | null>(null);

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within an AgentContextProvider');
  }
  return context;
};

// 레이아웃 계산 함수
function calculateLayout(data: any, type: 'flowchart' | 'mindmap' | 'tree' = 'flowchart') {
  // 간격 상수 조정
  const NODE_SPACING = {
    flowchart: { x: 350, y: 150 },
    mindmap: { radius: 400, levelMultiplier: 2 },
    tree: { x: 300, y: 150 }
  };

  // 노드 크기 상수
  const NODE_SIZE = {
    flowchart: { width: 170, height: 40 },
    mindmap: { width: 200, height: 40 },
    tree: { width: 180, height: 40 }
  };
  
  // 루트 노드 찾기
  const rootNode = data.nodes.find((node: any) => 
    !data.edges.some((edge: any) => edge.to === node.id)
  );
  
  if (!rootNode) return { nodes: data.nodes, edges: data.edges };

  // 자식 노드 찾기 함수
  const findChildren = (parentId: string) => {
    return data.edges
      .filter((edge: any) => edge.from === parentId)
      .map((edge: any) => data.nodes.find((node: any) => node.id === edge.to))
      .filter(Boolean);
  };

  // 노드의 깊이 계산
  const calculateDepth = (nodeId: string, visited = new Set<string>()): number => {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    
    const children = data.edges
      .filter((edge: any) => edge.from === nodeId)
      .map((edge: any) => edge.to);
    
    if (children.length === 0) return 0;
    
    const childDepths = children.map((childId: string) => 
      calculateDepth(childId, new Set(visited))
    );
    
    return Math.max(...childDepths) + 1;
  };

  // 각 레벨의 노드 수 계산
  const levelCounts = new Map<number, number>();
  const nodeLevels = new Map<string, number>();
  
  const assignLevels = (nodeId: string, level = 0, visited = new Set<string>()) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    nodeLevels.set(nodeId, level);
    levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    
    const children = data.edges
      .filter((edge: any) => edge.from === nodeId)
      .map((edge: any) => edge.to);
    
    children.forEach((childId: string) => assignLevels(childId, level + 1, visited));
  };
  
  assignLevels(rootNode.id);

  // 노드 위치 계산
  const nodes = data.nodes.map((node: any) => {
    const level = nodeLevels.get(node.id) || 0;
    const levelCount = levelCounts.get(level) || 1;
    const levelNodes = Array.from(nodeLevels.entries())
      .filter(([_, l]) => l === level)
      .map(([id]) => id);
    const nodeIndex = levelNodes.indexOf(node.id);
    
    let x, y;
    
    switch (type) {
      case 'mindmap': {
        // 방사형 레이아웃
        if (node.id === rootNode.id) {
          x = NODE_SPACING.mindmap.radius * 2;
          y = NODE_SPACING.mindmap.radius * 2;
        } else {
          const startAngle = -Math.PI / 2;
          const angleStep = (2 * Math.PI) / levelCount;
          const angle = startAngle + angleStep * nodeIndex + (level * Math.PI / 8); // 레벨별 각도 오프셋 추가
          
          const radius = NODE_SPACING.mindmap.radius * Math.pow(NODE_SPACING.mindmap.levelMultiplier, level);
          
          x = NODE_SPACING.mindmap.radius * 2 + radius * Math.cos(angle);
          y = NODE_SPACING.mindmap.radius * 2 + radius * Math.sin(angle);
        }
        break;
      }
      case 'tree': {
        // 수직 트리 레이아웃
        const centerOffset = ((levelCount - 1) * NODE_SPACING.tree.x) / 2;
        x = nodeIndex * NODE_SPACING.tree.x - centerOffset + NODE_SPACING.tree.x * 2;
        y = level * NODE_SPACING.tree.y + NODE_SPACING.tree.y;
        
        // 레벨이 깊어질수록 노드 간격을 좁힘
        if (level > 1) {
          x = x * (1 - level * 0.1); // 10%씩 간격 감소
        }
        break;
      }
      default: {
        // 플로우차트 레이아웃
        x = level * NODE_SPACING.flowchart.x + NODE_SPACING.flowchart.x;
        y = nodeIndex * NODE_SPACING.flowchart.y + NODE_SPACING.flowchart.y;
        
        // 같은 레벨의 노드들을 중앙 정렬
        const centerOffset = ((levelCount - 1) * NODE_SPACING.flowchart.y) / 2;
        y = y - centerOffset;
        break;
      }
    }
    
    return {
      ...node,
      x,
      y
    };
  });

  return {
    nodes,
    edges: data.edges
  };
}

export const AgentContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInput, setUserInput] = useState('');
  const [diagramVariants, setDiagramVariants] = useState<DiagramVariants | null>(null);
  const [selectedTab, setSelectedTab] = useState<'flowchart' | 'mindmap' | 'tree'>('flowchart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGeneratedDiagrams, setHasGeneratedDiagrams] = useState(false);
  const isMindmapDisabled = true;
  
  const agentRef = useRef<DiagramAgent>(new DiagramAgent());
  const [agentState, setAgentState] = useState<AgentState>(agentRef.current.getState());

  useEffect(() => {
    const currentState = agentRef.current.getState();
    setIsProcessing(currentState.isProcessing);
    setError(currentState.error);
    setAgentState(currentState);
  }, [agentRef.current.getState()]);

  const processUserInput = useCallback(async (input: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      console.log('Processing user input:', input);
      
      const response = await agentRef.current.processInput(input);
      console.log('Raw response from agent:', response);
      
      const processedResponse: DiagramVariants = {
        flowchart: calculateLayout(response.flowchart, 'flowchart'),
        mindmap: calculateLayout(response.mindmap, 'mindmap'),
        tree: calculateLayout(response.tree, 'tree')
      };
      
      setDiagramVariants(processedResponse);
      setHasGeneratedDiagrams(true);
      setError(null);
    } catch (err) {
      console.error('Error processing input:', err);
      setError(err instanceof Error ? err.message : '다이어그램 생성 중 오류가 발생했습니다.');
      setDiagramVariants(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const updatePreferences = useCallback(async (preferences: Partial<AgentMemory['context']['preferences']>) => {
    await agentRef.current.updatePreferences(preferences);
    setAgentState(agentRef.current.getState());
  }, []);

  const importDiagram = useCallback((data: DiagramExportData) => {
    setDiagramVariants(data.diagrams);
    setHasGeneratedDiagrams(true);
    if (data.theme) {
      updatePreferences({
        diagramStyle: data.theme.name === 'default' ? 'simple' : 'detailed'
      });
    }
  }, [updatePreferences]);

  const value = {
    userInput,
    setUserInput,
    processUserInput,
    diagramVariants,
    selectedTab,
    setSelectedTab,
    isProcessing,
    error,
    agentState,
    hasGeneratedDiagrams,
    updatePreferences,
    importDiagram,
    isMindmapDisabled
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}; 