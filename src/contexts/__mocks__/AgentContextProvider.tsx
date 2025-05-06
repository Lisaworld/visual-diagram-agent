import { jest } from '@jest/globals';
import React, { createContext, useContext } from 'react';
import { AgentContextType } from '../AgentContextProvider';

// Mock 함수들을 외부로 export
export const mockSetUserInput = jest.fn((input: string) => {});
export const mockProcessUserInput = jest.fn(async (input: string) => {});
export const mockSetSelectedTab = jest.fn((tab: 'flowchart' | 'mindmap' | 'tree') => {});

// 기본 Context 값 설정
const defaultContextValue: AgentContextType = {
  userInput: '',
  setUserInput: mockSetUserInput,
  processUserInput: mockProcessUserInput,
  setSelectedTab: mockSetSelectedTab,
  selectedTab: 'flowchart',
  isProcessing: false,
  error: null,
  diagramVariants: null
};

const MockAgentContext = createContext<AgentContextType>(defaultContextValue);

// Provider 컴포넌트 단순화
export const AgentContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockAgentContext.Provider value={defaultContextValue}>
      {children}
    </MockAgentContext.Provider>
  );
};

export const useAgentContext = () => {
  const context = useContext(MockAgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within an AgentContextProvider');
  }
  return context;
}; 