'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  StyleState,
  StyleAction,
  DiagramTheme,
  NodeStyle,
  EdgeStyle,
  DEFAULT_THEME
} from '../types/style';

interface StyleContextType {
  state: StyleState;
  setTheme: (theme: DiagramTheme) => void;
  addCustomTheme: (theme: DiagramTheme) => void;
  updateNodeStyle: (style: Partial<NodeStyle>) => void;
  updateEdgeStyle: (style: Partial<EdgeStyle>) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
}

const StyleContext = createContext<StyleContextType | null>(null);

const initialState: StyleState = {
  currentTheme: DEFAULT_THEME,
  customThemes: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  isDarkMode: false
};

function styleReducer(state: StyleState, action: StyleAction): StyleState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        currentTheme: action.payload
      };
    case 'ADD_CUSTOM_THEME':
      return {
        ...state,
        customThemes: [...state.customThemes, action.payload]
      };
    case 'UPDATE_NODE_STYLE':
      return {
        ...state,
        currentTheme: {
          ...state.currentTheme,
          nodeStyle: {
            ...state.currentTheme.nodeStyle,
            ...action.payload
          }
        }
      };
    case 'UPDATE_EDGE_STYLE':
      return {
        ...state,
        currentTheme: {
          ...state.currentTheme,
          edgeStyle: {
            ...state.currentTheme.edgeStyle,
            ...action.payload
          }
        }
      };
    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.payload,
        selectedEdgeId: null
      };
    case 'SELECT_EDGE':
      return {
        ...state,
        selectedNodeId: null,
        selectedEdgeId: action.payload
      };
    default:
      return state;
  }
}

export const StyleContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(styleReducer, initialState);

  const setTheme = useCallback((theme: DiagramTheme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const addCustomTheme = useCallback((theme: DiagramTheme) => {
    dispatch({ type: 'ADD_CUSTOM_THEME', payload: theme });
  }, []);

  const updateNodeStyle = useCallback((style: Partial<NodeStyle>) => {
    dispatch({ type: 'UPDATE_NODE_STYLE', payload: style });
  }, []);

  const updateEdgeStyle = useCallback((style: Partial<EdgeStyle>) => {
    dispatch({ type: 'UPDATE_EDGE_STYLE', payload: style });
  }, []);

  const selectNode = useCallback((nodeId: string | null) => {
    dispatch({ type: 'SELECT_NODE', payload: nodeId });
  }, []);

  const selectEdge = useCallback((edgeId: string | null) => {
    dispatch({ type: 'SELECT_EDGE', payload: edgeId });
  }, []);

  const value = {
    state,
    setTheme,
    addCustomTheme,
    updateNodeStyle,
    updateEdgeStyle,
    selectNode,
    selectEdge
  };

  return (
    <StyleContext.Provider value={value}>
      {children}
    </StyleContext.Provider>
  );
};

export const useStyleContext = () => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyleContext must be used within a StyleContextProvider');
  }
  return context;
}; 