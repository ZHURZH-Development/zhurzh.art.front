import React, { useState } from 'react';
import styles from '../../../../styles/pages/account/admin/ConstructorAdminPage.module.css';
import Text from '../../../common/Text.jsx';
import { adminUpdateZone, adminDeleteZone } from '../../../../shared/api/constructor.js';

/** Зона покраски: поля + палитра (hex-строки редактируются локально, сохраняются разом). */
export default function ZoneEditor({ zone, t, busy, run }) {
    const [form, setForm] = useState({
        code: zone.code,
        nameRu: zone.nameRu,
        nameEn: zone.nameEn,
        sortOrder: zone.sortOrder,
        active: zone.active,
    });
    const [palette, setPalette] = useState(
        zone.palette.map((c) => ({ hex: c.hex, nameRu: c.nameRu || '' })),
    );

    const field = (key) => ({
        value: form[key] ?? '',
        onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    });

    const setColor = (index, patch) =>
        setPalette((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));

    const removeColor = (index) => setPalette((prev) => prev.filter((_, i) => i !== index));

    const addColor = () => setPalette((prev) => [...prev, { hex: '#888888', nameRu: '' }]);

    const onSave = () =>
        run(() =>
            adminUpdateZone(zone.id, {
                ...form,
                sortOrder: Number(form.sortOrder) || 0,
                palette: palette.map((c, i) => ({
                    hex: c.hex,
                    nameRu: c.nameRu || null,
                    sortOrder: i,
                })),
            }),
        );

    const onDelete = () => {
        if (window.confirm(t.confirmDeleteZone)) {
            run(() => adminDeleteZone(zone.id));
        }
    };

    return (
        <div className={styles.card}>
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
                        onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                    />
                    <Text variant="sign" color="#9599C3">{t.activeLabel}</Text>
                </label>
            </div>

            <div className={styles.paletteList}>
                {palette.map((color, index) => (
                    // Индекс как key оправдан: строки редактируются на месте
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} className={styles.paletteRow}>
                        <input
                            type="color"
                            className={styles.colorPicker}
                            value={/^#[0-9a-fA-F]{6}$/.test(color.hex) ? color.hex : '#888888'}
                            onChange={(e) => setColor(index, { hex: e.target.value.toUpperCase() })}
                        />
                        <input
                            className={`${styles.input} ${styles.hexInput}`}
                            value={color.hex}
                            placeholder={t.hexLabel}
                            onChange={(e) => setColor(index, { hex: e.target.value })}
                        />
                        <input
                            className={styles.input}
                            value={color.nameRu}
                            placeholder={t.colorNameLabel}
                            onChange={(e) => setColor(index, { nameRu: e.target.value })}
                        />
                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => removeColor(index)}
                        >
                            <Text variant="sign" color="#e89a9a">✕</Text>
                        </button>
                    </div>
                ))}
                <button type="button" className={styles.actionButton} onClick={addColor}>
                    <Text variant="sign" color="#92c5ff">+ {t.addColor}</Text>
                </button>
            </div>

            <div className={styles.actions}>
                <button type="button" className={styles.actionButton} disabled={busy} onClick={onSave}>
                    <Text variant="sign" color="#92c5ff">{t.save}</Text>
                </button>
                <button type="button" className={styles.actionButton} disabled={busy} onClick={onDelete}>
                    <Text variant="sign" color="#e89a9a">{t.delete}</Text>
                </button>
            </div>
        </div>
    );
}
