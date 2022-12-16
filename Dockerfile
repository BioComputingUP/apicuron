FROM node:16.14.2-buster-slim

ENV NODE_ENV=production

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# installing project dependencies
RUN npm install


COPY . .

# installing node global dependencies
RUN npm i -g @nestjs/cli@8.2.5


# installing packages
CMD node dist/main