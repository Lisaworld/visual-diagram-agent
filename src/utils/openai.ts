import OpenAI from 'openai';
import { DiagramVariants } from '../types/diagram';
import { calculateLayout as calculateDiagramLayout } from './layoutCalculator';

// OpenAI 클라이언트 초기화를 함수로 분리
const createOpenAIClient = () => {
  // API 키가 없는 경우 경고
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY is not set. Using mock data instead.');
    return null;
  }

  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });
};

// 도식 생성을 위한 시스템 프롬프트
const SYSTEM_PROMPT = `당신은 자연어 설명을 도식화하는 전문가입니다.
주어진 설명을 분석하여 다음 세 가지 형태의 도식 데이터를 생성해야 합니다.
각 도식은 입력된 내용을 해당 도식의 특성에 맞게 다르게 표현해야 합니다.

중요한 규칙:
1. 각 노드의 텍스트는 최대 15단어로 제한하며, 핵심 키워드만 포함해야 합니다.
2. 불필요한 조사나 부가 설명은 제외합니다.
3. 전체 구조를 파악하는 데 중요한 내용만 선별합니다.

도식 유형별 특성:
1. 흐름도 (Flowchart):
   - 프로세스의 순차적인 단계를 표현
   - 시작과 종료 지점이 명확해야 함
   - 각 단계는 동작이나 의사결정을 나타냄
   - 화살표는 프로세스의 흐름을 나타냄

2. 마인드맵 (Mindmap):
   - 중심 주제에서 시작하여 관련 개념이 방사형으로 확장
   - 계층적이지만 자유로운 구조
   - 주제 간의 관계와 연관성을 표현
   - 각 가지는 하위 개념이나 세부 사항을 포함

3. 계층도 (Tree):
   - 명확한 상하위 관계를 표현
   - 최상위 노드에서 시작하여 아래로 확장
   - 각 레벨은 분류나 구조를 나타냄
   - 같은 레벨의 노드들은 동일한 속성이나 특성을 공유

출력 형식은 다음과 같은 JSON 구조여야 합니다:
{
  "flowchart": {
    "nodes": [{ "id": string, "text": string }],
    "edges": [{ "from": string, "to": string }]
  },
  "mindmap": {
    "nodes": [{ "id": string, "text": string }],
    "edges": [{ "from": string, "to": string }]
  },
  "tree": {
    "nodes": [{ "id": string, "text": string }],
    "edges": [{ "from": string, "to": string }]
  }
}`;

export interface DiagramResponse {
  flowchart: {
    nodes: Array<{ id: string; text: string; }>;
    edges: Array<{ from: string; to: string; }>;
  };
  mindmap: {
    nodes: Array<{ id: string; text: string; }>;
    edges: Array<{ from: string; to: string; }>;
  };
  tree: {
    nodes: Array<{ id: string; text: string; }>;
    edges: Array<{ from: string; to: string; }>;
  };
}

export async function generateDiagrams(input: string): Promise<DiagramVariants> {
  try {
    const response = await fetch('/api/generate-diagrams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '다이어그램 생성 중 오류가 발생했습니다.');
    }

    const result = await response.json();
    return result as DiagramVariants;
  } catch (error) {
    console.error('Error generating diagrams:', error);
    throw new Error('다이어그램 생성 중 오류가 발생했습니다.');
  }
}

// 레이아웃 계산 함수
export function calculateLayout(data: DiagramResponse[keyof DiagramResponse], type: string): DiagramResponse[keyof DiagramResponse] {
  const NODE_SPACING = 200;
  const LEVEL_HEIGHT = 150;
  
  // 노드 위치 초기화
  const nodes = data.nodes.map((node, index) => ({
    ...node,
    x: (index + 1) * NODE_SPACING,
    y: LEVEL_HEIGHT
  }));

  // 엣지는 그대로 유지
  return {
    nodes,
    edges: data.edges
  };
}

export default createOpenAIClient(); 