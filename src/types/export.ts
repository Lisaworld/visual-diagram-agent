import { DiagramData, DiagramVariants } from './diagram';
import { DiagramTheme } from './style';

export type ExportFormat = 'json' | 'png' | 'svg';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number; // PNG 품질 (0-1)
  scale?: number;   // 이미지 스케일
  background?: string; // 배경색
}

export interface DiagramExportData {
  version: string;
  timestamp: number;
  diagrams: DiagramVariants;
  theme: DiagramTheme;
  metadata: {
    creator: string;
    lastModified: number;
    title?: string;
    description?: string;
  };
}

export interface ImportResult {
  success: boolean;
  data?: DiagramExportData;
  error?: string;
}

export type ExportCallback = (result: { success: boolean; error?: string }) => void; 