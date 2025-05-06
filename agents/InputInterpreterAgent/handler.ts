// Custom interfaces to replace @google/adk
interface Agent {
  process(input: any, context: AgentContext): Promise<AgentResult<any>>;
}

interface AgentContext {
  logger: Logger;
  call(agentName: string, input: any): Promise<any>;
}

interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Logger {
  info(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

import { DiagramData } from '../../types/diagram';
import { v4 as uuidv4 } from 'uuid';

export class InputInterpreterAgent implements Agent {
  async process(
    input: { user_input: string },
    context: AgentContext
  ): Promise<AgentResult<{ base_structure: DiagramData }>> {
    const logger = context.logger;
    
    try {
      const keywords = this.extractKeywords(input.user_input);
      const nodes = this.createNodes(keywords);
      const edges = this.createEdges(nodes);

      const base_structure: DiagramData = { nodes, edges };
      
      logger.info('Generated base structure:', base_structure);
      
      return {
        success: true,
        data: { base_structure }
      };
    } catch (err) {
      const error = err as Error;
      logger.error('Error in interpretation:', error);
      return {
        success: false,
        error: error.message || 'Failed to interpret input'
      };
    }
  }

  private extractKeywords(input: string): string[] {
    const stopWords = ['a', 'the', 'is', 'are', 'and'];
    return input
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 4);
  }

  private createNodes(keywords: string[]): DiagramData['nodes'] {
    return keywords.map((keyword, index) => ({
      id: uuidv4(),
      text: keyword,
      x: 100 + (index % 2) * 200,
      y: 100 + Math.floor(index / 2) * 150
    }));
  }

  private createEdges(nodes: DiagramData['nodes']): DiagramData['edges'] {
    return nodes.slice(0, -1).map((node, index) => ({
      from: node.id,
      to: nodes[index + 1].id
    }));
  }
} 