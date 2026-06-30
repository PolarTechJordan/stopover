# Stopover v0.1.0 前端与业务 Review

日期：2026-07-01

## 结论

当前 Demo 已具备 AI 礼宾、5 步下单流、订单状态机、RFID 行李追踪和误机保障演示能力，但 v0.1.0 前存在三类会影响验收的问题：

1. 业务主轴偏移：首页把 MealPulse 团餐放在首屏核心位，弱化了 PRD 中“休息室信任锚 + 行李全托管 + 城市微游 + 误机保障”的主价值。
2. PRD 阈值不一致：代码把 4 小时、8 小时中转也带入套餐推荐，而 PRD 明确 MVP 以 6-48 小时为范围，微游包为 10-18 小时。
3. 可访问与国际化不足：页面只有中文，主题与文字尺度不可调，深色环境下大量硬编码浅色 utility 无法系统适配。

## v0.1.0 已迭代

- 新增全局偏好层：支持中文/英文一键切换、light/dark 主题切换、文字尺度切换，并持久化到 localStorage。
- 保持 Next.js App Router 架构：Root Layout 仍为 Server Component，浏览器状态下沉到 client provider 和 app chrome。
- 重塑首页首屏：将首屏主卡从团餐匹配改为 Stopover 履约方案，突出套餐、RFID 行李、返场缓冲和误机保障。
- 对齐 PRD 阈值：最低起订改为 6 小时；套餐推荐改用总中转时长；轻享 6-8h、微游 10-18h、过夜 12-36h。
- 合规文案收敛：checkout 改为“履约核验信息”，不再暗示 Demo 提供签证/入境代办。
- 提升质量门槛：移除 `ignoreBuildErrors`，让生产 build 执行 TypeScript 校验。

## 后续建议

- 将 `ConciergePersonaTemplate`、城市路线和状态机描述继续结构化为完整 i18n 字典，避免英文模式下少量运营型长文案仍需降级显示。
- 把订单状态、行李状态、路线 schedule 的本地化从组件内迁移到 domain copy 层。
- 引入轻量 e2e 流程测试：`/search -> /packages -> /checkout -> /order -> /journey`，覆盖语言/主题切换和误机分支。
