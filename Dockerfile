# 1. Build
FROM node:22-alpine
# Set working directory
WORKDIR /app
#
COPY package*.json /app/

# Same as yarn
RUN yarn

RUN apk update && apk upgrade && apk add --no-cache bash git openjpeg-tools

COPY . .

RUN yarn generateType && yarn build

RUN ls -l /app/dist

CMD [ "node", "dist/src/main.js" ]
