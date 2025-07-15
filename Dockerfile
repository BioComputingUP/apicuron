ARG UID=1002
ARG GID=1002


FROM node:18.13.0-buster-slim AS development


# load arguments in this target
ARG UID
ARG GID

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

FROM node:iron-bullseye-slim AS build

RUN apt-get update && apt-get install -y git && apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --verbose

COPY . .

RUN yarn build



FROM nginx:alpine3.21 AS production


COPY --chown=nginx:nginx --from=build /app/dist/apicuron-ui /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
