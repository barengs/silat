import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from '@/store';
import Main from '@/Main';
import '../css/app.css';

// Initialize React Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
});

// Apply saved theme on initial load
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.classList.toggle('dark', savedTheme === 'dark');

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Main />
                </BrowserRouter>
            </QueryClientProvider>
        </Provider>
    </React.StrictMode>
);
