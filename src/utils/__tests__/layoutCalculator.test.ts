import {
  calculateFlowchartLayout,
  calculateMindmapLayout,
  calculateTreeLayout,
  calculateLayout
} from '../layoutCalculator';
import { DiagramData } from '../../types/diagram';

describe('layoutCalculator', () => {
  const mockDiagramData: DiagramData = {
    nodes: [
      { id: 'node1', text: 'Node 1', x: 0, y: 0 },
      { id: 'node2', text: 'Node 2', x: 0, y: 0 },
      { id: 'node3', text: 'Node 3', x: 0, y: 0 },
    ],
    edges: [
      { from: 'node1', to: 'node2' },
      { from: 'node2', to: 'node3' },
    ],
  };

  describe('calculateFlowchartLayout', () => {
    it('arranges nodes horizontally', () => {
      const result = calculateFlowchartLayout(mockDiagramData);

      // 노드들이 수평으로 배치되었는지 확인
      expect(result.nodes[0].y).toBe(result.nodes[1].y);
      expect(result.nodes[1].y).toBe(result.nodes[2].y);

      // 노드들이 일정한 간격으로 배치되었는지 확인
      const spacing = result.nodes[1].x - result.nodes[0].x;
      expect(result.nodes[2].x - result.nodes[1].x).toBe(spacing);
    });
  });

  describe('calculateMindmapLayout', () => {
    it('arranges nodes in radial pattern', () => {
      const result = calculateMindmapLayout(mockDiagramData);

      // 중앙 노드 위치 확인
      expect(result.nodes[0].x).toBe(400); // CANVAS_WIDTH / 2
      expect(result.nodes[0].y).toBe(300); // CANVAS_HEIGHT / 2

      // 다른 노드들이 중앙 노드를 기준으로 방사형으로 배치되었는지 확인
      const distanceFromCenter1 = Math.sqrt(
        Math.pow(result.nodes[1].x - result.nodes[0].x, 2) +
        Math.pow(result.nodes[1].y - result.nodes[0].y, 2)
      );
      const distanceFromCenter2 = Math.sqrt(
        Math.pow(result.nodes[2].x - result.nodes[0].x, 2) +
        Math.pow(result.nodes[2].y - result.nodes[0].y, 2)
      );

      // 모든 노드가 중심으로부터 같은 거리에 있는지 확인
      expect(Math.abs(distanceFromCenter1 - distanceFromCenter2)).toBeLessThan(1);
    });

    it('handles empty data', () => {
      const emptyData: DiagramData = { nodes: [], edges: [] };
      const result = calculateMindmapLayout(emptyData);
      expect(result).toEqual(emptyData);
    });
  });

  describe('calculateTreeLayout', () => {
    it('arranges nodes in hierarchical structure', () => {
      const result = calculateTreeLayout(mockDiagramData);

      // 부모 노드가 자식 노드보다 왼쪽에 있는지 확인
      expect(result.nodes[0].x).toBeLessThan(result.nodes[1].x);
      expect(result.nodes[1].x).toBeLessThan(result.nodes[2].x);

      // 각 레벨의 노드들이 수직으로 적절히 분포되어 있는지 확인
      const yPositions = result.nodes.map(node => node.y);
      expect(Math.min(...yPositions)).toBeGreaterThan(0);
      expect(Math.max(...yPositions)).toBeLessThan(600); // CANVAS_HEIGHT
    });

    it('handles empty data', () => {
      const emptyData: DiagramData = { nodes: [], edges: [] };
      const result = calculateTreeLayout(emptyData);
      expect(result).toEqual(emptyData);
    });
  });

  describe('calculateLayout', () => {
    it('applies correct layout based on type', () => {
      const flowchartResult = calculateLayout(mockDiagramData, 'flowchart');
      const mindmapResult = calculateLayout(mockDiagramData, 'mindmap');
      const treeResult = calculateLayout(mockDiagramData, 'tree');

      // 각 레이아웃이 올바르게 적용되었는지 확인
      expect(flowchartResult.nodes[0].y).toBe(flowchartResult.nodes[1].y); // 플로우차트: 수평 배치
      expect(mindmapResult.nodes[0].x).toBe(400); // 마인드맵: 중앙 노드
      expect(treeResult.nodes[0].x).toBeLessThan(treeResult.nodes[1].x); // 트리: 계층 구조
    });
  });
}); 