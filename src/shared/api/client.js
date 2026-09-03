import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'zhurzh_token';

export function getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Единственная точка входа в API бэкенда. Бэкенд на все ошибки отвечает
 * { message: '…' } — сообщение сразу пригодно для показа пользователю
 * (см. apiErrorMessage).
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8092',
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/** Человекочитаемое сообщение из ошибки axios. */
export function apiErrorMessage(error, fallback = 'Что-то пошло не так. Попробуйте ещё раз.') {
    return error?.response?.data?.message || fallback;
}
