# Google ADK 개발 가이드

## 개요
ADK는 기능별 에이전트를 정의하고, 이들을 모듈화하여 연결하는 구조입니다. 각 에이전트는 `agent.yaml`로 역할과 입출력을 명시합니다.

## 기본 구조
- 각 에이전트는 디렉토리로 분리
- 필수 파일: `agent.yaml`, `handler.ts`

## agent.yaml 예시
```yaml
name: DiagramBuilderAgent
description: 사용자 입력을 받아 도식화 에이전트를 orchestrate
inputs:
  - name: user_input
    type: text
outputs:
  - name: diagram_data
    type: structured object
calls:
  - InputInterpreterAgent
  - DiagramGeneratorAgent
```

## 흐름 예시
1. 사용자 입력 → DiagramBuilderAgent
2. InputInterpreterAgent 호출 → 개념 추출
3. DiagramGeneratorAgent → 3가지 도식 생성
4. 결과 전달 → UI에서 수정 및 export
