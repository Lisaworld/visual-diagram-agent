# Visual Thinking Project Specification

## 프로젝트 개요
시각적 사고를 돕는 다이어그램 에디터 웹 애플리케이션

## 기술 스택

### Frontend
- Next.js 14.1.0
- React 18.2.0
- TypeScript
- Tailwind CSS

### 상태 관리
- Zustand
  ```typescript
  interface DiagramStore {
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string | null;
    isLoading: boolean;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    setSelectedNode: (nodeId: string | null) => void;
    setLoading: (loading: boolean) => void;
  }
  ```

### 다이어그램 관련
- React Flow
- D3.js

### 인증/인가
- Google OAuth 2.0

### AI 통합
- Google ADK (Application Development Kit)

## 상세 기능 명세

### 1. 다이어그램 내보내기
- 지원 형식: PNG, SVG, PDF, JSON
- 파일명 형식: `{다이어그램제목}_{YYYYMMDD_HHMMSS}.{확장자}`
- 내보내기 중 로딩 표시
  ```typescript
  interface ExportOptions {
    format: 'png' | 'svg' | 'pdf' | 'json';
    quality?: number; // PNG only, 0-1
    scale?: number; // PNG only, default 1
    darkMode?: boolean;
  }
  ```

### 2. 다이어그램 불러오기
- 지원 형식: JSON
- 파일 크기 제한: 10MB
- 유효성 검사 수행
- 드래그 앤 드롭 지원

### 3. 자동 저장
- 주기: 30초
- 저장 위치: LocalStorage
- 최대 백업 수: 5개
- 키 형식: `diagram_backup_{timestamp}`

### 4. 로딩 상태 관리
```typescript
enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SAVING = 'saving',
  EXPORTING = 'exporting',
  ERROR = 'error'
}

interface LoadingIndicatorProps {
  state: LoadingState;
  message?: string;
  progress?: number;
}
```

### 5. 다이어그램 레이아웃
- 자동 레이아웃 지원
  - 수직 트리
  - 수평 트리
  - 방사형
  - 힘 기반 (Force-Directed)
- 노드 간격: 기본 50px (커스터마이징 가능)
- 줌 레벨: 25% ~ 400%
- 미니맵 지원

## 주요 컴포넌트

### 1. EditableDiagram
다이어그램 편집을 위한 핵심 컴포넌트
```typescript
interface EditableDiagramProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  layoutType?: LayoutType;
  theme?: 'light' | 'dark';
  autoSave?: boolean;
  showMinimap?: boolean;
  readonly?: boolean;
}

interface Node extends ReactFlowNode {
  data: {
    label: string;
    type?: string;
    color?: string;
    icon?: string;
    metadata?: Record<string, any>;
  };
}
```

### 2. DiagramEditor
다이어그램 편집 UI를 제공하는 컨테이너 컴포넌트
- 툴바 기능
  - 노드 추가/삭제
  - 레이아웃 변경
  - 줌 컨트롤
  - 실행 취소/다시 실행
  - 내보내기/불러오기
- 다크모드 지원
- 키보드 단축키
  ```typescript
  const SHORTCUTS = {
    UNDO: 'mod+z',
    REDO: 'mod+shift+z',
    DELETE: ['backspace', 'delete'],
    COPY: 'mod+c',
    PASTE: 'mod+v',
    SAVE: 'mod+s',
  } as const;
  ```

### 3. FlowchartView
플로우차트 뷰어 컴포넌트
- 노드 타입
  - 시작/종료
  - 프로세스
  - 조건
  - 입출력
  - 데이터
- 커스텀 스타일링 지원

### 4. RadialMindmap
방사형 마인드맵 컴포넌트
- 중앙 노드에서 시작
- 자동 레이아웃
- 레벨별 색상 구분
- 확장/축소 애니메이션

### 5. TreeView
트리 구조 뷰어 컴포넌트
- 방향: 상하/좌우
- 노드 접기/펼치기
- 레벨별 들여쓰기
- 연결선 스타일 옵션

## Google ADK 통합

