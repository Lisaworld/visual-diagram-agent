import {
  generateFlowchartData,
  generateMindmapData,
  generateTreeData,
  generateDiagramVariants
} from '../diagramGenerator';

describe('diagramGenerator', () => {
  describe('generateFlowchartData', () => {
    it('should generate nodes and edges for flowchart', () => {
      const input = '시작\n처리\n종료';
      const result = generateFlowchartData(input);

      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);

      // 노드 검증
      expect(result.nodes[0]).toEqual({
        id: 'node-1',
        text: '시작',
        x: 100,
        y: 300
      });

      // 엣지 검증
      expect(result.edges[0]).toEqual({
        from: 'node-1',
        to: 'node-2'
      });
    });

    it('should handle empty input', () => {
      const result = generateFlowchartData('');
      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });
  });

  describe('generateMindmapData', () => {
    it('should generate central node and branches', () => {
      const input = '중심 주제\n가지 1\n가지 2';
      const result = generateMindmapData(input);

      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);

      // 중앙 노드 검증
      expect(result.nodes[0]).toEqual({
        id: 'center',
        text: '중심 주제',
        x: 400,
        y: 300
      });

      // 모든 엣지가 중앙 노드에서 시작하는지 검증
      result.edges.forEach(edge => {
        expect(edge.from).toBe('center');
      });
    });

    it('should handle empty input', () => {
      const result = generateMindmapData('');
      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });
  });

  describe('generateTreeData', () => {
    it('should generate hierarchical structure', () => {
      const input = '루트\n  자식 1\n    손자 1\n  자식 2';
      const result = generateTreeData(input);

      expect(result.nodes).toHaveLength(4);
      expect(result.edges).toHaveLength(3);

      // 노드 레벨 검증
      expect(result.nodes[0].text).toBe('루트');
      expect(result.nodes[1].text).toBe('자식 1');
      expect(result.nodes[2].text).toBe('손자 1');

      // 엣지 연결 검증
      expect(result.edges[0].from).toBe('node-0'); // 루트 → 자식 1
      expect(result.edges[1].from).toBe('node-1'); // 자식 1 → 손자 1
    });

    it('should handle empty input', () => {
      const result = generateTreeData('');
      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });
  });

  describe('generateDiagramVariants', () => {
    it('should generate all three diagram types', () => {
      const input = '주제\n내용 1\n내용 2';
      const result = generateDiagramVariants(input);

      expect(result.flowchart).toBeDefined();
      expect(result.mindmap).toBeDefined();
      expect(result.tree).toBeDefined();

      // 각 다이어그램이 노드를 포함하는지 검증
      expect(result.flowchart.nodes.length).toBeGreaterThan(0);
      expect(result.mindmap.nodes.length).toBeGreaterThan(0);
      expect(result.tree.nodes.length).toBeGreaterThan(0);
    });

    it('should handle empty input for all variants', () => {
      const result = generateDiagramVariants('');

      expect(result.flowchart.nodes).toHaveLength(0);
      expect(result.mindmap.nodes).toHaveLength(0);
      expect(result.tree.nodes).toHaveLength(0);
    });
  });
}); 