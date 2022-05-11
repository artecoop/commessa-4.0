import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';

import { RequireAuth } from './RequireAuth';

import ErrorBoundary from '@components/error-boundary';

const Login = lazy(() => import('./pages/login'));
const Home = lazy(() => import('./pages/home'));
const Fields = lazy(() => import('./pages/fields'));

export default function App() {
    return (
        <Router>
            <ErrorBoundary>
                <Suspense fallback={<LoadingOverlay visible={true} />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route element={<RequireAuth />}>
                            <Route path="/" element={<Home />} />

                            <Route path="/fields" element={<Fields />} />
                        </Route>
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </Router>
    );
}
