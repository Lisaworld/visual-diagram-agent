import React from 'react';
import InputBox from '@/components/InputBox';
import DiagramViewTabs from '@/components/DiagramViewTabs';
import { DiagramEditor } from '@/components/DiagramEditor';
import { ExportImportPanel } from '@/components/ExportImportPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAgentContext } from '@/contexts/AgentContextProvider';

const DiagramPreviewPage: React.FC = () => {
  const { isProcessing } = useAgentContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">도식을 생성하는 중입니다...</p>
          </div>
        </div>
      )}
      <div className="container max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Visual Thinking Diagram
          </h1>
          <ThemeToggle />
        </header>

        {/* 입력 섹션 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            텍스트 입력
          </h2>
          <InputBox />
        </section>

        {/* 다이어그램 뷰 섹션 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="mb-4">
            <DiagramViewTabs />
          </div>
          <div className="border rounded-lg overflow-hidden">
            <DiagramEditor />
          </div>
        </section>

        {/* 내보내기/가져오기 섹션 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            내보내기/가져오기
          </h2>
          <ExportImportPanel />
        </section>
      </div>
    </div>
  );
};

export default DiagramPreviewPage; 