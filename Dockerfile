# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Vite genera la cartella /dist
RUN npm run build

# Stage 2: Serve con Nginx
FROM nginx:alpine

# Crea un file di configurazione nginx al volo
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]