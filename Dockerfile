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
# Copia la build dalla cartella dist di Vite
COPY --from=build /app/dist /usr/share/nginx/html
# Espone la porta standard
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]