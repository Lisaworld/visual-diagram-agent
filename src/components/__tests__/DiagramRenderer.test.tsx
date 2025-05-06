import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiagramVariants, DiagramData } from '../../types/diagram';
import { useAgentContext } from '../../contexts/AgentContextProvider';
import DiagramRenderer from '../DiagramRenderer';

// Mock react-konva components
jest.mock('react-konva', () => ({
  Stage: ({ children, width, height, ...props }: {
    children: React.ReactNode;
    width?: number;
    height?: number;
    [key: string]: any;
  }) => (
    <div data-testid="konva-stage" {...props} style={{ width, height }}>
      {children}
    </div>
  ),
  Layer: ({ children, ...props }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="konva-layer" {...props}>
      {children}
    </div>
  ),
  Circle: ({ x, y, radius, ...props }: {
    x: number;
    y: number;
    radius: number;
    [key: string]: any;
  }) => (
    <div
      data-testid="konva-circle"
      style={{ position: 'absolute', left: x, top: y }}
      {...props}
    />
  ),
  Arrow: ({ points, ...props }: {
    points: number[];
    [key: string]: any;
  }) => (
    <div
      data-testid="konva-arrow"
      style={{
        position: 'absolute',
        left: points[0],
        top: points[1]
      }}
      {...props}
    />
  ),
  Text: ({ text, x, y, ...props }: {
    text: string;
    x: number;
    y: number;
    verticalAlign?: string;
    offsetX?: number;
    offsetY?: number;
    ellipsis?: boolean;
    [key: string]: any;
  }) => {
    // Filter out Konva-specific props
    const { verticalAlign, offsetX, offsetY, ellipsis, ...domProps } = props;
    
    return (
      <div
        data-testid="konva-text"
        style={{
          position: 'absolute',
          left: x - (offsetX || 0),
          top: y - (offsetY || 0),
          textAlign: 'center',
          overflow: ellipsis ? 'hidden' : 'visible',
          textOverflow: ellipsis ? 'ellipsis' : 'clip',
          whiteSpace: 'nowrap'
        }}
        {...domProps}
      >
        {text}
      </div>
    );
  },
  Group: ({ children, ...props }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div
      data-testid="konva-group"
      style={{ position: 'relative' }}
      {...props}
    >
      {children}
    </div>
  )
}));

// Mock the AgentContext
jest.mock('../../contexts/AgentContextProvider', () => ({
  useAgentContext: jest.fn()
}));

// Mock diagram data
const mockDiagramData: DiagramData = {
  nodes: [
    { id: '1', text: 'Node 1', x: 100, y: 100 },
    { id: '2', text: 'Node 2', x: 200, y: 200 }
  ],
  edges: [
    { from: '1', to: '2' }
  ]
};

const mockDiagramVariants: DiagramVariants = {
  flowchart: mockDiagramData,
  mindmap: {
    nodes: [
      { id: '1', text: 'Central Idea', x: 400, y: 300 },
      { id: '2', text: 'Branch 1', x: 200, y: 200 },
      { id: '3', text: 'Branch 2', x: 600, y: 200 },
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '1', to: '3' }
    ]
  },
  tree: {
    nodes: [
      { id: '1', text: 'Root', x: 400, y: 100 },
      { id: '2', text: 'Child 1', x: 300, y: 200 },
      { id: '3', text: 'Child 2', x: 500, y: 200 },
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '1', to: '3' }
    ]
  }
};

