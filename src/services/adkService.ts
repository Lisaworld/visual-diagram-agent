import ADK from '@google/adk';

class ADKService {
  private adk: ADK;
  private static instance: ADKService;

  private constructor() {
    this.adk = new ADK({
      credentials: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || '',
      },
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
      ],
    });
  }

  public static getInstance(): ADKService {
    if (!ADKService.instance) {
      ADKService.instance = new ADKService();
    }
    return ADKService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      await this.adk.initialize();
      await this.adk.authenticate();
    } catch (error) {
      console.error('Failed to initialize ADK:', error);
      throw error;
    }
  }

  public async createAgent(params: {
    name: string;
    description?: string;
    capabilities: string[];
  }) {
    try {
      const response = await this.adk.createAgent(params);
      return response.data;
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  }

  public async executeTask(taskId: string, input: any) {
    try {
      const response = await this.adk.executeTask(taskId);
      return response.data;
    } catch (error) {
      console.error('Failed to execute task:', error);
      throw error;
    }
  }

  public async getTaskResult(taskId: string) {
    try {
      const response = await this.adk.getTaskResult(taskId);
      return response.data;
    } catch (error) {
      console.error('Failed to get task result:', error);
      throw error;
    }
  }
}

export default ADKService; 