import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';

import { RequireAuth } from './RequireAuth';

import ErrorBoundary from '@components/error-boundary';

const Login = lazy(() => import('./pages/login'));
const Home = lazy(() => import('./pages/home'));
const Commesse = lazy(() => import('./pages/list'));
const Manage = lazy(() => import('./pages/manage'));

export default function App() {
    return (
        <Router>
            <ErrorBoundary>
                <Suspense fallback={<LoadingOverlay visible={true} />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route element={<RequireAuth />}>
                            <Route path="/" element={<Home />} />

                            <Route path="/commesse">
                                <Route index element={<Commesse />} />
                                <Route path="manage" element={<Manage />} />
                                <Route path="manage/:id" element={<Manage />} />
                            </Route>
                        </Route>
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </Router>
    );
}