describe('DiagramRenderer', () => {
  beforeEach(() => {
    (useAgentContext as jest.Mock).mockReturnValue({
      diagramVariants: null,
      selectedTab: 'flowchart'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display message when data is null', () => {
    render(<DiagramRenderer />);
    expect(screen.getByText('도식을 생성하려면 텍스트를 입력하세요.')).toBeInTheDocument();
  });

  it('should render diagram elements correctly', () => {
    render(<DiagramRenderer data={mockDiagramData} />);
    
    // Check stage and layer
    expect(screen.getByTestId('konva-stage')).toBeInTheDocument();
    expect(screen.getByTestId('konva-layer')).toBeInTheDocument();
    
    // Check nodes
    const nodes = screen.getAllByTestId('konva-group');
    expect(nodes).toHaveLength(2);
    
    // Check node texts
    const texts = screen.getAllByTestId('konva-text');
    expect(texts[0]).toHaveTextContent('Node 1');
    expect(texts[1]).toHaveTextContent('Node 2');
    
    // Check arrows
    expect(screen.getByTestId('konva-arrow')).toBeInTheDocument();
  });

  it('should handle custom dimensions', () => {
    const customWidth = 800;
    const customHeight = 400;
    
    render(<DiagramRenderer data={mockDiagramData} width={customWidth} height={customHeight} />);
    
    const stage = screen.getByTestId('konva-stage');
    expect(stage.style.width).toBe(`${customWidth}px`);
    expect(stage.style.height).toBe(`${customHeight}px`);
  });

  it('should render flowchart diagram correctly', () => {
    (useAgentContext as jest.Mock).mockReturnValue({
      diagramVariants: mockDiagramVariants,
      selectedTab: 'flowchart'
    });

    render(<DiagramRenderer data={mockDiagramVariants.flowchart} />);

    // Check stage and layer
    expect(screen.getByTestId('konva-stage')).toBeInTheDocument();
    expect(screen.getByTestId('konva-layer')).toBeInTheDocument();

    // Check nodes
    const nodes = screen.getAllByTestId('konva-group');
    expect(nodes).toHaveLength(2);

    // Check node texts
    const texts = screen.getAllByTestId('konva-text');
    expect(texts).toHaveLength(2);
    expect(texts[0]).toHaveTextContent('Node 1');
    expect(texts[1]).toHaveTextContent('Node 2');

    // Check edge
    const arrows = screen.getAllByTestId('konva-arrow');
    expect(arrows).toHaveLength(1);
  });

  it('should render mindmap diagram correctly', () => {
    (useAgentContext as jest.Mock).mockReturnValue({
      diagramVariants: mockDiagramVariants,
      selectedTab: 'mindmap'
    });

    render(<DiagramRenderer data={mockDiagramVariants.mindmap} />);

    // Check nodes
    const nodes = screen.getAllByTestId('konva-group');
    expect(nodes).toHaveLength(3);

    // Check node texts
    const texts = screen.getAllByTestId('konva-text');
    expect(texts).toHaveLength(3);
    expect(texts[0]).toHaveTextContent('Central Idea');
    expect(texts[1]).toHaveTextContent('Branch 1');
    expect(texts[2]).toHaveTextContent('Branch 2');

    // Check edges
    const arrows = screen.getAllByTestId('konva-arrow');
    expect(arrows).toHaveLength(2);
  });

  it('should render tree diagram correctly', () => {
    (useAgentContext as jest.Mock).mockReturnValue({
      diagramVariants: mockDiagramVariants,
      selectedTab: 'tree'
    });

    render(<DiagramRenderer data={mockDiagramVariants.tree} />);

    // Check nodes
    const nodes = screen.getAllByTestId('konva-group');
    expect(nodes).toHaveLength(3);

    // Check node texts
    const texts = screen.getAllByTestId('konva-text');
    expect(texts).toHaveLength(3);
    expect(texts[0]).toHaveTextContent('Root');
    expect(texts[1]).toHaveTextContent('Child 1');
    expect(texts[2]).toHaveTextContent('Child 2');

    // Check edges
    const arrows = screen.getAllByTestId('konva-arrow');
    expect(arrows).toHaveLength(2);
  });

  it('should update when selected tab changes', () => {
    (useAgentContext as jest.Mock).mockReturnValue({
      diagramVariants: mockDiagramVariants,
      selectedTab: 'flowchart'
    });

    const { rerender } = render(<DiagramRenderer data={mockDiagramVariants.flowchart} />);
    expect(screen.getAllByTestId('konva-group')).toHaveLength(2);

    // Switch to mindmap
    (useAgentContext as jest.Mock).mockReturnValue({
      diagramVariants: mockDiagramVariants,
      selectedTab: 'mindmap'
    });

    rerender(<DiagramRenderer data={mockDiagramVariants.mindmap} />);
    expect(screen.getAllByTestId('konva-group')).toHaveLength(3);
  });
}); 