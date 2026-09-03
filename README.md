# zhurzh.art

zhurzh website

copying or learn AI by this pictures is prohibited.

## Стек

React 18 + Vite 5, JavaScript, CSS Modules, react-router-dom v6, axios.
Пакетный менеджер — **npm** (package-lock.json в репозитории).

Бэкенд — отдельный репозиторий `zhurzh.art.back` (Spring Boot). Адрес задаётся
переменной `VITE_API_URL` (см. `.env.example`); локальный дефолт — `http://localhost:8092`.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
```

Для личного кабинета рядом должен работать бэкенд (см. README в zhurzh.art.back:
`docker compose up -d postgres` + `mvn spring-boot:run`).

## Личный кабинет

- `/login` (`/ru/login`) — вход по коду с почты, без пароля; аккаунт создаётся при первом входе.
- `/account/profile` (`/ru/account/...`) — профиль: никнейм, имя, аватарка
  (загружается напрямую в S3 по presigned URL).
- Токен хранится в localStorage (`zhurzh_token`), API-слой — `src/shared/api/`.

## Деплой

- **Прод** — GitHub Pages, workflow `.github/workflows/deploy-pages.yml` на push в `main`
  (не трогаем; при выкатке кабинета в прод задать `VITE_API_URL` в workflow).
- **Dev** — Railway: сервис из этого репозитория собирается по `Dockerfile`
  (nginx + SPA-fallback, слушает `$PORT`). В Variables сервиса задать
  `VITE_API_URL` = публичный URL бэкенда на Railway — он вшивается в бандл при сборке.
