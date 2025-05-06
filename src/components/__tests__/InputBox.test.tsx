import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import InputBox from '../InputBox';
import { AgentContextProvider } from '../../contexts/AgentContextProvider';

// Mock AgentContext
const mockSetUserInput = jest.fn();
const mockProcessUserInput = jest.fn();

jest.mock('../../contexts/AgentContextProvider', () => ({
  useAgentContext: () => ({
    userInput: '',
    setUserInput: mockSetUserInput,
    processUserInput: mockProcessUserInput,
    isProcessing: false,
    error: null
  })
}));

describe('InputBox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사용자 입력을 처리하고 상태를 업데이트합니다', async () => {
    render(<InputBox />);

    const textarea = screen.getByTestId('input-textarea');
    const button = screen.getByTestId('submit-button');

    // 초기 상태 확인
    expect(button).toBeDisabled();

    // 입력 변경
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '테스트 입력' } });
    });

    // 입력 상태 확인
    await waitFor(() => {
      expect(mockSetUserInput).toHaveBeenCalledWith('테스트 입력');
      expect(button).not.toBeDisabled();
    });

    // 버튼 클릭
    await act(async () => {
      fireEvent.click(button);
    });

    // 처리 상태 확인
    await waitFor(() => {
      expect(mockProcessUserInput).toHaveBeenCalledWith('테스트 입력');
    });
  });

  it('에러가 발생했을 때 에러 메시지를 표시합니다', async () => {
    const errorMessage = '테스트 에러';
    
    // Mock error state
    jest.spyOn(require('../../contexts/AgentContextProvider'), 'useAgentContext')
      .mockReturnValue({
        userInput: '테스트 입력',
        setUserInput: mockSetUserInput,
        processUserInput: mockProcessUserInput,
        isProcessing: false,
        error: errorMessage
      });

    render(<InputBox />);

    // 에러 메시지 확인
    await waitFor(() => {
      const errorElement = screen.getByTestId('error-message');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(errorMessage);
    });
  });

  it('처리 중일 때 입력이 비활성화됩니다', async () => {
    // Mock processing state
    jest.spyOn(require('../../contexts/AgentContextProvider'), 'useAgentContext')
      .mockReturnValue({
        userInput: '테스트 입력',
        setUserInput: mockSetUserInput,
        processUserInput: mockProcessUserInput,
        isProcessing: true,
        error: null
      });

    render(<InputBox />);

    const textarea = screen.getByTestId('input-textarea');
    const button = screen.getByTestId('submit-button');

    // 상태 확인
    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
}); 