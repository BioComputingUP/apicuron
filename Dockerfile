# Global Arguments for all build stages
ARG APP_DIR=/home/node/app
ARG UID=1002
ARG GID=1002
###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:16.14.2-buster-slim As development

ARG APP_DIR
ARG UID=1002
ARG GID=1002

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

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm ci

# Bundle app source
COPY --chown=node:node . .



CMD ["npm", "run", "start:dev"]

###################
# BUILD FOR PRODUCTION
###################

FROM node:16.14.2-buster-slim As build

ARG APP_DIR

# change node uid and gid to the defined one
RUN groupmod -g ${GID} node && \
    usermod -u ${UID} -g ${GID} node

USER node


WORKDIR ${APP_DIR}

COPY --chown=node:node package*.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development ${APP_DIR}/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --only=production && npm cache clean --force


###################
# PRODUCTION
###################

FROM node:16.14.2-buster-slim As production

ARG APP_DIR

# change node uid and gid to the defined one
RUN groupmod -g ${GID} node && \
    usermod -u ${UID} -g ${GID} node

USER node

RUN mkdir ${APP_DIR}
WORKDIR ${APP_DIR}

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build ${APP_DIR}/node_modules ${APP_DIR}/node_modules
COPY --chown=node:node --from=build ${APP_DIR}/dist ${APP_DIR}/dist


# Start the server using the production build
CMD [ "node", "dist/main.js" ]