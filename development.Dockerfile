FROM node:19

# Docker Puppeteer reference:
# https://pptr.dev/guides/docker
# https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer
# installs, work.
RUN apt-get update --no-install-recommends\
    && apt-get install -y --no-install-recommends wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create app/working/bot directory
RUN mkdir -p /app
WORKDIR /app

# Install app development dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install --include=dev

# Bundle app source
COPY . ./

# API port
EXPOSE 3000

# Show current folder structure in logs
# RUN ls -al -R

# Run the start command
CMD [ "npx", "nodemon", "--inspect=0.0.0.0:9229", "src/index.js" ]
