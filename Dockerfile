FROM node:16.20.0-alpine3.17

WORKDIR /code
COPY package.json .
COPY yarn.lock .
COPY index.js .

RUN yarn install

CMD ["node", "index.js"]
