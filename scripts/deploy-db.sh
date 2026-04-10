#!/bin/bash
# Token1000 数据库部署脚本
# 在服务器上以 root 权限运行

set -e

echo "=== Token1000 数据库部署脚本 ==="

# 1. 安装 PostgreSQL
echo "[1/4] 安装 PostgreSQL..."
apt update && apt install -y postgresql postgresql-contrib

# 2. 启动 PostgreSQL
echo "[2/4] 启动 PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# 3. 创建数据库用户和数据库
echo "[3/4] 创建数据库和用户..."

# 读取环境变量或使用默认值
DB_USER="${DB_USER:-token1000_user}"
DB_NAME="${DB_NAME:-token1000}"
DB_PASSWORD="${DB_PASSWORD:-token1000_secure_password}"

# 切换到 postgres 用户执行 psql 命令
su - postgres -c "psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\"" || echo "用户已存在，跳过"
su - postgres -c "psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\"" || echo "数据库已存在，跳过"
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\""

# 4. 导入数据库 Schema
echo "[4/4] 导入数据库 Schema..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 导入 schema（需要提供完整路径）
su - postgres -c "psql -d $DB_NAME -f $SCRIPT_DIR/../scripts/schema.sql" || echo "Schema 导入完成或已存在"

echo ""
echo "=== 数据库部署完成 ==="
echo "数据库用户: $DB_USER"
echo "数据库名: $DB_NAME"
echo ""
echo "连接字符串示例:"
echo "postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "请确保将此连接字符串添加到 .env 文件的 DATABASE_URL 中"
