# 📘 docs/diagram-layout-guide.md

이 문서는 Flowchart, Mindmap, Tree 도식 타입에 대한 기본 레이아웃 알고리즘과 Mermaid 코드 변환 방식을 Cursor가 이해하고 구현할 수 있도록 안내합니다.

## 🟦 Flowchart Layout (수직 흐름)

### 📌 개념
- 노드를 위에서 아래로 일렬로 배치합니다.
- x는 고정, y는 일정 간격으로 증가합니다.

### 💡 구현 예시 (JS)
```ts
const baseX = 200;
const gapY = 150;

nodes.map((node, index) => ({
  ...node,
  x: baseX,
  y: gapY * index
}));
```

### 🔁 Mermaid 변환 예시
```ts
function toMermaidFlowchart(nodes: Node[], edges: Edge[]): string {
  const lines = ['graph TD'];
  for (const node of nodes) {
    lines.push(`${node.id}["${node.text}"]`);
  }
  for (const edge of edges) {
    lines.push(`${edge.from} --> ${edge.to}`);
  }
  return lines.join('\n');
}
```

---

## 🟨 Mindmap Layout (방사형 중심 확장)

### 📌 개념
- 첫 노드를 중심에 두고, 나머지를 원형으로 배치합니다.
- 각도별로 퍼지게 하여 방사형 구조를 만듭니다.

### 💡 구현 예시 (JS)
```ts
const centerX = 300, centerY = 300, radius = 200;
const angleStep = (2 * Math.PI) / (nodes.length - 1);

nodes.map((node, index) => {
  if (index === 0) return { ...node, x: centerX, y: centerY }; // 중심 노드
  const angle = angleStep * (index - 1);
  return {
    ...node,
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  };
});
```

### 🔁 Mermaid
- Mermaid는 mindmap을 직접 지원하지 않습니다.
- 대신 Markmap 또는 다른 라이브러리를 고려하세요.

---

## 🟩 Tree Layout (계층 트리 구조)

### 📌 개념
- 첫 노드를 루트로 하고 하위 노드를 계층적으로 배치합니다.
- 수평 또는 수직 트리로 구성할 수 있습니다.

### 💡 구현 예시 (JS)
```ts
const rootNode = nodes[0];
const children = nodes.slice(1);

return nodes.map((node, index) => {
  if (index === 0) return { ...node, x: 300, y: 100 };
  const level = Math.floor((index - 1) / 2) + 1;
  const posInLevel = (index - 1) % 2;
  return {
    ...node,
    x: 150 + posInLevel * 300,
    y: 100 + level * 150
  };
});
```

### 🔁 Mermaid 변환 예시
```ts
function toMermaidTree(nodes: Node[], edges: Edge[]): string {
  const lines = ['graph TD'];
  for (const node of nodes) {
    lines.push(`${node.id}["${node.text}"]`);
  }
  for (const edge of edges) {
    lines.push(`${edge.from} --> ${edge.to}`);
  }
  return lines.join('\n');
}
```

---

## ✅ 요약

| 도식 유형 | 레이아웃 방식 | Mermaid 지원 |
|------------|----------------|----------------|
| Flowchart | 수직 흐름형 | ✅ 가능 (graph TD) |
| Mindmap | 방사형 확장 | ❌ Markmap 권장 |
| Tree      | 계층적 트리 | ✅ 가능 (graph TD or LR) |

Cursor는 이 문서를 참조하여 각 도식 Agent에 맞는 레이아웃 및 변환 기능을 구현할 수 있습니다.

