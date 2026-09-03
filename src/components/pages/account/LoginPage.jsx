import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import styles from '../../../styles/pages/account/LoginPage.module.css';
import Text from '../../common/Text.jsx';
import Button from '../../common/Button.jsx';
import { useLocale } from '../../../context/LocaleContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { accountTranslations } from '../../../locales/account.js';
import { requestCode, verifyCode } from '../../../shared/api/auth.js';
import { apiErrorMessage } from '../../../shared/api/client.js';

/**
 * Вход по коду с почты, два шага: email → код из письма.
 * Аккаунт создаётся автоматически при первом входе.
 */
export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isRu, localizePath } = useLocale();
    const { isAuthenticated, login } = useAuth();
    const t = accountTranslations[isRu ? 'ru' : 'en'];

    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const accountPath = localizePath('/account');
    if (isAuthenticated) {
        const from = location.state?.from || accountPath;
        return <Navigate to={from} replace />;
    }

    const onRequestCode = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            await requestCode(email.trim());
            setStep('code');
        } catch (err) {
            setError(apiErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const onVerify = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const { token } = await verifyCode(email.trim(), code.trim());
            await login(token);
            navigate(location.state?.from || accountPath, { replace: true });
        } catch (err) {
            setError(apiErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <Text variant="h2">{t.loginTitle}</Text>

                {step === 'email' ? (
                    <form className={styles.form} onSubmit={onRequestCode}>
                        <Text variant="body" color="#9599C3">
                            {t.loginIntro}
                        </Text>
                        <label className={styles.field}>
                            <Text variant="sign" color="#9599C3">
                                {t.emailLabel}
                            </Text>
                            <input
                                type="email"
                                required
                                autoFocus
                                className={styles.input}
                                placeholder={t.emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                        {error && (
                            <Text variant="body" color="#e89a9a">
                                {error}
                            </Text>
                        )}
                        <Button type="submit" disabled={busy}>
                            {busy ? t.sending : t.sendCode}
                        </Button>
                    </form>
                ) : (
                    <form className={styles.form} onSubmit={onVerify}>
                        <Text variant="body" color="#9599C3">
                            {t.codeSentTo} {email}
                        </Text>
                        <label className={styles.field}>
                            <Text variant="sign" color="#9599C3">
                                {t.codeLabel}
                            </Text>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                required
                                autoFocus
                                className={`${styles.input} ${styles.codeInput}`}
                                placeholder={t.codePlaceholder}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            />
                        </label>
                        {error && (
                            <Text variant="body" color="#e89a9a">
                                {error}
                            </Text>
                        )}
                        <Button type="submit" disabled={busy || code.length !== 6}>
                            {busy ? t.signingIn : t.signIn}
                        </Button>
                        <div className={styles.secondaryActions}>
                            <button
                                type="button"
                                className={styles.linkButton}
                                onClick={() => {
                                    setStep('email');
                                    setCode('');
                                    setError('');
                                }}
                            >
                                <Text variant="sign" color="#92c5ff">
                                    {t.changeEmail}
                                </Text>
                            </button>
                            <button
                                type="button"
                                className={styles.linkButton}
                                disabled={busy}
                                onClick={(e) => onRequestCode(e)}
                            >
                                <Text variant="sign" color="#92c5ff">
                                    {t.resend}
                                </Text>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}
