FROM node:20.11.0-alpine3.19

WORKDIR /code
COPY package.json .
COPY yarn.lock .
COPY index.js .

RUN yarn install

CMD ["node", "index.js"]
