FROM node:14.17.1-alpine
ENV NODE_ENV=development
RUN apk add  --no-cache ffmpeg
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN ["yarn", "install"]
COPY . .
RUN yarn run build

CMD ["yarn", "start"]
