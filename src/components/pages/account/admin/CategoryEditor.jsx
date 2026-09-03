import React, { useState } from 'react';
import styles from '../../../../styles/pages/account/admin/ConstructorAdminPage.module.css';
import Text from '../../../common/Text.jsx';
import {
    adminUpdateCategory,
    adminDeleteCategory,
    adminCreateOption,
} from '../../../../shared/api/constructor.js';
import OptionEditor from './OptionEditor.jsx';

/** Карточка категории: поля, удаление, список опций. */
export default function CategoryEditor({ category, zones, t, busy, run }) {
    const [form, setForm] = useState({
        code: category.code,
        nameRu: category.nameRu,
        nameEn: category.nameEn,
        sortOrder: category.sortOrder,
        active: category.active,
    });
    const [expanded, setExpanded] = useState(false);

    const field = (key) => ({
        value: form[key] ?? '',
        onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    });

    const onSave = () =>
        run(() =>
            adminUpdateCategory(category.id, {
                ...form,
                sortOrder: Number(form.sortOrder) || 0,
            }),
        );

    const onDelete = () => {
        if (window.confirm(t.confirmDeleteCategory)) {
            run(() => adminDeleteCategory(category.id));
        }
    };

    const onAddOption = () =>
        run(() =>
            adminCreateOption(category.id, {
                code: `option-${Date.now() % 100000}`,
                nameRu: 'Новая опция',
                nameEn: 'New option',
                sortOrder: category.options.length * 10,
            }),
        );

    return (
        <div className={styles.card}>
            <button
                type="button"
                className={styles.cardHeader}
                onClick={() => setExpanded((v) => !v)}
            >
                <Text variant="h4">
                    {category.nameRu} <span className={styles.mutedCode}>({category.code})</span>
                </Text>
                <Text variant="sign" color="#9599C3">
                    {expanded ? '▲' : '▼'} {category.options.length}
                </Text>
            </button>

            {expanded && (
                <>
                    <div className={styles.formRow}>
                        <label className={styles.smallField}>
                            <Text variant="sign" color="#9599C3">{t.codeLabel}</Text>
                            <input className={styles.input} {...field('code')} />
                        </label>
                        <label className={styles.smallField}>
                            <Text variant="sign" color="#9599C3">{t.nameRuLabel}</Text>
                            <input className={styles.input} {...field('nameRu')} />
                        </label>
                        <label className={styles.smallField}>
                            <Text variant="sign" color="#9599C3">{t.nameEnLabel}</Text>
                            <input className={styles.input} {...field('nameEn')} />
                        </label>
                        <label className={styles.tinyField}>
                            <Text variant="sign" color="#9599C3">{t.sortLabel}</Text>
                            <input className={styles.input} type="number" {...field('sortOrder')} />
                        </label>
                        <label className={styles.checkField}>
                            <input
                                type="checkbox"
                                checked={!!form.active}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, active: e.target.checked }))
                                }
                            />
                            <Text variant="sign" color="#9599C3">{t.activeLabel}</Text>
                        </label>
                    </div>
                    <div className={styles.actions}>
                        <button type="button" className={styles.actionButton} disabled={busy} onClick={onSave}>
                            <Text variant="sign" color="#92c5ff">{t.save}</Text>
                        </button>
                        <button type="button" className={styles.actionButton} disabled={busy} onClick={onDelete}>
                            <Text variant="sign" color="#e89a9a">{t.delete}</Text>
                        </button>
                    </div>

                    <div className={styles.options}>
                        {category.options.length === 0 && (
                            <Text variant="sign" color="#5a5e85">{t.noOptions}</Text>
                        )}
                        {category.options.map((option) => (
                            <OptionEditor
                                key={option.id}
                                option={option}
                                zones={zones}
                                t={t}
                                busy={busy}
                                run={run}
                            />
                        ))}
                        <button
                            type="button"
                            className={styles.actionButton}
                            disabled={busy}
                            onClick={onAddOption}
                        >
                            <Text variant="sign" color="#92c5ff">+ {t.addOption}</Text>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
