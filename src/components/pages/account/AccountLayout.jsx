import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from '../../../styles/pages/account/AccountLayout.module.css';
import Text from '../../common/Text.jsx';
import { useLocale } from '../../../context/LocaleContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { accountTranslations } from '../../../locales/account.js';

/**
 * Каркас кабинета: слева меню навигации, справа контент раздела (Outlet).
 * На мобильных меню становится горизонтальной полосой над контентом.
 */
export default function AccountLayout() {
    const navigate = useNavigate();
    const { isRu, localizePath } = useLocale();
    const { user, logout } = useAuth();
    const t = accountTranslations[isRu ? 'ru' : 'en'];

    const menuItems = [
        { label: t.menuProfile, to: localizePath('/account/profile') },
        { label: t.menuConstructor, to: localizePath('/constructor') },
        { label: t.menuMyWyverns, to: localizePath('/account/wyverns') },
        ...(user?.role === 'ADMIN'
            ? [{ label: t.menuAdminConstructor, to: localizePath('/account/admin/constructor') }]
            : []),
    ];
    const soonItems = [t.menuGlossary, t.menuWallpapers, t.menuAdopts];

    const onLogout = () => {
        logout();
        navigate(localizePath('/'));
    };

    return (
        <main className={styles.page}>
            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <Text variant="h3">{t.menuTitle}</Text>
                        {user?.role === 'ADMIN' && (
                            <Text variant="sign" color="var(--gold)">
                                {t.adminBadge}
                            </Text>
                        )}
                    </div>

                    <nav className={styles.menu}>
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`
                                }
                            >
                                <Text variant="body">{item.label}</Text>
                            </NavLink>
                        ))}
                        {soonItems.map((label) => (
                            <div key={label} className={`${styles.menuLink} ${styles.menuLinkDisabled}`}>
                                <Text variant="body" color="#5a5e85">
                                    {label}
                                </Text>
                                <Text variant="sign" color="#5a5e85">
                                    {t.menuSoon}
                                </Text>
                            </div>
                        ))}
                    </nav>

                    <button type="button" className={styles.logout} onClick={onLogout}>
                        <Text variant="body" color="#9599C3">
                            {t.logout}
                        </Text>
                    </button>
                </aside>

                <section className={styles.content}>
                    <Outlet />
                </section>
            </div>
        </main>
    );
}
