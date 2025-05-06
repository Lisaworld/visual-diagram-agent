export const rules = [
  {
    name: "ADK 구조 규칙",
    description: "각 agent는 agent.yaml과 handler.ts 파일을 포함하며, 역할, 입력, 출력, 호출 대상 agent를 정의해야 합니다.",
    applyTo: ["agent.yaml"],
    examples: [
      "name: FlowchartAgent",
      "inputs: [{ name: input, type: structured }]",
      "calls: [MindmapAgent]"
    ]
  },
  {
    name: "Agent 디렉토리 구조 규칙",
    description: "모든 agent는 agents/ 하위에 디렉토리로 존재해야 하며, 관련 파일을 포함해야 합니다.",
    applyTo: ["*"],
    examples: ["agents/FlowchartAgent/agent.yaml", "agents/FlowchartAgent/handler.ts"]
  }
];
