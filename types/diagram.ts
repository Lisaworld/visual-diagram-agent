export interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface Edge {
  from: string;
  to: string;
}

export interface DiagramData {
  nodes: Node[];
  edges: Edge[];
}

export interface DiagramVariants {
  flowchart: DiagramData;
  mindmap: DiagramData;
  tree: DiagramData;
}

export type DiagramType = 'flowchart' | 'mindmap' | 'tree';
export type ExportFormat = 'json' | 'mermaid' | 'image';
