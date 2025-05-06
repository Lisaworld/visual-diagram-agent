'use client';

import React, { useRef, useState } from 'react';
import { useAgentContext } from '../contexts/AgentContextProvider';
import { useStyleContext } from '../contexts/StyleContextProvider';
import { ExportFormat } from '../types/export';
import { exportToJSON, importFromJSON, downloadFile, generateFileName } from '../utils/exportUtils';
import { getNodesBounds, getViewportForBounds, Panel } from 'reactflow';
import { toPng, toSvg } from 'dom-to-image-more';

export const ExportImportPanel: React.FC = () => {
  const { diagramVariants, selectedTab, importDiagram } = useAgentContext();
  const { state: styleState } = useStyleContext();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      setError(null);
      if (!diagramVariants) {
        throw new Error('내보낼 다이어그램이 없습니다.');
      }

      if (format === 'json') {
        const data = exportToJSON(diagramVariants, styleState.currentTheme);
        const jsonString = JSON.stringify(data, null, 2);
        const fileName = generateFileName(selectedTab, 'json');
        downloadFile(jsonString, fileName, 'application/json');
      } else {
        const flowContainer = document.querySelector('.react-flow');
        if (!flowContainer) {
          throw new Error('다이어그램을 찾을 수 없습니다.');
        }

        const downloadImage = (dataUrl: string, extension: string) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = generateFileName(selectedTab, extension);
          link.click();
        };

        const options = {
          backgroundColor: styleState.currentTheme.background,
          quality: 1,
          pixelRatio: 2
        };

        if (format === 'png') {
          const dataUrl = await toPng(flowContainer as HTMLElement, options);
          downloadImage(dataUrl, 'png');
        } else if (format === 'svg') {
          const dataUrl = await toSvg(flowContainer as HTMLElement, options);
          downloadImage(dataUrl, 'svg');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          if (typeof content !== 'string') {
            throw new Error('파일을 읽을 수 없습니다.');
          }

          const result = await importFromJSON(content);
          if (!result.success || !result.data) {
            throw new Error(result.error || '파일을 가져올 수 없습니다.');
          }

          importDiagram(result.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : '파일 처리 중 오류가 발생했습니다.');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일을 가져오는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleExport('json')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          JSON 내보내기
        </button>
        <button
          onClick={() => handleExport('png')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          PNG 내보내기
        </button>
        <button
          onClick={() => handleExport('svg')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          SVG 내보내기
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          JSON 가져오기
        </button>
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
}; 