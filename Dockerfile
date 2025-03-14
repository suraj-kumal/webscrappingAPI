FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  libx11-xcb1 \
  libxcb1 \
  libxcb-dri3-0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libgtk-3-0 \
  libnss3 \
  libasound2 \
  libatk-bridge2.0-0 \
  libxshmfence1 \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libcups2 \
  libdbus-1-3 \
  lsb-release \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*


COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
