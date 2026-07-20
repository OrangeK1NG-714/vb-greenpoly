# GreenPoly 独立站上线执行方案 & 中国回料工厂竞品调研

> **一份文档两个用途**：Part 1 是可立即执行的采购+上线清单（今天下单，30 天上线）；Part 2 是支撑决策的竞品调研档案。
> **对象**：Richard（richardq0714@gmail.com · +86 183 5297 8082）
> **实际情况**：家族回料厂 · **成立 2003-05-22（22 年老厂）** · 浙江宁波慈溪 2 亩地 · **暂无环保认证** · 主营 ABS / HIPS / PP / GPPS
> **商业模式**：自有造粒产线 + 宁波/余姚/慈溪本地 sourcing 网络（料不够可代采）—— 类 Sinox 的 "compounder + trader" 混合模式
> **主战场**：东南亚（越南 · 印尼 · 泰国 · 马来西亚）· 服务器机房落在**新加坡**
> **技术栈**：Next.js 14 + Prisma（[README.md](README.md)）已就位

---

## 🎯 30 秒摘要

1. **今天可下单**：Vultr High Frequency 新加坡 VPS（$24/月）+ 域名 $10/年 + Cloudflare 免费。**首年硬成本 ≈ ¥2,560**。
2. **核心叙事**：**22 年慈溪家族老厂 + 家电产业带地利 + 造粒 + sourcing 混合模式** —— 三个都是天然差异化，不用编。
3. **不要抄认证墙**：对手都堆 GRS/UL2809/FDA，你没有 — 顶级菜单换成 **Capabilities / Applications / Case Studies**，避免"造假认证"的法律+SEO 双重风险。
4. **不要抄欧美打法**：语言从 EN/ZH/RU/ES 改成 **EN + VI + ID + TH**（越/印/泰），面向东南亚下游应用（家电外壳、汽车饰件、日用注塑）。
5. **不要抄 rPET/PCR 叙事**：主打 ABS/HIPS/GPPS/PP 通用料 SEO —— 这恰好是 4 个高置信样本的**空白点**，你有先发优势。
6. **可以抄的核心 3 条**：具名销售 + 独立 WhatsApp（Yujie）、每个聚合物族独立 landing（INTCO）、"造粒 + sourcing"混合模式文案（Sinox）。

---

# Part 1 · 落盘执行方案（Ready to Ship）

## 1.1 硬件采购清单（今天下单 · ¥170/月起）

### 🥇 主推：Vultr High Frequency 新加坡（综合最优）

| 项目 | 规格 | 价格 | 说明 |
|---|---|---|---|
| **VPS** | 2 vCPU / 4GB RAM / 128GB NVMe / 4TB 流量 | **$24/月 ≈ ¥170** | 新加坡机房，东南亚客户 <30ms |
| **系统** | Ubuntu 22.04 LTS | 免费 | Next.js + Postgres 同机部署 |
| **备份** | Vultr 自动备份 | +$4.8/月 | 强烈建议开 |
| **合计** | | **~$29/月 ≈ ¥205/月** | 首年 ≈ ¥2,460 |

**下单步骤**（15 分钟）：
1. 注册 https://www.vultr.com/（可用信用卡或 PayPal）
2. Products → Deploy New Server → **High Frequency** → **Singapore** → **Ubuntu 22.04** → 55 GB SSD ($12/月) 或 128 GB NVMe ($24/月，推荐)
3. Server Hostname: `greenpoly-prod`
4. 加 SSH Key（本机 `~/.ssh/id_ed25519.pub`；没有就 `ssh-keygen -t ed25519` 生成）
5. Deploy → 2 分钟拿到公网 IP

### 备选方案（如果 Vultr 付款不便）

| 方案 | 价格 | 何时选 |
|---|---|---|
| **DigitalOcean SGP1 · Basic 2C4G** | $24/月 | Vultr 付款失败时的等价替代 |
| **阿里云新加坡·轻量应用服务器 2C4G** | ¥288/月（首年¥216） | 需要中国大陆备案免除 + 支付宝付款 |
| **AWS Lightsail Singapore 2C4G** | $24/月 | 已有 AWS 账号且熟悉的团队 |

