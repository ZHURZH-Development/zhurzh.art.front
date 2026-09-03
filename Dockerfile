# Для деплоя на Railway. VITE_API_URL приходит переменной сервиса и
# вшивается в бандл на этапе сборки (Vite читает env только при build).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
# Railway задаёт PORT; локально по умолчанию 80.
ENV PORT=80
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
