# Global Arguments for all build stages
ARG BUILD_NODE_VERSION=iron-bullseye
ARG NODE_VERSION=iron-bullseye-slim
ARG APP_DIR=/home/node/app
ARG UID
ARG GID
###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:${NODE_VERSION} AS local

ARG APP_DIR
ARG UID
ARG GID

# install ps command for hot reload
RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*

# change node uid and gid to the defined one
RUN groupmod -g ${GID} node && \
    usermod -u ${UID} -g ${GID} node

# Use the node user from the image (instead of the root user)
USER node

RUN mkdir ${APP_DIR}

# Create app directory
WORKDIR ${APP_DIR}

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

# # Install app dependencies using the `npm ci` command instead of `npm install`
# RUN npm ci

# Bundle app source
COPY --chown=node:node . .



CMD ["yarn", "run", "start:dev"]

###################
# BUILD FOR PRODUCTION
###################

FROM node:${BUILD_NODE_VERSION} AS build

USER node
WORKDIR /home/node/app

COPY --chown=node:node package.json package-lock.json ./

# Keep dev dependencies to build the application
RUN yarn install --frozen-lockfile


COPY --chown=node:node . .

RUN yarn build

###################
# RUNTIME (PRODUCTION & DEV)
###################

FROM node:${NODE_VERSION} AS runtime

ARG APP_DIR=/home/node/app


USER node
WORKDIR ${APP_DIR}

COPY --chown=node:node --from=build /home/node/app/node_modules ${APP_DIR}/node_modules
COPY --chown=node:node --from=build /home/node/app/dist ${APP_DIR}/dist
COPY --chown=node:node views/ /home/node/app/views


EXPOSE 3000

CMD [ "node", "dist/main.js" ]

###################
# PRODUCTION
###################
FROM runtime AS production
ENV NODE_ENV=production

###################
# DEV SERVER
###################
FROM runtime AS dev
ENV NODE_ENV=development