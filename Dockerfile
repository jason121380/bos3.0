FROM node:20.12.1-alpine AS builder
WORKDIR /usr/app

# 複製 package 檔案
COPY package*.json ./

# 設定 npm 下載重試與超時，應對大型 node_modules 下載時的網路不穩定
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# 安裝相依套件 (包含 devDependencies 以便 build)
# 使用 --legacy-peer-deps 來解決舊版套件之間的相依性衝突 (ERESOLVE)
RUN npm install --legacy-peer-deps

# 複製原始碼
COPY . .

# 執行建置
RUN npm run build

# 執行階段
FROM node:20.12.1-alpine
WORKDIR /usr/app

# 從編譯階段複製 build 資料夾
COPY --from=builder /usr/app/build ./build

# 安裝 serve
RUN npm install -g serve

EXPOSE 3000

# 啟動應用程式
CMD ["serve", "-s", "build"]

