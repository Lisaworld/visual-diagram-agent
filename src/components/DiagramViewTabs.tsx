import React, { useRef, useMemo } from 'react';
import { useAgentContext } from '@/contexts/AgentContextProvider';
import DiagramView from '@/components/DiagramView';
import { MindMapView } from '@/components/MindMapView';
import { TreeView } from '@/components/TreeView';
import { DiagramType } from '@/types/diagram';

const DiagramViewTabs: React.FC = () => {
  const { diagramVariants, selectedTab, setSelectedTab, isProcessing, hasGeneratedDiagrams } = useAgentContext();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // 추천 다이어그램 타입 계산을 메모이제이션
  const recommendedType = useMemo(() => {
    if (!diagramVariants || !hasGeneratedDiagrams || isProcessing) return null;

    const scores = {
      flowchart: diagramVariants.flowchart.nodes.length + diagramVariants.flowchart.edges.length,
      mindmap: diagramVariants.mindmap.nodes.length + diagramVariants.mindmap.edges.length,
      tree: diagramVariants.tree.nodes.length + diagramVariants.tree.edges.length,
    };

    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as DiagramType;
  }, [diagramVariants, hasGeneratedDiagrams, isProcessing]);

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

  // 다이어그램 렌더링 컴포넌트를 메모이제이션
  const DiagramComponent = useMemo(() => {
    if (!diagramVariants || !diagramVariants[selectedTab]) {
      return (
        <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">
            {isProcessing ? '도식을 생성하는 중입니다...' : '도식을 생성하려면 텍스트를 입력하세요.'}
          </p>
        </div>
      );
    }

    const props = { data: diagramVariants[selectedTab] };
    
    switch (selectedTab) {
      case 'mindmap':
        return <MindMapView {...props} />;
      case 'tree':
        return <TreeView {...props} />;
      case 'flowchart':
        return <DiagramView {...props} />;
      default:
        return null;
    }
  }, [diagramVariants, selectedTab, isProcessing]);

  return (
    <div className="space-y-4">
      {diagramVariants && !isProcessing && hasGeneratedDiagrams && (
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                완료! 추천 도식: {recommendedType && recommendedType.charAt(0).toUpperCase() + recommendedType.slice(1)}
              </p>
            </div>
          </div>
        </div>
      )}
      <div 
        role="tablist" 
        aria-label="Diagram types"
        onKeyDown={handleKeyDown}
        className="flex space-x-1 border-b border-gray-200 dark:border-gray-700"
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
            className={`px-4 py-2 border-b-2 transition-colors duration-150 ${
              selectedTab === type 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent hover:border-gray-300 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            } ${type === recommendedType ? 'font-semibold' : ''}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
            {type === recommendedType && (
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                추천
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="w-full h-[600px] border rounded-lg overflow-hidden">
        {DiagramComponent}
      </div>
    </div>
  );
};

export default DiagramViewTabs; 