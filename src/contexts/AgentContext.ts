import { createContext, useContext } from 'react';
import { AgentContext } from '@google/adk';
import { DiagramVariants, DiagramType } from '../../types/diagram';

export interface DiagramAgentState {
  diagramVariants: DiagramVariants | null;
  selectedTab: DiagramType;
  isProcessing: boolean;
  error: string | null;
}

export interface DiagramAgentContext {
  state: DiagramAgentState;
  actions: {
    processUserInput: (input: string) => Promise<void>;
    updateNodePosition: (id: string, x: number, y: number) => Promise<void>;
    updateNodeText: (id: string, text: string) => Promise<void>;
    setSelectedTab: (tab: DiagramType) => void;
  };
}

export const AgentContextInstance = createContext<DiagramAgentContext | null>(null);

export const useAgentContext = () => {
  const context = useContext(AgentContextInstance);
  if (!context) {
    throw new Error('useAgentContext must be used within an AgentContextProvider');
  }
  return context;
}; 