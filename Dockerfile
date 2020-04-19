FROM node:12
WORKDIR /usr/src/app

# Install dependancies first.
RUN apt-get update -y
RUN apt-get install ffmpeg graphicsmagick -y

COPY package*.json ./
RUN npm ci

COPY . .
USER root
CMD [ "node", "index.js" ]

