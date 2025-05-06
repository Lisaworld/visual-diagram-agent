import { Node, Edge } from './diagram';

export type ExportFormat = 'json' | 'mermaid' | 'image';

/**
 * Flowchart 및 Tree용 Mermaid 변환 함수
 */
export function toMermaidFlowchart(nodes: Node[], edges: Edge[]): string {
  const lines = ['graph TD'];
  for (const node of nodes) {
    lines.push(`${node.id}["${node.text}"]`);
  }
  for (const edge of edges) {
    lines.push(`${edge.from} --> ${edge.to}`);
  }
  return lines.join('\n');
}

/**
 * Tree 구조도 Flowchart와 동일한 방식으로 변환 가능
 */
export function toMermaidTree(nodes: Node[], edges: Edge[]): string {
  return toMermaidFlowchart(nodes, edges); // 구조 같으므로 동일 처리
}
