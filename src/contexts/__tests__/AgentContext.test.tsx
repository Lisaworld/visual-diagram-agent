import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgentContextProvider, useAgentContext } from '../AgentContextProvider';
import userEvent from '@testing-library/user-event';

// Mock generateDiagramVariants
jest.mock('../../utils/diagramGenerator', () => ({
  generateDiagramVariants: jest.fn(() => ({
    flowchart: { nodes: [], edges: [] },
    mindmap: { nodes: [], edges: [] },
    tree: { nodes: [], edges: [] }
  }))
}));

// Mock the context consumer component
const TestComponent = () => {
  const { userInput, setUserInput, isProcessing, error, processUserInput } = useAgentContext();
  
  const handleClick = () => {
    setUserInput('test input');
    processUserInput('test input');
  };
  
  return (
    <div>
      <div data-testid="user-input">{userInput}</div>
      <div data-testid="processing-state">{isProcessing ? 'processing' : 'idle'}</div>
      <div data-testid="error-state">{error || 'no error'}</div>
      <button onClick={handleClick}>Process Input</button>
    </div>
  );
};

describe('AgentContextProvider', () => {
  it('should provide initial context values', () => {
    render(
      <AgentContextProvider>
        <TestComponent />
      </AgentContextProvider>
    );

    expect(screen.getByTestId('user-input')).toHaveTextContent('');
    expect(screen.getByTestId('processing-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('error-state')).toHaveTextContent('no error');
  });

  it('should update user input when setUserInput is called', async () => {
    render(
      <AgentContextProvider>
        <TestComponent />
      </AgentContextProvider>
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('user-input')).toHaveTextContent('test input');
    });
  });

  it('should process input and update state', async () => {
    render(
      <AgentContextProvider>
        <TestComponent />
      </AgentContextProvider>
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('processing-state')).toHaveTextContent('idle');
    });
  });

  it('should handle errors during processing', async () => {
    // Mock generateDiagramVariants to throw an error
    const { generateDiagramVariants } = require('../../utils/diagramGenerator');
    generateDiagramVariants.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    render(
      <AgentContextProvider>
        <TestComponent />
      </AgentContextProvider>
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toHaveTextContent('Test error');
    });
  });
}); 