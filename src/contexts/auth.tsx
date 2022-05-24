import { useEffect, useState, useContext, createContext, PropsWithChildren } from 'react';

import { apiGet, apiPost } from '@lib/api';

import { FetchResult, LoginResult, Profile } from 'types';

type ContextProps = {
    isLoading?: boolean;
    isAuthenticated?: boolean;
    profile?: Profile;
    login?(email: string, password: string): Promise<void>;
    logout?(): Promise<void>;
    isInRole?(role: string | string[]): boolean;
};

export const AuthContext = createContext<Partial<ContextProps>>({});
export const useAuth = (): Partial<ContextProps> => useContext(AuthContext);

export const AuthProvider = ({ children }: PropsWithChildren<ContextProps>) => {
    const TOKEN_KEY = 'token';
    const PROFILE_KEY = 'profile';

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profile, setProfile] = useState<Profile>();

    useEffect(() => {
        const sessionToken = sessionStorage.getItem(TOKEN_KEY);
        if (sessionToken) {
            const token = JSON.parse(sessionToken) as LoginResult;

            if (token.expires < Date.now()) {
                logout();
                return;
            }

            setIsAuthenticated(true);

            const sessionProfile = sessionStorage.getItem(PROFILE_KEY);
            if (sessionProfile) {
                setProfile(JSON.parse(sessionProfile));
            }
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const result = await apiPost<FetchResult<LoginResult>>('/auth/login', { email, password });

            result.data.expires = Date.now() + result.data.expires;

            sessionStorage.setItem(TOKEN_KEY, JSON.stringify(result.data));

            const me = await apiGet<FetchResult<Profile>>('/users/me');

            const roles = [
                { id: '433113b1-84b2-4e8a-91c5-521749bcb244', name: 'Administrator' },
                { id: 'a6830522-82e0-4e79-bd53-a02b6bf04039', name: 'Editor' },
                { id: 'f4127167-2845-41ab-bd4c-bee8a34c0066', name: 'Worker' }
            ];

            me.data.role = roles.find(r => r.id === me.data.role)?.name || 'Worker';

            sessionStorage.setItem(PROFILE_KEY, JSON.stringify(me.data));

            setProfile(me.data);
            setIsAuthenticated(true);
        } catch (e) {
            throw new Error('Non disponi dei diritti necessari per entrare');
        } finally {
            setIsLoading(false);
        }
    };

    const isInRole = (role: string | string[]) => {
        if (!profile) {
            return false;
        }

        if (Array.isArray(role)) {
            return role.includes(profile.role);
        }

        return role === profile.role;
    };

    const logout = async (): Promise<void> => {
        sessionStorage.clear();
        setProfile(undefined);
        setIsAuthenticated(false);
    };

    return <AuthContext.Provider value={{ isLoading, isAuthenticated, profile, login, logout, isInRole }}>{children}</AuthContext.Provider>;
};
