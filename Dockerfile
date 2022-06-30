FROM node

WORKDIR /doctor-appointment

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "./dist/index.js"]