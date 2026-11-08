import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './app/App.tsx';
import { queryClient } from './app/queryClient.ts';
import './shared/styles/global.css';
import './shared/styles/typography.css';

const rootElement = document.getElementById('root');
if (rootElement === null) throw new Error('The root element is missing.');

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
