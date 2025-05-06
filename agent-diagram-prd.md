# Visual Thinking Agent Project Documentation

## 프로젝트 개요
자연어 입력을 받아 3가지 스타일(흐름도/마인드맵/계층도)의 도식을 자동으로 생성하는 웹 애플리케이션

## 개발 현황

### 1단계: 기본 UI 및 상태관리 (완료)
- [x] 입력 UI 구현
  - InputBox 컴포넌트 구현
  - 사용자 입력 처리 및 유효성 검사
  - 키보드 단축키 지원 (⌘/Ctrl + Enter)
- [x] AgentContextProvider 구현
  - 전역 상태 관리
  - 사용자 입력 상태 관리
  - 도식 데이터 상태 관리
- [x] 기본 레이아웃 구성
- [x] 컴포넌트 테스트 작성

### 2단계: 도식 데이터 생성 (완료)
- [x] 도식 데이터 구조 정의
  - 공통 포맷: nodes, edges
  - 각 도식 타입별 특성 반영
- [x] Mock 데이터 생성 로직
  - 흐름도(flowchart) 데이터 생성
  - 마인드맵(mindmap) 데이터 생성
  - 계층도(tree) 데이터 생성
- [x] 데이터 변환 및 검증 로직

### 3단계: 도식 에디터 구현 (완료)
- [x] Konva.js 기반 캔버스 구현
  - Stage, Layer 구조 설정
  - 노드 및 엣지 렌더링
- [x] 노드 편집 기능
  - 텍스트 수정 UI
  - 더블클릭/Enter 이벤트 처리
  - 편집 모드 전환
- [x] 노드 드래그 기능
  - 드래그 앤 드롭 구현
  - 위치 상태 관리
  - 엣지 자동 업데이트
- [x] 테스트 케이스
  - 컴포넌트 렌더링 테스트
  - 사용자 상호작용 테스트
  - react-konva 모킹

### 4단계: LLM 통합 (진행 예정)
- [ ] OpenAI API 연동
  - API 키 관리
  - 요청/응답 처리
  - 에러 핸들링
- [ ] 프롬프트 엔지니어링
  - 도식 생성 프롬프트 설계
  - 컨텍스트 관리
  - 응답 포맷 정의
- [ ] ADK 기반 에이전트 구현
  - 에이전트 아키텍처 설계
  - 상태 관리 및 메모리 구현
  - 도구 통합

### 5단계: 고급 기능 (예정)
- [ ] 도식 스타일 커스터마이징
- [ ] 도식 내보내기/가져오기
- [ ] 실시간 협업 기능
- [ ] 히스토리 관리

## 기술 스택
- Frontend: React, TypeScript
- 상태관리: Context API
- 캔버스: Konva.js
- 테스트: Jest, React Testing Library
- AI: OpenAI API (예정)

## 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 테스트 실행
npm test
```

## 프로젝트 구조
```
src/
  ├── components/
  │   ├── InputBox.tsx
  │   ├── EditableDiagram.tsx
  │   ├── DiagramRenderer.tsx
  │   └── __tests__/
  ├── contexts/
  │   └── AgentContextProvider.tsx
  ├── types/
  │   └── diagram.ts
  ├── utils/
  │   └── layoutCalculator.ts
  └── App.tsx
```

