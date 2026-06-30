# 中转游 Stopover Demo — 技术脚手架 & 选型文档

> **适用对象**：产品经理 → GPT Vibe Coding → 交付物：可访问的 Web Demo
> **版本**: v1.0  |  **日期**: 2026-06-30  |  **作者**: Jordan

---

## 0. 架构哲学（先说为什么）

### 核心判断
中转游 Demo 的本质是**流程演示**，不是生产系统。因此选型原则：

| 原则 | 体现 |
|------|------|
| **Domain first** | 5 个 Feature 的状态机必须先于技术选型 |
| **Reversibility matters** | 选能"轻松换皮"或"轻松换后端"的栈，不绑定单一云 |
| **No architecture astronautics** | 不上微服务、不上 K8s、不上 GraphQL。Vibe coding 复杂度是 demo 杀手 |
| **Optimize for "demo 能跑"** | 选 Vibe Coding 工具最熟悉的栈（Next.js + Tailwind） |

### 关键架构决策（ADR 摘要）

| 决策 | 选 | 不选 | 取舍 |
|------|----|----|------|
| **前端框架** | Next.js (App Router) | Vite + React / Vue | Next 一体化（路由/SSR/API），Vibe Coding 生态最成熟 |
| **UI 库** | Tailwind CSS + shadcn/ui | MUI / Ant Design | shadcn 可复制粘贴，最适合迭代 |
| **数据可视化** | Recharts + Framer Motion | D3 / ECharts | Recharts 体积小、上手快，动画加分 |
| **状态管理** | Zustand | Redux / Jotai | Zustand 心智负担最低，demo 够用 |
| **表单** | React Hook Form + Zod | Formik | 类型安全、错误提示优雅 |
| **后端** | Next.js Route Handlers (BFF) | 独立 Express / Nest | 不拆分，Mock 数据放内存 + JSON |
| **数据持久化** | localStorage + 内存 Store | 真数据库 | 刷新不丢即可，不上 DB |
| **部署** | Vercel / CloudStudio 沙箱 | 自建 | 一键部署、免费、URL 可分享 |
| **类型安全** | TypeScript | JS | 5 个 Feature 状态机复杂，必须有类型 |

---

## 1. 技术栈一览（Vibe Coding 推荐组合）

### 1.1 一级选型（必选）

| 层级 | 技术 | 版本 | 选它的一句话理由 |
|------|------|------|----------------|
| 前端框架 | **Next.js 14+ (App Router)** | 14.2 / 15.x | API Route + SSR + 路由一体化 |
| 语言 | **TypeScript 5.x** | 5.4+ | 状态机复杂，必须有类型 |
| UI 样式 | **Tailwind CSS 3.4+** | 3.4 | Vibe Coding 生态最熟 |
| 组件库 | **shadcn/ui** | latest | 复制即用，可改可删 |
| 图标 | **lucide-react** | latest | shadcn 配套 |
| 动画 | **Framer Motion 11+** | 11.x | 状态切换有"高级感" |
| 状态管理 | **Zustand 4.x** | 4.5 | 5 行代码一个 store |
| 表单 | **React Hook Form + Zod** | 7.x / 3.x | 校验、错误提示优雅 |
| Mock 数据 | **@faker-js/faker** + 本地 JSON | 8.x | 模拟订单、用户、行李 |
| 地图 | **react-simple-maps** 或静态 SVG | 3.x | 轻量、画航线图够用 |

### 1.2 二级选型（按需）

| 需求 | 选 | 备选 |
|------|----|----|
| 图表（订单趋势） | **Recharts** | Chart.js |
| QR 码展示 | **qrcode.react** | — |
| 时间处理 | **dayjs** | date-fns |
| ID 生成 | **nanoid** | uuid |
| 国际化 | 先不做（中文为主） | next-intl |
| 测试（可选） | **Vitest + Playwright** | Jest |

### 1.3 部署

