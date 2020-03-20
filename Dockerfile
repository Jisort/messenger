FROM node:12.2.0-alpine as client

WORKDIR /usr/messenger/
COPY package*.json ./
RUN npm install
COPY / ./
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/messenger/

COPY --from=client /usr/messenger/build/ /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
