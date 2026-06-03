FROM node:22-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund \
    && apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY src ./src
COPY public ./public

RUN addgroup -S eatsy && adduser -S -G eatsy eatsy && chown -R eatsy:eatsy /app
USER eatsy

EXPOSE 3000
CMD ["node", "src/server.js"]
