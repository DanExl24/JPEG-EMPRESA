# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

# Pods Podman

```bash
# Construir imágenes
podman build -t jpeg-frontend:latest -f src/Dockerfile.frontend .
podman build -t jpeg-backend:latest -f backend/Dockerfile.backend ./backend
```

```
# Levantar pods
podman play kube podman-app-kube.yaml
podman play kube podman-db-kube.yaml
```

```
# Detener pods
podman pod stop jpeg-app
podman pod stop jpeg-db
```

```
# Eliminar pods
podman pod rm jpeg-app
podman pod rm jpeg-db
```

# FRONTEND

```bash
npm install
npm install axios vue-router pinia
npm install vue-router
npm install -D tailwindcss@3.3.3 postcss autoprefixer
npx tailwindcss init -p
```

# BACKEND

```bash
    npm init -y
    npm install express cors dotenv
    npm install -D nodemon
```

# Correr Frontend

Raiz - npm run dev

# Correr Backend

```
cd backend
npm run dev
```

# Instalar Prisma

```
cd backend
si hay node_modules, borrar la carpeta node_modules
npm ci
npx prisma generate
npx prisma db push
npm run dev
```
