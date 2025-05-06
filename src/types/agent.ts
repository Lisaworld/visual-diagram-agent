import { DiagramResponse } from '../utils/openai';

export interface AgentMemory {
  conversationHistory: ConversationEntry[];
  diagramHistory: DiagramHistoryEntry[];
  context: AgentContext;
}

export interface ConversationEntry {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface DiagramHistoryEntry {
  input: string;
  output: DiagramResponse;
  timestamp: number;
}

export interface AgentContext {
  currentTask: string | null;
  preferences: {
    diagramStyle: 'simple' | 'detailed';
    language: 'ko' | 'en';
    colorScheme: 'light' | 'dark';
  };
}

export interface AgentTool {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

export interface AgentState {
  memory: AgentMemory;
  tools: AgentTool[];
  isProcessing: boolean;
  error: string | null;
}

export type AgentAction = 
  | { type: 'ADD_CONVERSATION'; payload: ConversationEntry }
  | { type: 'ADD_DIAGRAM'; payload: DiagramHistoryEntry }
  | { type: 'UPDATE_CONTEXT'; payload: Partial<AgentContext> }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }; 