import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { iconMapper } from './iconMapper';
import { useStyleContext } from '../contexts/StyleContextProvider';

interface NodeData {
  label: string;
  isRoot?: boolean;
  isLeft?: boolean;
  depth?: number;
}

const getNodeStyle = (
  isDark: boolean,
  type: string,
  data: NodeData
) => {
  const baseStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const darkModeStyle = isDark ? {
    backgroundColor: '#2d2d2d',
    borderColor: '#404040',
    color: '#f3f3f3',
  } : {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    color: '#1a202c',
  };

  // 마인드맵 스타일
  if (type === 'mindmap') {
    const mindmapColors = [
      { bg: isDark ? '#2d3748' : '#ebf8ff', border: isDark ? '#4a5568' : '#90cdf4' }, // 파랑
      { bg: isDark ? '#2d3748' : '#faf5ff', border: isDark ? '#4a5568' : '#d6bcfa' }, // 보라
      { bg: isDark ? '#2d3748' : '#f0fff4', border: isDark ? '#4a5568' : '#9ae6b4' }, // 초록
    ];

    if (data.isRoot) {
      return {
        ...baseStyle,
        ...darkModeStyle,
        backgroundColor: isDark ? '#3c366b' : '#ebf4ff',
        borderColor: isDark ? '#4c51bf' : '#7f9cf5',
        fontWeight: 600,
      };
    }

    const colorIndex = data.isLeft ? 0 : 2;
    return {
      ...baseStyle,
      backgroundColor: mindmapColors[colorIndex].bg,
      borderColor: mindmapColors[colorIndex].border,
      color: isDark ? '#f3f3f3' : '#1a202c',
    };
  }

  // 트리 스타일
  if (type === 'tree') {
    const depth = data.depth || 0;
    const treeColors = [
      { bg: isDark ? '#2d3748' : '#ebf8ff', border: isDark ? '#4a5568' : '#90cdf4' }, // 깊이 0
      { bg: isDark ? '#2a4365' : '#e6fffa', border: isDark ? '#2c5282' : '#81e6d9' }, // 깊이 1
      { bg: isDark ? '#2c5282' : '#e6fffa', border: isDark ? '#2b6cb0' : '#63b3ed' }, // 깊이 2
      { bg: isDark ? '#2b6cb0' : '#ebf8ff', border: isDark ? '#3182ce' : '#4299e1' }, // 깊이 3+
    ];

    const colorIndex = Math.min(depth, treeColors.length - 1);
    return {
      ...baseStyle,
      backgroundColor: treeColors[colorIndex].bg,
      borderColor: treeColors[colorIndex].border,
      color: isDark ? '#f3f3f3' : '#1a202c',
    };
  }

  // 플로우차트 기본 스타일
  return {
    ...baseStyle,
    ...darkModeStyle,
  };
};

const CustomNode = ({ data, isConnectable, type = 'flowchart' }: NodeProps) => {
  const { state: { isDarkMode } } = useStyleContext();
  const { emoji, Icon } = iconMapper(data.label);
  const nodeStyle = getNodeStyle(isDarkMode, type, data);
  
  return (
    <div style={nodeStyle}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className={`w-2 h-2 ${isDarkMode ? '!bg-gray-400' : '!bg-gray-500'}`}
      />
      
      <div className="flex items-center">
        {(emoji || Icon) && (
          <div className="text-xl mr-2 flex items-center">
            {emoji || (Icon && <Icon className="w-5 h-5" />)}
          </div>
        )}
        <div className="text-sm font-medium">
          {data.label}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className={`w-2 h-2 ${isDarkMode ? '!bg-gray-400' : '!bg-gray-500'}`}
      />
    </div>
  );
};

export default memo(CustomNode); 