import React, { useRef, useState } from 'react';
import styles from '../../../styles/pages/account/ProfilePage.module.css';
import Text from '../../common/Text.jsx';
import Button from '../../common/Button.jsx';
import { useLocale } from '../../../context/LocaleContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { accountTranslations } from '../../../locales/account.js';
import { updateMe, uploadAvatar } from '../../../shared/api/me.js';
import { apiErrorMessage } from '../../../shared/api/client.js';

/** Профиль: аватарка (presigned upload в S3), никнейм и имя. */
export default function ProfilePage() {
    const { isRu } = useLocale();
    const { user, setUser } = useAuth();
    const t = accountTranslations[isRu ? 'ru' : 'en'];
    const fileInputRef = useRef(null);

    const [nickname, setNickname] = useState(user?.nickname ?? '');
    const [name, setName] = useState(user?.name ?? '');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null); // { kind: 'ok' | 'error', text }

    const initial = (user?.nickname || user?.name || user?.email || '?').charAt(0).toUpperCase();

    const onSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const me = await updateMe({ nickname: nickname.trim(), name: name.trim() });
            setUser(me);
            setMessage({ kind: 'ok', text: t.saved });
        } catch (err) {
            setMessage({ kind: 'error', text: apiErrorMessage(err) });
        } finally {
            setSaving(false);
        }
    };

    const onPickAvatar = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // тот же файл можно выбрать повторно
        if (!file) {
            return;
        }
        setUploading(true);
        setMessage(null);
        try {
            const me = await uploadAvatar(file);
            setUser(me);
        } catch (err) {
            setMessage({ kind: 'error', text: apiErrorMessage(err) });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.profile}>
            <Text variant="h2">{t.profileTitle}</Text>

            <div className={styles.avatarRow}>
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className={styles.avatar} />
                ) : (
                    <div className={styles.avatarPlaceholder}>
                        <Text variant="h2" color="#92c5ff">
                            {initial}
                        </Text>
                    </div>
                )}
                <div className={styles.avatarActions}>
                    <button
                        type="button"
                        className={styles.linkButton}
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Text variant="body" color="#92c5ff">
                            {uploading ? t.avatarUploading : t.avatarChange}
                        </Text>
                    </button>
                    <Text variant="sign" color="#5a5e85">
                        {user?.email}
                    </Text>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={onPickAvatar}
                    />
                </div>
            </div>

            <form className={styles.form} onSubmit={onSave}>
                <label className={styles.field}>
                    <Text variant="sign" color="#9599C3">
                        {t.nicknameLabel}
                    </Text>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder={t.nicknamePlaceholder}
                        value={nickname}
                        maxLength={32}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <Text variant="sign" color="#5a5e85">
                        {t.nicknameHint}
                    </Text>
                </label>

                <label className={styles.field}>
                    <Text variant="sign" color="#9599C3">
                        {t.nameLabel}
                    </Text>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder={t.namePlaceholder}
                        value={name}
                        maxLength={255}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>

                {message && (
                    <Text variant="body" color={message.kind === 'ok' ? '#9ad4a4' : '#e89a9a'}>
                        {message.text}
                    </Text>
                )}

                <Button type="submit" disabled={saving}>
                    {saving ? t.saving : t.save}
                </Button>
            </form>
        </div>
    );
}
