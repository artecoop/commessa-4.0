import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { SWRConfig } from 'swr';
import { MantineProvider, MantineThemeOverride } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import dayjs from 'dayjs';

// Initialize DayJS
import 'dayjs/locale/it';
dayjs.locale('it');

import { apiGet } from '@lib/api';

import { AuthProvider } from 'contexts/auth';

import App from './App';

import './styles/global.css';

const swrConfig = {
    suspense: true,
    fetcher: apiGet,
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateIfStale: false
};

const theme: MantineThemeOverride = {
    fontFamily: 'open sans, sans-serif',
    headings: {
        fontFamily: 'open sans, sans-serif'
    },
    colors: {
        'artecoop-green': ['#f8fce0', '#ecf4ba', '#dfeb91', '#d2e268', '#c5da3e', '#acc125', '#86961b', '#5f6b10', '#384005', '#131600'],
        'artecoop-violet': ['#f3e9ff', '#d7c2f1', '#ba9ce4', '#9f74d7', '#834ccb', '#6a33b2', '#52288b', '#3b1c64', '#23103e', '#0e041a']
    },
    primaryColor: 'artecoop-green',
    primaryShade: 5,
    datesLocale: 'it-IT'
};

const root = createRoot(document.getElementById('root') as Element);
root.render(
    <StrictMode>
        <SWRConfig value={swrConfig}>
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <NotificationsProvider position="top-center" autoClose={5000}>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </NotificationsProvider>
            </MantineProvider>
        </SWRConfig>
    </StrictMode>
);
