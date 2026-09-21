# Everything: one deployable application (Node.js serves both API and React frontend)
FROM node:22-alpine AS build
WORKDIR /app
ENV VITE_API_ENABLED=true
COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --legacy-peer-deps
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/server ./server

EXPOSE 3001
CMD ["node", "dist-server/index.js"]
