import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../../styles/pages/constructor/ConstructorPage.module.css';
import Text from '../../common/Text.jsx';
import Button from '../../common/Button.jsx';
import { useLocale } from '../../../context/LocaleContext.jsx';
import { constructorTranslations } from '../../../locales/constructor.js';
import {
    getConstructorConfig,
    renderPreview,
    saveWyvern,
} from '../../../shared/api/constructor.js';
import { apiErrorMessage } from '../../../shared/api/client.js';

const PREVIEW_DEBOUNCE_MS = 400;

/**
 * Конструктор виверны. Превью собирается ТОЛЬКО на сервере (уменьшенное,
 * с ватермаркой) — сырые слои в браузер не попадают. Каждый клик
 * дебаунсится и отменяет предыдущий запрос превью.
 */
export default function ConstructorPage() {
    const { isRu, localizePath } = useLocale();
    const t = constructorTranslations[isRu ? 'ru' : 'en'];
    const label = (item) => (isRu ? item.nameRu : item.nameEn);

    const [config, setConfig] = useState(null);
    const [configError, setConfigError] = useState(null);
    const [selections, setSelections] = useState({});
    const [colors, setColors] = useState({});
    const [name, setName] = useState('');

    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const abortRef = useRef(null);

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [savedWyvern, setSavedWyvern] = useState(null);

    // Конфиг + дефолтный выбор (первая опция/первый цвет), чтобы превью не пустовало
    useEffect(() => {
        let cancelled = false;
        getConstructorConfig()
            .then((cfg) => {
                if (cancelled) return;
                setConfig(cfg);
                const defaultSelections = {};
                cfg.categories.forEach((category) => {
                    if (category.options.length > 0) {
                        defaultSelections[category.code] = category.options[0].id;
                    }
                });
                const defaultColors = {};
                cfg.zones.forEach((zone) => {
                    if (zone.palette.length > 0) {
                        defaultColors[zone.code] = zone.palette[0].hex;
                    }
                });
                setSelections(defaultSelections);
                setColors(defaultColors);
            })
            .catch((err) => !cancelled && setConfigError(apiErrorMessage(err)));
        return () => {
            cancelled = true;
        };
    }, []);

    const hasSelection = useMemo(
        () => config && config.categories.some((c) => selections[c.code]),
        [config, selections],
    );

    // Дебаунс-превью: отменяем устаревший запрос, подменяем objectURL
    useEffect(() => {
        if (!hasSelection || savedWyvern) return undefined;
        const timer = setTimeout(async () => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            setPreviewLoading(true);
            setPreviewError(null);
            try {
                const blob = await renderPreview({ selections, colors }, controller.signal);
                const url = URL.createObjectURL(blob);
                setPreviewUrl((old) => {
                    if (old) URL.revokeObjectURL(old);
                    return url;
                });
            } catch (err) {
                if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                    // Тело ошибки — blob, вытаскиваем message вручную
                    let message = t.loading;
                    try {
                        const body = await err.response?.data?.text?.();
                        message = body ? JSON.parse(body).message : apiErrorMessage(err);
                    } catch {
                        message = apiErrorMessage(err);
                    }
                    setPreviewError(message);
                }
            } finally {
                if (abortRef.current === controller) {
                    setPreviewLoading(false);
                }
            }
        }, PREVIEW_DEBOUNCE_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selections, colors, hasSelection, savedWyvern]);

    // objectURL чистим при уходе со страницы
    useEffect(
        () => () => {
            abortRef.current?.abort();
            setPreviewUrl((old) => {
                if (old) URL.revokeObjectURL(old);
                return null;
            });
        },
        [],
    );

    const pickOption = useCallback((categoryCode, optionId) => {
        setSelections((prev) => ({ ...prev, [categoryCode]: optionId }));
    }, []);

    const pickColor = useCallback((zoneCode, hex) => {
        setColors((prev) => ({ ...prev, [zoneCode]: hex }));
    }, []);

    const onSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            const wyvern = await saveWyvern({ name: name.trim(), selections, colors });
            setSavedWyvern(wyvern);
        } catch (err) {
            setSaveError(apiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (configError) {
        return (
            <main className={styles.page}>
                <Text variant="body" color="#e89a9a">{configError}</Text>
            </main>
        );
    }
    if (!config) {
        return (
            <main className={styles.page}>
                <Text variant="body" color="#9599C3">{t.loading}</Text>
            </main>
        );
    }
    if (config.categories.length === 0) {
        return (
            <main className={styles.page}>
                <Text variant="body" color="#9599C3">{t.emptyConfig}</Text>
            </main>
        );
    }

    if (savedWyvern) {
        return (
            <main className={styles.page}>
                <div className={styles.savedPanel}>
                    <Text variant="h2">{t.savedTitle}</Text>
                    <Text variant="body" color="#9599C3">
                        {t.savedCode}{' '}
                        <Link to={localizePath(`/wyvern/${savedWyvern.code}`)} className={styles.codeLink}>
                            {savedWyvern.code}
                        </Link>
                    </Text>
                    {savedWyvern.finalUrl && (
                        <img src={savedWyvern.finalUrl} alt={savedWyvern.name} className={styles.savedImage} />
                    )}
                    <Link to={localizePath('/account/wyverns')}>
                        <Button type="button">{t.goToMy}</Button>
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <Text variant="h1" className={styles.title}>{t.pageTitle}</Text>
            <div className={styles.layout}>
                <section className={styles.panel}>
                    {config.categories.map((category) => (
                        <div key={category.code} className={styles.group}>
                            <Text variant="h4">{label(category)}</Text>
                            <div className={styles.optionGrid}>
                                {category.options.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={`${styles.option} ${
                                            selections[category.code] === option.id ? styles.optionActive : ''
                                        }`}
                                        onClick={() => pickOption(category.code, option.id)}
                                    >
                                        {option.thumbnailUrl && (
                                            <img src={option.thumbnailUrl} alt="" className={styles.optionThumb} />
                                        )}
                                        <Text variant="sign">{label(option)}</Text>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {config.zones.length > 0 && (
                        <div className={styles.group}>
                            <Text variant="h4">{t.colorsTitle}</Text>
                            {config.zones.map((zone) => (
                                <div key={zone.code} className={styles.zoneRow}>
                                    <Text variant="sign" color="#9599C3">{label(zone)}</Text>
                                    <div className={styles.swatches}>
                                        {zone.palette.map((color) => (
                                            <button
                                                key={color.hex}
                                                type="button"
                                                title={color.nameRu || color.hex}
                                                className={`${styles.swatch} ${
                                                    colors[zone.code] === color.hex ? styles.swatchActive : ''
                                                }`}
                                                style={{ backgroundColor: color.hex }}
                                                onClick={() => pickColor(zone.code, color.hex)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.group}>
                        <label className={styles.field}>
                            <Text variant="sign" color="#9599C3">{t.nameLabel}</Text>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder={t.namePlaceholder}
                                value={name}
                                maxLength={64}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </label>
                    </div>

                    {saveError && (
                        <Text variant="body" color="#e89a9a">{saveError}</Text>
                    )}
                    <Button type="button" disabled={saving || !name.trim()} onClick={onSave}>
                        {saving ? t.saving : t.save}
                    </Button>
                </section>

                <section className={styles.previewPane}>
                    <div className={styles.previewFrame}>
                        {previewUrl && (
                            <img src={previewUrl} alt={t.previewAlt} className={styles.previewImage} />
                        )}
                        {previewLoading && <div className={styles.previewSpinner} />}
                    </div>
                    {previewError ? (
                        <Text variant="sign" color="#e89a9a">{previewError}</Text>
                    ) : (
                        <Text variant="sign" color="#5a5e85">{t.previewHint}</Text>
                    )}
                </section>
            </div>
        </main>
    );
}
