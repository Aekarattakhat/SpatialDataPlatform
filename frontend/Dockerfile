FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG FRONTEND_PORT=80
ARG BACKEND_BASE_URL=http://localhost:8080/v1

ENV FRONTEND_PORT=$FRONTEND_PORT
ENV BACKEND_BASE_URL=$BACKEND_BASE_URL

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV FRONTEND_PORT=80
EXPOSE $FRONTEND_PORT

CMD ["nginx", "-g", "daemon off;"]
