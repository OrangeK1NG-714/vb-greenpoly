# GreenPoly 上线部署指南(Vultr 新加坡 VPS + Cloudflare)

> 按你已敲定的方案:**自建 VPS(新加坡机房)+ Cloudflare Free**。
> 全程约 1–2 小时。跟着从上到下做即可,命令直接复制粘贴。

## 先回答：要不要买海外服务器？

**建议把源站放在新加坡，但不必执着于“国外品牌”的服务器。**Vultr、DigitalOcean，或阿里云的**新加坡地域**都可以；东南亚买家、Googlebot 和 Bingbot 都能稳定访问即可。现有单台 2C4G VPS 配合 Cloudflare 足够，不需要再买美国或欧洲机器。

阿里云**中国大陆地域**不是“Google 一定不收录”，但它会带来 ICP 备案、跨境网络波动和海外爬虫可用性风险，不适合这个面向东南亚的站点。Google 是否收录主要看：公开 HTTPS 可访问、返回 200、没有 `noindex`/防爬拦截、canonical 与 sitemap 一致，以及在 Search Console 提交，而不是云厂商品牌。

本项目当前的优先级是：**新加坡源站 + Cloudflare 橙云代理 + 单一正式域名**。所有 `www`/非 `www` 变体必须最终指向同一正式 URL，避免索引信号分散。

## 架构总览

```
东南亚买家 → Cloudflare(免费 CDN/DNS/防护)→ Vultr 新加坡 VPS
                                              ├─ Caddy(自动 HTTPS 反向代理)
                                              └─ Next.js(PM2 守护)+ SQLite
```

**数据库直接用 SQLite**:单台 VPS + 询盘型网站,SQLite 完全够用(每天几千 PV 无压力),
零改代码、零额外服务、备份 = 拷一个文件。等以后询盘量大了再迁 Postgres(见文末)。

## 每月花多少钱

| 项目 | 月费 | 说明 |
|---|---|---|
| Vultr 新加坡 VPS(2C4G High Frequency) | **$24 ≈ ¥175** | 唯一大头;预算紧选 1C2G $12 也够跑,后台可一键升配 |
| 域名(.com) | ≈ ¥7(年付 ¥80 摊到每月) | 注册商年付 |
| Cloudflare CDN/DNS/防护 | 0 | Free 计划 |
| HTTPS 证书 | 0 | Caddy 自动申请续期 |
| 数据库(SQLite) | 0 | 无需另租 |
| Zoho 域名邮箱(收信) | 0 | 免费版 5 账号 |
| Resend 发信(询盘通知,后期加) | 0 | 免费 3000 封/月 |
| **合计** | **≈ ¥180/月**(省钱版 ≈ ¥95/月) | |

---

## 第 0 步:上线前必改清单

**已完成 ✅**(2026-07-06 时点):

- ✅ `src/lib/site.ts` — 真实 WhatsApp/Zalo(+86 183 5297 8082)、Gmail、慈溪地址已填
- ✅ `messages/*.json` — 六个语言的 `errorBody` 占位电话已换成真号
- ✅ `llms.txt` — 已改为诚实叙事(无虚假认证),语言列表已更新

**还剩(带 ⬜ 的做完才能上线)**:

| 状态 | 事项 | 说明 |
|---|---|---|
| ⬜ | `.env`(第 4 步在服务器上建) | `AUTH_SECRET` 随机串、`SEED_ADMIN_PASSWORD` 强密码、`NEXT_PUBLIC_SITE_URL` 真域名 |
| ⬜ | 本机跑一次 `npm run build` 确认无错 | 改完任何代码后的习惯动作 |
| 可选 | LINE 官方账号(泰国买家) | 申请后把 ID 填进 `site.ts` 的 `line` 字段即显示 |
| 可选 | Zoho 邮箱开通后 | 把 `site.ts` 和 `messages/*.json` 里的 Gmail 换成 `sales@greenpoly.com` |
| 可选 | 品牌分享图 | 做一张 1200×630 放 `public/og.jpg`,替换 `src/app/layout.tsx` 里 OpenGraph 的临时产品图 |

生成随机 AUTH_SECRET:本机终端跑 `openssl rand -base64 32`,输出留着第 4 步用。

---

## 第 1 步:域名 + Cloudflare(~15 分钟)

