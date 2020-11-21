#TODO add GPU acceleration support
FROM ubuntu:20.04

RUN apt-get update

RUN DEBIAN_FRONTEND=noninteractive apt install -y libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2

RUN apt-get install -y curl
# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app

COPY package.json /app

RUN npm install 

COPY . /app

CMD sh