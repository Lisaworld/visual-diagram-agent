import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { AgentContextProvider, useAgentContext } from '../AgentContextProvider';
import { generateDiagrams } from '../../utils/openai';

// Mock OpenAI API
jest.mock('../../utils/openai', () => ({
  generateDiagrams: jest.fn()
}));

const mockDiagramResponse = {
  flowchart: {
    nodes: [
      { id: '1', text: 'Start' },
      { id: '2', text: 'Process' }
    ],
    edges: [{ from: '1', to: '2' }]
  },
  mindmap: {
    nodes: [
      { id: '1', text: 'Center' },
      { id: '2', text: 'Branch' }
    ],
    edges: [{ from: '1', to: '2' }]
  },
  tree: {
    nodes: [
      { id: '1', text: 'Root' },
      { id: '2', text: 'Child' }
    ],
    edges: [{ from: '1', to: '2' }]
  }
};

// 테스트용 컴포넌트
const TestComponent = () => {
  const context = useAgentContext();
  return (
    <div>
      <div data-testid="user-input">{context.userInput}</div>
      <div data-testid="selected-tab">{context.selectedTab}</div>
      <div data-testid="is-processing">{context.isProcessing.toString()}</div>
      {context.error && <div data-testid="error">{context.error}</div>}
    </div>
  );
};

describe('AgentContextProvider', () => {
  beforeEach(() => {
    (generateDiagrams as jest.Mock).mockClear();
  });

  it('provides initial context values', () => {
    const { getByTestId } = render(
      <AgentContextProvider>
        <TestComponent />
      </AgentContextProvider>
    );

    expect(getByTestId('user-input')).toHaveTextContent('');
    expect(getByTestId('selected-tab')).toHaveTextContent('flowchart');
    expect(getByTestId('is-processing')).toHaveTextContent('false');
  });

  it('processes user input successfully', async () => {
    (generateDiagrams as jest.Mock).mockResolvedValueOnce(mockDiagramResponse);

    const { getByTestId } = render(
      <AgentContextProvider>
        <TestComponent />
      </AgentContextProvider>
    );

    const context = useAgentContext();

    await act(async () => {
      await context.processUserInput('test input');
    });

    await waitFor(() => {
      expect(generateDiagrams).toHaveBeenCalledWith('test input');
      expect(getByTestId('is-processing')).toHaveTextContent('false');
    });
  });

  it('handles API errors', async () => {
    const errorMessage = 'API Error';
    (generateDiagrams as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { getByTestId } = render(
      <AgentContextProvider>
        <TestComponent />
      </AgentContextProvider>
    );

    const context = useAgentContext();

    await act(async () => {
      await context.processUserInput('test input');
    });

    await waitFor(() => {
      expect(getByTestId('error')).toHaveTextContent(errorMessage);
      expect(getByTestId('is-processing')).toHaveTextContent('false');
    });
  });

  it('updates selected tab', () => {
    const { getByTestId } = render(
      <AgentContextProvider>
        <TestComponent />
      </AgentContextProvider>
    );

    const context = useAgentContext();

    act(() => {
      context.setSelectedTab('mindmap');
    });

    expect(getByTestId('selected-tab')).toHaveTextContent('mindmap');
  });
}); 