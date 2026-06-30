# Stopover 中转游 Web Demo 项目技术文档

这是一个基于 **Next.js 16 (React 19)** 和 **Tailwind CSS v4** 构建的“一站式中转套餐与微游服务”概念演示（PoC）网站。该系统针对长中转旅客面临的“时间、行李和体验焦虑”，通过**以休息室为信任锚 + 行李全托管 + 模块化城市微游**的业务闭环实现旅客体验的全面升级。

---

## 🛠️ 技术栈与依赖

* **核心框架**：Next.js 16.2.9 (App Router) + React 19
* **样式系统**：Tailwind CSS v4 (通过 `@tailwindcss/postcss` 接入原生 CSS 变量)
* **状态引擎**：Zustand v5 + `persist` 中间件（在浏览器 `localStorage` 中自动持久化订单和行李状态，刷新页面不丢失）
* **时间处理**：Day.js (处理高精度的中转时间段差值计算、行李相对流转时间轴偏移)
* **动画系统**：Framer Motion (提供流畅的收银台流转、卡片切换微动画)
* **凭证生成**：qrcode.react (生成服务核销与行李标签关联的 RFID 电子凭证二维码)
* **图标库**：Lucide React
* **AI 礼宾**：Next.js Route Handler + DashScope OpenAI-compatible `/chat/completions`，默认模型 `qwen3.7-max`，无 Key 时自动降级为确定性 demo 回复

---

## 📂 项目目录结构说明

```bash
├── src/
│   ├── app/                      # Next.js 路由与页面组件
│   │   ├── layout.tsx            # 全局导航栏、页脚及浮动演示控制台组件注入
│   │   ├── page.tsx              # 手机优先 AI 礼宾 Demo 首屏
│   │   ├── pitch/                # 黑客松展示用 HTML/PPT 页面
│   │   ├── api/concierge/        # Qwen 礼宾后端接口，失败时本地兜底
│   │   └── (flow)/               # 核心业务漏斗流程
│   │       ├── search/           # Step 1: 航班搜索（4/10/23/35h真实航班预设与时间轴滑块）
│   │       ├── packages/         # Step 2: 套餐匹配（智能匹配轻享、微游、过夜包，置灰受限包）
│   │       ├── checkout/         # Step 3: 安全收银台（履约核验信息与一键支付）
│   │       ├── order/            # Step 4: 电子凭证（生成电子凭证二维码，通过 ?id= 关联订单）
│       └── journey/          # Step 5: 追踪看板（双 Tab 追踪，通过 ?id= 关联追踪）
│   │
│   ├── components/
│   │   └── features/
│   │       ├── ConciergeDemo.tsx # AI Agent 聊天式中转方案推荐
│   │       └── DemoController.tsx# 【重点演示用】右下角浮动演示控制台，可一键流转状态与触发异常
│   │
│   └── lib/
│       ├── types.ts              # 业务核心 TypeScript 结构定义 (Flight, Order, Package等)
│       ├── mockData.ts           # 静态套餐数据、免签枢纽机场列表与 4 类真实航班 Presets
│       ├── store/
│       │   └── orderStore.ts     # 全局 Zustand Store，承载订单创建、状态跃迁、行李手动模拟更新
│       └── state-machine/
│           └── orderState.ts     # 【核心业务逻辑】有限状态机 (FSM)，掌管 9 种核心状态流转
```

---

## 🧩 核心架构设计

### 1. 有限状态机 (Finite State Machine)
订单与行李追踪由 `src/lib/state-machine/orderState.ts` 强控制。包含 9 种合规业务状态以及 `TIMEOUT`（路况延误误机）异常分支：

*   **已支付 (paid)**：订单初始生成状态。
*   **柜台收件 (baggage_received)**：行李在服务柜台交付并贴上 RFID 电子标签。
*   **贵宾厅小憩 (in_lounge)** / **市区微游 (tour_ongoing)** / **酒店入住 (hotel_checked_in)**：行李自动直送后台寄存库，人去休息/观光/回客房。
*   **出库运回 (returning)**：行李自动复运至出境安检口/登机口。
*   **已登机 (boarded)** & **中转游完成 (completed)**：旅客签收行李并装机起飞。
*   **路况异常误机 (missed_flight)** & **无忧退款赔付 (refunded)**：触发无忧保障 SOP，快速退款并改签。

### 2. 状态与行李时间的真实性校验
* **时间计算解耦**：系统区分了**实际航班停留时间**（由所选航班 preset 的起降差决定）和**预留中转服务时长**（由旅客在搜索页拖动 Slider 手动调节，限制最大不超过 `中转时长 - 2小时`）。
* **流转时间关联**：行李流转的各日志节点时间不再使用系统当前时间。系统会自动解析所选航班的 `arrivalTime` 和 `departureTime`，自动分配符合真实流程的相对时间戳（例如收件为 `落地时间 + 20分钟`，登机装舱为 `起飞时间 - 60分钟`）。

---

## ⚡ 云端部署指南

当前黑客松版本包含 `/api/concierge` 后端接口，用于在服务端调用 DashScope `qwen3.7-max`。因此默认不再使用 `output: 'export'` 纯静态导出；建议部署到 Vercel、Node Server、Cloudflare Workers/Pages 的 Next serverful 方案，或现场直接运行本地局域网地址。

需要配置的环境变量：

```bash
DASHSCOPE_API_KEY=...
COMPATIBLE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DEFAULT_MODEL=qwen3.7-max
MODEL_TEMPERATURE=0.2
LLM_CALL_TIMEOUT=10
```

也兼容 smartbundlex 的变量命名：`COMPATIBLE_API_KEY` 可作为 `DASHSCOPE_API_KEY` 的替代。

如果必须部署为完全静态页面，需要移除或禁用 `/api/concierge`，并把首页 AI 礼宾切回本地确定性回复；这会牺牲现场 Qwen 实时对话效果。

---

## 💻 本地运行与开发

如果您要在本地继续开发，只需安装依赖并启动：

```bash
# 安装项目依赖
npm install

# 开启本地开发服务器 (默认端口 3000)
npm run dev
```

使用 smartbundlex 的百炼配置启动现场 demo：

```bash
set -a
source /Users/kaisun/smartbundlex/.env.dev
set +a
npm run dev -- -p 3000
```

演示入口：

* 手机 AI 礼宾 Demo：`http://localhost:3000/`
* 展示 HTML/PPT：`http://localhost:3000/pitch`
* 传统流程沙盒：`http://localhost:3000/search`
