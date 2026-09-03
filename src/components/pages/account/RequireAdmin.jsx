import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useLocale } from '../../../context/LocaleContext.jsx';

/** Пускает только админа; остальных тихо уводит в профиль. */
export default function RequireAdmin({ children }) {
    const { user, loading } = useAuth();
    const { localizePath } = useLocale();

    if (loading) {
        return null;
    }
    if (user?.role !== 'ADMIN') {
        return <Navigate to={localizePath('/account/profile')} replace />;
    }
    return children;
}
