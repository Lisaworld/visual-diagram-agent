import { OpenAI } from 'openai';
import { DiagramData } from '../types/diagram';
import { iconMapper } from '../components/iconMapper';

export interface MindmapPromptInput {
  user_input: string;
}

export class MindmapPromptTool {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    });
  }

  async execute(input: MindmapPromptInput): Promise<DiagramData> {
    const systemPrompt = `
당신은 마인드맵 생성 전문가입니다. 주어진 주제에 대해 다음 규칙을 따라 마인드맵 구조를 생성해주세요:

1. 중심 키워드(root)를 첫 번째 노드로 설정
2. 4-6개의 주요 가지(branch) 키워드 생성
3. 각 키워드는 10자 이내로 제한
4. 키워드는 명사 또는 명사구 형태로 작성
5. 각 키워드는 중복되지 않아야 함
6. 출력은 반드시 JSON 형식이어야 함

출력 형식:
{
  "nodes": [
    {"id": "root", "text": "중심키워드"},
    {"id": "1", "text": "가지1"},
    ...
  ],
  "edges": [
    {"from": "root", "to": "1"},
    ...
  ]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `주제: ${input.user_input}` }
        ],
        temperature: 0.65,
      });

      const content = response.choices[0].message?.content || '';
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}') + 1;
      const jsonStr = content.slice(jsonStart, jsonEnd);
      
      const baseData = JSON.parse(jsonStr);

      // 노드 위치 계산 및 이모지 매핑
      const centerX = 400;
      const centerY = 300;
      const radius = 200;
      const nodes = baseData.nodes.map((node: any, index: number) => {
        const angle = (index === 0) ? 0 : ((2 * Math.PI * (index - 1)) / (baseData.nodes.length - 1));
        const x = (index === 0) ? centerX : centerX + radius * Math.cos(angle);
        const y = (index === 0) ? centerY : centerY + radius * Math.sin(angle);
        
        // 이모지 매핑
        const { emoji } = iconMapper(node.text);
        const text = emoji ? `${emoji} ${node.text}` : node.text;

        return {
          ...node,
          text,
          x,
          y
        };
      });

      return {
        nodes,
        edges: baseData.edges
      };
    } catch (error: any) {
      console.error('MindmapPromptTool Error:', error);
      throw new Error('마인드맵 생성 중 오류가 발생했습니다.');
    }
  }
} 