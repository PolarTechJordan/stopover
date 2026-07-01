# 龙腾中转礼遇产品验收与开发变更 Review v0.3.0

本篇文档记录了针对 **Stopover Gemini (龙腾中转礼遇)** 项目在最新一轮迭代中完成的系统性重构与变更。

---

## 一、 路由与导航重构 (Routing & Navigation)

1. **首页迁移与演示入口**
   - 将原独立的 Pitch 推广介绍页内容重构为可复用的组件 [PitchPage.tsx](file:///src/components/features/PitchPage.tsx)。
   - 将主入口 `/` 直接配置为渲染此 `PitchPage`，作为项目的官方产品宣讲与演示首页。原旧路径 `/pitch` 仍作为备用别名路由保留。
   - 在首页的新加坡 10 小时主干道卡片中，增加了一个显眼的“进入中转仪表盘 Demo”的主操作按钮，点击即可直接无缝跳转到中转仪表盘 `/dashborad`。

2. **仪表盘路径统合与纯净版设计**
   - 新增仪表盘路径：同时支持 `/dashborad` (容错防呆路径) 和标准的 `/dashboard` 均指向 `<StopoverDashboard />`。
   - 在导航组件 [AppChrome.tsx](file:///src/components/features/AppChrome.tsx) 中增加了全局逻辑，访问这两个仪表盘路径时，自动隐藏全局的 Header（头部导航）和 Footer（页脚），以腾出完整的屏幕空间用于展示中转仪表盘。
   - 彻底移除了仪表盘内原有的“个人资料”和“支持”两个对 Hackathon 答辩无用的冗余选项，导航项缩减为极简的 4 项（首页、预订、行程、订单）。
   - 删除了仪表盘右上角的“AILab PPT”头像按钮和 PPT 标识，界面更纯粹、清爽。
   - 将帮助中心及顾问咨询链接统一重定向至首页 `/`（即 Pitch 主页）。

---

## 二、 全局双语本地化 (Bilingual Localization)

1. **首页双语化 (Pitch Page)**
   - 在 [PitchPage.tsx](file:///src/components/features/PitchPage.tsx) 中全面接入了语言偏好状态 `useAppPreferences`。
   - 梳理并内置了完整的 `zhCopy` (中文) 和 `enCopy` (英文) 对照字典，包含了首页所有的幻灯片标语、中转痛点分析、三层核心履约能力、典型中转包套餐对比、用户真实评价以及页尾的开始体验按钮。
   - 点击右上角的中英文切换按钮，首页的文字内容会即时、无闪烁地完成语言切换。

---

## 三、 动态 ID 路由与订单加载 (Dynamic ID Routing & State Initialization)

1. **侧边栏带 ID 路由跳转**
   - 在仪表盘左侧菜单栏中，**“我的行程”** 和 **“我的订单”** 现在会动态读取当前活跃的订单 ID（如未下单，则默认携带 `case-10h` 模版 ID），跳转路径改为：
     - 行程：`/journey?id=${currentOrderId}`
     - 订单：`/order?id=${currentOrderId}`

2. **预定中转精准 Case 绑定**
   - 解决了之前直接跳转 `/packages` 和 `/checkout` 导致的状态错配 bug。
   - 仪表盘中所有的 **“预定中转”**、**“查看详情并下单”** 及 **“查看全部套餐”** 链接均统一调整为携带 Case ID 的地址：`/packages?id=case-10h`。
   - 重构了套餐页面 [packages/page.tsx](file:///src/app/(flow)/packages/page.tsx)：支持解析 URL 传参 `id=...`，并在页面加载时从 mock 数据中查找该 Case 的航班与时长，自动初始化全局 Store 的搜索参数（包括机场、航班号、停留时间、预留时长），并自动选中对应档位的套餐（10h 自动选微游包，23h/35h 自动选过夜包），彻底消除了“因无参数被重定向回搜索页”或“套餐对不上”的逻辑问题，并使用 `<Suspense>` 保证了 Next.js 静态打包兼容性。

3. **动态订单详情与 timeline 解析**
   - 在 [orderStore.ts](file:///src/lib/store/orderStore.ts) 中加入了静态案例构造器 `getMockOrderForCaseId`。
   - 当用户在浏览器直接访问含有 `id` 的页面（如 `/journey?id=case-23h`、`/order?id=case-10h`）时，系统会自动生成对应案例的全部 mock 数据并渲染，而不再展示“未找到行程/订单”的错误，提供了连贯的模板展示能力。

---

## 四、 中转时间轴逻辑修正 (Timeline & Buffer Overrides)

1. **4 小时不可定购边界改为“4小时机场室内游”**
   - 将 case 库 [mockData.ts](file:///src/lib/mockData.ts) 中的 `'case-4h'` 案例从“不可订购边界样例”重命名为 **“4小时机场室内游 (新加坡樟宜)”** (英文 `"4h Airport Indoor Tour"`).
   - 在搜索页面中放开了 4 小时不可预定的图表警告，现在 4 小时中转也会正常显示时间轴拆解柱状图。
   - 自定义重写了 4 小时的段落逻辑：在 4 小时的中转总时长下，中间的套餐窗口自定义显示为 **“机场休息室+机场室内购物路线”**（占 1.5h，落地 1.5h，登机 1h，总长 4h），提供明确的替代方案。

2. **10h & 35h 登机缓冲 (Boarding Buffer) 修正**
   - 调整了规则引擎 [prdRules.ts](file:///src/lib/prdRules.ts) 中的默认预留时间，以满足客户对登机缓冲的精确控制：
     - **10小时白天中转**：默认服务时间调为 **7 小时**，根据公式 `10 - 7 - 1.5 (落地) = 1.5`，登机 Buffer 精确为 **1.5 小时**（中英文介绍文案也同步修正为“预留 7 小时”）。
     - **35小时跨天中转**：默认服务时间调为 **31.5 小时**，根据公式 `35 - 31.5 - 1.5 = 2`，登机 Buffer 精确为 **2 小时**。

---

## 五、 后台大模型接入 DeepSeek (DeepSeek LLM Integration)

1. **API 路由与动态密钥**
   - 在后台聊天机器人接口 [route.ts](file:///src/app/api/concierge/route.ts) 中重构了 `callModel` 逻辑。
   - 增加了对 `DEEPSEEK_API_KEY` 的动态检测。当系统未配置任何环境变量时，会自动将接口指向 DeepSeek 官方域名 `https://api.deepseek.com` 并使用模型 `deepseek-chat`，使用极具兼容性的 Hackathon 线上部署密钥 `sk-520b...` 作为兜底，保证演示项目上线后开箱即用。
   - 过滤了不兼容的 Dashscope/Qwen 参数（例如 `enable_thinking`），确保发送给 DeepSeek 的 JSON 荷载格式正确。
   - 完整保留了系统 PRD 知识库注入，使得 DeepSeek 的聊天应答高度契合产品业务规则（SLA 赔付、误机兜底等）。

---

## 六、 彻底废除“AI 团餐”匹配服务 (Removal of AI Meal Matching)

应产品形态的简化需求，已将“AI 团餐匹配” (AI Meal Matching / MATCH / `ai-group-meal`) 在整个系统及代码库中全量下线：

1. **套餐及增值服务移除 (Data Model)**
   - 从 `light` (轻享包)、`micro` (微游包)、`overnight` (过夜包) 的 mock 绑定增值服务中去掉了 `'ai-group-meal'` 标识。
   - 在 `addons` 列表字典中删除了 `ai-group-meal` 增值服务项，并在 [types.ts](file:///src/lib/types.ts) 中移为了 `'ai-group-meal'` 的 SKU 类型定义。
   - 移除了 [appPreferences.ts](file:///src/lib/appPreferences.ts) 中对应的团餐多语言字典对照组。

2. **UI 交互页面与卡片净化 (Page cleanup)**
   - **选包页面 (`/packages`)**：删除了底部的 “龙腾出行 AI 团餐匹配” 卡片、E/I 人偏好切换、能量水平调整以及 Match 分数闪烁小控件；清空了对应的 React State 状态与依赖计算。
   - **收银页面 (`/checkout`)**：删除了“AI 团餐将随票一起履约”的安全锁定提示卡片。
   - **行程状态页面 (`/journey`)**：删除了“龙腾出行 AI 团餐核销卡”电子 QR 凭证区块，并将增值项为空时的判定逻辑予以重构。
   - **订单详情页面 (`/order`)**：删除了与订单 QR 码绑定的 “DragonPass MealPulse 已生成” 状态卡片。

3. **对话助手逻辑净化 (Concierge Engine)**
   - 在 [conciergeEngine.ts](file:///src/lib/conciergeEngine.ts) 中修改了 `recommendAddons` 推荐算法，不再自动捆绑团餐。
   - 将 Chatbot 中针对 Addon 的快捷提问词从“加 AI 团餐”修正为了“eSIM 高速流量包”。
   - 清理了全部 4 个礼宾角色模板（Persona）中的默认团餐加购记录。
   - 在 API 知识库描述中删除了 AI 团餐的匹配模型介绍，避免 LLM 在回复中推荐相关虚空功能。
   - 删除了 [ConciergeDemo.tsx](file:///src/components/features/ConciergeDemo.tsx) 下全部残留的 `buildMealMatch` 运算模型及 matched 样式。

---

## 结论

本版本 (v0.3.0) 极大地提升了演示系统的数据流一致性与业务纯粹性。所有的预设案例全部打通了闭环，在去除多余非核心功能的同时，将登机 Buffer、边界警告、双语切换和后台大模型调用都做到了逻辑完美对齐。
