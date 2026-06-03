# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /workspace/nest-api

COPY nest-api/package.json nest-api/package-lock.json ./
RUN npm ci
RUN mkdir /workspace/prod-deps \
  && cp package.json package-lock.json /workspace/prod-deps/ \
  && cd /workspace/prod-deps \
  && npm ci --omit=dev \
  && rm -rf /root/.npm

COPY nest-api/ ./
COPY generated/ /workspace/generated/
RUN npm run build --if-present

# ---- Stage 2: Runtime ----
FROM alpine:3.20

ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_PATH=/workspace/nest-api/node_modules

WORKDIR /workspace/nest-api

RUN apk add --no-cache nodejs \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /workspace/prod-deps/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /workspace/nest-api/dist ./dist
COPY --from=builder --chown=appuser:appgroup /workspace/nest-api/package.json ./
COPY --from=builder --chown=appuser:appgroup /workspace/generated /workspace/generated

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const p=process.env.PORT||3000; const req=require('http').get({host:'127.0.0.1',port:p,path:'/live',timeout:4000},res=>process.exit(res.statusCode===200?0:1)); req.on('error',()=>process.exit(1)); req.on('timeout',()=>{req.destroy(); process.exit(1);});"

CMD ["node", "dist/main.js"]
