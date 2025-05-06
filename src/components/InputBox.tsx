import React, { useCallback, useEffect, useState } from 'react';
import { useAgentContext } from '../contexts/AgentContextProvider';

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
            placeholder="자연어로 설명을 입력하세요. (예: '회원가입 후 로그인하여 게시글을 작성하는 프로세스')"
            data-testid="input-textarea"
          />
          {error && (
            <div className="mt-2 text-red-500" data-testid="error-message">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            ⌘ + Enter 또는 Ctrl + Enter로 제출
          </p>
          <button
            type="submit"
            id="submit-button"
            name="submit-button"
            disabled={!localInput.trim() || isProcessing}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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