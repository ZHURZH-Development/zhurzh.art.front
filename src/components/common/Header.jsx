import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/common/Header.module.css';
import Text from './Text.jsx';
import { useLocale } from '../../context/LocaleContext.jsx';
import { headerTranslations } from '../../locales/landing.js';
import { accountTranslations } from '../../locales/account.js';
import useIsMobile from '../../hooks/useIsMobile.js';
import { useAuth } from '../../context/AuthContext.jsx';

const LOGO_URL = 'https://storage.yandexcloud.net/zhurzh/landing/logo.png';

export default function Header() {
    const isMobile = useIsMobile();
    const { pathname } = useLocation();
    const { isRu, localizePath } = useLocale();
    const t = headerTranslations[isRu ? 'ru' : 'en'];
    const ta = accountTranslations[isRu ? 'ru' : 'en'];
    const { isAuthenticated } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const homePath = localizePath('/');
    // В кабинет — если уже вошли; иначе на страницу логина
    const accountPath = localizePath(isAuthenticated ? '/account' : '/login');

    const externalLinks = isRu
        ? [
              { label: t.comic, href: 'https://t.me/ZhurzhArt/30' },
          ]
        : [
              { label: t.comic, href: 'https://www.patreon.com/collection/39648' },
          ];
    // Разделы в разработке: видны в меню, но не кликабельны
    const navLinks = [
        ...externalLinks,
        { label: t.articles, to: localizePath('/articles') },
        { label: t.worldMap, disabled: true },
        { label: t.characters, disabled: true },
        { label: t.shop, disabled: true },
        { label: t.author, disabled: true },
        { label: t.joinCommunity, to: localizePath('/articles/community') },
    ];
    const mobileMenuLinks = [
        { label: 'Read the Comic', href: 'https://www.patreon.com/collection/39648' },
        { label: 'Articles', to: localizePath('/articles') },
        { label: 'Lore', href: 'https://www.patreon.com/collection/98091' },
        { label: 'Adopt', href: 'https://www.patreon.com/collection/784035?view=expanded' },
    ];

    const closeDrawer = useCallback(() => setDrawerOpen(false), []);
    const openDrawer = useCallback(() => setDrawerOpen(true), []);

    useEffect(() => {
        if (!isMobile) {
            setDrawerOpen(false);
        }
    }, [isMobile]);

    useEffect(() => {
        if (!drawerOpen) {
            return undefined;
        }
        const onKey = (e) => {
            if (e.key === 'Escape') {
                closeDrawer();
            }
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [drawerOpen, closeDrawer]);

    const menuAria = isRu ? 'Открыть меню' : 'Open menu';

    const onLogoClick = useCallback(
        (e) => {
            if (pathname === homePath) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        [pathname, homePath]
    );

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    <Link to={homePath} className={styles.logoLink} onClick={onLogoClick}>
                        <img src={LOGO_URL} alt={t.siteTitle} className={styles.logoImg} />
                    </Link>

                    {isMobile ? (
                        <button
                            type="button"
                            className={styles.burger}
                            aria-expanded={drawerOpen}
                            aria-controls="site-nav-drawer"
                            aria-label={menuAria}
                            onClick={() => (drawerOpen ? closeDrawer() : openDrawer())}
                        >
                            <img src="/images/burger.svg" alt="" width={26} height={18} />
                        </button>
                    ) : (
                        <nav className={styles.nav} aria-label="Main">
                            {navLinks.map((link) => {
                                if (link.disabled) {
                                    return (
                                        <span
                                            key={link.label}
                                            className={styles.navLinkDisabled}
                                            aria-disabled="true"
                                        >
                                            <Text variant="body" color="#5A718D">
                                                {link.label}
                                            </Text>
                                        </span>
                                    );
                                }
                                const label = (
                                    <Text variant="body" color="#92c5ff">
                                        {link.label}
                                    </Text>
                                );
                                return link.to ? (
                                    <Link key={link.label} to={link.to} className={styles.navLink}>
                                        {label}
                                    </Link>
                                ) : (
                                    <a
                                        key={link.href + link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.navLink}
                                    >
                                        {label}
                                    </a>
                                );
                            })}
                            <Link to={accountPath} className={styles.navLink}>
                                <Text variant="body" color="var(--gold)">
                                    {ta.menuTitle}
                                </Text>
                            </Link>
                        </nav>
                    )}
                </div>
            </header>

            {isMobile && (
                <>
                    <div
                        className={`${styles.backdrop} ${drawerOpen ? styles.backdropVisible : ''}`}
                        aria-hidden={!drawerOpen}
                        onClick={closeDrawer}
                    />
                    <aside
                        id="site-nav-drawer"
                        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
                        aria-hidden={!drawerOpen}
                    >
                        <div className={styles.drawerLinks}>
                            <Link
                                to={accountPath}
                                className={styles.drawerNavLink}
                                onClick={closeDrawer}
                            >
                                <Text variant="body" color="var(--gold)">
                                    {ta.menuTitle}
                                </Text>
                            </Link>
                            {mobileMenuLinks.map((link) =>
                                link.to ? (
                                    <Link
                                        key={link.label}
                                        to={link.to}
                                        className={styles.drawerNavLink}
                                        onClick={closeDrawer}
                                    >
                                        <Text variant="body" color="#9599C3">
                                            {link.label}
                                        </Text>
                                    </Link>
                                ) : (
                                <a
                                    key={link.href + link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.drawerNavLink}
                                    onClick={closeDrawer}
                                >
                                    <Text variant="body" color="#9599C3">
                                        {link.label}
                                    </Text>
                                </a>
                                )
                            )}
                        </div>
                    </aside>
                </>
            )}
        </>
    );
}
