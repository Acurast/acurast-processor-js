FROM node:22-bookworm-slim

WORKDIR /proj

COPY package.json package-lock.json ./
COPY packages/std-mocks/package.json packages/std-mocks/package.json
COPY packages/taquito/package.json packages/taquito/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/utils/package.json packages/utils/package.json
RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN npm run build

CMD ["npm", "run", "test"]