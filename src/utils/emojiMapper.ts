export const emojiMapper = (label: string): string => {
  const map: Record<string, string> = {
    // 일반적인 개념
    데이터: '📊',
    테스트: '🧪',
    배포: '🚀',
    에러: '❌',
    서버: '🖥️',
    클라이언트: '💻',
    사용자: '👤',
    시스템: '⚙️',
    
    // 프로세스 관련
    시작: '🎯',
    종료: '🏁',
    처리: '⚡',
    분석: '🔍',
    검증: '✅',
    
    // 입출력 관련
    입력: '✍️',
    출력: '📤',
    저장: '💾',
    
    // 상태 관련
    대기: '⏳',
    완료: '✨',
    실패: '💥',
    
    // AI/ML 관련
    AI: '🧠',
    학습: '📚',
    모델: '🤖',
    
    // 구조적 요소
    그룹: '🗂️',
    목록: '📝',
    단계: '🔢',
    
    // 비즈니스/조직 관련
    회의: '💬',
    보고: '📊',
    관리: '📋',
    
    // 기술 관련
    API: '🔌',
    코드: '💻',
    버그: '🐛',
    보안: '🔒',
    
    // 추상적 개념
    아이디어: '💡',
    목표: '🎯',
    전략: '🎮',
    계획: '📅'
  };

  // 소문자로 변환하여 비교
  const lowerLabel = label.toLowerCase();
  
  for (const [keyword, emoji] of Object.entries(map)) {
    if (lowerLabel.includes(keyword.toLowerCase())) {
      return emoji;
    }
  }

  return ''; // 매칭되는 이모지가 없을 경우 빈 문자열 반환
}; 