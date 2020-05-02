FROM node:12
WORKDIR /usr/src/app

# Install dependancies first.
RUN apt-get update -y
RUN apt-get install ffmpeg graphicsmagick fortune cowsay python3-pip -y

ENV PATH="/usr/games:${PATH}"

RUN pip3 install chatterbot
RUN pip3 install chatterbot_corpus
RUN pip3 install emoji

COPY package*.json ./
RUN npm ci

COPY ./src/* .
USER root
CMD [ "node", "index.js" ]

