import React, { useEffect, useState } from 'react';
import ADKService from '../services/adkService';

export const ADKExample: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const initializeADK = async () => {
      try {
        const adkService = ADKService.getInstance();
        await adkService.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize ADK');
      }
    };

    initializeADK();
  }, []);

  const handleCreateAgent = async () => {
    try {
      const adkService = ADKService.getInstance();
      const agent = await adkService.createAgent({
        name: 'Test Agent',
        description: 'A test agent created using TypeScript',
        capabilities: ['TEXT_GENERATION', 'CODE_GENERATION'],
      });
      setResult(agent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Error: {error}
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="p-4">
        Initializing ADK...
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ADK Example</h2>
      <button
        onClick={handleCreateAgent}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Test Agent
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}; 