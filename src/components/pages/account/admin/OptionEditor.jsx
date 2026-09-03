import React, { useRef, useState } from 'react';
import styles from '../../../../styles/pages/account/admin/ConstructorAdminPage.module.css';
import Text from '../../../common/Text.jsx';
import {
    adminUpdateOption,
    adminDeleteOption,
    adminSetThumbnail,
    adminUploadAsset,
    adminAddLayer,
    adminUpdateLayer,
    adminDeleteLayer,
} from '../../../../shared/api/constructor.js';

const LAYER_TYPES = ['STATIC', 'TINT', 'MULTIPLY'];

/** Редактор опции: поля, иконка, таблица PNG-слоёв. */
export default function OptionEditor({ option, zones, t, busy, run }) {
    const [form, setForm] = useState({
        code: option.code,
        nameRu: option.nameRu,
        nameEn: option.nameEn,
        sortOrder: option.sortOrder,
        active: option.active,
    });
    const [newLayer, setNewLayer] = useState({ zIndex: 10, type: 'STATIC', colorZoneId: '' });
    const [uploading, setUploading] = useState(false);
    const thumbInputRef = useRef(null);
    const layerInputRef = useRef(null);

    const field = (key) => ({
        value: form[key] ?? '',
        onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    });

    const onSave = () =>
        run(() =>
            adminUpdateOption(option.id, {
                ...form,
                sortOrder: Number(form.sortOrder) || 0,
            }),
        );

    const onDelete = () => {
        if (window.confirm(t.confirmDeleteOption)) {
            run(() => adminDeleteOption(option.id));
        }
    };

    const onPickThumbnail = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploading(true);
        try {
            await run(async () => {
                const key = await adminUploadAsset(file, 'THUMBNAIL');
                await adminSetThumbnail(option.id, key);
            });
        } finally {
            setUploading(false);
        }
    };

    /** Слой добавляется одним жестом: выбрал PNG — файл ушёл в S3, слой создан */
    const onPickLayerFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploading(true);
        try {
            await run(async () => {
                const key = await adminUploadAsset(file, 'LAYER');
                await adminAddLayer(option.id, {
                    s3Key: key,
                    zIndex: Number(newLayer.zIndex) || 0,
                    type: newLayer.type,
                    colorZoneId: newLayer.type === 'TINT' ? newLayer.colorZoneId || null : null,
                });
            });
        } finally {
            setUploading(false);
        }
    };

    const onLayerChange = (layer, patch) =>
        run(() =>
            adminUpdateLayer(option.id, layer.id, {
                s3Key: layer.s3Key,
                zIndex: Number(patch.zIndex ?? layer.zIndex) || 0,
                type: patch.type ?? layer.type,
                colorZoneId:
                    (patch.type ?? layer.type) === 'TINT'
                        ? (patch.colorZoneId ?? layer.colorZoneId) || null
                        : null,
            }),
        );

    const onLayerDelete = (layer) => {
        if (window.confirm(t.confirmDeleteLayer)) {
            run(() => adminDeleteLayer(option.id, layer.id));
        }
    };

    return (
        <div className={styles.optionCard}>
            <div className={styles.formRow}>
                {option.thumbnailUrl ? (
                    <img src={option.thumbnailUrl} alt="" className={styles.thumb} />
                ) : (
                    <div className={styles.thumbPlaceholder} />
                )}
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

            <div className={styles.actions}>
                <button type="button" className={styles.actionButton} disabled={busy} onClick={onSave}>
                    <Text variant="sign" color="#92c5ff">{t.save}</Text>
                </button>
                <button
                    type="button"
                    className={styles.actionButton}
                    disabled={busy || uploading}
                    onClick={() => thumbInputRef.current?.click()}
                >
                    <Text variant="sign" color="#92c5ff">
                        {uploading ? t.uploading : t.uploadThumb}
                    </Text>
                </button>
                <button type="button" className={styles.actionButton} disabled={busy} onClick={onDelete}>
                    <Text variant="sign" color="#e89a9a">{t.delete}</Text>
                </button>
                <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onPickThumbnail}
                />
            </div>

            {/* Слои */}
            {option.layers.length === 0 ? (
                <Text variant="sign" color="#5a5e85">{t.noLayers}</Text>
            ) : (
                <div className={styles.layerTable}>
                    {option.layers.map((layer) => (
                        <div key={layer.id} className={styles.layerRow}>
                            <Text variant="sign" color="#5a5e85" className={styles.layerKey}>
                                {layer.s3Key.split('/').pop()}
                            </Text>
                            <input
                                className={`${styles.input} ${styles.layerZ}`}
                                type="number"
                                defaultValue={layer.zIndex}
                                title={t.layerZ}
                                onBlur={(e) => {
                                    if (Number(e.target.value) !== layer.zIndex) {
                                        onLayerChange(layer, { zIndex: e.target.value });
                                    }
                                }}
                            />
                            <select
                                className={styles.input}
                                value={layer.type}
                                title={t.layerType}
                                onChange={(e) => onLayerChange(layer, { type: e.target.value })}
                            >
                                {LAYER_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {layer.type === 'TINT' && (
                                <select
                                    className={styles.input}
                                    value={layer.colorZoneId || ''}
                                    title={t.layerZone}
                                    onChange={(e) => onLayerChange(layer, { colorZoneId: e.target.value })}
                                >
                                    <option value="">—</option>
                                    {zones.map((zone) => (
                                        <option key={zone.id} value={zone.id}>{zone.nameRu}</option>
                                    ))}
                                </select>
                            )}
                            <button
                                type="button"
                                className={styles.actionButton}
                                disabled={busy}
                                onClick={() => onLayerDelete(layer)}
                            >
                                <Text variant="sign" color="#e89a9a">✕</Text>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Новый слой: параметры + выбор файла одним действием */}
            <div className={styles.newLayerRow}>
                <input
                    className={`${styles.input} ${styles.layerZ}`}
                    type="number"
                    value={newLayer.zIndex}
                    title={t.layerZ}
                    onChange={(e) => setNewLayer((prev) => ({ ...prev, zIndex: e.target.value }))}
                />
                <select
                    className={styles.input}
                    value={newLayer.type}
                    onChange={(e) => setNewLayer((prev) => ({ ...prev, type: e.target.value }))}
                >
                    {LAYER_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                {newLayer.type === 'TINT' && (
                    <select
                        className={styles.input}
                        value={newLayer.colorZoneId}
                        onChange={(e) =>
                            setNewLayer((prev) => ({ ...prev, colorZoneId: e.target.value }))
                        }
                    >
                        <option value="">—</option>
                        {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>{zone.nameRu}</option>
                        ))}
                    </select>
                )}
                <button
                    type="button"
                    className={styles.actionButton}
                    disabled={busy || uploading || (newLayer.type === 'TINT' && !newLayer.colorZoneId)}
                    onClick={() => layerInputRef.current?.click()}
                >
                    <Text variant="sign" color="#92c5ff">
                        {uploading ? t.uploading : `+ ${t.addLayer}`}
                    </Text>
                </button>
                <input
                    ref={layerInputRef}
                    type="file"
                    accept="image/png"
                    hidden
                    onChange={onPickLayerFile}
                />
            </div>
        </div>
    );
}
