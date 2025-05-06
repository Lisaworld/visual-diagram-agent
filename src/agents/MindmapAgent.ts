import { DiagramData } from '../types/diagram';
import { MindmapPromptTool, MindmapPromptInput } from '../tools/mindmap-prompt';

export class MindmapAgent {
  private mindmapTool: MindmapPromptTool;

  constructor() {
    this.mindmapTool = new MindmapPromptTool();
  }

  async generateMindmap(input: string): Promise<DiagramData> {
    try {
      // GPT를 통한 마인드맵 구조 생성
      const promptInput: MindmapPromptInput = { user_input: input };
      const mindmapData = await this.mindmapTool.execute(promptInput);

      // 레이아웃 최적화 및 반환
      return this.optimizeLayout(mindmapData);
    } catch (error: any) {
      console.error('MindmapAgent Error:', error);
      throw new Error('마인드맵 생성 중 오류가 발생했습니다.');
    }
  }

  private optimizeLayout(data: DiagramData): DiagramData {
    // 이미 mindmap-prompt.ts에서 기본 레이아웃을 설정했으므로
    // 추가적인 최적화가 필요한 경우에만 여기서 처리
    return data;
  }
} 