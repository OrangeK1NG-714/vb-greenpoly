# greenpoly 架构

## 产品与边界

`greenpoly` 是 Next.js 16 全栈产品，包含多语言公开站、询盘、产品埋点、管理后台和人工销售
工作台；保留 React 18、next-intl、Tailwind 3、shadcn/Radix、Prisma 7 与单实例 SQLite/libSQL。

- 浏览器只访问 GreenPoly 同源页面和 Route Handler，不能直连 Go/数据库或携带服务端凭据。
- `go-backend` 是唯一共享重后端。询盘完整配置时由 Go 托管，否则回退 Prisma；Prisma 还拥有本产品埋点、session、报价和样品。
- GreenPoly 自己拥有访客行为数据；对 Go 只暴露脱敏、低计数抑制后的内部营销聚合。
- 报价、样品确认、邮件/WhatsApp 草稿和工厂交接文本都只供人审阅、复制和手工发送。
- 产品图是场景示意，不是证书、COA、库存或具体批次证据。

## 目录职责

| 层 | 当前入口与职责 | 新代码落位 |
| --- | --- | --- |
| composition | Next 入口是 `src/app/layout.tsx`、`src/app/[locale]/layout.tsx` 与各 Route Handler/RSC 页面。当前页面和 handler 直接读取 `goBackendEnabled` 并选择 Go 或 Prisma，组合职责分散。 | 服务端依赖选择集中到 `src/composition/server/`；按请求取得已经组装好的 application service/repository，浏览器 bundle 不得包含该目录。 |
| delivery | `src/app/[locale]/` 是公开站，`src/app/admin/` 是后台，`src/app/api/` 是 HTTP/BFF，`src/components/marketing/`、`admin/`、`ui/` 是视图，`src/proxy.ts` 负责语言入口与地域路由。 | 新页面/组件继续按公开站或后台落位；Route Handler 只做鉴权、限流、输入解析和 HTTP 映射，不直接查询 Prisma/Go。 |
| application | 当前询盘创建、列表、状态更新、报价/样品编排散落在页面、Route Handler 和 `src/lib/sales-tools.ts`/`sales-api.ts`。 | 用例放 `src/application/inquiries/` 与 `src/application/sales/`，例如 create/list/update inquiry、update quote、confirm sample；用例只依赖 domain/ports。 |
| domain / ports | `src/lib/sales-tools.ts` 是纯销售规则候选，包含报价计算、状态迁移、样品版本、待办和跟进草稿；`marketing-stats.ts` 含纯聚合规则，`products-data.ts` 是产品目录真值。 | 按 `src/domain/inquiries/`、`sales/`、`marketing/` 拆分纯规则；`InquiryRepository`、报价/样品仓储和时钟放 `src/domain/ports/`。domain 不导入 Next、React、Prisma 或网络客户端。 |
| adapters | `src/lib/db.ts`/Prisma 是本地持久化 adapter，`src/lib/go-backend.ts` 是 Go adapter，`auth.ts`、`tracking.ts`、`geo.ts`、`sales-records.ts` 与生产配置是框架/基础设施适配。 | 逐步收口到 `src/adapters/persistence/`、`go/`、`auth/`、`analytics/`；保留现有 schema 和外部契约，adapter 实现 ports。 |

## 依赖方向

```text
Next delivery → application → domain/ports ← Prisma/Go/analytics adapters
                                        ↑
                           server composition 选择实现
```

- 公开页面、后台页面和 Route Handler 不决定使用 Go 还是 Prisma；该策略只在服务端 composition。
- application 可组合领域规则和 ports，但不能接触 `NextRequest`、`NextResponse`、Prisma model 或 `fetch`。
- adapter 可以依赖 Prisma、环境变量和远端 API；domain/ports 不依赖 adapter。
- 客户端组件只接收最小 view model，并经同源 API 发 mutation；服务端 token 永不进入
  `NEXT_PUBLIC_*`、React props 或浏览器日志。
- 项目不导入兄弟仓源码或数据库。与 Go 的关系只通过版本化 HTTP 契约。

## 禁止事项

- 禁止浏览器直连 Go、直接访问 Prisma，或让页面/handler 新增 Go/Prisma 分支选择。
- 禁止让 BFF 成为第二份共享领域状态；跨产品权威能力只能进入 `go-backend`，GreenPoly
  本地存储只服务本产品现有边界。
- 禁止 domain 导入 Next/React/Prisma，禁止 adapter 反向调用组件。
- 禁止自动发送报价、跟进草稿、样品确认或工厂交接信息；所有外发都要人工复核。
- 禁止把低计数访客桶、原始 IP、session、referrer、UTM 或询盘明细暴露给内部聚合消费者。
- 禁止把示意图、模拟数据、弱开发账号描述成真实批次、检测、库存或生产凭据。
- 数据迁移、公开部署、真实交易或生产凭据使用必须另经 Human 确认。

## 当前迁移热点

2026-07-29 首批已建立 `InquiryRepository`、`InquiryService`、Go/Prisma adapters 和唯一
服务端 composition；公开询盘写入、后台询盘读页和销售页不再自行选择存储实现。

当前 `src/lib/sales-tools.ts` 约 750 行，聚合报价、样品、待办和多语言文案多类规则；
`TradeWorkflowWorkspace.tsx` 约 735 行，同时做表单、mutation、状态和展示；
`SalesWorkspace.tsx` 约 388 行。`ContactForm.tsx`、公开首页和 `marketing-stats.ts` 也在
300 行上下。剩余边界债务集中在尚未迁移的销售 mutation 和聚合规则。

渐进顺序：

1. 先锁定公开询盘响应、后台读写、Go/Prisma 回退、营销聚合和销售记录契约；避开当前
   首页、营销组件和 proxy 的既有脏改动。
2. `InquiryRepository`、adapters、composition、询盘读和公开写切片已完成；列表的
   limit 与 created/updated 排序由应用端显式传递，Prisma/Go adapter 语义一致。
3. 再迁 inquiry 状态更新，并单列 `updateQuote`、样品版本/确认等 application 用例。
4. 按 quote、sample、todo、follow-up 拆 `sales-tools.ts`，每次只移动一组已有纯规则，
   不机械拆成循环依赖的小文件。
5. 领域边界稳定后再拆 `TradeWorkflowWorkspace.tsx`/`SalesWorkspace.tsx` 的控制器和视图。

每批分别验证并可反向应用本批 patch；不得覆盖当前未提交 UI 工作。

## 验证

项目原生门禁：

```bash
npm run check
```

该命令应完成测试、ESLint 和 Next 生产构建。Prisma schema 另跑既有 generate/migration
检查但不顺带迁移生产数据；Go 联调须区分 fixture、隔离数据库和生产结果。
