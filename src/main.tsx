import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './app/App.tsx';
import './shared/styles/global.css';
import './shared/styles/typography.css';

const rootElement = document.getElementById('root');
if (rootElement === null) throw new Error('The root element is missing.');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
