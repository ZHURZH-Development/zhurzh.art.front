import axios from 'axios';
import { api } from './client.js';

/** Профиль текущего пользователя: { id, email, nickname, name, avatarUrl, role }. */
export async function getMe() {
    const { data } = await api.get('/api/me');
    return data;
}

/** Частичное обновление: передавайте только изменённые поля. */
export async function updateMe({ nickname, name }) {
    const { data } = await api.patch('/api/me', { nickname, name });
    return data;
}

/**
 * Загрузка аватарки по схеме presigned upload: бэкенд подписывает URL,
 * файл уходит из браузера напрямую в S3, затем ключ сохраняется в профиле.
 * Content-Type входит в подпись — PUT должен отправить тот же заголовок.
 */
export async function uploadAvatar(file) {
    const { data: presigned } = await api.post('/api/me/avatar/presign-upload', {
        filename: file.name,
        contentType: file.type,
    });
    // Чистый axios: заголовок Authorization нашего API в S3 не нужен и ломает подпись
    await axios.put(presigned.uploadUrl, file, {
        headers: { 'Content-Type': file.type },
    });
    const { data } = await api.put('/api/me/avatar', { key: presigned.key });
    return data;
}
