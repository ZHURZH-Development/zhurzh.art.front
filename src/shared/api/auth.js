import { api } from './client.js';

/** Отправить 6-значный код на почту (TTL 10 минут, повтор раз в 30 секунд). */
export async function requestCode(email) {
    await api.post('/api/auth/request-code', { email });
}

/** Обменять код на JWT. Возвращает { token, role, email }. */
export async function verifyCode(email, code) {
    const { data } = await api.post('/api/auth/verify', { email, code });
    return data;
}
