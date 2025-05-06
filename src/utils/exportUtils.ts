import { Stage } from 'konva/lib/Stage';
import { DiagramExportData, ExportOptions, ImportResult } from '../types/export';
import { DiagramVariants } from '../types/diagram';
import { DiagramTheme } from '../types/style';

export const VERSION = '1.0.0';

export async function exportToImage(stage: Stage, options: ExportOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const dataURL = stage.toDataURL({
        pixelRatio: options.scale || 2,
        mimeType: options.format === 'png' ? 'image/png' : 'image/svg+xml',
        quality: options.quality || 1,
        ...(options.background ? { backgroundColor: options.background } : {})
      });
      resolve(dataURL);
    } catch (error: unknown) {
      reject(new Error(error instanceof Error ? error.message : '이미지 내보내기 실패'));
    }
  });
}

export function exportToJSON(
  diagrams: DiagramVariants,
  theme: DiagramTheme,
  metadata?: Partial<DiagramExportData['metadata']>
): DiagramExportData {
  return {
    version: VERSION,
    timestamp: Date.now(),
    diagrams,
    theme,
    metadata: {
      creator: 'Visual Thinking Agent',
      lastModified: Date.now(),
      ...metadata
    }
  };
}

export async function importFromJSON(jsonData: string): Promise<ImportResult> {
  try {
    const data: DiagramExportData = JSON.parse(jsonData);
    
    // 버전 검사
    if (!data.version || data.version !== VERSION) {
      return {
        success: false,
        error: '지원하지 않는 파일 버전입니다.'
      };
    }

    // 데이터 구조 검증
    if (!data.diagrams || !data.theme) {
      return {
        success: false,
        error: '잘못된 파일 형식입니다.'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: '파일을 파싱할 수 없습니다: ' + error.message
    };
  }
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const generateFileName = (diagramType: string, extension: string): string => {
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join('');
  
  return `${diagramType}_${timestamp}.${extension}`;
}; 