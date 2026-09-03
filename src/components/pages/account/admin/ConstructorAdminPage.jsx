import React, { useCallback, useEffect, useState } from 'react';
import styles from '../../../../styles/pages/account/admin/ConstructorAdminPage.module.css';
import Text from '../../../common/Text.jsx';
import Button from '../../../common/Button.jsx';
import { useLocale } from '../../../../context/LocaleContext.jsx';
import { constructorTranslations } from '../../../../locales/constructor.js';
import { adminGetTree, adminCreateCategory, adminCreateZone } from '../../../../shared/api/constructor.js';
import { apiErrorMessage } from '../../../../shared/api/client.js';
import CategoryEditor from './CategoryEditor.jsx';
import ZoneEditor from './ZoneEditor.jsx';

/**
 * Настройка конструктора: категории с опциями и слоями + зоны с палитрами.
 * После каждой мутации дерево перезагружается целиком — данных мало,
 * зато состояние всегда честное.
 */
export default function ConstructorAdminPage() {
    const { isRu } = useLocale();
    const t = constructorTranslations[isRu ? 'ru' : 'en'];

    const [tree, setTree] = useState(null);
    const [tab, setTab] = useState('categories');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const reload = useCallback(async () => {
        try {
            setTree(await adminGetTree());
            setError(null);
        } catch (err) {
            setError(apiErrorMessage(err));
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    /** Общая обёртка мутаций: блокирует форму, показывает ошибку, перечитывает дерево */
    const run = useCallback(
        async (action) => {
            setBusy(true);
            setError(null);
            try {
                await action();
                await reload();
                return true;
            } catch (err) {
                setError(apiErrorMessage(err));
                return false;
            } finally {
                setBusy(false);
            }
        },
        [reload],
    );

    const onAddCategory = () =>
        run(() =>
            adminCreateCategory({
                code: `category-${Date.now() % 100000}`,
                nameRu: 'Новая категория',
                nameEn: 'New category',
                sortOrder: (tree?.categories?.length ?? 0) * 10,
            }),
        );

    const onAddZone = () =>
        run(() =>
            adminCreateZone({
                code: `zone-${Date.now() % 100000}`,
                nameRu: 'Новая зона',
                nameEn: 'New zone',
                sortOrder: (tree?.zones?.length ?? 0) * 10,
                palette: [],
            }),
        );

    if (!tree) {
        return <Text variant="body" color="#9599C3">{error || t.loading}</Text>;
    }

    return (
        <div className={styles.wrap}>
            <Text variant="h2">{t.adminTitle}</Text>

            <div className={styles.tabs}>
                <button
                    type="button"
                    className={`${styles.tab} ${tab === 'categories' ? styles.tabActive : ''}`}
                    onClick={() => setTab('categories')}
                >
                    <Text variant="body">{t.tabCategories}</Text>
                </button>
                <button
                    type="button"
                    className={`${styles.tab} ${tab === 'zones' ? styles.tabActive : ''}`}
                    onClick={() => setTab('zones')}
                >
                    <Text variant="body">{t.tabZones}</Text>
                </button>
            </div>

            {error && <Text variant="body" color="#e89a9a">{error}</Text>}

            {tab === 'categories' && (
                <div className={styles.list}>
                    {tree.categories.map((category) => (
                        <CategoryEditor
                            key={category.id}
                            category={category}
                            zones={tree.zones}
                            t={t}
                            busy={busy}
                            run={run}
                        />
                    ))}
                    <Button type="button" disabled={busy} onClick={onAddCategory}>
                        {t.addCategory}
                    </Button>
                </div>
            )}

            {tab === 'zones' && (
                <div className={styles.list}>
                    {tree.zones.length === 0 && (
                        <Text variant="body" color="#9599C3">{t.noZones}</Text>
                    )}
                    {tree.zones.map((zone) => (
                        <ZoneEditor key={zone.id} zone={zone} t={t} busy={busy} run={run} />
                    ))}
                    <Button type="button" disabled={busy} onClick={onAddZone}>
                        {t.addZone}
                    </Button>
                </div>
            )}
        </div>
    );
}
