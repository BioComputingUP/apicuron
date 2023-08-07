ARG UID=1002
ARG GID=1002


FROM node:16.14.2-buster-slim AS development


# load arguments in this target
ARG UID=1002
ARG GID=1002

# set the APP directory
ENV APP_DIR /home/node/app

# change node uid and gid to the defined one
RUN groupmod -g ${GID} node && \
    usermod -u ${UID} -g ${GID} node

# switch to the node user
USER node

# create app directory
RUN mkdir ${APP_DIR}

# create app directory
WORKDIR ${APP_DIR}


COPY --chown=node:node ./package*.json ${APP_DIR}/

# # npm install all the packages precisely
# RUN npm install


# run the app in the development server
CMD ["npm", "run", "start-dev-external"]