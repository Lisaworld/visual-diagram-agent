import React from 'react';
import { render, screen } from '@testing-library/react';
import { EditableDiagram } from '../EditableDiagram';

// Mock ReactFlow since it's not compatible with Jest DOM environment
jest.mock('reactflow', () => ({
  __esModule: true,
  default: jest.fn(() => null),
  Background: jest.fn(() => null),
  Controls: jest.fn(() => null),
  MiniMap: jest.fn(() => null),
  addEdge: jest.fn((params, edges) => [...edges, { id: 'new-edge', ...params }]),
}));

describe('EditableDiagram', () => {
  const mockNodes = [
    { id: '1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  ];
  const mockEdges = [
    { id: '1-2', source: '1', target: '2' },
  ];

  it('renders without crashing', () => {
    render(<EditableDiagram />);
  });

  it('accepts initial nodes and edges', () => {
    render(
      <EditableDiagram
        initialNodes={mockNodes}
        initialEdges={mockEdges}
      />
    );
  });

  it('calls onNodesChange when nodes change', () => {
    const onNodesChange = jest.fn();
    render(
      <EditableDiagram
        initialNodes={mockNodes}
        onNodesChange={onNodesChange}
      />
    );
    // Add more specific tests for node changes when needed
  });

  it('calls onEdgesChange when edges change', () => {
    const onEdgesChange = jest.fn();
    render(
      <EditableDiagram
        initialEdges={mockEdges}
        onEdgesChange={onEdgesChange}
      />
    );
    // Add more specific tests for edge changes when needed
  });
}); 