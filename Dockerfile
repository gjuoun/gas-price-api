FROM node:12.16.1-alpine3.9
WORKDIR /usr/home/gjuoun/gas-price-api
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 6002
ENV PORT=6002
CMD ["npm", "start"]