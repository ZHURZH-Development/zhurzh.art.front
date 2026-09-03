import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../../styles/pages/account/MyWyvernsPage.module.css';
import Text from '../../common/Text.jsx';
import Button from '../../common/Button.jsx';
import { useLocale } from '../../../context/LocaleContext.jsx';
import { constructorTranslations } from '../../../locales/constructor.js';
import { getMyWyverns } from '../../../shared/api/constructor.js';
import { apiErrorMessage } from '../../../shared/api/client.js';

/** Галерея сохранённых виверн владельца: превью, код-ссылка, скачивание hi-res. */
export default function MyWyvernsPage() {
    const { isRu, localizePath } = useLocale();
    const t = constructorTranslations[isRu ? 'ru' : 'en'];

    const [wyverns, setWyverns] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getMyWyverns()
            .then((list) => !cancelled && setWyverns(list))
            .catch((err) => !cancelled && setError(apiErrorMessage(err)));
        return () => {
            cancelled = true;
        };
    }, []);

    if (error) {
        return <Text variant="body" color="#e89a9a">{error}</Text>;
    }
    if (!wyverns) {
        return <Text variant="body" color="#9599C3">{t.loading}</Text>;
    }

    return (
        <div className={styles.wrap}>
            <Text variant="h2">{t.myTitle}</Text>

            {wyverns.length === 0 ? (
                <div className={styles.empty}>
                    <Text variant="body" color="#9599C3">{t.myEmpty}</Text>
                    <Link to={localizePath('/constructor')}>
                        <Button type="button">{t.myCreate}</Button>
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {wyverns.map((wyvern) => (
                        <article key={wyvern.id} className={styles.card}>
                            {wyvern.previewUrl && (
                                <img src={wyvern.previewUrl} alt={wyvern.name} className={styles.image} />
                            )}
                            <div className={styles.cardBody}>
                                <Text variant="h4">{wyvern.name}</Text>
                                <Link
                                    to={localizePath(`/wyvern/${wyvern.code}`)}
                                    className={styles.codeLink}
                                >
                                    <Text variant="sign" color="var(--gold)">{wyvern.code}</Text>
                                </Link>
                                <Text variant="sign" color="#5a5e85">
                                    {wyvern.createdAt ? new Date(wyvern.createdAt).toLocaleDateString() : ''}
                                </Text>
                                {wyvern.finalUrl && (
                                    <a
                                        href={wyvern.finalUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={styles.download}
                                    >
                                        <Text variant="sign" color="#92c5ff">{t.download}</Text>
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
