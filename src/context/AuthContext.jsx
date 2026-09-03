import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, getToken, setToken } from '../shared/api/client.js';
import { getMe } from '../shared/api/me.js';

/**
 * Авторизация в личном кабинете. Токен живёт в localStorage; профиль
 * подгружается один раз при старте и обновляется после правок в кабинете.
 */
const AuthContext = createContext({
    user: null,
    loading: true,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    setUser: () => {},
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(getToken()));

    useEffect(() => {
        if (!getToken()) {
            return;
        }
        let cancelled = false;
        getMe()
            .then((me) => {
                if (!cancelled) setUser(me);
            })
            .catch(() => {
                // Токен протух или аккаунт заблокирован — выходим молча
                clearToken();
                if (!cancelled) setUser(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback(async (token) => {
        setToken(token);
        const me = await getMe();
        setUser(me);
        return me;
    }, []);

    const logout = useCallback(() => {
        clearToken();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            logout,
            setUser,
        }),
        [user, loading, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
