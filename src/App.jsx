import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import { LocaleProvider } from './context/LocaleContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Header from './components/common/Header.jsx';
import LandingPage from './components/pages/LandingPage.jsx';
import ArticlesPage from './components/pages/ArticlesPage.jsx';
import ArticleCommunity from './components/pages/articles/ArticleCommunity.jsx';
import ArticleWhoAreThey from './components/pages/articles/ArticleWhoAreThey.jsx';
import PageNotFound from './components/pages/PageNotFound.jsx';
import CanonicalLink from './components/common/CanonicalLink.jsx';
import LoginPage from './components/pages/account/LoginPage.jsx';
import RequireAuth from './components/pages/account/RequireAuth.jsx';
import RequireAdmin from './components/pages/account/RequireAdmin.jsx';
import AccountLayout from './components/pages/account/AccountLayout.jsx';
import ProfilePage from './components/pages/account/ProfilePage.jsx';
import MyWyvernsPage from './components/pages/account/MyWyvernsPage.jsx';
import ConstructorAdminPage from './components/pages/account/admin/ConstructorAdminPage.jsx';
import ConstructorPage from './components/pages/constructor/ConstructorPage.jsx';
import PublicWyvernPage from './components/pages/constructor/PublicWyvernPage.jsx';

/** Личный кабинет: логин + разделы под общим каркасом с левым меню */
function accountRoutes(prefix) {
    return (
        <>
            <Route path={`${prefix}/login`} element={<LoginPage />} />
            <Route
                path={`${prefix}/constructor`}
                element={
                    <RequireAuth>
                        <ConstructorPage />
                    </RequireAuth>
                }
            />
            <Route path={`${prefix}/wyvern/:code`} element={<PublicWyvernPage />} />
            <Route
                path={`${prefix}/account`}
                element={
                    <RequireAuth>
                        <AccountLayout />
                    </RequireAuth>
                }
            >
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="wyverns" element={<MyWyvernsPage />} />
                <Route
                    path="admin/constructor"
                    element={
                        <RequireAdmin>
                            <ConstructorAdminPage />
                        </RequireAdmin>
                    }
                />
            </Route>
        </>
    );
}

function AppRoutes() {
    return (
        <>
            <CanonicalLink />
            <Header />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/community" element={<ArticleCommunity />} />
                <Route path="/articles/whoAreThey" element={<ArticleWhoAreThey />} />
                {accountRoutes('')}
                <Route path="/ru/" element={<Navigate to="/ru" replace />} />
                <Route path="/ru" element={<LandingPage />} />
                <Route path="/ru/articles" element={<ArticlesPage />} />
                <Route path="/ru/articles/community" element={<ArticleCommunity />} />
                <Route path="/ru/articles/whoAreThey" element={<ArticleWhoAreThey />} />
                {accountRoutes('/ru')}
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <Router>
            <LocaleProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </LocaleProvider>
        </Router>
    );
}
