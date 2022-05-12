import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { SWRConfig } from 'swr';
import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import dayjs from 'dayjs';

// Initialize DayJS
import 'dayjs/locale/it';
dayjs.locale('it');

import fetchData from '@lib/api';

import { AuthProvider } from 'contexts/auth';

import App from './App';

import './styles/global.css';

const root = createRoot(document.getElementById('root') as Element);
root.render(
    <StrictMode>
        <SWRConfig
            value={{
                suspense: true,
                fetcher: fetchData,
                revalidateOnFocus: false,
                revalidateOnMount: false
            }}
        >
            <MantineProvider>
                <NotificationsProvider autoClose={5000}>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </NotificationsProvider>
            </MantineProvider>
        </SWRConfig>
    </StrictMode>
);
