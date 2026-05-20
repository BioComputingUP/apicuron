ARG NODE_VERSION=iron-bullseye-slim
ARG NGINX_VERSION=alpine3.21

FROM node:${NODE_VERSION} AS local

ARG UID
ARG GID

ENV APP_DIR=/home/node/app

# change node uid and gid to match the running user's machine
RUN groupmod -g ${GID} node && \
    usermod -u ${UID} -g ${GID} node


USER node

WORKDIR ${APP_DIR}


COPY --chown=node:node ./package*.json .
COPY --chown=node:node ./yarn.lock .

CMD ["yarn", "run", "start-dev-external"]

FROM node:${NODE_VERSION} AS deps

RUN apt-get update && apt-get install -y git && apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

FROM node:${NODE_VERSION} AS build-prod

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build


FROM node:${NODE_VERSION} AS build-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build-dev

FROM nginx:${NGINX_VERSION} AS production


COPY --chown=nginx:nginx --from=build-prod /app/dist/apicuron-ui /usr/share/nginx/html
COPY --chown=nginx:nginx prod.nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

FROM nginx:${NGINX_VERSION} AS dev

COPY --chown=nginx:nginx --from=build-dev /app/dist/apicuron-ui /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]