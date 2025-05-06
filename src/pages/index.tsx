import dynamic from 'next/dynamic';

const DiagramPreviewPage = dynamic(() => import('./DiagramPreviewPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
    </div>
  ),
});

export default DiagramPreviewPage; 