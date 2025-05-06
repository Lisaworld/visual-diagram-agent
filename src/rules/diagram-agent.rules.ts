// file: rules/diagram-agent.rules.ts

export const rules = [
    {
      name: "노드 텍스트 수정 규칙",
      description: "사용자가 노드를 클릭하면 텍스트 편집이 가능해야 하고, 변경 사항은 실시간으로 상태에 반영되어야 한다.",
      applyTo: ["EditableDiagram.tsx", "diagramStore.ts"],
      examples: [
        "노드 더블클릭 시 <input> 또는 contentEditable을 표시",
        "엔터를 누르면 입력 종료 및 상태 업데이트"
      ]
    },
    {
      name: "도식 구조 생성 규칙",
      description: "사용자 입력을 기반으로 세 가지 도식 구조(Flowchart, Mindmap, Tree)를 생성해야 한다. 초기에는 mock 데이터로 구현한다.",
      applyTo: ["diagramGenerator.ts"],
      examples: [
        "generateFlowchartData(input: string): DiagramData",
        "generateMindmapData(input: string): DiagramData"
      ]
    },
    {
      name: "탭 전환 시 상태 유지 규칙",
      description: "각 도식 탭은 독립적으로 상태를 유지하며, 사용자가 탭을 전환해도 해당 도식의 편집 상태가 유지되어야 한다.",
      applyTo: ["DiagramViewTabs.tsx", "diagramStore.ts"],
      examples: [
        "탭 별로 diagramState를 구분해서 저장",
        "탭 전환 시 해당 상태를 EditableDiagram에 주입"
      ]
    },
    {
      name: "도식 코드 export 규칙",
      description: "사용자는 수정된 도식을 Mermaid 코드 혹은 JSON 형식으로 복사 및 다운로드할 수 있어야 한다.",
      applyTo: ["ExportArea.tsx", "convertToMermaid.ts"],
      examples: [
        "Copy to Clipboard 버튼 제공",
        "JSON → Mermaid 변환 함수 생성"
      ]
    },
    {
      name: "초기 상태 관리 규칙",
      description: "사용자의 입력과 각 도식 스타일의 상태를 전역 상태로 관리하여 재사용성과 일관성을 높인다.",
      applyTo: ["diagramStore.ts"],
      examples: [
        "zustand로 각 diagramType 별 상태 생성",
        "updateNodeText(id: string, newText: string)"
      ]
    },
    {
        name: "노드 수정 가능 도식 규칙",
        description: "도식 노드는 클릭 시 텍스트 수정 가능해야 하며, 상태는 글로벌로 관리됩니다.",
        applyTo: ["EditableDiagram.tsx"],
        examples: [
          "노드 클릭 → input 필드로 전환",
          "엔터 시 상태 업데이트 → 다이어그램 리렌더링"
        ]
      },
      {
        name: "도식 스타일 생성 규칙",
        description: "입력된 개념을 기반으로 Flowchart / Mindmap / Tree 구조를 생성하는 함수를 작성해야 합니다.",
        applyTo: ["diagramGenerator.ts"],
        examples: ["generateFlowchartData(input)", "generateMindmapData(input)"]
      }
  ]
  