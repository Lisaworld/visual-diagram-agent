import React, { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import EditableDiagram from './EditableDiagram';
import { ThemeToggle } from './ThemeToggle';

interface DiagramEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: uuidv4(),
      type: 'custom',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: 'New Node' },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(nodes, edges);
  }, [nodes, edges, onSave]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <button
            onClick={handleAddNode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Node
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
        <ThemeToggle />
      </div>
      <div className="flex-1">
        <EditableDiagram
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
        />
      </div>
    </div>
  );
};

export default DiagramEditor; 