| 环境 | 用途 | 备注 |
|------|------|------|
| **Vercel** | 公开 demo URL | 适合给同事/老板看 |
| **CloudStudio 沙箱** | 内网分享 | 国内访问快 |
| 本地 `npm run dev` | 开发态 | 默认 3000 端口 |

---

## 2. 目录结构（约定）

```
stopover-demo/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 全局布局（顶部导航 + 底部 Tab）
│   ├── page.tsx                 # 首页：5 大场景入口
│   ├── globals.css              # Tailwind base
│   │
│   ├── (flow)/                  # 主流程（用户视角）
│   │   ├── search/
│   │   │   └── page.tsx         # Step 1: 选机场/航班/时长
│   │   ├── packages/
│   │   │   └── page.tsx         # Step 2: 3 档套餐 + 增值项
│   │   ├── checkout/
│   │   │   └── page.tsx         # Step 3: 订单确认 + 支付(模拟)
│   │   ├── order/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Step 4: 订单详情 + 服务触发
│   │   └── journey/
│   │       └── [id]/
│   │           └── page.tsx     # Step 5: 行李追踪 + 城市游时刻表
│   │
│   ├── lounge/                  # Feature 1: 休息室预约
│   ├── baggage/                 # Feature 2: 行李托管
│   ├── city-tour/               # Feature 3: 城市微游
│   ├── addons/                  # Feature 4: 增值项
│   └── custom-tour/             # Feature 5: 包车定制
│
├── components/
│   ├── ui/                      # shadcn/ui 原子组件
│   ├── features/                # 业务组件
│   │   ├── PackageCard.tsx
│   │   ├── BaggageTimeline.tsx
│   │   ├── CityTourRoute.tsx
│   │   └── FlightInfo.tsx
│   └── layout/                  # 布局组件
│
├── lib/
│   ├── mock/                    # Mock 数据
│   │   ├── airports.ts          # 5 个枢纽 mock
│   │   ├── packages.ts          # 3 档套餐
│   │   ├── orders.ts
│   │   ├── city-tours.ts
│   │   └── flights.ts
│   ├── store/                   # Zustand stores
│   │   ├── orderStore.ts        # 当前订单
│   │   ├── baggageStore.ts      # 行李状态
│   │   └── tourStore.ts
│   ├── types/                   # 领域类型
│   │   ├── order.ts
│   │   ├── baggage.ts
│   │   ├── package.ts
│   │   └── flight.ts
│   ├── state-machine/           # 状态机
│   │   ├── orderState.ts
│   │   └── baggageState.ts
│   └── utils.ts
│
├── app/api/                     # Route Handlers（Mock API）
│   ├── packages/route.ts
│   ├── orders/route.ts
│   ├── orders/[id]/route.ts
│   └── baggage/[id]/route.ts
│
├── public/
│   ├── images/
│   │   ├── airports/            # 5 个机场的 banner 图
│   │   └── routes/              # 城市游路线示意
│   └── icons/
│
├── tailwind.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. 领域类型定义（核心数据模型）

**这是给 GPT 的"字典"**，让 vibe coding 时所有命名都规范。

```typescript
// lib/types/flight.ts
export type AirportCode = 'SIN' | 'DOH' | 'IST' | 'DXB' | 'HND';

export interface Flight {
  flightNo: string;          // "TR123"
  airline: string;           // "酷航"
  from: AirportCode;
  to: AirportCode;
  arrivalTime: string;       // ISO
  departureTime: string;     // ISO
  terminal: string;
}

// lib/types/package.ts
export type PackageSku = 'light' | 'micro' | 'overnight';

export interface Package {
  sku: PackageSku;
  name: string;              // "轻享包"
  tagline: string;           // "6-8h 纯休息最佳"
  price: number;             // 单位：分（避免浮点）
  currency: 'CNY' | 'USD' | 'SGD';
  includes: string[];        // ["休息室 3h", "行李寄存", "快速安检"]
  recommendedLayover: {
    minHours: number;
    maxHours: number;
  };
  addons: AddonSku[];
}

