import React, { useCallback, useEffect, useState } from 'react';
import { useAgentContext } from '../contexts/AgentContextProvider';

const EXAMPLE_TRAVEL_TEXT = "여행을 준비할 때 고려할 점은 교통, 숙소, 일정, 음식, 예산이 있어. 교통은 비행기, 기차, 렌터카로 나뉘고, 숙소는 호텔, 에어비앤비, 게스트하우스가 있고, 일정은 도착, 관광, 휴식으로 계획해";

const EXAMPLE_ORG_TEXT = "IT 회사 조직도는 CEO 아래에 기술총괄, 사업총괄, 경영지원 부서가 있어. 기술총괄 아래에는 개발팀과 인프라팀, 사업총괄 아래에는 마케팅팀, 영업팀, 고객지원팀이 있고, 개발팀은 프론트엔드, 백엔드, AI팀으로 나뉘어.";

const InputBox: React.FC = () => {
  const { userInput, setUserInput, processUserInput, isProcessing, error } = useAgentContext();
  const [localInput, setLocalInput] = useState(userInput);

  useEffect(() => {
    setLocalInput(userInput);
  }, [userInput]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalInput(value);
    setUserInput(value);
  }, [setUserInput]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim()) return;
    await processUserInput(localInput);
  }, [localInput, processUserInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleExampleClick = useCallback((text: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setLocalInput(text);
    setUserInput(text);
  }, [setUserInput]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-4" id="input-form" name="input-form">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <textarea
            id="user-input"
            name="user-input"
            value={localInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="w-full h-32 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="자연어로 설명을 입력하세요."
            data-testid="input-textarea"
          />
          {error && (
            <div className="mt-2 text-red-500" data-testid="error-message">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-500 text-[13px] sm:text-sm whitespace-nowrap">
            <button
              onClick={handleExampleClick(EXAMPLE_TRAVEL_TEXT)}
              className="hover:text-gray-600 hover:underline focus:outline-none"
            >
              📝 예: 여행준비
            </button>
            <span>/</span>
            <button
              onClick={handleExampleClick(EXAMPLE_ORG_TEXT)}
              className="hover:text-gray-600 hover:underline focus:outline-none"
            >
              📝 예: 조직도
            </button>
          </div>
          <button
            type="submit"
            id="submit-button"
            name="submit-button"
            disabled={!localInput.trim() || isProcessing}
            className="inline-flex px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 min-w-fit"
            data-testid="submit-button"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                처리 중...
              </>
            ) : (
              '도식 생성'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default InputBox; 