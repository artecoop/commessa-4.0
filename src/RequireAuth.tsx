import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@contexts/auth';

export const RequireAuth = () => {
    const { isLoading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isLoading && !isAuthenticated) {
        return <Navigate to={`/login?returnUrl=${encodeURI(location.pathname)}`} replace />;
    }

    return <Outlet />;
};
