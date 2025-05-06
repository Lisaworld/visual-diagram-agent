import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { DiagramVariants } from '../../src/types/diagram';
import { calculateLayout } from '../../src/utils/layoutCalculator';

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

응답은 반드시 다음과 같은 JSON 형식이어야 합니다:
{
  "flowchart": {
    "nodes": [{"id": "string", "text": "string"}],
    "edges": [{"from": "string", "to": "string"}]
  },
  "mindmap": {
    "nodes": [{"id": "string", "text": "string"}],
    "edges": [{"from": "string", "to": "string"}]
  },
  "tree": {
    "nodes": [{"id": "string", "text": "string"}],
    "edges": [{"from": "string", "to": "string"}]
  }
}`;

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" }  // JSON 응답 형식 강제
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return res.status(500).json({ error: 'Empty response from OpenAI' });
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse OpenAI response as JSON',
        details: content  // 디버깅을 위해 원본 응답 포함
      });
    }

    // 응답 검증
    if (!result.flowchart?.nodes || !result.mindmap?.nodes || !result.tree?.nodes ||
        !result.flowchart?.edges || !result.mindmap?.edges || !result.tree?.edges) {
      return res.status(500).json({ 
        error: 'Invalid response format: missing required fields',
        details: result  // 디버깅을 위해 실제 응답 구조 포함
      });
    }

    // 노드 위치 계산
    try {
      ['flowchart', 'mindmap', 'tree'].forEach(type => {
        result[type] = calculateLayout(result[type], type as keyof DiagramVariants);
      });
    } catch (layoutError) {
      console.error('Layout calculation error:', layoutError);
      return res.status(500).json({ 
        error: 'Failed to calculate diagram layout',
        details: layoutError instanceof Error ? layoutError.message : String(layoutError)
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating diagrams:', error);
    return res.status(500).json({ 
      error: 'Failed to generate diagrams',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 