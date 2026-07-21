# GreenPoly SEO + GEO 操作手册

> SEO = 让 Google/Bing 收录并排名;GEO = 让 ChatGPT/Perplexity/Claude 在回答买家问题时引用你。
> 两者共享一个地基:**可抓取 + 结构化 + 内容诚实一致**。

## 一、代码层已就绪(不用再动)

| 项 | 状态 |
|---|---|
| sitemap.xml(全页面 × 6 语言,带互相指向的 hreflang) | ✅ 自动生成 |
| robots.txt(放行全部爬虫,屏蔽 /admin /api) | ✅ 含 AI 爬虫(GPTBot 等默认放行) |
| llms.txt(AI 引擎专用站点说明,诚实叙事) | ✅ `/llms.txt` |
| 每页每语言独立 title/description/canonical | ✅ 避免语言页互相抢排名 |
| 结构化数据:Organization(全站)+ Product/Breadcrumb(产品页) | ✅ JSON-LD |
| 社交/聊天分享卡片(WhatsApp/Zalo/LINE 贴链接出图) | ✅ OpenGraph |
| 移动端速度(全静态页 + CDN) | ✅ 天然快 |

> 代码只解决可抓取性，不能代替公开部署与搜索引擎验证。源站地域选新加坡即可；Google 是否收录不取决于是否使用“国外品牌”云厂商，而取决于海外爬虫能否稳定访问正式 HTTPS URL。

## 二、上线后第 1 天:解决"是否被谷歌收录"

### 1. Google Search Console(最重要,15 分钟)

