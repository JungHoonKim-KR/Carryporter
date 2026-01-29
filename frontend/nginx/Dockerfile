# Build stage - React 빌드
FROM node:18-alpine AS build

WORKDIR /app

# 의존성 설치 (경로에서 sse-client 제거)
COPY frontend/package*.json ./
RUN npm install

# 소스 복사 및 빌드 (경로에서 sse-client 제거)
COPY frontend/ .
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

# React 빌드 결과물을 nginx로 복사
# Vite 프로젝트의 기본 빌드 출력 경로는 'dist'입니다.
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 설정 복사
COPY frontend/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]