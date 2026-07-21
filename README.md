# GreenPoly — 塑料回料独立站（前后端分离 / 含管理后台 / 自定义埋点）

Next.js 14 全栈应用：公开站（多语言）+ 管理后台 + 自定义埋点 + GEO 优化基础设施。

## 🎯 它包含什么

### 公开站（SEO + GEO 优化）
- **多语言路由**：`/` (EN) · `/vi` · `/id` · `/th` · `/ms` · `/zh` —— next-intl 驱动，按访客 IP 自动路由到对应语言
- **页面**：首页 · 产品总览 · 产品详情（HDPE/PP/PET）· 关于 · 品质 · 联系
- **GEO**：`llms.txt`（AI 爬虫友好）· 动态 sitemap.xml · robots.txt · 每页 hreflang · Schema.org 结构化数据
- **每个按钮、链接、表单都带 `data-track` 属性**，自动捕捉行为

### 自定义埋点（你要的"看用户关心什么"）
- 会话化（sessionId 存 localStorage）—— 看单个客户完整轨迹
- 自动捕获事件：
  - `page_view` · `dwell`（心跳 + 卸载）· `scroll_depth` (25/50/75/100%)
  - `cta_click` · `whatsapp_click` · `email_click` · `outbound_click`
  - `form_submit`
- 每条事件附：sessionId · UTM · referrer · country · userAgent · locale

### 管理后台（`/admin`）
- 登录：邮箱密码 + JWT cookie
- **Dashboard**：KPI 卡片 + Top 页面 + Top 国家 + 询盘状态分布
- **Inquiries**：列表 + 状态筛选（NEW/CONTACTED/QUOTED/NEGOTIATING/WON/LOST）+ 内联状态切换 + 详情页（**含完整 session 行为轨迹**）+ 销售内部备注
- **Analytics**：转化漏斗 · 产品页热度 · Top CTA · 滚动深度分布 · 平均停留时长
- **Traffic**：地理来源 · UTM · referrer · 语言分布

## 🚀 本地运行

```bash
cd greenpoly
# 依赖已装。如重装：npm install
# 数据库已 seed。如重做：rm dev.db && npx prisma migrate dev && npm run db:seed
npm run dev    # http://localhost:3000
```

**管理后台**：访问 `http://localhost:3000/admin/login`
本地开发可使用 `.env.example` 中的种子账号；它只能用于本机。生产环境会拒绝默认密码、短于 12 个字符的管理员密码，以及弱于 32 个字符的 `AUTH_SECRET`。

## 📁 项目结构

```
greenpoly/
├── prisma/
│   ├── schema.prisma          # Inquiry / Event / Session / Product / AdminUser
│   ├── seed.ts                # admin + 产品 seed
│   └── dev.db                 # SQLite（dev）
├── messages/                  # 翻译 JSON
│   ├── en.json / zh.json / ru.json / es.json
├── src/
│   ├── app/
│   │   ├── [locale]/          # 公开站 - 多语言路由
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── products/[slug]/  # 产品总览 + 详情
│   │   │   ├── about/quality/contact/
│   │   │   └── layout.tsx     # 公开站 layout（含 Nav/Footer/Tracker）
│   │   ├── admin/
│   │   │   ├── login/         # 登录页
│   │   │   └── (dashboard)/   # 受保护路由组
│   │   │       ├── page.tsx              # 总览
│   │   │       ├── inquiries/page.tsx    # 询盘列表
│   │   │       ├── inquiries/[id]/       # 询盘详情 + session 轨迹
│   │   │       ├── analytics/page.tsx    # 漏斗 + 产品热度
│   │   │       ├── traffic/page.tsx      # 地理 + UTM
│   │   │       └── layout.tsx            # auth + sidebar
│   │   ├── api/
│   │   │   ├── track/         # POST: 埋点
│   │   │   ├── inquiry/       # POST: 表单
│   │   │   └── admin/         # login / logout / inquiries CRUD
│   │   ├── llms.txt/          # GEO（AI 爬虫）
│   │   ├── sitemap.ts / robots.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── marketing/         # Nav / Footer / LangSwitcher / Tracker / ContactForm
│   │   └── admin/             # InquiryStatusSelect / InquiryNotes
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # JWT cookie auth
│   │   ├── tracking.ts        # 前端埋点 SDK
│   │   ├── geo.ts             # 提取 IP/country 头
│   │   └── products-data.ts   # 产品目录
│   ├── i18n/                  # next-intl 配置
│   └── middleware.ts          # 多语言中间件
└── package.json
```