export type AddonSku =
  | 'esim'
  | 'transfer'
  | 'hotel-dayuse'
  | 'shower'
  | 'meal-voucher'
  | 'private-car';

// lib/types/baggage.ts
export type BaggageStatus =
  | 'received'      // 中转柜台收件
  | 'in_transit'    // 转运中
  | 'at_lounge'     // 到达贵宾厅
  | 'at_hotel'      // 到达酒店
  | 'returning'     // 送回中
  | 'delivered'     // 已送回
  | 'lost';         // 异常

export interface BaggageTracking {
  trackingId: string;
  orderId: string;
  rfidTag: string;
  pickupAt: string;          // ISO
  currentLocation: string;   // "樟宜机场 T1 贵宾厅"
  status: BaggageStatus;
  photoUrl: string;
  history: Array<{
    status: BaggageStatus;
    timestamp: string;
    location: string;
  }>;
}

// lib/types/order.ts
export type OrderStatus =
  | 'paid'                  // 已支付
  | 'baggage_received'      // 已收行李
  | 'in_lounge'             // 在休息室
  | 'in_city_tour'          // 城市游中
  | 'at_hotel'              // 在酒店
  | 'baggage_returning'     // 行李送回中
  | 'boarded'               // 已登机
  | 'completed'             // 完成
  | 'missed_flight'         // 误机
  | 'refunded';             // 已退款

export interface StopoverOrder {
  orderId: string;
  userId: string;
  arrivalFlight: Flight;
  departureFlight: Flight;
  layoverAirport: AirportCode;
  layoverHours: number;
  package: Package;
  addons: AddonSku[];
  totalAmount: number;       // 分
  status: OrderStatus;
  createdAt: string;
  baggage?: BaggageTracking;
  cityTour?: {
    routeId: string;
    departureTime: string;   // "09:00"
    guideId: string;
    vehicleId: string;
  };
  hotel?: {
    hotelId: string;
    checkIn: string;
    checkOut: string;
  };
}
```

---

## 4. 状态机（最关键！）

```typescript
// lib/state-machine/orderState.ts
import { OrderStatus } from '@/lib/types/order';

interface Transition {
  from: OrderStatus;
  to: OrderStatus;
  trigger: string;
  guard?: (ctx: any) => boolean;
}

export const orderTransitions: Transition[] = [
  { from: 'paid',              to: 'baggage_received',  trigger: 'RECEIVE_BAGGAGE' },
  { from: 'baggage_received',  to: 'in_lounge',         trigger: 'ENTER_LOUNGE' },
  { from: 'baggage_received',  to: 'in_city_tour',      trigger: 'START_CITY_TOUR' },
  { from: 'baggage_received',  to: 'at_hotel',          trigger: 'CHECK_IN_HOTEL' },
  { from: 'in_city_tour',      to: 'at_hotel',          trigger: 'CITY_TOUR_END' },
  { from: 'in_lounge',         to: 'baggage_returning', trigger: 'PREPARE_RETURN', guard: ctx => ctx.minutesToDeparture <= 90 },
  { from: 'in_city_tour',      to: 'baggage_returning', trigger: 'PREPARE_RETURN', guard: ctx => ctx.minutesToDeparture <= 90 },
  { from: 'at_hotel',          to: 'baggage_returning', trigger: 'CHECK_OUT' },
  { from: 'baggage_returning', to: 'boarded',           trigger: 'BOARD' },
  { from: 'boarded',           to: 'completed',         trigger: 'COMPLETE' },
  { from: 'in_city_tour',      to: 'missed_flight',     trigger: 'TIMEOUT', guard: ctx => ctx.minutesToDeparture < 0 },
  { from: 'missed_flight',     to: 'refunded',          trigger: 'REFUND' },
];

