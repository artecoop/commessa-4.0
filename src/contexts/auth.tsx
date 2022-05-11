import { useEffect, useState, useContext, createContext, PropsWithChildren } from 'react';
import fetchData from '@lib/api';
import { LoginResult, Profile } from 'types';

type ContextProps = {
    isLoading?: boolean;
    isAuthenticated?: boolean;
    profile?: Profile;
    login?(email: string, password: string): Promise<void>;
    logout?(): Promise<void>;
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
        setIsAuthenticated(sessionStorage.getItem(TOKEN_KEY) !== undefined && sessionStorage.getItem(TOKEN_KEY) !== '');
        const sessionProfile = sessionStorage.getItem(PROFILE_KEY);
        if (sessionProfile) {
            const p = JSON.parse(sessionProfile) as Profile;
            setProfile(p);
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const result = await fetchData('/auth/login', { email, password }, 'POST');
            sessionStorage.setItem(TOKEN_KEY, result.data.access_token);

            const me = await fetchData('/users/me', undefined, 'GET');
            sessionStorage.setItem(PROFILE_KEY, JSON.stringify(me.data));

            setIsAuthenticated(true);
        } catch (e) {
            throw new Error('Non disponi dei diritti necessari per entrare');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        sessionStorage.clear();
        setProfile(undefined);
        setIsAuthenticated(false);
    };

    return <AuthContext.Provider value={{ isLoading, isAuthenticated, profile, login, logout }}>{children}</AuthContext.Provider>;
};
