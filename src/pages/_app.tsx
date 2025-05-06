import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { AgentContextProvider } from '../contexts/AgentContextProvider';
import { StyleContextProvider } from '../contexts/StyleContextProvider';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <AgentContextProvider>
        <StyleContextProvider>
          <Component {...pageProps} />
        </StyleContextProvider>
      </AgentContextProvider>
    </ThemeProvider>
  );
} 