// 简单实现（XState 太重，demo 用轻量版）
export function transition(current: OrderStatus, trigger: string, ctx: any = {}): OrderStatus {
  const t = orderTransitions.find(t => t.from === current && t.trigger === trigger);
  if (!t) throw new Error(`Invalid transition: ${current} -> ${trigger}`);
  if (t.guard && !t.guard(ctx)) throw new Error(`Guard failed: ${current} -> ${trigger}`);
  return t.to;
}
```

---

## 5. Mock 数据规范（给 GPT 看）

```typescript
// lib/mock/airports.ts
export const airports = [
  {
    code: 'SIN',
    name: '新加坡樟宜机场',
    city: 'Singapore',
    nameZh: '新加坡',
    image: '/images/airports/sin.jpg',
    loungeLocation: 'T1 贵宾厅',
    visaFree: true,
    cityTourRoutes: ['classic-4h', 'deep-6h', 'highlight-3h'],
  },
  {
    code: 'DOH',
    name: '多哈哈马德国际机场',
    city: 'Doha',
    nameZh: '多哈',
    image: '/images/airports/doh.jpg',
    loungeLocation: 'Al Mourjan Business Lounge',
    visaFree: true,
    cityTourRoutes: ['doha-4h', 'doha-6h'],
  },
  {
    code: 'IST',
    name: '伊斯坦布尔机场',
    city: 'Istanbul',
    nameZh: '伊斯坦布尔',
    image: '/images/airports/ist.jpg',
    loungeLocation: 'IGA Lounge',
    visaFree: false,           // 需签证，标注
    cityTourRoutes: ['classic-4h', 'bosphorus-6h'],
  },
  {
    code: 'DXB',
    name: '迪拜国际机场',
    city: 'Dubai',
    nameZh: '迪拜',
    image: '/images/airports/dxb.jpg',
    loungeLocation: 'Marhaba Lounge',
    visaFree: true,
    cityTourRoutes: ['classic-4h', 'burj-3h'],
  },
  {
    code: 'HND',
    name: '东京羽田机场',
    city: 'Tokyo',
    nameZh: '东京',
    image: '/images/airports/hnd.jpg',
    loungeLocation: 'Power Lounge',
    visaFree: true,
    cityTourRoutes: ['tokyo-4h', 'tokyo-6h'],
  },
];
```

```typescript
// lib/mock/packages.ts
export const packages: Package[] = [
  {
    sku: 'light',
    name: '轻享包',
    tagline: '6-8h 纯休息，零负担',
    price: 28000,           // ¥280
    currency: 'CNY',
    includes: [
      '机场贵宾厅 3 小时',
      '随身行李寄存',
      '快速安检通道',
      '淋浴 / Wi-Fi / 充电',
    ],
    recommendedLayover: { minHours: 6, maxHours: 8 },
    addons: ['esim', 'meal-voucher', 'shower'],
  },
  {
    sku: 'micro',
    name: '微游包',
    tagline: '10-18h，去城市看一眼',
    price: 78000,           // ¥780
    currency: 'CNY',
    includes: [
      '机场贵宾厅 2 小时',
      '随身行李全托管（柜台 → 贵宾厅）',
      '城市半日游 4 小时（固定路线）',
      '机场 ↔ 市区专车接送',
      '中文 / 英文向导',
      '误机保障 + 改签协助',
    ],
    recommendedLayover: { minHours: 10, maxHours: 18 },
    addons: ['esim', 'transfer', 'meal-voucher'],
  },
  {
    sku: 'overnight',
    name: '过夜包',
    tagline: '12-36h，玩 + 睡都安排',
    price: 98000,           // ¥980
    currency: 'CNY',
    includes: [
      '机场贵宾厅 1 小时（餐食）',
      '随身行李全托管（柜台 → 酒店）',
      '合作酒店钟点房 6 小时',
      '机场 ↔ 酒店专车',
      '次日回程专车',
      '误机保障 + 改签协助',
    ],
    recommendedLayover: { minHours: 12, maxHours: 36 },
    addons: ['esim', 'transfer', 'private-car', 'meal-voucher'],
  },
];
```

---

## 6. 路由 & 页面流程（5 步主流程）

```
/  首页（5 大场景入口 + 推荐枢纽）
  ↓
