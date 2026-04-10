#!/bin/bash
# Token1000 应用部署脚本
# 在服务器上以 root 权限运行

set -e

echo "=== Token1000 应用部署脚本 ==="

# 配置变量
APP_DIR="/var/www/token1000"
APP_USER="www-data"
GIT_REPO="https://github.com/CJZ-ZM/Token1000.git"
DOMAIN="${DOMAIN:-token1000.com}"

# 1. 安装基础软件
echo "[1/7] 安装基础软件 (Node.js, Nginx, PM2)..."

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 Nginx
apt install -y nginx

# 安装 PM2 (全局)
npm install -g pm2

# 2. 创建应用目录
echo "[2/7] 创建应用目录..."
mkdir -p $APP_DIR
chown -R $APP_USER:$APP_USER $APP_DIR

# 3. 拉取代码
echo "[3/7] 拉取代码..."
cd $APP_DIR

# 如果目录已有代码，更新；否则克隆
if [ -d ".git" ]; then
    echo "代码已存在，执行 git pull..."
    sudo -u $APP_USER git pull origin main
else
    sudo -u $APP_USER git clone $GIT_REPO .
fi

# 4. 安装依赖
echo "[4/7] 安装依赖..."
sudo -u $APP_USER npm install

# 5. 配置环境变量
echo "[5/7] 配置环境变量..."
cat > $APP_DIR/.env << EOF
DATABASE_URL=${DATABASE_URL:-postgresql://token1000_user:token1000_secure_password@localhost:5432/token1000}
ADMIN_API_KEY=${ADMIN_API_KEY:-token1000-admin-key}
NODE_ENV=production
EOF
chown $APP_USER:$APP_USER $APP_DIR/.env
chmod 600 $APP_DIR/.env

# 6. 构建应用
echo "[6/7] 构建应用..."
cd $APP_DIR
sudo -u $APP_USER npm run build

# 7. 配置 PM2
echo "[7/7] 配置 PM2..."
cd $APP_DIR

# 创建 PM2 配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'token1000',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# 启动 PM2
sudo -u $APP_USER pm2 start ecosystem.config.js
sudo -u $APP_USER pm2 save
sudo -u $APP_USER pm2 startup

# 配置 Nginx 反向代理
cat > /etc/nginx/sites-available/token1000 << EOF
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/token1000 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # 删除默认站点

# 测试 Nginx 配置
nginx -t

# 重载 Nginx
systemctl reload nginx

echo ""
echo "=== 部署完成 ==="
echo "应用目录: $APP_DIR"
echo "域名: $DOMAIN"
echo "访问地址: http://$DOMAIN"
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs token1000"
echo "  重启应用: pm2 restart token1000"
echo "  查看状态: pm2 status"
