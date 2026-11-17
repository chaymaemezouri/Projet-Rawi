FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["sh", "-c", "if [ ! -d node_modules/react ]; then npm install; fi && npm run dev -- --host 0.0.0.0 --port 5174"]
