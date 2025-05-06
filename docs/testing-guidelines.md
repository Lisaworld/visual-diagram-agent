# 테스트 가이드라인

## 1. 테스트 환경 설정

### 1.1 테스트 도구
- Jest: 테스트 러너 및 프레임워크
- React Testing Library: 컴포넌트 테스트
- Testing Library User Event: 사용자 인터랙션 시뮬레이션
- jest-environment-jsdom: DOM 환경 시뮬레이션

### 1.2 설정 파일
- jest.config.js: Jest 설정
- jest.setup.js: 테스트 환경 설정
- tsconfig.json: TypeScript 설정

## 2. 테스트 구조

### 2.1 디렉토리 구조
```
src/
└── components/
    ├── ComponentName.tsx
    └── __tests__/
        └── ComponentName.test.tsx
```

### 2.2 테스트 파일 명명
- 컴포넌트 테스트: `ComponentName.test.tsx`
- 유틸리티 테스트: `utilityName.test.ts`
- 통합 테스트: `ComponentName.integration.test.tsx`

## 3. 테스트 작성 가이드

### 3.1 기본 원칙
- 사용자 관점에서 테스트 작성
- 구현이 아닌 동작을 테스트
- 의미 있는 테스트 케이스 작성
- 테스트 격리 유지

### 3.2 컴포넌트 테스트 예시
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<ComponentName />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### 3.3 테스트 우선순위
1. 핵심 사용자 시나리오
2. 에러 케이스
3. 엣지 케이스
4. 성능 관련 케이스

## 4. 테스트 커버리지

### 4.1 커버리지 목표
- 라인 커버리지: 80% 이상
- 브랜치 커버리지: 75% 이상
- 함수 커버리지: 90% 이상

### 4.2 커버리지 제외
- 타입 정의 파일 (.d.ts)
- 테스트 파일
- 스토리북 파일

## 5. 모킹 가이드라인

### 5.1 모킹 대상
- 외부 API 호출
- 브라우저 API
- 시간 관련 함수
- 랜덤 값 생성

### 5.2 모킹 예시
```typescript
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

jest.mock('../../contexts/AgentContext', () => ({
  useAgentContext: () => ({
    state: { /* mock state */ },
    actions: { /* mock actions */ },
  }),
}));
```

## 6. 디버깅

### 6.1 테스트 디버깅
- `test.only()` 사용
- `console.log()` 활용
- Jest 디버거 사용
- React DevTools 활용

### 6.2 일반적인 문제 해결
- 비동기 테스트: `async/await` 사용
- 이벤트 핸들링: `userEvent` 사용
- DOM 업데이트: `waitFor()` 사용

## 7. CI/CD 통합

### 7.1 테스트 자동화
```yaml
# GitHub Actions 예시
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

### 7.2 테스트 보고서
- Jest 커버리지 리포트
- 테스트 실행 시간
- 실패한 테스트 목록 

## 8. 테스트 파일 구조
- 컴포넌트 테스트: `src/components/__tests__/`
- 컨텍스트 테스트: `src/contexts/__tests__/`
- 유틸리티 테스트: `src/utils/__tests__/`

## 9. 테스트 작성 규칙
- 파일명: `[ComponentName].test.tsx`
- 테스트 그룹: `describe('[ComponentName]', () => {...})`
- 테스트 케이스: `it('should [expected behavior]', () => {...})`

## 10. 테스트 유형
- 렌더링 테스트: 컴포넌트가 올바르게 렌더링되는지 확인
- 인터랙션 테스트: 사용자 입력에 대한 반응 확인
- 상태 변화 테스트: 상태 업데이트 및 부작용 확인
- 에러 처리 테스트: 예외 상황 처리 확인

## 11. 테스트 우선순위
1. 핵심 비즈니스 로직
2. 사용자 인터랙션이 많은 컴포넌트
3. 재사용 가능한 공통 컴포넌트
4. 유틸리티 함수

## 12. 테스트 작성 체크리스트
- [ ] 주요 렌더링 케이스 확인
- [ ] 사용자 인터랙션 테스트
- [ ] 에러 상황 처리 테스트
- [ ] 비동기 동작 테스트
- [ ] 접근성 테스트

## 13. 테스트 커버리지 현황

| 컴포넌트/모듈 | 테스트 여부 | 커버리지 수준 | 테스트 유형 | 테스트 경로 |
|------------|-----------|------------|-----------|-----------|
| InputBox | ✅ | 높음 | - 렌더링 테스트<br>- 인터랙션 테스트<br>- 상태 변화 테스트<br>- 에러 처리 테스트 | `src/components/__tests__/InputBox.test.tsx` |
| EditableDiagram | ✅ | 높음 | - 렌더링 테스트<br>- 노드/엣지 표시 테스트<br>- 드래그 인터랙션 테스트<br>- 텍스트 업데이트 테스트 | `src/components/__tests__/EditableDiagram.test.tsx` |
| DiagramViewTabs | ❌ | 없음 | - | - |
| AgentContextProvider | ✅ | 보통 | - 컨텍스트 초기화 테스트<br>- 상태 업데이트 테스트<br>- 다이어그램 변형 테스트 | `src/contexts/__tests__/AgentContext.test.tsx` |
| DiagramRenderer | ❌ | 없음 | - | - |
| ControlPanel | ❌ | 없음 | - | - |

### 개선이 필요한 영역

1. DiagramViewTabs
   - 탭 전환 기능 테스트
   - 활성 탭 상태 관리 테스트
   - 탭 컨텐츠 렌더링 테스트

2. DiagramRenderer
   - 다양한 다이어그램 유형 렌더링 테스트
   - 캔버스 크기 조정 테스트
   - 줌/패닝 기능 테스트

3. ControlPanel
   - 도구 선택 테스트
   - 설정 변경 테스트
   - 단축키 동작 테스트

### 다음 단계 테스트 계획

1. DiagramViewTabs 컴포넌트 테스트 작성
   - 탭 전환 로직
   - 탭 상태 관리
   - 접근성 준수 여부

2. DiagramRenderer 컴포넌트 테스트 작성
   - 다이어그램 타입별 렌더링
   - 성능 최적화 검증
   - 에러 바운더리 테스트

3. ControlPanel 컴포넌트 테스트 작성
   - 도구 상호작용
   - 설정 저장/복원
   - 키보드 단축키 