**不推荐**：
- ❌ 阿里云香港 —— 东南亚客户延迟比新加坡多 20-40ms
- ❌ Vercel + Supabase 全托管 —— 中国大陆访问 Vercel 边缘节点不稳定，你自己看后台会很卡
- ❌ Hetzner 德国 —— 便宜但东南亚延迟 200ms+

---

## 1.2 软件/服务采购清单（1 天配齐 · 大部分免费）

| 类别 | 服务 | 价格 | 用途 | 何时买 |
|---|---|---|---|---|
| **CDN + DNS** | Cloudflare Free | ¥0 | 全球加速 + DDoS 防护 + 免费 SSL | 域名到手立即接 |
| **域名** | Cloudflare Registrar 或 Namecheap | $10–15/年 | `.com` 优先，`.io/.co` 备选 | Day 1 |
| **邮件（收）** | Zoho Mail 免费版 | ¥0（5 用户/5GB） | 收 `sales@greenpoly.com` 询盘 | Day 1 |
| **邮件（发）** | Resend | ¥0（3,000 封/月免费） | 询盘自动回复 + 内部通知 | Day 3 |
| **对象存储** | Cloudflare R2 | ¥0（10GB 免费） | 产品图 / TDS PDF / 证书 PDF | Day 5 |
| **分析** | Google Analytics 4 | ¥0 | 与自建埋点并行做校验 | 上线前 |
| **站长工具** | Google Search Console + Bing Webmaster | ¥0 | 必装 | 上线当天 |
| **监控** | UptimeRobot Free | ¥0（5 分钟粒度） | 宕机短信通知 | 上线当天 |
| **邮件营销**（可选） | Brevo（原 Sendinblue） | ¥0（300 封/天） | 后期 EDM | 上线 30 天后 |

**首年软件+服务总成本：域名 ¥100 + 其他 ¥0 = ¥100**
**首年总硬成本：VPS ¥2,460 + 域名 ¥100 ≈ ¥2,560**（不含内容制作和 ISO 9001 认证）

---

## 1.3 域名 & 邮件 & DNS（半天配好）

### 域名选择（Day 1 就买）

按优先级：
1. `greenpoly.com` — 首选（查 https://who.is）
2. `greenpoly.co` / `greenpoly.io` — 备选
3. `greenpolymer.com` — 备选
4. **不要选**：`.cn` / `.com.cn`（东南亚买家会怀疑）· `.xyz` / `.top`（低信任度）

### DNS 配置（Cloudflare · 10 分钟）

```
A     @              <Vultr IP>          Proxied（橙色云）
A     www            <Vultr IP>          Proxied
MX    @              mx.zoho.com         Priority 10
MX    @              mx2.zoho.com        Priority 20
TXT   @              v=spf1 include:zoho.com include:resend.com ~all
TXT   _dmarc         v=DMARC1; p=quarantine; rua=mailto:richardq0714@gmail.com
CNAME _domainkey     （按 Zoho 后台给的值填）
```

### 邮件账号规划

| 邮箱 | 用途 |
|---|---|
| `sales@greenpoly.com` | 主询盘（Zoho 收件）· 你个人日常用 |
| `richard@greenpoly.com` | 具名销售 1（Zoho 收件）· 网站上公开 |
| `no-reply@greenpoly.com` | Resend 发件（自动回复 + 系统邮件）|
| `richardq0714@gmail.com` | 兜底转发（Zoho 转发一份到你 Gmail，避免漏）|

---

## 1.4 联系信息落地（占位符替换清单）

