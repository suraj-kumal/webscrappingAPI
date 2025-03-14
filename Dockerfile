FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libxrender1 \
  libxtst6 \
  lsb-release \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
