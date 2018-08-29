FROM node:9

WORKDIR /usr/src/app

COPY yarn.lock ./

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

RUN yarn global add pm2

EXPOSE 3042

CMD ["pm2-runtime", "server"]
