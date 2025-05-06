import React, { useRef, useMemo, useCallback } from 'react';
import { useAgentContext } from '../contexts/AgentContextProvider';
import { DiagramType, DiagramData } from '../types/diagram';
import { Tab } from '@headlessui/react';
import { FlowchartView } from './FlowchartView';
import { RadialMindmap } from './RadialMindmap';
import { TreeView } from './TreeView';

interface DiagramVariants {
  flowchart: DiagramData;
  mindmap: DiagramData;
  tree: DiagramData;
}

const DiagramViewTabs: React.FC = () => {
  const { diagramVariants, selectedTab, setSelectedTab, isProcessing, hasGeneratedDiagrams } = useAgentContext();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // 노드 텍스트 변경 핸들러
  const handleNodeChange = useCallback((nodeId: string, newText: string) => {
    // 여기서 상태 업데이트 로직을 구현할 수 있습니다.
    console.log('Node text changed:', { nodeId, newText });
  }, []);

  // 추천 다이어그램 타입 계산을 메모이제이션
  const recommendedType = useMemo(() => {
    if (!diagramVariants || !hasGeneratedDiagrams || isProcessing) return null;

    const scores = {
      flowchart: (diagramVariants.flowchart?.nodes?.length || 0) + (diagramVariants.flowchart?.edges?.length || 0),
      mindmap: (diagramVariants.mindmap?.nodes?.length || 0) + (diagramVariants.mindmap?.edges?.length || 0),
      tree: (diagramVariants.tree?.nodes?.length || 0) + (diagramVariants.tree?.edges?.length || 0),
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

  const tabs: { key: DiagramType; name: string }[] = [
    { key: 'flowchart', name: '플로우차트' },
    { key: 'mindmap', name: '마인드맵' },
    { key: 'tree', name: '트리' },
  ];

  const selectedIndex = tabs.findIndex(tab => tab.key === selectedTab);

  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">시각화할 내용이 없습니다</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          텍스트를 입력하시면 다이어그램이 자동으로 생성됩니다.
        </p>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">
          도식을 생성하는 중입니다...
        </p>
      </div>
    </div>
  );

  // 초기 상태 (아무 입력도 없는 상태)
  if (!hasGeneratedDiagrams && !isProcessing) {
    return (
      <div className="w-full">
        <div className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-100 hover:bg-white/[0.12] hover:text-white"
              disabled
            >
              {tab.name}
            </button>
          ))}
        </div>
        {renderEmptyState()}
      </div>
    );
  }

  // 로딩 상태
  if (isProcessing) {
    return (
      <div className="w-full">
        <div className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-100 hover:bg-white/[0.12] hover:text-white"
              disabled
            >
              {tab.name}
            </button>
          ))}
        </div>
        {renderLoadingState()}
      </div>
    );
  }

  // 데이터가 없는 상태
  if (!diagramVariants) {
    return renderEmptyState();
  }

  return (
    <div className="w-full">
      <Tab.Group
        selectedIndex={selectedIndex}
        onChange={index => setSelectedTab(tabs[index].key)}
      >
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map(tab => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {tab.name}
              {tab.key === recommendedType && (
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                  추천
                </span>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-2">
          <Tab.Panel
            key="flowchart"
            className={classNames(
              'rounded-xl bg-white dark:bg-gray-800 p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {diagramVariants.flowchart ? (
              <FlowchartView 
                data={diagramVariants.flowchart} 
                onNodeChange={handleNodeChange}
              />
            ) : renderEmptyState()}
          </Tab.Panel>

          <Tab.Panel
            key="mindmap"
            className={classNames(
              'rounded-xl bg-white dark:bg-gray-800 p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {selectedTab === 'mindmap' && diagramVariants.mindmap ? (
              <RadialMindmap 
                data={diagramVariants.mindmap}
                onNodeChange={handleNodeChange}
              />
            ) : renderEmptyState()}
          </Tab.Panel>

          <Tab.Panel
            key="tree"
            className={classNames(
              'rounded-xl bg-white dark:bg-gray-800 p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            {diagramVariants.tree ? (
              <TreeView 
                data={diagramVariants.tree}
                onNodeChange={handleNodeChange}
              />
            ) : renderEmptyState()}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export default DiagramViewTabs; 