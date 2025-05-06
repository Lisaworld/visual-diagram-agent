import React from 'react';
import {
  ServerIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CloudIcon,
  CpuChipIcon,
  UserIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  CircleStackIcon,
  ComputerDesktopIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BookOpenIcon,
  RocketLaunchIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentListIcon,
  WrenchIcon,
  LockClosedIcon,
  LightBulbIcon,
  FlagIcon,
  CommandLineIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

interface IconMapItem {
  emoji: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const iconMap: Record<string, IconMapItem> = {
  // 일반적인 개념
  데이터: { emoji: '📊', icon: CircleStackIcon },
  테스트: { emoji: '🧪', icon: ClipboardDocumentListIcon },
  배포: { emoji: '🚀', icon: RocketLaunchIcon },
  에러: { emoji: '❌', icon: ExclamationTriangleIcon },
  서버: { emoji: '🖥️', icon: ServerIcon },
  클라이언트: { emoji: '💻', icon: ComputerDesktopIcon },
  사용자: { emoji: '👤', icon: UserIcon },
  시스템: { emoji: '⚙️', icon: CogIcon },
  
  // 프로세스 관련
  시작: { emoji: '🎯', icon: PlayIcon },
  종료: { emoji: '🏁', icon: StopIcon },
  처리: { emoji: '⚡', icon: BoltIcon },
  분석: { emoji: '🔍', icon: MagnifyingGlassIcon },
  검증: { emoji: '✅', icon: CheckCircleIcon },
  
  // 입출력 관련
  입력: { emoji: '✍️', icon: DocumentTextIcon },
  출력: { emoji: '📤', icon: DocumentDuplicateIcon },
  저장: { emoji: '💾', icon: CircleStackIcon },
  
  // 상태 관련
  대기: { emoji: '⏳', icon: ArrowPathIcon },
  완료: { emoji: '✨', icon: CheckCircleIcon },
  실패: { emoji: '💥', icon: ExclamationTriangleIcon },
  
  // AI/ML 관련
  AI: { emoji: '🧠', icon: SparklesIcon },
  학습: { emoji: '📚', icon: BookOpenIcon },
  모델: { emoji: '🤖', icon: CpuChipIcon },
  
  // 구조적 요소
  그룹: { emoji: '🗂️', icon: DocumentDuplicateIcon },
  목록: { emoji: '📝', icon: ClipboardDocumentListIcon },
  단계: { emoji: '🔢', icon: CommandLineIcon },
  
  // 비즈니스/조직 관련
  회의: { emoji: '💬', icon: ChatBubbleBottomCenterTextIcon },
  보고: { emoji: '📊', icon: DocumentTextIcon },
  관리: { emoji: '📋', icon: ClipboardDocumentListIcon },
  
  // 기술 관련
  API: { emoji: '🔌', icon: PuzzlePieceIcon },
  코드: { emoji: '💻', icon: CodeBracketIcon },
  버그: { emoji: '🐛', icon: ExclamationTriangleIcon },
  보안: { emoji: '🔒', icon: LockClosedIcon },
  
  // 추상적 개념
  아이디어: { emoji: '💡', icon: LightBulbIcon },
  목표: { emoji: '🎯', icon: FlagIcon },
  전략: { emoji: '🎮', icon: WrenchIcon },
  계획: { emoji: '📅', icon: ClipboardDocumentListIcon }
};

export interface IconMapResult {
  emoji: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const iconMapper = (label: string): IconMapResult => {
  const lowerLabel = label.toLowerCase();
  
  for (const [keyword, item] of Object.entries(iconMap)) {
    if (lowerLabel.includes(keyword.toLowerCase())) {
      return {
        emoji: item.emoji,
        Icon: item.icon
      };
    }
  }

  return {
    emoji: ''
  };
}; 