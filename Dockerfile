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
# 用 npm ci 依 package-lock.json 安裝，與 CI 相同、每次建置版本一致
RUN npm ci --legacy-peer-deps

# 複製原始碼
COPY . .

# 執行建置
RUN npm run build

# 執行階段
FROM node:20.12.1-alpine
WORKDIR /usr/app

# 從編譯階段複製 build 資料夾
COPY --from=builder /usr/app/build ./build

# 安裝 serve（固定大版本 14；build/serve.json 由 public/ 複製而來，設定 /assets 長效快取、HTML 不快取）
RUN npm install -g serve@14

EXPOSE 3000

# 啟動應用程式
CMD ["serve", "-s", "build"]

