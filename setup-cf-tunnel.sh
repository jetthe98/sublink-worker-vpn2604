#!/bin/bash

# Cloudflare Tunnel + OpenClash 一键配置脚本（小主机端）
# 使用方法：sudo bash setup-cf-tunnel.sh

set -e

echo "========================================"
echo "  Cloudflare Tunnel 一键配置脚本"
echo "  适用于小主机远程访问"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    exit 1
fi

# 检查系统架构
ARCH=$(uname -m)
case $ARCH in
    x86_64)  CF_ARCH="linux-amd64" ;;
    aarch64) CF_ARCH="linux-arm64" ;;
    armv7l)  CF_ARCH="linux-arm" ;;
    *)       CF_ARCH="linux-amd64" ;;
esac

echo -e "${YELLOW}[1/6] 安装 cloudflared...${NC}"
if command -v cloudflared &> /dev/null; then
    echo -e "${GREEN}cloudflared 已安装: $(cloudflared --version)${NC}"
else
    echo "正在下载 cloudflared ($CF_ARCH)..."
    curl -L "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-$CF_ARCH" -o /tmp/cloudflared
    chmod +x /tmp/cloudflared
    mv /tmp/cloudflared /usr/local/bin/cloudflared
    echo -e "${GREEN}cloudflared 安装完成: $(cloudflared --version)${NC}"
fi
echo ""

# 获取域名
echo -e "${YELLOW}[2/6] 配置域名${NC}"
echo "请输入你的 Cloudflare 域名（例如: example.com）:"
read -p "域名: " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}域名不能为空${NC}"
    exit 1
fi

# 登录 Cloudflare
echo ""
echo -e "${YELLOW}[3/6] 登录 Cloudflare${NC}"
echo "请在浏览器中完成登录..."
cloudflared tunnel login

# 创建 Tunnel
echo ""
echo -e "${YELLOW}[4/6] 创建 Tunnel${NC}"
TUNNEL_NAME="home-server"

if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo -e "${GREEN}Tunnel '$TUNNEL_NAME' 已存在${NC}"
else
    echo "创建 Tunnel '$TUNNEL_NAME'..."
    OUTPUT=$(cloudflared tunnel create $TUNNEL_NAME)
    TUNNEL_ID=$(echo "$OUTPUT" | grep -oP '[a-f0-9-]{36}')
    echo -e "${GREEN}Tunnel 创建成功: $TUNNEL_ID${NC}"
fi

# 获取 Tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | grep -oP '[a-f0-9-]{36}' | head -1)

if [ -z "$TUNNEL_ID" ]; then
    echo -e "${RED}无法获取 Tunnel ID${NC}"
    exit 1
fi

CRED_FILE="$HOME/.cloudflared/$TUNNEL_ID.json"

# 配置 Tunnel
echo ""
echo -e "${YELLOW}[5/6] 配置 Tunnel${NC}"

mkdir -p ~/.cloudflared

cat > ~/.cloudflared/config.yml << EOF
# Cloudflare Tunnel 配置文件
tunnel: $TUNNEL_ID
credentials-file: $CRED_FILE

# 连接优化
retries: 5
grace-period: 30s

ingress:
  # HTTP 代理（OpenClash 使用）
  - hostname: proxy.$DOMAIN
    service: http://localhost:8118

  # SOCKS5 代理
  - hostname: socks.$DOMAIN
    service: socks://localhost:1080

  # SSH
  - hostname: ssh.$DOMAIN
    service: ssh://localhost:22

  # 默认规则
  - service: http_status:404
EOF

echo -e "${GREEN}配置文件已创建: ~/.cloudflared/config.yml${NC}"

# 创建 DNS 记录
echo ""
echo "创建 DNS 记录..."
cloudflared tunnel route dns $TUNNEL_NAME proxy.$DOMAIN || echo -e "${YELLOW}proxy.$DOMAIN 记录已存在${NC}"
cloudflared tunnel route dns $TUNNEL_NAME socks.$DOMAIN || echo -e "${YELLOW}socks.$DOMAIN 记录已存在${NC}"
cloudflared tunnel route dns $TUNNEL_NAME ssh.$DOMAIN || echo -e "${YELLOW}ssh.$DOMAIN 记录已存在${NC}"

# 安装 Privoxy（提供 HTTP 代理）
echo ""
echo -e "${YELLOW}[6/6] 安装 Privoxy...${NC}"
if command -v privoxy &> /dev/null; then
    echo -e "${GREEN}Privoxy 已安装${NC}"
else
    apt update && apt install -y privoxy 2>/dev/null || {
        yum install -y privoxy 2>/dev/null || {
            echo -e "${YELLOW}无法自动安装 Privoxy，请手动安装${NC}"
        }
    }
fi

# 配置 Privoxy
cat > /etc/privoxy/config << 'EOF'
# Privoxy 配置文件
listen-address  127.0.0.1:8118
forward-socks5  / 127.0.0.1:1080 .

# 日志
logfile /var/log/privoxy/privoxy.log
debug 1

# 访问控制
permit-access 127.0.0.1
EOF

mkdir -p /var/log/privoxy

# 启动服务
echo ""
echo "启动服务..."
sudo cloudflared service install 2>/dev/null || true
sudo systemctl enable cloudflared
sudo systemctl restart cloudflared

sudo systemctl enable privoxy 2>/dev/null || true
sudo systemctl restart privoxy 2>/dev/null || true

echo ""
echo "========================================"
echo -e "${GREEN}配置完成！${NC}"
echo "========================================"
echo ""
echo "服务地址："
echo "  HTTP 代理:  proxy.$DOMAIN"
echo "  SOCKS 代理: socks.$DOMAIN"
echo "  SSH:        ssh.$DOMAIN"
echo ""
echo "查看状态："
echo "  sudo systemctl status cloudflared"
echo "  sudo systemctl status privoxy"
echo ""
echo "日志："
echo "  journalctl -u cloudflared -f"
echo ""
echo "========================================"
echo ""
echo "下一步：在国内 OpenWrt + OpenClash 中添加节点"
echo "配置文件已保存在: ~/.cloudflared/config.yml"
echo ""
