export interface NodeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
  fontSize: number;
  fontFamily: string;
  padding: number;
}

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  dash: number[];
  arrowSize: number;
}

export interface DiagramTheme {
  name: string;
  nodeStyle: NodeStyle;
  edgeStyle: EdgeStyle;
  background: string;
}

export const DEFAULT_THEME: DiagramTheme = {
  name: 'default',
  nodeStyle: {
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 1,
    radius: 50,
    fontSize: 14,
    fontFamily: 'Arial',
    padding: 10
  },
  edgeStyle: {
    stroke: '#666666',
    strokeWidth: 1,
    dash: [],
    arrowSize: 10
  },
  background: '#ffffff'
};

export const DARK_THEME: DiagramTheme = {
  name: 'dark',
  nodeStyle: {
    fill: '#2d2d2d',
    stroke: '#ffffff',
    strokeWidth: 1,
    radius: 50,
    fontSize: 14,
    fontFamily: 'Arial',
    padding: 10
  },
  edgeStyle: {
    stroke: '#ffffff',
    strokeWidth: 1,
    dash: [],
    arrowSize: 10
  },
  background: '#1a1a1a'
};

export interface StyleState {
  currentTheme: DiagramTheme;
  customThemes: DiagramTheme[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDarkMode: boolean;
}

export type StyleAction =
  | { type: 'SET_THEME'; payload: DiagramTheme }
  | { type: 'ADD_CUSTOM_THEME'; payload: DiagramTheme }
  | { type: 'UPDATE_NODE_STYLE'; payload: Partial<NodeStyle> }
  | { type: 'UPDATE_EDGE_STYLE'; payload: Partial<EdgeStyle> }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'SELECT_EDGE'; payload: string | null }; 