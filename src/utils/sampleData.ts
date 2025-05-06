import { DiagramVariants } from '../types/diagram';

export const SAMPLE_DIAGRAM_DATA: DiagramVariants = {
  flowchart: {
    nodes: [
      { id: '1', text: '시작', x: 200, y: 100 },
      { id: '2', text: '데이터 입력', x: 200, y: 200 },
      { id: '3', text: '데이터 처리', x: 200, y: 300 },
      { id: '4', text: '결과 출력', x: 200, y: 400 },
      { id: '5', text: '종료', x: 200, y: 500 }
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' }
    ]
  },
  mindmap: {
    nodes: [
      { id: '1', text: '프로젝트 계획', x: 400, y: 300 },
      { id: '2', text: '요구사항 분석', x: 200, y: 200 },
      { id: '3', text: '설계', x: 600, y: 200 },
      { id: '4', text: '구현', x: 200, y: 400 },
      { id: '5', text: '테스트', x: 600, y: 400 }
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '1', to: '3' },
      { from: '1', to: '4' },
      { from: '1', to: '5' }
    ]
  },
  tree: {
    nodes: [
      { id: '1', text: '최상위', x: 400, y: 100 },
      { id: '2', text: '중간 1', x: 200, y: 200 },
      { id: '3', text: '중간 2', x: 600, y: 200 },
      { id: '4', text: '하위 1', x: 100, y: 300 },
      { id: '5', text: '하위 2', x: 300, y: 300 },
      { id: '6', text: '하위 3', x: 500, y: 300 },
      { id: '7', text: '하위 4', x: 700, y: 300 }
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '1', to: '3' },
      { from: '2', to: '4' },
      { from: '2', to: '5' },
      { from: '3', to: '6' },
      { from: '3', to: '7' }
    ]
  }
}; 