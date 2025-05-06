declare module '@google/adk' {
  export interface ADKConfig {
    apiKey?: string;
    credentials?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    scopes?: string[];
  }

  export interface ADKResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  }

  export interface ADKError extends Error {
    code: string;
    status: number;
    response?: ADKResponse;
  }

  export class ADK {
    constructor(config: ADKConfig);
    
    // Core methods
    initialize(): Promise<void>;
    authenticate(): Promise<void>;
    
    // Agent methods
    createAgent(params: any): Promise<ADKResponse>;
    updateAgent(agentId: string, params: any): Promise<ADKResponse>;
    deleteAgent(agentId: string): Promise<ADKResponse>;
    listAgents(): Promise<ADKResponse>;
    
    // Task methods
    createTask(params: any): Promise<ADKResponse>;
    executeTask(taskId: string): Promise<ADKResponse>;
    getTaskResult(taskId: string): Promise<ADKResponse>;
    
    // Utility methods
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback?: (data: any) => void): void;
  }

  export default ADK;
} 