## 🔧 关键命令

```bash
npm run dev           # 开发服务器
npm run build         # 生产构建
npm run start         # 启动生产构建
npm run lint          # ESLint
npm test              # 生产配置防呆测试
npm run check         # 测试 + lint + 生产构建
npm run db:migrate    # 新建并应用迁移
npm run db:generate   # 重生成 Prisma client
npm run db:seed       # 灌入 admin + 产品
npm run db:studio     # 数据库可视化界面
```

## ✅ 已验证可工作

刚才完整 smoke test 通过：
- 4 种语言路由都返回 200
- 产品/About/Contact/Quality 全部正常
- llms.txt 和 sitemap.xml 动态生成
- /admin 未登录会跳转 /admin/login（307）
- 登录 API 返回 token cookie
- POST /api/track 入库成功
- POST /api/inquiry 入库成功并返回 id
- 带 cookie 访问 /admin 返回 200

## 🌍 部署：新加坡 VPS 自建（东南亚客户 <30ms）

> **为什么不用 Vercel？** 项目定位东南亚 + 自主可控。VPS 是常驻进程，
> **SQLite（better-sqlite3）在 VPS 上完全够用**——单实例、读多写少、
> 询盘/埋点量级不大，无需迁移 Postgres。数据就是一个 `prod.db` 文件，
> 备份 = 复制这个文件。等真到了多实例/高并发再谈 Postgres。

### 0. 买什么

| 项 | 推荐 | 备注 |
|---|---|---|
| VPS | **Vultr High Frequency 新加坡 2C4G ≈ $24/月** | 备选 DigitalOcean SGP1 / 阿里云新加坡 |
| 系统 | Ubuntu 24.04 LTS | |
| DNS/CDN | Cloudflare Free | 套在 VPS 前面，免费 HTTPS + 抗量 |
| 域名 | greenpoly.com（在 Namecheap/Cloudflare Registrar 买）| |

### 1. DNS（Cloudflare）

1. Cloudflare 添加站点 `greenpoly.com`，把域名 NS 改到 Cloudflare 给的两条。
2. 加 A 记录：`@` → VPS 公网 IP，`www` → 同 IP，**橙色云开启**（代理）。
3. SSL/TLS 模式选 **Full (strict)**（配合下面 Caddy 的证书）。

### 2. 服务器初始化（SSH 进服务器后）

```bash
# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 拉代码（或用 scp/rsync 上传本地目录）
git clone <你的仓库地址> /var/www/greenpoly
cd /var/www/greenpoly
npm ci
```

### 3. 环境变量（生产 `.env`）

在 `/var/www/greenpoly/.env` 写入（**AUTH_SECRET 必须换**，密码别用默认）：

```bash
DATABASE_URL="file:./prod.db"
NEXT_PUBLIC_SITE_URL="https://greenpoly.com"
AUTH_SECRET="$(openssl rand -base64 32)"   # 复制它的输出填进去，别原样保留
SEED_ADMIN_EMAIL="richardq0714@gmail.com"
SEED_ADMIN_PASSWORD="换成你自己的强密码"
```

### 4. 建库 + 构建

```bash
npx prisma migrate deploy     # 建 prod.db 表结构
npm run db:seed               # 首次灌 admin + 产品；重复执行不会重设现有管理员密码
npm run build                 # 生产构建
```

