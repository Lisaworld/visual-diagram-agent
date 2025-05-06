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

import { DiagramData, DiagramVariants } from '../../../types/diagram';

export class DiagramBuilderAgent implements Agent {
  async process(
    input: { base_structure: DiagramData },
    context: AgentContext
  ): Promise<AgentResult<{ diagram_variants: DiagramVariants }>> {
    const logger = context.logger;
    logger.info('Generating diagram variants');

    try {
      // Call each diagram type agent
      const [flowchart_data, mindmap_data, tree_data] = await Promise.all([
        context.call('FlowchartAgent', { base_structure: input.base_structure }),
        context.call('MindmapAgent', { base_structure: input.base_structure }),
        context.call('TreeAgent', { base_structure: input.base_structure })
      ]);

      const diagram_variants: DiagramVariants = {
        flowchart: flowchart_data.flowchart_data,
        mindmap: mindmap_data.mindmap_data,
        tree: tree_data.tree_data
      };

      return {
        success: true,
        data: { diagram_variants }
      };
    } catch (err) {
      const error = err as Error;
      logger.error('Error generating diagrams:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate diagrams'
      };
    }
  }
} 