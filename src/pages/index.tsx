import dynamic from 'next/dynamic';

const DiagramPreviewPage = dynamic(() => import('./DiagramPreviewPage'), {
  ssr: false,
});

export default DiagramPreviewPage; 