### 5. 常驻进程（PM2）

```bash
sudo npm install -g pm2
pm2 start npm --name greenpoly -- start   # 默认监听 3000
pm2 startup            # 复制它打印的命令并执行 —— 开机自启
pm2 save
```

### 6. 反向代理 + HTTPS（Caddy，最省心）

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy
```

`/etc/caddy/Caddyfile`：

```
greenpoly.com, www.greenpoly.com {
    reverse_proxy localhost:3000
    encode gzip zstd
}
```

```bash
sudo systemctl reload caddy    # 自动签发/续期 Let's Encrypt 证书
```

### 7. 验收

```bash
curl -I https://greenpoly.com            # 期望 200
curl -s https://greenpoly.com/sitemap.xml | head
# 浏览器开 https://greenpoly.com/admin/login 用第 3 步的账号登录
```

### 8. 上新版本（以后每次改完代码）

```bash
cd /var/www/greenpoly
git pull
npm ci
npx prisma migrate deploy    # 有新迁移时才生效
npm run build
pm2 reload greenpoly         # 零停机重载
```

### 9. 备份（SQLite 极简）

```bash
# 每天备份 prod.db（加进 crontab）
cp /var/www/greenpoly/prod.db /var/backups/greenpoly-$(date +\%F).db
```

## 🎨 你需要替换的占位符

全局搜索替换：

| 占位 | 替换为 |
|---|---|
| `GreenPoly` | 你的品牌名 |
> ✅ **联系方式已接真实数据**（WhatsApp/Zalo `8618352978082`、Gmail、慈溪地址），
> 集中在 [`src/lib/site.ts`](src/lib/site.ts) 的 `CONTACT`——改这一个文件全站生效。

| 待办 | 在哪改 |
|---|---|
| 邮箱换成域名邮箱 `sales@greenpoly.com`（Zoho 建好后）| `src/lib/site.ts` → `CONTACT.email` |
| 泰国 LINE ID（拿到后填，会自动在联系页/浮窗显示）| `src/lib/site.ts` → `CONTACT.line` |
| 品牌分享图 `og.jpg`（1200×630）| 放 `public/og.jpg`，改 `src/app/layout.tsx` 的 `openGraph.images` |
| 产品参数 / 价格 | `src/lib/products-data.ts` 直接改 |

## 📈 GEO（后期任务）

- ✅ `llms.txt` 自动生成（`/llms.txt`）
- ✅ 动态 sitemap.xml（含 hreflang）
- ✅ Schema.org Product 标记（产品详情页）
- ✅ 多语言 hreflang
- ⏳ 加博客（每月 2 篇深度文章，给 ChatGPT/Perplexity 抓）
- ⏳ Google Search Console 提交 sitemap（东南亚主要用 Google）
- ⏳ 博客文章按 ABS/HIPS/PP 关键词写（竞品调研结论：4 家样本无人主打 ABS，有先发优势）

## 💡 后续可加

- **邮件通知**：装 Resend，在 `/api/inquiry/route.ts` 加发送
- **WhatsApp 推送**：WhatsApp Business API
- **CRM 集成**：HubSpot / Zoho webhook
- **多管理员 + 角色**
- **价格管理 UI**：目前价格在文件里，可挪到 DB
- **A/B 测试**：埋点已经具备，加个 variant 字段即可

## ⚠️ 已知细节

1. Status 切换是 fire-and-forget——失败无 toast。生产可加。
2. 跨设备同一买家无法关联（基于 localStorage sessionId）。可加 email 二次绑定。
3. **本地** dev 看不到国家来源——部署到新加坡 VPS + Cloudflare 后，middleware 自动读 `cf-ipcountry` header（也兼容 Vercel 的 `x-vercel-ip-country`），据此把访客路由到对应语言。
4. 老的 `recycled-plastic-site/` 静态版保留在 `../recycled-plastic-site/`，作为设计参考。
