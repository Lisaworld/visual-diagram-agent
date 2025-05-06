# 📦 컴포넌트 구조

## 🎯 개요

이 문서는 프로젝트의 React 컴포넌트 구조와 각 컴포넌트의 역할을 설명합니다.

## 📝 입력 관련 컴포넌트

### InputBox
`src/components/InputBox.tsx`

사용자로부터 자연어 입력을 받는 컴포넌트입니다.

#### Props
- 없음 (Context를 통해 데이터 관리)

#### 주요 기능
- 텍스트 입력 영역 제공
- 제출 버튼
- 단축키 지원 (⌘ + Enter, Ctrl + Enter)
- 로딩 상태 표시
- 에러 메시지 표시

#### 사용 예시
```tsx
<InputBox />
```

## 🎨 도식화 관련 컴포넌트

### DiagramRenderer
`src/components/DiagramRenderer.tsx`

Konva.js를 사용하여 다이어그램을 렌더링하는 컴포넌트입니다.

#### Props
- 없음 (Context를 통해 데이터 관리)

#### 주요 기능
- Stage, Layer 구성
- 노드 렌더링 (Circle)
- 엣지 렌더링 (Arrow)
- 텍스트 렌더링

#### 사용 예시
```tsx
<DiagramRenderer />
```

## 🔄 상태 관리

### AgentContextProvider
`src/contexts/AgentContextProvider.tsx`

애플리케이션의 상태를 관리하는 Context Provider입니다.

#### 관리하는 상태
- `diagramVariants`: 다이어그램 데이터
- `selectedTab`: 현재 선택된 탭
- `isProcessing`: 처리 중 상태
- `error`: 에러 메시지

#### 제공하는 함수
- `processUserInput`: 사용자 입력 처리
- `setSelectedTab`: 탭 변경

#### 사용 예시
```tsx
const App = () => (
  <AgentContextProvider>
    <InputBox />
    <DiagramRenderer />
  </AgentContextProvider>
);
```

## 🧪 테스트

각 컴포넌트는 Jest와 React Testing Library를 사용하여 테스트됩니다.

### 테스트 파일 위치
- `src/components/__tests__/InputBox.test.tsx`
- `src/components/__tests__/DiagramRenderer.test.tsx`

### 테스트 범위
- 컴포넌트 렌더링
- 사용자 상호작용
- 상태 변경
- 에러 처리

## 🎯 향후 구현 예정 컴포넌트

1. `DiagramViewTabs`: 도식 스타일 탭 UI
2. `EditableDiagram`: 텍스트 수정 가능한 도식
3. `ExportArea`: 결과 내보내기 UI

## 📚 컴포넌트 설계 원칙

1. **단일 책임**: 각 컴포넌트는 하나의 주요 기능에 집중
2. **상태 관리 중앙화**: Context를 통한 상태 관리
3. **접근성**: ARIA 레이블과 키보드 네비게이션 지원
4. **재사용성**: 공통 컴포넌트의 모듈화
5. **테스트 용이성**: 각 컴포넌트는 독립적으로 테스트 가능 