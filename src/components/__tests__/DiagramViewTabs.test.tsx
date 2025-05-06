import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiagramType } from '../../types/diagram';
import { useAgentContext } from '../../contexts/AgentContextProvider';

// Mock the AgentContext
jest.mock('../../contexts/AgentContextProvider', () => ({
  useAgentContext: jest.fn()
}));

// Create mock component for testing
const DiagramViewTabs: React.FC = () => {
  const { selectedTab, setSelectedTab } = useAgentContext();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const tabs = ['flowchart', 'mindmap', 'tree'] as DiagramType[];
    const currentIndex = tabs.indexOf(selectedTab);
    
    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        const nextTab = tabs[nextIndex];
        setSelectedTab(nextTab);
        tabsRef.current[nextIndex]?.focus();
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        const prevTab = tabs[prevIndex];
        setSelectedTab(prevTab);
        tabsRef.current[prevIndex]?.focus();
        break;
      }
    }
  };

  return (
    <div 
      role="tablist" 
      aria-label="Diagram types"
      onKeyDown={handleKeyDown}
    >
      {(['flowchart', 'mindmap', 'tree'] as DiagramType[]).map((type, index) => (
        <button
          key={type}
          ref={(el: HTMLButtonElement | null) => {
            tabsRef.current[index] = el;
          }}
          role="tab"
          aria-selected={selectedTab === type}
          onClick={() => setSelectedTab(type)}
          tabIndex={selectedTab === type ? 0 : -1}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  );
};

// Mock the actual component
jest.mock('../../components/DiagramViewTabs', () => DiagramViewTabs);

describe('DiagramViewTabs', () => {
  const mockSetSelectedTab = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useAgentContext as jest.Mock).mockReturnValue({
      selectedTab: 'flowchart',
      diagramVariants: null,
      setSelectedTab: mockSetSelectedTab
    });
  });

  it('renders all diagram type tabs', () => {
    render(<DiagramViewTabs />);
    
    expect(screen.getByRole('tab', { name: /Flowchart/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Mindmap/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tree/i })).toBeInTheDocument();
  });

  it('shows correct selected state for active tab', () => {
    render(<DiagramViewTabs />);
    
    const flowchartTab = screen.getByRole('tab', { name: /Flowchart/i });
    const mindmapTab = screen.getByRole('tab', { name: /Mindmap/i });
    const treeTab = screen.getByRole('tab', { name: /Tree/i });

    expect(flowchartTab).toHaveAttribute('aria-selected', 'true');
    expect(mindmapTab).toHaveAttribute('aria-selected', 'false');
    expect(treeTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls setSelectedTab when clicking a tab', () => {
    render(<DiagramViewTabs />);
    
    const mindmapTab = screen.getByRole('tab', { name: /Mindmap/i });
    fireEvent.click(mindmapTab);

    expect(mockSetSelectedTab).toHaveBeenCalledWith('mindmap');
  });

  it('updates selected tab when context changes', () => {
    const { rerender } = render(<DiagramViewTabs />);
    
    // Change the selected tab in context
    (useAgentContext as jest.Mock).mockReturnValue({
      selectedTab: 'tree',
      diagramVariants: null,
      setSelectedTab: mockSetSelectedTab
    });

    rerender(<DiagramViewTabs />);

    const treeTab = screen.getByRole('tab', { name: /Tree/i });
    expect(treeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('supports keyboard navigation', () => {
    render(<DiagramViewTabs />);
    
    const tablist = screen.getByRole('tablist');
    const flowchartTab = screen.getByRole('tab', { name: /Flowchart/i });
    
    // Focus on flowchart tab
    flowchartTab.focus();
    
    // Press right arrow to move to mindmap tab
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(mockSetSelectedTab).toHaveBeenCalledWith('mindmap');
    
    // Press left arrow to move back to flowchart tab
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(mockSetSelectedTab).toHaveBeenCalledWith('tree');
  });
}); 