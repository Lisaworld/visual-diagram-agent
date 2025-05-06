# Diagram 구조 정의

## Node
```ts
type Node = {
  id: string;
  text: string;
  x: number;
  y: number;
};
```

## Edge
```ts
type Edge = {
  from: string;
  to: string;
};
```

## DiagramData
```ts
type DiagramData = {
  nodes: Node[];
  edges: Edge[];
};
```
