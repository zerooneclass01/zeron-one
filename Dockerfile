# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Injeta limite de memória para o Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instala dependências aproveitando o cache do Docker
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o código completo original
COPY . .

# --- FORÇAR MODO CLIENTE EM TODAS AS ROTAS (Bypass definitivo do Prerender) ---
# Reescrevemos o arquivo de rotas do servidor para dizer explicitamente ao Angular: 
# "Não importa a rota, renderize apenas no Client (Navegador)".
RUN mkdir -p src/app && echo 'import { RenderMode } from "@angular/ssr"; export const serverRoutes = [{ path: "**", renderMode: RenderMode.Client }]; export default serverRoutes;' > src/app/app.routes.server.ts || true
RUN mkdir -p src/app && echo 'import { RenderMode } from "@angular/ssr"; export const serverRoutes = [{ path: "**", renderMode: RenderMode.Client }]; export default serverRoutes;' > src/app/server.routes.ts || true

# Executa o build clássico
RUN npx ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

# Copia os arquivos gerados com segurança
RUN cp -r /app/dist/*/browser/* /usr/share/nginx/html/ || cp -r /app/dist/*/* /usr/share/nginx/html/ || cp -r /app/dist/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]