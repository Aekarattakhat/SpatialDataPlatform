FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .env ./
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV FRONTEND_PORT=80
EXPOSE $FRONTEND_PORT

CMD ["nginx", "-g", "daemon off;"]
