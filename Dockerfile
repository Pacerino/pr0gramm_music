FROM node:14.17.1-alpine
ENV NODE_ENV=development
# Add ffmpeg
RUN apk add  --no-cache ffmpeg
# Install Dependencies
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install
# Copy files & Compile
WORKDIR /usr/src/app
COPY . .
RUN yarn run build

CMD ["yarn", "start"]