/search  步骤 1：选机场 / 输入到达航班 / 选停留时长
  ↓
/packages  步骤 2：系统推荐 1 个套餐 + 展示另 2 个 + 增值项
  ↓
/checkout  步骤 3：订单确认 + 模拟支付
  ↓
/order/[id]  步骤 4：订单详情（状态机当前态 + 服务触发按钮）
  ↓
/journey/[id]  步骤 5：实时追踪（行李时间线 + 城市游时刻表）
```

### 关键交互
- **步骤 4 的"演示模式"**：提供"快速推进时间"按钮，让 demo 一次能跑完整个流程（不然 6h 等待没法看）
- **步骤 5 的"行李时间线"**：用 Framer Motion 做 Lottie 风格的水平时间轴
- **状态机可视化**：用色块显示当前 9 个状态（已支付/已收行李/...）

---

## 7. 视觉风格指南（科技感 + 人文温度）

> 你的审美偏好："科技感 + 人文温度"，排斥冰冷纯科技风。

| 元素 | 风格 | 实现 |
|------|------|------|
| **主色** | 深蓝 + 暖橙（机场航空蓝 + 旅途暖意） | `#0B5FFF` + `#FF8A3D` |
| **辅助色** | 米白 / 沙金 | `#FAF7F2` / `#D4B996` |
| **字体** | 思源黑体 + Inter | `next/font/google` |
| **圆角** | 12-16px（柔和不冰冷） | `rounded-xl` |
| **阴影** | 极轻、双层 | `shadow-[0_2px_8px_rgba(11,95,255,0.06)]` |
| **插画** | 抽象几何 + 人物剪影（机场/飞机/行李） | Figma 生成或 Unsplash 风景 |
| **文案** | 偏口语、有温度 | "把中转交给您" 优于 "中转服务" |
| **动效** | 入场 fade + 上滑、不过度 | Framer Motion `duration: 0.4` |

---

## 8. 关键文件清单（给 GPT 一次性参考）

**让 GPT 在 vibe coding 时按这个清单执行：**

1. ✅ `package.json` — 依赖锁定
2. ✅ `tailwind.config.ts` — 主题色 / 字体
3. ✅ `lib/types/*.ts` — 5 个核心类型
4. ✅ `lib/mock/*.ts` — 5 套 mock 数据
5. ✅ `lib/store/orderStore.ts` — Zustand 主 store
6. ✅ `lib/state-machine/orderState.ts` — 状态机
7. ✅ `app/layout.tsx` + `app/page.tsx` — 全局壳
8. ✅ `app/(flow)/*` — 5 步主流程
9. ✅ `components/features/PackageCard.tsx` — 套餐卡
10. ✅ `components/features/BaggageTimeline.tsx` — 行李时间线
11. ✅ `components/features/CityTourRoute.tsx` — 城市游路线
12. ✅ `components/features/OrderStatusBar.tsx` — 状态机可视化
13. ✅ `app/api/orders/route.ts` — Mock 订单 API
14. ✅ `app/api/baggage/[id]/route.ts` — Mock 行李 API
15. ✅ `README.md` — 启动 + 演示步骤

---

## 9. 演示流程剧本（给 PM 演示时用）

> **5 分钟跑完整个 demo 的脚本**

