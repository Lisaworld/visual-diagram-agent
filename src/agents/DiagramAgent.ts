import { generateDiagrams } from '../utils/openai';
import { AgentState, AgentAction, AgentTool, AgentMemory } from '../types/agent';
import { DiagramVariants } from '../types/diagram';

const DEFAULT_MEMORY: AgentMemory = {
  conversationHistory: [],
  diagramHistory: [],
  context: {
    currentTask: null,
    preferences: {
      diagramStyle: 'simple',
      language: 'ko',
      colorScheme: 'light'
    }
  }
};

export class DiagramAgent {
  private state: AgentState;
  private tools: Map<string, AgentTool>;

  constructor() {
    this.state = {
      memory: DEFAULT_MEMORY,
      tools: [],
      isProcessing: false,
      error: null
    };
    this.tools = new Map();
    this.initializeTools();
  }

  private initializeTools() {
    this.registerTool({
      name: 'generateDiagram',
      description: '자연어 입력을 기반으로 다이어그램 생성',
      execute: async (input: string) => {
        try {
          // 입력 전처리
          const processedInput = this.preprocessInput(input);
          
          // 다이어그램 생성
          const diagrams = await generateDiagrams(processedInput);
          
          // 결과 검증
          this.validateDiagrams(diagrams);
          
          return diagrams;
        } catch (error) {
          console.error('Diagram generation error:', error);
          throw new Error(
            error instanceof Error 
              ? `다이어그램 생성 중 오류가 발생했습니다: ${error.message}`
              : '다이어그램 생성 중 알 수 없는 오류가 발생했습니다.'
          );
        }
      }
    });

    this.registerTool({
      name: 'updateContext',
      description: '에이전트 컨텍스트 업데이트',
      execute: async (context: Partial<AgentMemory['context']>) => {
        this.dispatch({
          type: 'UPDATE_CONTEXT',
          payload: context
        });
        return this.state.memory.context;
      }
    });
  }

  private preprocessInput(input: string): string {
    // 입력 텍스트 전처리
    return input.trim();
  }

  private validateDiagrams(diagrams: DiagramVariants) {
    // 다이어그램 데이터 유효성 검사
    const types = ['flowchart', 'mindmap', 'tree'] as const;
    
    for (const type of types) {
      const diagram = diagrams[type];
      if (!diagram?.nodes?.length) {
        throw new Error(`${type} 다이어그램의 노드가 없습니다.`);
      }
      if (!diagram?.edges?.length && diagram.nodes.length > 1) {
        throw new Error(`${type} 다이어그램의 엣지가 없습니다.`);
      }
    }
  }

  private registerTool(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  private dispatch(action: AgentAction) {
    switch (action.type) {
      case 'ADD_CONVERSATION':
        this.state.memory.conversationHistory.push(action.payload);
        break;
      case 'ADD_DIAGRAM':
        this.state.memory.diagramHistory.push(action.payload);
        break;
      case 'UPDATE_CONTEXT':
        this.state.memory.context = {
          ...this.state.memory.context,
          ...action.payload
        };
        break;
      case 'SET_PROCESSING':
        this.state.isProcessing = action.payload;
        break;
      case 'SET_ERROR':
        this.state.error = action.payload;
        break;
    }
  }

  public async processInput(input: string) {
    if (!input.trim()) {
      throw new Error('입력 텍스트가 비어있습니다.');
    }

    this.dispatch({ type: 'SET_PROCESSING', payload: true });
    this.dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // 대화 기록 추가
      this.dispatch({
        type: 'ADD_CONVERSATION',
        payload: {
          role: 'user',
          content: input,
          timestamp: Date.now()
        }
      });

      // 다이어그램 생성
      const generateTool = this.tools.get('generateDiagram');
      if (!generateTool) {
        throw new Error('다이어그램 생성 도구를 찾을 수 없습니다.');
      }

      const result = await generateTool.execute(input);

      // 다이어그램 기록 추가
      this.dispatch({
        type: 'ADD_DIAGRAM',
        payload: {
          input,
          output: result,
          timestamp: Date.now()
        }
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      this.dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      this.dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }

  public getState(): AgentState {
    return this.state;
  }

  public async updatePreferences(preferences: Partial<AgentMemory['context']['preferences']>) {
    const updateTool = this.tools.get('updateContext');
    if (!updateTool) {
      throw new Error('컨텍스트 업데이트 도구를 찾을 수 없습니다.');
    }

    await updateTool.execute({
      preferences: {
        ...this.state.memory.context.preferences,
        ...preferences
      }
    });
  }
} 