import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// Production API URL interceptor (for Vercel deployment connected to Render backend)
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
if (rawApiUrl) {
  const normalizedBase = rawApiUrl.replace(/\/+$/, '');
  const originalFetch = window.fetch;
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      if (input.startsWith('/api')) {
        return originalFetch(`${normalizedBase}${input}`, init);
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api')) {
        return originalFetch(`${normalizedBase}${input.pathname}${input.search}`, init);
      }
    }
    return originalFetch(input, init);
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
