# Token1000 阿里云部署指南

## 服务器要求

| 配置项 | 推荐规格 |
|--------|----------|
| CPU | 1核 |
| 内存 | 2GB |
| 磁盘 | 40GB SSD |
| 带宽 | 1Mbps |
| 系统 | Ubuntu 22.04 LTS |

## 阿里云安全组配置

在阿里云控制台的安全组中，开放以下端口：

| 端口 | 用途 |
|------|------|
| 22 | SSH (仅限你的 IP) |
| 80 | HTTP |
| 443 | HTTPS |
| 3000 | Next.js (仅内网访问) |

---

## 第一步：连接到服务器

```bash
ssh root@你的服务器IP
```

---

## 第二步：运行数据库部署脚本

```bash
# 设置数据库密码
export DB_USER=token1000_user
export DB_PASSWORD=你的强密码
export DB_NAME=token1000

# 下载并运行数据库部署脚本
curl -sL https://raw.githubusercontent.com/CJZ-ZM/Token1000/main/scripts/deploy-db.sh | bash -s
```

---

## 第三步：运行应用部署脚本

```bash
# 设置环境变量
export DOMAIN=你的域名
export DATABASE_URL=postgresql://token1000_user:你的密码@localhost:5432/token1000
export ADMIN_API_KEY=你的管理后台密钥

# 下载并运行应用部署脚本
curl -sL https://raw.githubusercontent.com/CJZ-ZM/Token1000/main/scripts/deploy-app.sh | bash -s
```

---

## 第四步：配置域名解析

在阿里云 DNS 解析中添加记录：

| 记录类型 | 主机记录 | 记录值 |
|----------|----------|--------|
| A | @ | 你的服务器IP |
| A | www | 你的服务器IP |

---

## 第五步：配置 SSL 证书（可选但强烈推荐）

使用 Let's Encrypt 免费证书：

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d token1000.com -d www.token1000.com
```

---

## 验证部署

部署完成后，访问：

- `http://你的域名` - 应该显示网站首页
- `http://你的域名/zhan` - 中转站列表
- `http://你的域名/zhan/siliconflow` - 供应商详情（含价格提交表单）

---

## 常用维护命令

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs token1000

# 重启应用
pm2 restart token1000

# 更新代码后重部署
cd /var/www/token1000
git pull origin main
npm install
npm run build
pm2 restart token1000
```

---

## 数据库备份

建议设置定时备份：

```bash
# 创建备份脚本
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/root/backups
mkdir -p $BACKUP_DIR
pg_dump -U token1000_user token1000 > $BACKUP_DIR/token1000_$DATE.sql
find $BACKUP_DIR -name "token1000_*.sql" -mtime +7 -delete
EOF

chmod +x /root/backup-db.sh

# 添加定时任务（每天凌晨3点备份）
crontab -e
# 添加行: 0 3 * * * /root/backup-db.sh
```

---

## 备案流程

1. 登录阿里云备案系统
2. 添加网站备案
3. 填写网站信息
4. 上传身份证/营业执照照片
5. 等待初审（1-2工作日）
6. 短信核验
7. 等待管局审核（5-20工作日）

备案期间网站可以通过 IP 正常访问。

---

## 问题排查

### 应用无法访问
```bash
pm2 logs token1000
systemctl status nginx
```

### 数据库连接失败
```bash
su - postgres
psql -d token1000 -U token1000_user
```

### Nginx 502 错误
```bash
pm2 status  # 确认应用在运行
pm2 logs token1000  # 检查应用日志
```
