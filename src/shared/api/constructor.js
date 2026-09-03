import axios from 'axios';
import { api } from './client.js';

// ── Клиентская сторона конструктора ─────────────────────────────────────

/**
 * Конфиг конструктора: { categories: [{code, nameRu, nameEn, options}],
 * zones: [{code, nameRu, nameEn, palette}] }. Слоёв и ключей S3 здесь нет —
 * браузер видит только иконки опций и палитры.
 */
export async function getConstructorConfig() {
    const { data } = await api.get('/api/constructor/config');
    return data;
}

/**
 * Серверное превью текущего выбора: PNG-blob с ватермаркой.
 * config = { selections: {категория: optionId}, colors: {зона: hex} }.
 * signal — AbortController, чтобы отменять устаревшие запросы при кликах.
 */
export async function renderPreview(config, signal) {
    const { data } = await api.post('/api/constructor/preview', config, {
        responseType: 'blob',
        signal,
    });
    return data;
}

/** Сохранить виверну: рендерит финал на сервере и присваивает код W-XXXXXX. */
export async function saveWyvern({ name, selections, colors }) {
    const { data } = await api.post('/api/wyverns', { name, selections, colors });
    return data;
}

export async function getMyWyverns() {
    const { data } = await api.get('/api/wyverns/my');
    return data;
}

/** Публичная страница-сертификат; работает без токена. */
export async function getPublicWyvern(code) {
    const { data } = await api.get(`/api/public/wyverns/${encodeURIComponent(code)}`);
    return data;
}

// ── Админка ─────────────────────────────────────────────────────────────

/** Полное дерево: { categories: [...с опциями и слоями], zones: [...] }. */
export async function adminGetTree() {
    const { data } = await api.get('/api/admin/constructor/tree');
    return data;
}

/**
 * Загрузка ассета в S3 по presigned-схеме (как аватарка в me.js):
 * purpose = 'LAYER' | 'THUMBNAIL'. Возвращает key для прикрепления.
 */
export async function adminUploadAsset(file, purpose) {
    const { data: presigned } = await api.post('/api/admin/constructor/presign-upload', {
        filename: file.name,
        contentType: file.type,
        purpose,
    });
    // Чистый axios: заголовок Authorization нашего API в S3 не нужен и ломает подпись
    await axios.put(presigned.uploadUrl, file, {
        headers: { 'Content-Type': file.type },
    });
    return presigned.key;
}

export async function adminCreateCategory(payload) {
    const { data } = await api.post('/api/admin/constructor/categories', payload);
    return data;
}

export async function adminUpdateCategory(id, payload) {
    const { data } = await api.patch(`/api/admin/constructor/categories/${id}`, payload);
    return data;
}

export async function adminDeleteCategory(id) {
    await api.delete(`/api/admin/constructor/categories/${id}`);
}

export async function adminCreateOption(categoryId, payload) {
    const { data } = await api.post(`/api/admin/constructor/categories/${categoryId}/options`, payload);
    return data;
}

export async function adminUpdateOption(optionId, payload) {
    const { data } = await api.patch(`/api/admin/constructor/options/${optionId}`, payload);
    return data;
}

export async function adminDeleteOption(optionId) {
    await api.delete(`/api/admin/constructor/options/${optionId}`);
}

export async function adminSetThumbnail(optionId, key) {
    const { data } = await api.put(`/api/admin/constructor/options/${optionId}/thumbnail`, { key });
    return data;
}

export async function adminAddLayer(optionId, payload) {
    const { data } = await api.post(`/api/admin/constructor/options/${optionId}/layers`, payload);
    return data;
}

export async function adminUpdateLayer(optionId, layerId, payload) {
    const { data } = await api.patch(
        `/api/admin/constructor/options/${optionId}/layers/${layerId}`,
        payload,
    );
    return data;
}

export async function adminDeleteLayer(optionId, layerId) {
    const { data } = await api.delete(`/api/admin/constructor/options/${optionId}/layers/${layerId}`);
    return data;
}

export async function adminCreateZone(payload) {
    const { data } = await api.post('/api/admin/constructor/zones', payload);
    return data;
}

export async function adminUpdateZone(id, payload) {
    const { data } = await api.patch(`/api/admin/constructor/zones/${id}`, payload);
    return data;
}

export async function adminDeleteZone(id) {
    await api.delete(`/api/admin/constructor/zones/${id}`);
}
