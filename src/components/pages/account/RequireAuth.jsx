import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useLocale } from '../../../context/LocaleContext.jsx';

/** Пускает в кабинет только с токеном; гостя уводит на логин, запомнив откуда пришёл. */
export default function RequireAuth({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const { localizePath } = useLocale();
    const location = useLocation();

    if (loading) {
        return null; // профиль ещё грузится — не дёргаем редиректом
    }
    if (!isAuthenticated) {
        return <Navigate to={localizePath('/login')} state={{ from: location.pathname }} replace />;
    }
    return children;
}
