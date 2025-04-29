FROM node:22-bookworm-slim

RUN apt update && apt install -y jq

WORKDIR /proj

COPY package.json package-lock.json ./
COPY packages/std-mocks/package.json packages/std-mocks/package.json
COPY packages/taquito/package.json packages/taquito/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/utils/package.json packages/utils/package.json
RUN npm ci

COPY . .
RUN chmod +x publish-packages.sh

ENV NODE_ENV=production

RUN npm run build

CMD ["npm", "run", "test"]