1. 打开 [search.google.com/search-console](https://search.google.com/search-console)
2. 选 **网域(Domain)** 方式,输入 `greenpoly.com`
3. 它给你一条 TXT 记录 → 到 **Cloudflare → DNS** 添加 → 回来点验证
4. 左侧 **Sitemaps** → 提交 `https://greenpoly.com/sitemap.xml`
5. 顶部网址检查框,逐个粘贴下面 6 个 URL,每个点 **"请求编入索引"**(手动催收录,新站必做):
   - `https://greenpoly.com/`
   - `https://greenpoly.com/products/abs`(ABS 是你的先发关键词)
   - `https://greenpoly.com/products/hips`
   - `https://greenpoly.com/vi`
   - `https://greenpoly.com/id`
   - `https://greenpoly.com/quality`

### 2. Bing Webmaster Tools(10 分钟,别跳过)

[bing.com/webmasters](https://www.bing.com/webmasters) → 可以直接"从 GSC 导入"一键搞定。
**为什么必做:ChatGPT 的联网搜索走 Bing 索引** —— 不进 Bing 就进不了 ChatGPT 的引用池,这是 GEO 的入场券。

### 3. Cloudflare 检查一处开关(1 分钟)

Cloudflare 后台 → **Security → Bots**:确认 **"Block AI Bots" / "AI Scrapers and Crawlers" 是关闭状态**。
开着的话 GPTBot/ClaudeBot/PerplexityBot 全被挡在门外,llms.txt 白写。

### 4. 怎么确认收录成功

- Google 搜索框输入 `site:greenpoly.com` —— 出结果 = 已收录
- GSC 左侧 **"网页"** 报告看收录数量(目标:71 页大部分进索引)
- **预期节奏**:新域名首页 3–14 天,全站 2–6 周。第 1 周没动静是正常的,别慌

### 5. 加速收录:让 Google 从别处"发现"你

新域名孤零零没外链,爬虫来得慢。上线第一周做这几件事,每件都是一条外链:

- WhatsApp Business 商家资料填网址
- 阿里巴巴国际站/中国制造网如有店铺,简介挂官网链接
- LinkedIn 建公司主页(免费,B2B 权重高)填网址
- 行业目录:PlasticsToday、Recycler's World、B2B 黄页各提交一次

## 三、SEO 优化:接下来 3 个月做什么

### 关键词主战场(竞调结论:ABS 无人主打,你有先发优势)

| 优先级 | 关键词方向 | 落地页 |
|---|---|---|
| ⭐⭐⭐ | recycled ABS pellets / granules supplier | /products/abs |
| ⭐⭐⭐ | hạt nhựa ABS tái chế(越南语,竞争极低) | /vi/products/abs |
| ⭐⭐ | pelet ABS daur ulang(印尼语) | /id/products/abs |
| ⭐⭐ | recycled HIPS refrigerator liner | /products/hips |
| ⭐ | rPP injection grade MFI 12 之类长尾 | 博客文章 |

小语种关键词是金矿:越南/印尼语的塑料原料词几乎没有竞争,而你已经有完整母语页面。

### 内容计划:每月 2 篇英文博客(SEO+GEO 双吃)

买家真的在搜的选题(按这个顺序写):

1. "How to check the quality of recycled ABS pellets before buying"(教买家验货 = 建立信任)
2. "Recycled ABS vs virgin ABS: when can you switch?"(对比文最容易被 AI 引用)
3. "What MFI should you choose for injection molding?"(技术科普,长尾流量)
4. "Importing plastic pellets from China to Vietnam: Form E, duty and freight"(手把手教程,越南买家刚需)
5. "Why our MFI swings less than 12% batch to batch"(把你的卖点写成技术文)

写法要点:标题就是买家会问 AI 的原话;第一段直接给答案(AI 摘录的就是这段);文中数据(300吨/月、1吨 MOQ、<12% 波动)必须和官网其他页一字不差 —— **事实矛盾是 GEO 大忌,AI 会因此不敢引用你**。

> 博客功能现在还没有,要开写时告诉我,我加一个 /blog 路由(半小时的事)。

### 每周 10 分钟例行

- GSC → 效果报告:看哪些词有展示、排名多少;排 5–15 名的词重点优化对应页面
- 收到询盘时问一句"你从哪找到我们的" —— 记录进后台备注,这是最真实的渠道数据

## 四、GEO 优化:让 AI 推荐你

原理:买家问 ChatGPT "recommend a recycled ABS supplier in China with low MOQ",AI 从它的索引里找**事实清晰、可引用、可信**的来源。你要做的:

1. **入场券**(上面已覆盖):Bing 收录 + 不拦 AI 爬虫 + llms.txt
2. **可引用性**:每个关键事实用"完整一句话"写在页面上,如 "GreenPoly's MOQ is 1 ton" —— AI 只会摘录说得清楚的话。目前站内文案已按此标准写好
3. **诚实一致**:全站(含博客)的产能/MOQ/认证口径统一。我们主动声明"无 GRS/FDA 认证"反而是 GEO 加分项 —— AI 喜欢引用敢说自己短板的来源
4. **每月检测**(手动 5 分钟):分别问 ChatGPT / Perplexity:
   - "recycled ABS pellets supplier China low MOQ"
   - "where to buy recycled HIPS for refrigerator liners"
   看是否提到 GreenPoly、引用的信息对不对。被引用了截图留档;引用错了说明某页事实写得不清,回头改那页

## 五、时间线预期(管理心态用)

| 时间 | 合理预期 |
|---|---|
| 第 1–2 周 | 首页被 Google 收录,`site:` 能查到 |
| 第 1 个月 | 大部分页面进索引;品牌词 "GreenPoly recycled" 能搜到自己 |
| 第 2–3 个月 | 小语种词(越/印尼)开始有排名和零星询盘 |
| 第 3–6 个月 | 英文长尾词进前 20;ChatGPT/Perplexity 开始出现引用 |
| 持续 | 每月 2 篇博客不断供,6 个月后自然流量才是主收入渠道 |

SEO 是慢变量。前 3 个月询盘主要还是靠你主动开发(WhatsApp/展会/平台),网站先当"信任背书 + 接询盘的桶"。
