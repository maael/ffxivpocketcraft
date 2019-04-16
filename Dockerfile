FROM mhart/alpine-node:11 as build
WORKDIR /repo
COPY . .
RUN yarn

ARG MONGO_URI=mongodb://mongo:27017
ENV MONGO_URI=${MONGO_URI}
ENV NODE_ENV production

RUN yarn build
RUN yarn install --production --ignore-scripts --prefer-offline

FROM mhart/alpine-node:base-11
WORKDIR /repo
COPY --from=build /repo .

ARG MONGO_URI=mongodb://mongo:27017
ENV MONGO_URI=${MONGO_URI}
ENV NODE_ENV production

EXPOSE 3042

ENTRYPOINT ["node", "-r", "dotenv-extended/config"]

CMD ["server/index.js"]