| 时间 | 动作 | 页面 |
|------|------|------|
| 0:00 | 打开首页，介绍 5 大场景 | `/` |
| 0:30 | 选「新加坡樟宜」+ 输入航班 + 选 14h 中转 | `/search` |
| 1:00 | 系统推荐「微游包」，展示 3 档对比 + 加 eSIM | `/packages` |
| 1:30 | 模拟支付，确认订单 | `/checkout` |
| 2:00 | 订单详情，点"模拟到达中转柜台" | `/order/[id]` |
| 2:30 | 行李交付（点按钮），显示 RFID 贴标 + 推送 | `/order/[id]` |
| 3:00 | **点"演示模式：快进时间"** | `/journey/[id]` |
| 3:30 | 行李时间线逐步推进：in_transit → at_lounge → returning | `/journey/[id]` |
| 4:00 | 切到城市游 tab：显示 9:00 出发路线、4 个景点 | `/journey/[id]` |
| 4:30 | 误时保护演示：人为延后，触发"快速返程流程" | `/journey/[id]` |
| 5:00 | 行李送回 + 登机 + 完成 | `/journey/[id]` |

---

## 10. Vibe Coding 提示词模板（给 GPT 用的）

> 把这份文档压缩成 context，然后给 GPT 类似下面的指令：

```
你是 Next.js 14 + TypeScript + Tailwind + shadcn/ui 专家。
基于以下技术规范实现一个中转游 Stopover Demo Web 应用：

[粘贴本文档的关键部分：技术栈、目录结构、类型定义、Mock 数据、5 步流程]

要求：
1. TypeScript strict 模式
2. 移动端响应式（375px - 1920px）
3. 主色 #0B5FFF + 暖橙 #FF8A3D，圆角 12-16px
4. 5 步流程必须完整，状态机 9 个状态全部支持
5. 演示模式按钮：把 6h 等待压缩到 30 秒
6. 用 Zustand 管理订单状态，localStorage 持久化
7. 完成后启动 dev server 在 3000 端口

先输出 package.json 和目录结构，等我确认后逐文件实现。
```

---

## 11. 不做什么（防 GPT 跑偏）

明确告诉 GPT 不要做：

- ❌ **不接真实 API**（航班动态、eSIM 平台等）—— 全部 Mock
- ❌ **不上数据库**（MongoDB / Postgres）—— localStorage + 内存
- ❌ **不做用户系统**（登录/注册/SSO）—— 固定一个测试用户
- ❌ **不做支付**（支付宝/微信）—— 模拟支付弹窗
- ❌ **不做多语言**（i18n）—— 中文为主
- ❌ **不做后台管理**（CMS/运营端）—— 这是 C 端 demo
- ❌ **不上 SSR 数据预取**—— CSR 即可

---

## 12. 风险与回退方案

| 风险 | 概率 | 回退 |
|------|------|------|
| GPT 跑偏选 Next.js 之外的技术 | 中 | 在 prompt 里硬约束，生成前先确认 package.json |
| 状态机太复杂 GPT 写崩 | 中 | 把本文档 §4 状态机表直接复制到 prompt 里 |
| 视觉风格不达标 | 中 | 给 GPT 截图参考（用 v0.dev 或 screenshot） |
| 演示数据太假 | 低 | 用真实机场图 + 真实景点名（foursquare API 即可） |
| Vercel 部署失败 | 低 | 回退 CloudStudio 沙箱 |

---

## 13. 验收清单（demo 完成时 PM 自检）

- [ ] 5 大 Feature 全部跑通
- [ ] 状态机 9 个状态全部可视化
- [ ] 行李时间线能看到 ≥ 3 个状态切换
- [ ] 误机保护场景能触发
- [ ] 3 档套餐有清晰对比
- [ ] 移动端 375px 宽度可用
- [ ] 演示模式 30 秒跑完全流程
- [ ] 刷新页面订单不丢
- [ ] Vercel 部署后公网 URL 可访问

---

> **写给 PM 的一句话**：这份文档不是技术方案，是**给 GPT 的"产品技术语言"**。你只需要把 §1（技术栈）+ §3（类型定义）+ §5（Mock 数据）+ §6（路由流程）+ §10（Vibe Coding prompt）这 5 段粘进 GPT 对话框，就能跑起来了。
