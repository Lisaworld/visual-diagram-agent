import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input) {
      return NextResponse.json(
        { error: '입력 텍스트가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `당신은 자연어 설명을 도식화하는 전문가입니다.
주어진 설명을 분석하여 다음과 같은 JSON 형식으로 세 가지 도식 데이터를 생성해야 합니다.

응답은 반드시 다음 JSON 형식이어야 하며, 다른 설명이나 텍스트를 포함하지 않아야 합니다:

{
  "flowchart": {
    "nodes": [
      { "id": "string", "text": "string" }
    ],
    "edges": [
      { "from": "string", "to": "string" }
    ]
  },
  "mindmap": {
    "nodes": [
      { "id": "string", "text": "string" }
    ],
    "edges": [
      { "from": "string", "to": "string" }
    ]
  },
  "tree": {
    "nodes": [
      { "id": "string", "text": "string" }
    ],
    "edges": [
      { "from": "string", "to": "string" }
    ]
  }
}

중요한 규칙:
1. 각 노드의 텍스트는 최대 15단어로 제한하며, 핵심 키워드만 포함해야 합니다.
2. 불필요한 조사나 부가 설명은 제외합니다.
3. 전체 구조를 파악하는 데 중요한 내용만 선별합니다.
4. 응답은 반드시 위에 명시된 JSON 형식이어야 합니다.
5. 노드 ID는 고유한 문자열이어야 합니다.
6. 응답에는 JSON 데이터만 포함되어야 하며, 다른 설명이나 텍스트를 포함하지 않아야 합니다.

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
   - 같은 레벨의 노드들은 동일한 속성이나 특성을 공유`
        },
        {
          role: "user",
          content: `다음 설명을 기반으로 JSON 형식의 도식 데이터를 생성해주세요. 다른 설명이나 텍스트는 포함하지 말고 JSON 데이터만 응답해주세요: ${input}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('API 응답이 비어있습니다.');
    }

    try {
      const diagrams = JSON.parse(response);
      
      // 응답 검증
      if (!diagrams.flowchart || !diagrams.mindmap || !diagrams.tree) {
        throw new Error('잘못된 다이어그램 형식입니다.');
      }

      return NextResponse.json(diagrams);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      return NextResponse.json(
        { error: '다이어그램 데이터 파싱 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '다이어그램 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 