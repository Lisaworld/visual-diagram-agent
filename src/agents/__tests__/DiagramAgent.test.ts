import { DiagramAgent } from '../DiagramAgent';
import { generateDiagrams } from '../../utils/openai';

// Mock OpenAI API
jest.mock('../../utils/openai', () => ({
  generateDiagrams: jest.fn()
}));

const mockDiagramResponse = {
  flowchart: {
    nodes: [
      { id: '1', text: 'Start' },
      { id: '2', text: 'Process' }
    ],
    edges: [{ from: '1', to: '2' }]
  },
  mindmap: {
    nodes: [
      { id: '1', text: 'Center' },
      { id: '2', text: 'Branch' }
    ],
    edges: [{ from: '1', to: '2' }]
  },
  tree: {
    nodes: [
      { id: '1', text: 'Root' },
      { id: '2', text: 'Child' }
    ],
    edges: [{ from: '1', to: '2' }]
  }
};

describe('DiagramAgent', () => {
  let agent: DiagramAgent;

  beforeEach(() => {
    agent = new DiagramAgent();
    (generateDiagrams as jest.Mock).mockClear();
  });

  it('initializes with default state', () => {
    const state = agent.getState();
    expect(state.memory.conversationHistory).toEqual([]);
    expect(state.memory.diagramHistory).toEqual([]);
    expect(state.isProcessing).toBe(false);
    expect(state.error).toBeNull();
  });

  it('processes input and updates state', async () => {
    (generateDiagrams as jest.Mock).mockResolvedValueOnce(mockDiagramResponse);

    await agent.processInput('test input');
    const state = agent.getState();

    // 대화 기록 확인
    expect(state.memory.conversationHistory).toHaveLength(1);
    expect(state.memory.conversationHistory[0].content).toBe('test input');
    expect(state.memory.conversationHistory[0].role).toBe('user');

    // 다이어그램 기록 확인
    expect(state.memory.diagramHistory).toHaveLength(1);
    expect(state.memory.diagramHistory[0].input).toBe('test input');
    expect(state.memory.diagramHistory[0].output).toEqual(mockDiagramResponse);

    // 상태 확인
    expect(state.isProcessing).toBe(false);
    expect(state.error).toBeNull();
  });

  it('handles errors during processing', async () => {
    const errorMessage = '다이어그램 생성 중 오류가 발생했습니다.';
    (generateDiagrams as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await expect(agent.processInput('test input')).rejects.toThrow(errorMessage);
    const state = agent.getState();

    // 대화 기록은 추가되어야 함
    expect(state.memory.conversationHistory).toHaveLength(1);
    
    // 에러 상태 확인
    expect(state.error).toBe(errorMessage);
    expect(state.isProcessing).toBe(false);
  });

  it('updates preferences', async () => {
    const newPreferences = {
      diagramStyle: 'detailed' as const,
      language: 'en' as const
    };

    await agent.updatePreferences(newPreferences);
    const state = agent.getState();

    expect(state.memory.context.preferences).toEqual({
      ...state.memory.context.preferences,
      ...newPreferences
    });
  });

  it('maintains conversation history', async () => {
    (generateDiagrams as jest.Mock).mockResolvedValue(mockDiagramResponse);

    await agent.processInput('first input');
    await agent.processInput('second input');

    const state = agent.getState();
    expect(state.memory.conversationHistory).toHaveLength(2);
    expect(state.memory.conversationHistory[0].content).toBe('first input');
    expect(state.memory.conversationHistory[1].content).toBe('second input');
  });
}); 