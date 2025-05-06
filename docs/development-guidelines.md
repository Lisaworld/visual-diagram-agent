# 개발 가이드라인

## 1. 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── __tests__/      # 컴포넌트 테스트
│   ├── InputBox.tsx    # 입력 컴포넌트
│   └── ThemeToggle.tsx # 테마 토글 컴포넌트
├── contexts/           # React Context
│   ├── AgentContext.ts
│   └── AgentContextProvider.tsx
├── pages/             # Next.js 페이지
│   └── _app.tsx
├── styles/            # 스타일 파일
│   └── globals.css
└── types/             # TypeScript 타입 정의
    └── diagram.ts
```

## 2. 기술 스택 및 도구

### 2.1 핵심 라이브러리
- Next.js 14.1.0
- React 18.2.0
- TypeScript
- TailwindCSS 3.4.1

### 2.2 상태 관리
- React Context API
- AgentContext를 통한 중앙화된 상태 관리

### 2.3 테스트 도구
- Jest
- React Testing Library
- Testing Library User Event

### 2.4 코드 품질
- ESLint
- TypeScript strict 모드
- Jest 테스트 커버리지

## 3. 개발 규칙

### 3.1 컴포넌트 작성
- 함수형 컴포넌트 사용
- TypeScript 타입 명시
- Props 인터페이스 정의
- 접근성 속성 추가 (ARIA)

### 3.2 스타일링
```typescript
// Tailwind CSS 클래스 구조화
const className = {
  base: "w-full p-4",
  variants: {
    primary: "bg-primary-600 text-white",
    secondary: "bg-gray-200 text-gray-800"
  }
}
```

### 3.3 테스트 작성
- 컴포넌트별 테스트 파일 생성
- 사용자 인터랙션 테스트
- 접근성 테스트
- 스냅샷 테스트 (필요시)

## 4. 명명 규칙

### 4.1 파일명
- 컴포넌트: PascalCase.tsx
- 유틸리티: camelCase.ts
- 테스트: ComponentName.test.tsx

### 4.2 변수/함수명
- 변수: camelCase
- 상수: UPPER_SNAKE_CASE
- 타입/인터페이스: PascalCase

## 5. Git 관리

### 5.1 브랜치 전략
- main: 프로덕션 브랜치
- develop: 개발 브랜치
- feature/*: 기능 개발
- fix/*: 버그 수정

### 5.2 커밋 메시지
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 코드

## 6. 빌드 및 배포

### 6.1 개발 환경
```bash
npm run dev     # 개발 서버
npm test        # 테스트 실행
npm run build   # 프로덕션 빌드
```

### 6.2 환경 변수
- .env.local: 로컬 환경
- .env.development: 개발 환경
- .env.production: 프로덕션 환경

## 7. 문제 해결

### 7.1 일반적인 이슈
- 타입 에러: tsconfig.json 확인
- 빌드 에러: next.config.js 확인
- 스타일 이슈: tailwind.config.js 확인

### 7.2 디버깅
- React DevTools 활용
 