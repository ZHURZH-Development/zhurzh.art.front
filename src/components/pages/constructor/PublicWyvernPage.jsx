import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../../styles/pages/constructor/PublicWyvernPage.module.css';
import Text from '../../common/Text.jsx';
import { useLocale } from '../../../context/LocaleContext.jsx';
import { constructorTranslations } from '../../../locales/constructor.js';
import { getPublicWyvern } from '../../../shared/api/constructor.js';

/**
 * Публичная страница-сертификат виверны по коду W-XXXXXX: превью
 * с ватермаркой + снапшот выбора. Доступна без логина — по ней
 * проверяется подлинность.
 */
export default function PublicWyvernPage() {
    const { code } = useParams();
    const { isRu } = useLocale();
    const t = constructorTranslations[isRu ? 'ru' : 'en'];

    const [wyvern, setWyvern] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setWyvern(null);
        setNotFound(false);
        getPublicWyvern(code)
            .then((data) => !cancelled && setWyvern(data))
            .catch(() => !cancelled && setNotFound(true));
        return () => {
            cancelled = true;
        };
    }, [code]);

    // config — JSON-снапшот {selections: [...], colors: [...]} на момент сохранения
    const snapshot = useMemo(() => {
        if (!wyvern?.config) return null;
        try {
            return JSON.parse(wyvern.config);
        } catch {
            return null;
        }
    }, [wyvern]);

    if (notFound) {
        return (
            <main className={styles.page}>
                <Text variant="body" color="#e89a9a">{t.publicNotFound}</Text>
            </main>
        );
    }
    if (!wyvern) {
        return (
            <main className={styles.page}>
                <Text variant="body" color="#9599C3">{t.loading}</Text>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <Text variant="h1">{wyvern.name}</Text>
                <Text variant="sign" color="var(--gold)">{wyvern.code}</Text>

                {wyvern.previewUrl && (
                    <img src={wyvern.previewUrl} alt={wyvern.name} className={styles.image} />
                )}

                <div className={styles.facts}>
                    {wyvern.ownerNickname && (
                        <div className={styles.factRow}>
                            <Text variant="sign" color="#9599C3">{t.publicOwner}</Text>
                            <Text variant="body">{wyvern.ownerNickname}</Text>
                        </div>
                    )}
                    <div className={styles.factRow}>
                        <Text variant="sign" color="#9599C3">{t.publicCreated}</Text>
                        <Text variant="body">
                            {new Date(wyvern.createdAt).toLocaleDateString()}
                        </Text>
                    </div>
                    {snapshot?.selections?.map((s) => (
                        <div key={s.categoryCode} className={styles.factRow}>
                            <Text variant="sign" color="#9599C3">
                                {isRu ? s.categoryNameRu : s.categoryNameEn}
                            </Text>
                            <Text variant="body">{isRu ? s.optionNameRu : s.optionNameEn}</Text>
                        </div>
                    ))}
                    {snapshot?.colors?.map((c) => (
                        <div key={c.zoneCode} className={styles.factRow}>
                            <Text variant="sign" color="#9599C3">
                                {isRu ? c.zoneNameRu : c.zoneNameEn}
                            </Text>
                            <span className={styles.colorFact}>
                                <span className={styles.colorDot} style={{ backgroundColor: c.hex }} />
                                <Text variant="body">{c.colorNameRu || c.hex}</Text>
                            </span>
                        </div>
                    ))}
                </div>

                <Text variant="sign" color="#5a5e85">{t.publicVerified}</Text>
            </div>
        </main>
    );
}