按 [README.md#L162](README.md#L162) 的清单，用你的真实信息替换代码里的占位符：

| 占位符 | 替换为 | 备注 |
|---|---|---|
| `GreenPoly` | 你的品牌名（**贴近家厂名的域名**，你自己去选）| Day 1 前敲定 |
| `sales@greenpoly.com` | `sales@<你的域名>`（Zoho 建好后启用）| |
| `+86 138-XXXX-XXXX` | `+86 183 5297 8082` | ✅ 已定 |
| `8613800000000` | `8618352978082`（WhatsApp/wa.me 用）| ✅ 已定 |
| `Ningbo` / `Beilun District` | **`Cixi, Ningbo, Zhejiang, China`** | ✅ 已定（慈溪）|
| `yourdomain.com` / `greenpoly.com` | 你买到的实际域名 | Day 1 |
| `2014` | **`2003`** | ✅ 已定（22 年老厂）|
| `15,000T` / `10+` | **`3,000T/year own line + sourcing network`** | ✅ 已定（单班 2-3 条线保守值 + 代采能力）|

**建议直接把这句英文塞进 About 页 hero 区**：

> *"Family-owned since **2003**. Based in **Cixi, Ningbo** — the heart of China's home-appliance manufacturing belt — we've supplied **ABS · HIPS · PP · GPPS** granules to injection molders for over **22 years**. Beyond our own compounding line (~3,000 T/year), we source additional grades from our local partner network across Ningbo, Yuyao, and Cixi to match your volume."*

这段话有 4 个天然差异化点，一句话砸满：
1. **22 years family-owned** —— 大厂员工话术抗不过家族传承
2. **Cixi, home-appliance belt** —— 地利叙事（下游知道慈溪是家电+回料集散地）
3. **ABS/HIPS/PP/GPPS** —— 明确品类关键词（SEO 直接吃）
4. **own line + sourcing network** —— 化解 2 亩地产能天花板

**⚠️ 产能口径纪律**：对外统一说 `~3,000 T/year own production + flexible sourcing for larger orders`。别有的销售说 3,000、有的说 10,000 —— 客户交叉验证会穿。

**⚠️ 认证零容忍**：绝对不要在网站上写 GRS / ISO 14001 / FDA 你实际没有的认证 —— 欧美买家会查登记号，越南/印尼买家也会向 SGS/BV 复核。真被抓一次全站信任崩塌。宁可空着，也别写假的。

---

## 1.5 30 天上线时间线

| 周 | 关键交付 | 花费 |
|---|---|---|
| **Day 1** | 买 VPS · 买域名 · 接 Cloudflare · 建 Zoho 邮箱 | ¥170 + ¥100 |
| **Day 2–3** | 部署 Next.js 到 VPS（`pm2` + `nginx` + `certbot`）· 替换所有占位符 · 装 GA4 + GSC | ¥0 |
| **Day 4–7** | 拍产品照（10 张真实车间/成品照）· 写 4 个聚合物 landing 文案（ABS/HIPS/PP/GPPS）· 上传 TDS PDF | 摄影 ¥500-2000 |
| **Day 8–14** | 加越/印/泰翻译（先机翻 + 人工校对 ¥500/语言）· 加 3 篇博客（东南亚下游应用向）| ¥1500-3000 |
| **Day 15–21** | 提交 GSC 和 Bing sitemap · 上 5 条 LinkedIn 首帖 · 找 3 家越南/印尼小客户发样 | 样品成本 |
| **Day 22–30** | 观察埋点：哪个产品页停留最长？哪个国家来的多？根据数据决定第二轮内容优先级 | ¥0 |

**关键节点**：Day 7 网站可访问；Day 14 SEO 基础到位；Day 30 有第一批数据。

---

# Part 2 · 站点重构方案（针对你的实际情况）

## 2.1 与竞品调研的关键差异

| 竞品调研中的"抄这个" | 你的实际情况 | 你应该做的 |
|---|---|---|
| Yujie/INTCO 主打 PCR/回收料 + GRS 认证墙 | 无认证 + 通用料为主 | **不装认证工厂**。主叙事换成"稳定供货 + 具名销售 + 快速响应" |
| Sinox 6 张证书做顶级菜单 | 至多只有 ISO 9001（如无就先申请，¥5-15k / 3-6 月）| 顶级菜单换成 **Capabilities / Applications / Case Studies** |
| Topcentral 主打 rPET 食品级 FDA | 主营 ABS/HIPS/GPPS/PP | 主打**东南亚下游应用**：家电外壳 / 汽车饰件 / 日用注塑 |
| 4 家高置信样本全瞄准欧美 | 瞄准东南亚 | 语言：EN + VI + ID + TH（**去掉 RU/ES**，代码里把 `messages/ru.json` 和 `es.json` 换成 `vi.json` 和 `id.json`）|
| 竞品堆"回料 recycled"关键词 | 通用料为主 | 关键词：`ABS granules supplier Vietnam`、`GPPS resin Indonesia`、`HIPS pellets Thailand`—— **竞品调研里 ABS 是空白点** |

## 2.2 你的独立站应该长什么样

### 顶级菜单（推荐）

```
Home  |  Products ▾  |  Capabilities  |  Applications  |  About  |  Contact
              │
              ├─ ABS Granules
              ├─ HIPS Granules
              ├─ GPPS Granules
              ├─ PP (Polypropylene) Granules
              └─ Other Grades on Request
```

**为什么不做 Certifications 菜单**：你目前没有 —— 有一张 ISO 9001 就不够撑一个顶级菜单。**Capabilities**（车间照 + 产线 + QC 流程 + 交期承诺）代替 **Certifications**，更适合你。

### 4 个聚合物 Landing 页骨架（每页一份）

**URL 模板**：`/products/abs-granules` · `/products/hips-granules` · `/products/gpps-granules` · `/products/pp-granules`

**页面结构（1 屏 = 1 目的）**：
1. **H1**：`ABS Granules Supplier from Cixi, China — 22 Years, Family-Owned`
2. **一句话价值**：`Own compounding line (3,000 T/year) + local sourcing network · Weekly shipments to Ho Chi Minh / Jakarta / Bangkok · Named sales, WhatsApp response < 4h`
3. **TDS 关键参数表**：MFI · 密度 · 颜色 · 杂质率 · 包装规格
4. **典型下游应用**（东南亚市场向）：Home Appliance Housing / Consumer Electronics Shell / Auto Interior Trim（**明确对标慈溪本地服务过的应用类型**）
5. **三按钮 CTA**：`Get Quote` / `WhatsApp Richard` / `Download TDS`（抄 Yujie）
6. **Capacity 明文说清楚**（抄 Sinox 减摩擦文案）：
   > `MOQ 1 ton for our own line. Larger volumes and grades beyond our line fulfilled through our trusted sourcing network across Ningbo / Yuyao / Cixi.`
7. **社会证明**（有就写，没就先空）：Trusted by X buyers in VN/ID/TH since 20XX
8. **FAQ 5 条**：MOQ？账期？付款方式？打样时间？可否小批混批？

## 2.3 无认证工厂的差异化叙事（重要）

**你不能装认证工厂，但可以正面立四个天然优势**：

1. **22 年家族老厂 + 慈溪家电产业带**（**最强牌，任何竞品复制不了**）：
   - About 页 hero 就用上一节那句 22 年 + Cixi + ABS/HIPS/PP/GPPS 的英文
   - 4 家高置信样本里最老的 Yujie 也才 2005，你比他们早
   - "Grown with the region" 叙事对东南亚买家杀伤力大 —— 他们知道慈溪 = 家电

2. **具名销售 + 秒回**（抄 Yujie 精髓）：
   - 网站放你 Richard 的头像 + WhatsApp（+86 183 5297 8082）+ 邮箱（richard@<域名>）
   - 承诺 "WhatsApp response within 4 business hours"
   - 大厂销售一个人管几十个客户，你亲自回，是优势不是劣势

3. **小批灵活 + 大单代采**（把 2 亩地劣势 + 代采能力都变卖点）：
   - `MOQ 1 ton for own grades` —— 大厂 MOQ 起步 5-10 吨，你能接小单
   - `Larger volumes fulfilled through our Ningbo sourcing network` —— 上限也高
   - 面向东南亚中小型注塑厂（月耗 3-10 吨很常见），MOQ 低 + 上限弹性就是护城河

4. **"可代采认证料"文案**（抄 Sinox 的减摩擦逻辑）：
   - `We can source GRS/ISCC-certified material on request through partner mills`
   - 老实承认自己不做认证，但客户要的话可以中转 —— 既诚实又不丢单

**⚠️ 中期建议**：3 个月内至少把 **ISO 9001** 拿下（¥5,000-15,000，3-6 个月）。这是最基础的信任门槛，东南亚客户也会问。GRS 等回收认证 6-12 个月内不用考虑（10-30 万 + 供应链改造）。

---

# Part 3 · 竞品调研摘要（支撑材料）

> 完整调研方法：多源 web 搜索 + 主站源码抓取 + 3 票抗辩验证 + 合成
> 22 条结论通过 3 票对抗验证 · 调研日期：2026-06-30

## 3.1 4 个高置信样本 + 1 个 IA 范本

| 站点 | 公司 / 省份 | 主营 | 借鉴价值 |
|---|---|---|---|
| **en.dgyujie168.com** | Dongguan Yujie · 广东东莞 | PCR LDPE/HDPE/LLDPE/PP | ⭐⭐⭐ 询盘 UX（三按钮 + 具名销售）**直接抄** |
| **itopcentral.com** | Ningbo Topcentral · 浙江 | rPET 为主 | ⭐ 碳足迹叙事（你先不用）|
| **intcoplastic.com** | INTCO Recycling · 上交所 688087 | rPET/rPS/rPP/rPE | ⭐⭐ 每个聚合物族独立 SEO landing **结构可抄** |
| **recycled-granules.com** | Hebei Changsheng · 河北 | rHDPE/PVC/滴灌带 | ⭐ 反面教材（大杂烩），提醒你**聚焦**|
| **sinox-polymers.com** | 德国不莱梅 + 上海贸易子公司 | 全品类 | ⭐⭐ IA 范本（"可任选认证发货"文案抄）|

### 🔥 Yujie 询盘 UX 三连按钮（**最值得抄的一处**）

产品页 HTML 实测：
1. **Get Quote**（弹询盘表单）
2. **whatsapp me**（每位销售独立 `wa.me/...` 链接）
3. **File Download**（下载 TDS/COA）
4. **Submit Message**（兜底邮件，`mailto` 预填主题 `PCR Plastic Inquiry`）

**双销售具名分流**：Abby Leung、Claire Lee 各自独立头像 + 独立 WhatsApp + 专属邮箱。**你就是唯一的具名销售 Richard**，先做一个，后期招人再加。

### 🔥 INTCO SEO 长尾结构（**你的 4 个 landing 抄这个**）

| URL 模板 | 你的落地 |
|---|---|
| `/en/products/rpet/` | `/products/abs-granules` |
| `/en/products/rpp/` | `/products/pp-granules` |
| `/en/products/rpe/` | `/products/hips-granules` |
| `/en/products/rps/` | `/products/gpps-granules` |

标题模板：`[POLYMER] Granules Supplier | Small-Batch Specialist from China | GreenPoly`

### 🔥 Sinox 减摩擦文案（**认证叙事的救命稻草**）

原文："**可任选认证或无认证发货**"

你的版本："**Available with or without third-party certification — we can source certified material on request through partner mills.**"

—— 老实承认无认证 + 提供解决路径。比"假装有认证"和"什么都不提"都强。

## 3.2 7 条借鉴清单（已按你的情况裁剪）

原文档 11 条已删除 4 条不适用的（"Certificates 顶级菜单"、"食品级 SKU 页"、"碳足迹百分比"、"7 种欧洲语言 i18n"）。

### A. 立即抄（Day 1-7）

1. **产品页三按钮 CTA**：`Get Quote` / `WhatsApp Richard` / `Download TDS`（范本：Yujie）
2. **具名销售 + 头像 + 独立 WhatsApp**：你先做 Richard 一个（+86 183 5297 8082 → wa.me/8618352978082）
3. **每个聚合物族独立 landing**（范本：INTCO）—— 4 个页面：ABS / HIPS / GPPS / PP
4. **邮件 mailto 预填主题**：`?subject=ABS%20Granules%20Inquiry%20-%20[Company]`

### B. 一个月内做（Day 8-30）

5. **"可选认证发货"文案**（范本：Sinox）—— 每个产品页底部固定文案
6. **Applications 页**：列 3 个典型东南亚下游场景 + 客户 logo（有真实客户后补，无就先留一个"新客户案例征集中"）
7. **技术栈保持自建**（你已经是 Next.js + Prisma，比 4 个样本里 3 个用的 IIS/Contao 更现代）

---

# Part 4 · 附录

## 4.1 反例（明确剔除）

| 域名 | 剔除原因 |
|---|---|
| gonplastics.com | 002768.SZ 上市公司，**虚拟料**（GPPS/HIPS/EPS 等），零 PCR —— 与你品类接近，但叙事完全不同 |
| ky-plastics.com | 工程塑料目录站，数百 SKU 大杂烩 |
| bo-re-tech.com | 卖机器不卖粒子 |

**⚠️ 有意思**：gonplastics 做虚拟料 GPPS/HIPS，赛道其实和你一样。可以第二轮单独扒它的独立站（如果它有）作对标 —— 但它是上市大厂，规模差异要认清。

## 4.2 ENF 目录种子（第二轮可扒）

| 域名 | 公司 |
|---|---|
| gdintop.com | Guangdong Intop |
| plasticgranules-xcl.com | Shenzhen Xinchanglong |
| remeiplas.com | Hebei Remei |
| swanpolyplastic.com | Anhui Swanpoly |

## 4.3 调研元数据

- 5 个搜索角度并行 → 17 个 URL 抓取 → 22 条 claim 抗辩验证（3 票制）→ 合成
- 总 agent 数：102 · 总耗时：约 102 分钟
- 报告生成：2026-06-30 · 落盘方案追加：2026-07-01

## 4.4 调研局限

1. **样本规模**：只深扒了 4 家高置信样本 + 1 家范本 + 7 家 ENF 种子（未深扒）
2. **省份覆盖**：广东 + 浙江 + 山东 + 河北 高置信；安徽 + 江苏 缺
3. **INTCO canonical 歧义**：`intcoplastic.com` vs `intcoplastics.com` 两域名并存
4. **Changsheng 规模**：MIC profile 自述 9 人 257㎡，与独立站宣称的"manufacturer"规模不符

---

## 📋 Day 1 Checklist（可以立即下单了）

**基础信息已敲定**：✅ 慈溪 · ✅ 2003 成立（22 年）· ✅ 3,000 T/year + sourcing · ✅ 手机/邮箱 · ⏳ 域名（你自己选贴近家厂名的）

### Day 1（今天 / 明天，共 ~2 小时）

- [ ] **域名**：想好贴近家厂名的英文品牌 → https://who.is 查 `.com` 可用性 → Cloudflare Registrar 或 Namecheap 下单（$10/年）
- [ ] **VPS**：注册 Vultr → 下单 **High Frequency Singapore 2C4G $24/月** → 拿到公网 IP
- [ ] **DNS**：把域名 NS 指向 Cloudflare → 按 [1.3 节](COMPETITOR_RESEARCH_CN_FACTORIES.md#13-域名--邮件--dns半天配好) 配 A / MX / TXT
- [ ] **邮件**：Zoho Mail 免费版建 `sales@<域名>` + `richard@<域名>`，转发一份到 richardq0714@gmail.com

### Day 2-3

- [ ] **部署代码**：SSH 到 VPS → 装 Node 20 + Postgres + Nginx + Certbot → clone 项目 → `pm2 start`
- [ ] **占位符替换**：按 [1.4 节](COMPETITOR_RESEARCH_CN_FACTORIES.md#14-联系信息落地占位符替换清单) 表格全部换成真实值（**已敲定 5 个字段，只剩品牌名和域名要填**）
- [ ] **About 页 hero**：贴上 1.4 节那段英文（22 年 + Cixi + 4 品类 + own line + sourcing）
- [ ] **语言切换**：`messages/ru.json` + `es.json` 改成 `vi.json` + `id.json`，同步改 [src/i18n](src/i18n/) 配置

### Day 4-7

- [ ] **拍真实照片**：车间 3 张 + 造粒线 2 张 + 成品袋装 2 张 + 你本人 1 张（About 页用）+ 慈溪厂区外景 1 张 + **老照片 1 张**（如果有 2003 年前后的老照片，是杀器 —— 22 年叙事的实证）
- [ ] **写 4 个 landing 文案**：ABS · HIPS · PP · GPPS，按 [2.2 节](COMPETITOR_RESEARCH_CN_FACTORIES.md#22-你的独立站应该长什么样) 骨架填
- [ ] **上传 TDS PDF**：每个品类至少一份技术参数表（可先用行业通用值，日后补自测数据）

### 本周内（并行推进）

- [ ] **ISO 9001 询价**：找慈溪/宁波本地认证服务，先启动流程（¥5-15k · 3-6 月）
- [ ] **GSC + Bing Webmaster** 提交 sitemap
- [ ] **UptimeRobot** 装宕机监控（免费，短信通知你手机 +86 183 5297 8082）

**卡壳随时问我。**下单 Vultr 后把 IP 甩给我，我可以帮你写部署脚本。