1. 买域名(Namecheap / 阿里云都行,比如 `greenpoly.com`)。
2. 注册 [cloudflare.com](https://cloudflare.com) → **Add a Site** → 输入域名 → 选 **Free 计划**。
3. Cloudflare 会给你两个 NS 地址(如 `xxx.ns.cloudflare.com`)→ 回到域名注册商,把域名的 Nameservers 改成这两个。
4. 生效后(几分钟到几小时),在 Cloudflare **SSL/TLS** 页把模式设为 **Full (strict)**。

DNS 记录等第 2 步拿到服务器 IP 后再加。

## 第 2 步:开 Vultr 新加坡服务器(~10 分钟)

1. 注册 [vultr.com](https://vultr.com) → **Deploy New Server**。
2. 选择:
   - 类型:**High Frequency**(高主频,建站首选)
   - 位置:**Singapore**
   - 系统:**Ubuntu 24.04 LTS**
   - 规格:**2 vCPU / 4 GB RAM($24/月)**(1C2G $12 也能跑,预算紧可以先小后升)
3. SSH Keys:强烈建议添加你 Mac 的公钥(本机跑 `cat ~/.ssh/id_ed25519.pub`,没有就先 `ssh-keygen -t ed25519` 生成)。
4. Deploy → 记下服务器 IP(下文用 `<服务器IP>` 指代)。
5. 回 Cloudflare → DNS → 添加两条 **A 记录**(Proxy 状态开着橙色云☁️):
   - `@` → `<服务器IP>`
   - `www` → `<服务器IP>`

## 第 3 步:服务器初始化(~15 分钟)

本机终端 SSH 上去,依次执行:

```bash
ssh root@<服务器IP>

# 更新系统
apt update && apt upgrade -y

# 防火墙:只放行 SSH / HTTP / HTTPS
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

# 防爆破
apt install -y fail2ban && systemctl enable --now fail2ban

# 安装 Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git

# 安装 PM2(进程守护,崩了自动拉起、开机自启)
npm install -g pm2

# 安装 Caddy(全自动 HTTPS 的 Web 服务器,比 Nginx 省心)
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

## 第 4 步:部署代码(~20 分钟)

**上传代码**(两种任选):

- 方式 A(推荐,以后更新方便):把项目推到 GitHub 私有仓库,服务器上 `git clone`。
- 方式 B(最直接):本机 rsync 上传:

```bash
# 在本机项目目录的上一层跑(排除依赖和构建产物)
rsync -avz --exclude node_modules --exclude .next --exclude dev.db \
  greenpoly/ root@<服务器IP>:/srv/greenpoly/
```

**服务器上配置并构建:**

```bash
cd /srv/greenpoly

# 生产环境变量
cat > .env <<'EOF'
DATABASE_URL="file:/srv/greenpoly/data/prod.db"
NEXT_PUBLIC_SITE_URL="https://greenpoly.com"
AUTH_SECRET="<粘贴第0步 openssl 生成的随机串>"
SEED_ADMIN_EMAIL="richard@greenpoly.com"
SEED_ADMIN_PASSWORD="<你的强密码>"
EOF

mkdir -p data
npm install
npx prisma migrate deploy   # 建表
npm run db:generate
npm run db:seed             # 建管理员 + 产品目录
npm run build

# PM2 启动 + 开机自启
pm2 start npm --name greenpoly -- start
pm2 save && pm2 startup     # 按它输出的提示再执行一行命令
```

## 第 5 步:Caddy 反向代理(~5 分钟)

```bash
cat > /etc/caddy/Caddyfile <<'EOF'
greenpoly.com, www.greenpoly.com {
    reverse_proxy localhost:3000
    encode gzip zstd
}
EOF
systemctl reload caddy
```

Caddy 会自动申请并续期 HTTPS 证书,不用管。

**验收**:浏览器打开 `https://greenpoly.com` —— 应该看到网站;
`https://greenpoly.com/vi` 是越南语;`/admin` 能登录(用第 4 步设的账号密码)。

> 语言自动跳转说明:middleware 读 Cloudflare 的 `cf-ipcountry` 头,越南访客自动进 `/vi`、
> 印尼进 `/id`、泰国进 `/th`、马来进 `/ms`。走了 Cloudflare 橙云这个头自动就有,无需配置。

### 访客 IP 归属地

- 管理后台的 **Visitors** 和 **Traffic** 页面会记录访问 IP 与 Cloudflare 边缘提供的**国家级**归属地；`cf-ipcountry` 不依赖第三方 IP 查询服务。
- Cloudflare Free 默认只提供国家。城市、省州、坐标只有在你的可信边缘/托管平台明确转发对应头时才会显示，且 IP 定位始终是近似值，不是用户精确地址。
- 域名必须保持 Cloudflare 橙云代理；若有人绕过 Cloudflare 直连源站，既拿不到国家归属地，也可能伪造转发头。生产环境应按 Cloudflare 的源站保护方案限制直连，并且不得把原始 IP 输出到公开页面。
- IP 是个人数据。公开站上线前需根据实际保存期限、主体和适用市场补齐隐私声明；这个步骤需要负责人确认法律主体与数据保留政策。

## 第 6 步:上线后 30 分钟内做的事

1. **Google Search Console**(search.google.com/search-console)→ 验证域名 → 提交 `https://greenpoly.com/sitemap.xml`
2. **Bing Webmaster** 同样提交一次(东南亚也有 Bing/ChatGPT 流量)
3. 手机上真机测一遍:WhatsApp 按钮能拉起对话、表单能提交、`/admin/inquiries` 能看到测试询盘
4. 邮箱:Zoho Free 挂域名收信(`sales@greenpoly.com`),Cloudflare 里按 Zoho 指引加 MX 记录

---

## 日常运维速查

```bash
pm2 logs greenpoly          # 看运行日志
pm2 restart greenpoly       # 重启

# 更新代码后重新发布
cd /srv/greenpoly && git pull   # (或重新 rsync)
npm install && npm run build && pm2 restart greenpoly

# 备份数据库(所有询盘和访客数据都在这一个文件里)
cp /srv/greenpoly/data/prod.db /srv/backup-$(date +%F).db
```

建议加每日自动备份:`crontab -e` 加一行
`0 4 * * * cp /srv/greenpoly/data/prod.db /srv/backups/prod-$(date +\%F).db`
(先 `mkdir -p /srv/backups`)

## 以后再说的事

- **询盘邮件通知**:注册 Resend,`.env` 加 `RESEND_API_KEY`,在 `src/app/api/inquiry/route.ts` 里加发送逻辑(README「后续可加」有说明)
- **迁 Postgres**:等日 PV 过万或需要多机时再考虑 —— `apt install postgresql`,schema `provider` 改 `postgresql`,`db.ts` 换 `@prisma/adapter-pg`,数据用 prisma 脚本导一次即可
- **ISO 9001**:3 个月内启动认证后,在 Quality 页加真实证书(现在的"诚实无认证"文案届时同步更新)