### ADK 서비스 레이어
```typescript
interface AgentParams {
  name: string;
  description?: string;
  capabilities: Array<'TEXT_GENERATION' | 'CODE_GENERATION' | 'DIAGRAM_ANALYSIS'>;
  metadata?: Record<string, any>;
}

interface TaskParams {
  agentId: string;
  input: {
    type: 'text' | 'diagram' | 'code';
    content: string;
  };
  options?: Record<string, any>;
}

class ADKService {
  // 핵심 메서드
  initialize(): Promise<void>;
  authenticate(): Promise<void>;
  
  // 에이전트 관련
  createAgent(params: AgentParams): Promise<ADKResponse>;
  updateAgent(agentId: string, params: Partial<AgentParams>): Promise<ADKResponse>;
  deleteAgent(agentId: string): Promise<ADKResponse>;
  
  // 태스크 관련
  createTask(params: TaskParams): Promise<ADKResponse>;
  executeTask(taskId: string): Promise<ADKResponse>;
  getTaskResult(taskId: string): Promise<ADKResponse>;
  
  // 이벤트 핸들링
  on(event: ADKEventType, callback: (data: any) => void): void;
  off(event: ADKEventType, callback?: (data: any) => void): void;
}

type ADKEventType = 
  | 'task.created'
  | 'task.started'
  | 'task.completed'
  | 'task.failed'
  | 'agent.created'
  | 'agent.updated'
  | 'agent.deleted';
```

### 필요한 환경 변수
```env
# Google OAuth & ADK
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/callback/google
GOOGLE_CLOUD_PROJECT=your_project_id

# 선택적 설정
NEXT_PUBLIC_DEFAULT_LAYOUT=vertical-tree
NEXT_PUBLIC_AUTO_SAVE_INTERVAL=30000
NEXT_PUBLIC_MAX_BACKUP_COUNT=5
NEXT_PUBLIC_MAX_IMPORT_SIZE=10485760  # 10MB in bytes
```

## 프로젝트 구조
```
src/
├── components/
│   ├── EditableDiagram.tsx
│   ├── DiagramEditor.tsx
│   ├── FlowchartView.tsx
│   ├── RadialMindmap.tsx
│   ├── TreeView.tsx
│   └── ThemeToggle.tsx
├── services/
│   └── adkService.ts
├── types/
│   ├── google-adk.d.ts
│   └── env.d.ts
└── styles/
    └── globals.css

docs/
└── PROJECT_SPEC.md
```

## 개발 환경 설정

### 1. 의존성 설치
```bash
# 기본 의존성
npm install react react-dom next typescript @types/react @types/node

# UI 관련
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 상태 관리
npm install zustand

# 다이어그램 관련
npm install reactflow

# 유틸리티
npm install @types/uuid uuid @heroicons/react next-themes
```

### 2. Google Cloud 설정
1. Google Cloud Console에서 새 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 필요한 API 활성화
4. 환경 변수 설정 (.env.local)

### 3. 개발 서버 실행
```bash
npm run dev
```
- 기본 포트: 3001
- 개발 서버 URL: http://localhost:3001

## 테스트
```bash
npm run test
```
- Jest + React Testing Library 사용
- 컴포넌트별 단위 테스트 구현

## 주의사항
1. CSP(Content Security Policy) 설정 필요
2. 환경 변수 보안 관리
3. Google ADK 관련 타입 정의 유지보수
4. 반응형 디자인 고려
5. 성능 최적화 (메모이제이션, 코드 스플리팅 등) 

## 성능 최적화

### 1. 메모이제이션
- React.memo 적용 대상
  - DiagramNode
  - EdgeLine
  - ToolbarButton
  - MiniMap
- useMemo/useCallback 사용
  - 레이아웃 계산
  - 이벤트 핸들러
  - 필터링/정렬 함수

### 2. 코드 스플리팅
- 다이내믹 임포트
  ```typescript
  const DiagramExport = dynamic(() => import('./DiagramExport'), {
    loading: () => <LoadingSpinner />,
    ssr: false
  });
  ```
- 레이아웃별 코드 분리
- 에디터/뷰어 분리

### 3. 렌더링 최적화
- 가상화 적용 (대규모 다이어그램)
- 디바운스/쓰로틀
  - 노드 위치 업데이트
  - 자동 저장
  - 검색/필터링
- 레이어 캐싱

## 에러 처리

### 1. 사용자 피드백
```typescript
interface ErrorFeedback {
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  action?: {
    label: string;
    handler: () => void;
  };
}
```

### 2. 에러 바운더리
- 컴포넌트별 에러 격리
- 자동 복구 시도
- 에러 로깅

### 3. 폴백 UI
- 로딩 실패 시 대체 화면
- 오프라인 모드 지원
- 자동 저장 복구

## 접근성

### 1. 키보드 네비게이션
- 노드 간 이동
- 포커스 관리
- ARIA 레이블

### 2. 고대비 모드
- WCAG 2.1 준수
- 커스텀 테마 지원

### 3. 스크린 리더 지원
- 의미있는 대체 텍스트
- 실시간 업데이트 알림 