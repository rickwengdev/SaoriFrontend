# 使用 Node.js 作为构建阶段的基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件到工作目录
COPY . .

# 构建生产版本
RUN npm run build

# 使用 Nginx 作为生产服务器
FROM nginx:alpine

# 将构建的静态文件复制到 Nginx 默认的静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制证书文件
COPY server.crt /etc/nginx/
COPY server.key /etc/nginx/

# 配置 Nginx 使用 HTTPS
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

# 暴露端口 8080
EXPOSE 8080

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]