import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';

import { RequireAuth } from './RequireAuth';

import ErrorBoundary from '@components/error-boundary';

const Login = lazy(() => import('./pages/login'));
const Commesse = lazy(() => import('./pages/list'));
const Manage = lazy(() => import('./pages/manage'));
const Operative = lazy(() => import('./pages/operative'));
const Print = lazy(() => import('./pages/print'));

const Paper = lazy(() => import('./pages/ancillaries/paper'));
const Processing = lazy(() => import('./pages/ancillaries/processing'));
const RunType = lazy(() => import('./pages/ancillaries/run-types'));
const Varnish = lazy(() => import('./pages/ancillaries/varnish'));

export default function App() {
    return (
        <Router>
            <ErrorBoundary>
                <Suspense fallback={<LoadingOverlay visible={true} />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route element={<RequireAuth />}>
                            <Route path="/" element={<Navigate to="/commesse" replace />} />

                            <Route path="/commesse">
                                <Route index element={<Commesse />} />
                                <Route path="manage" element={<Manage />} />
                                <Route path="manage/:id" element={<Manage />} />
                            </Route>

                            <Route path="operative/:id" element={<Operative />} />

                            <Route path="print/:id" element={<Print />} />

                            <Route path="/papers" element={<Paper />} />
                            <Route path="/processings" element={<Processing />} />
                            <Route path="/run-types" element={<RunType />} />
                            <Route path="/varnish" element={<Varnish />} />
                        </Route>
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </Router>
    );
}
