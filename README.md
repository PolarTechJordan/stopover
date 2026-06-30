# Stopover 中转游 Web Demo 项目技术文档

这是一个基于 **Next.js 16 (React 19)** 和 **Tailwind CSS v4** 构建的“一站式中转套餐与微游服务”概念演示（PoC）网站。该系统针对长中转旅客面临的“时间、行李和体验焦虑”，通过**以休息室为信任锚 + 行李全托管 + 模块化城市微游**的业务闭环实现旅客体验的全面升级。

---

## 🛠️ 技术栈与依赖

* **核心框架**：Next.js 16.2.9 (App Router) + React 19
* **样式系统**：Tailwind CSS v4 (通过 `@tailwindcss/postcss` 接入原生 CSS 变量)
* **状态引擎**：Zustand v5 + `persist` 中间件（在浏览器 `localStorage` 中自动持久化订单和行李状态，刷新页面不丢失）
* **时间处理**：Day.js (处理高精度的中转时间段差值计算、行李相对流转时间轴偏移)
* **动画系统**：Framer Motion (提供流畅的收银台流转、卡片切换微动画)
* **凭证生成**：qrcode.react (生成出港海关申报与行李标签关联的 RFID 电子核销二维码)
* **图标库**：Lucide React

---

## 📂 项目目录结构说明

```bash
├── src/
│   ├── app/                      # Next.js 路由与页面组件
│   │   ├── layout.tsx            # 全局导航栏、页脚及浮动演示控制台组件注入
│   │   ├── page.tsx              # 首页宣传页 (Hub展示、痛点与三级业务模型拆解)
│   │   └── (flow)/               # 核心业务漏斗流程
│   │       ├── search/           # Step 1: 航班搜索（4/10/23/35h真实航班预设与时间轴滑块）
│   │       ├── packages/         # Step 2: 套餐匹配（智能匹配轻享、微游、过夜包，置灰受限包）
│   │       ├── checkout/         # Step 3: 安全收银台（旅客护照拼音入境申报与一键支付）
│   │       ├── order/            # Step 4: 电子凭证（生成电子凭证二维码，通过 ?id= 关联订单）
│       └── journey/          # Step 5: 追踪看板（双 Tab 追踪，通过 ?id= 关联追踪）
│   │
│   ├── components/
│   │   └── features/
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

## ⚡ 云端部署指南 (Cloudflare Pages)

本项目是纯前端状态驱动的单页应用/离线持久化结构，完美适配 **Cloudflare Pages**。以下是部署到 Cloudflare Pages 的两种主流方案：

### 方案 A：静态导出部署（Static Export - 推荐，最简便稳定）

由于本项目的所有状态机和 mock 数据都由 Zustand 缓存在客户端，我们可以将 Next.js 编译为完全静态的 HTML/JS/CSS 静态网站，这在 Cloudflare Pages 上加载速度最快且完全免费。

#### 1. 修改 Next.js 配置文件
打开 `next.config.ts` (或 `next.config.js`)，在配置中加入 `output: 'export'`，并关闭静态路由动态路径检测：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 启用静态导出
  images: {
    unoptimized: true, // 静态导出必须关闭 Next.js 图片优化
  },
  // 忽略构建时 TypeScript / ESLint 的编译中断
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
```

#### 2. 在 Cloudflare 网页后台部署
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages**。
2. 点击 **Create application** -> 选择 **Pages** -> 点击 **Connect to Git** 关联您的 GitHub 仓库。
3. 选择 `PolarTechJordan/stopover` 仓库。
4. 在 **Build settings** 中选择预设框架：
   * **Framework preset**：`Next.js (Static HTML Export)`
   * **Build command**：`npm run build`
   * **Build output directory**：`out`
5. 点击 **Save and Deploy** 按钮。
6. 稍等 1-2 分钟，部署完成后您将获得一个专属的 `*.pages.dev` 域名。

---

### 方案 B：利用 Edge Runtime 部署 (Full-Stack SSR 部署)

如果您希望未来加入后端接口（例如 Next.js Route Handlers / API 路由），可以利用 Cloudflare Edge 运行环境部署：

#### 1. 安装 Cloudflare 集成插件
在项目根目录运行以下命令以引入 Cloudflare Pages 适配器：
```bash
npm install -D @cloudflare/next-on-pages
```

#### 2. 配置 Cloudflare 后台构建参数
1. 在 CF Dashboard Pages 中关联代码库。
2. 在 **Build settings** 配置：
   * **Framework preset**：`Next.js`
   * **Build command**：`npx @cloudflare/next-on-pages`
   * **Build output directory**：`.vercel/output/static`
3. 在下方 **Environment variables (环境变量)** 中添加：
   * 变量名：`NODE_VERSION`
   * 变量值：`18` 或以上（推荐 `20`）
4. 点击部署即可。

---

## 💻 本地运行与开发

如果您要在本地继续开发，只需安装依赖并启动：

```bash
# 安装项目依赖
npm install

# 开启本地开发服务器 (默认端口 3000)
npm run dev
```
