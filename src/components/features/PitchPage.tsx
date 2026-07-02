'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Luggage,
  MapPinned,
  MessageCircle,
  Plane,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  Compass,
  Briefcase,
} from 'lucide-react';
import OpenConciergeButton from '@/components/features/OpenConciergeButton';
import { useAppPreferences } from './AppPreferenceProvider';
import { localizePackage, localizeAirport } from '@/lib/appPreferences';
import { airports, packages } from '@/lib/mockData';

type PitchCopy = {
  hackathonDemo: string;
  brand: string;
  subBrand: string;
  tagline: string;
  description: string;
  tags: string[];
  openChatDemo: string;
  viewTemplates: string;
  demoCaseTitle: string;
  recommended: string;
  microTour: string;
  timeline: Array<{ time: string; label: string }>;
  enterDashboard: string;
  safetyBanner: string;
  certaintyTitle: string;
  painPoints: Array<{ title: string; body: string; solution: string }>;
  solutionTitle: string;
  solutionSubline: string;
  solutionFlow: Array<{ title: string; body: string }>;
  techTitle: string;
  techSubline: string;
  techStack: Array<{ title: string; body: string }>;
  businessTitle: string;
  businessSubline: string;
  validationWindow90d: string;
  metrics: Array<{ label: string; before: string; after: string }>;
  packages: Array<{ name: string; hours: string; body: string }>;
  closingLabel: string;
  closingHeadline: string;
  enterLiveDemo: string;
};

const zhCopy: PitchCopy = {
  hackathonDemo: 'Hackathon Demo',
  brand: '龙腾',
  subBrand: '中转礼遇',
  tagline: '机场等待的增长曲线',
  description: '专为中转 6–48 小时旅客设计，把漫长枯燥的机场等待，升级为轻装自由的城市奇遇。',
  tags: ['自然语言对话', '行李全托管', '误机赔付'],
  openChatDemo: '打开对话 Demo',
  viewTemplates: '查看模板流程',
  demoCaseTitle: '新加坡 10 小时中转',
  recommended: '推荐',
  microTour: '微游包',
  timeline: [
    { time: '08:30', label: 'SQ833 抵达' },
    { time: '09:20', label: '向导出发' },
    { time: '13:00', label: '回到机场贵宾厅' },
    { time: '17:00', label: '行李返场启动' },
  ],
  enterDashboard: '进入中转仪表盘 Demo',
  safetyBanner: '龙腾中转礼遇把返程缓冲、VIP 安检、误机改签和行李保险打包成可跟踪的信任底座。',
  certaintyTitle: '旅客买的不是旅游，是确定性',
  painPoints: [
    {
      title: '1. 时间焦虑',
      body: '漫长中转等候期无休闲消遣，候机大厅拥挤嘈杂；旅客有意出境短途游览，却因陌生路线、语言不通、担心错过航班等多重顾虑不敢离港。',
      solution: '对策：标准化推出 4/8/12 小时分时段专属城市路线，全程专人向导、一价全包，旅客无需自行做行程攻略。',
    },
    {
      title: '2. 随身行李焦虑',
      body: '中转需反复提取、二次托运大件行李流程繁琐；随身拖拽登机箱游览耗损体力，大幅降低旅客外出游玩、线下消费意愿。',
      solution: '对策：中转柜台一键行李全托管，依托 RFID 物联网实时定位追踪；实现人包分离，行李直达贵宾厅或中转酒店，AI 智能弹窗实时推送行李动态提醒。',
    },
    {
      title: '3. 决策焦虑',
      body: '停留时长有限，旅客难以快速匹配贴合自身预算、喜好、剩余登机时间的出行方案，选择成本高、纠结内耗严重。',
      solution: '对策：专属 AI 礼遇智能对话机器人，一键同步航班剩余时长、行李状态、出行偏好；自动分层推荐轻量化 / 深度游玩、休息休憩、免税购物三类方案，实时调整行程，一站式敲定全部中转安排，消除选择内耗。',
    },
    {
      title: '4. 误机安全焦虑',
      body: '外出游览遭遇路面拥堵、行程延误、向导衔接失误等突发状况，一旦误机损失全由旅客自行承担，是旅客不敢出境中转游览的核心顾虑。',
      solution: '对策：系统实时前置抓取航班动态，行程全程预留弹性缓冲时长，专人全程把控返程节点；配套专属中转误机保障险，若因我方服务问题造成误机，支持极速核验、即时理赔，彻底打消航班延误后顾之忧。',
    },
  ],
  solutionTitle: '产品解法：一个 AI 入口，三层履约能力',
  solutionSubline: 'AI 让用户不用学习菜单，状态机让运营不靠口头承诺。评委看到的是酷炫对话卡片，业务真正卖的是可控的机场服务编排。',
  solutionFlow: [
    { title: '一句话说需求', body: '我在新加坡中转 10 小时，想轻装出机场看看城市。' },
    { title: 'AI 核算安全窗口', body: '识别航班、到离港时间、入境和安检缓冲，给出可用服务时长。' },
    { title: '推荐套餐和路线', body: '微游包：行李托管、贵宾厅、4 小时城市游、接送和误机保障。' },
    { title: '进入履约追踪', body: 'RFID 行李卡、向导车辆、返程截止和异常兜底全部可视化。' },
  ],
  techTitle: '技术讲法：非技术也能听懂',
  techSubline: '大模型负责“理解和解释”，业务数据负责“价格和边界”，状态机负责“每一步是否真的能履约”。这三层分开，demo 酷，但不是幻觉。',
  techStack: [
    { title: '中转礼遇入口', body: '把自然语言需求转成可执行的中转方案，并用卡片推进确认、下单和履约。' },
    { title: '业务状态机', body: '订单、行李、微游、酒店和误机保障按可解释状态流转。' },
    { title: 'Mock 枢纽数据', body: '首站新加坡樟宜，保留多哈、伊斯坦布尔、迪拜扩展位。' },
    { title: '降级可演示', body: '没有模型 key 或网络失败时，自动使用确定性礼宾回复。' },
  ],
  businessTitle: '商业结果：从等待时间里长出新收入',
  businessSubline: '首个 PoC 不追求全机场覆盖，只验证高价值中转用户愿不愿意为省心多付 ¥200-400。',
  validationWindow90d: '90 天验证窗口',
  metrics: [
    { label: '休息室单点客单', before: '约 ¥200', after: '目标 ¥450+' },
    { label: '套餐渗透率', before: '待建立基线', after: '90 天 8%' },
    { label: '行李托管占比', before: 'N/A', after: '90 天 30%' },
    { label: '履约目标', before: '人工兜底', after: '零漏接 / 零误机事故' },
  ],
  packages: [
    { name: '轻享包', hours: '6-8h', body: '休息室 + 行李寄存 + 快速安检' },
    { name: '微游包', hours: '10-18h', body: '行李全托管 + 城市 4h 游 + 接送' },
    { name: '过夜包', hours: '12-36h', body: '酒店/钟点房 + 行李托管 + 接送' },
  ],
  closingLabel: 'Closing',
  closingHeadline: '我们不是卖一段观光，而是卖一段不会失控的中转时间。',
  enterLiveDemo: '进入现场 Demo',
};

const enCopy: PitchCopy = {
  hackathonDemo: 'Hackathon Demo',
  brand: 'DragonPass',
  subBrand: 'Stopover',
  tagline: 'The Growth Curve of Airport Waiting',
  description: 'Designed for 6–48h layover travelers, upgrading tedious airport wait times into seamless, worry-free city adventures.',
  tags: ['Conversational Chat', 'Baggage Custody', 'Missed Connection Protection'],
  openChatDemo: 'Open Chat Demo',
  viewTemplates: 'View Templates',
  demoCaseTitle: 'Singapore 10h Stopover',
  recommended: 'RECOM',
  microTour: 'Micro-Tour',
  timeline: [
    { time: '08:30', label: 'SQ833 Arrival' },
    { time: '09:20', label: 'Guide Depart' },
    { time: '13:00', label: 'Back to Lounge' },
    { time: '17:00', label: 'Baggage Return' },
  ],
  enterDashboard: 'Enter Dashboard Demo',
  safetyBanner: 'DragonPass Stopover packages return buffers, VIP security, rebooking assistance, and baggage insurance into a trackable trust framework.',
  certaintyTitle: "Travelers don't buy tours, they buy certainty",
  painPoints: [
    {
      title: '1. Time Anxiety',
      body: 'Long layovers lack recreation, with crowded and noisy terminals. Travelers want a quick city tour but hesitate due to unfamiliar routes, language barriers, and fear of missing their flight.',
      solution: 'Solution: Standardized 4/8/12h city routes with dedicated guides, all-inclusive pricing, requiring no planning by the traveler.',
    },
    {
      title: '2. Baggage Anxiety',
      body: 'Claiming and re-checking heavy baggage is tedious. Dragging carry-on bags around cities exhausts energy, severely dampening the desire to explore or shop.',
      solution: 'Solution: One-click baggage custody at transit counters with real-time RFID tracking, delivering bags directly to lounges or hotels.',
    },
    {
      title: '3. Decision Anxiety',
      body: 'With limited time, travelers struggle to match budgets, preferences, and departure times, leading to high selection costs and severe indecision.',
      solution: 'Solution: AI Concierge chatbot syncs flight time, baggage status, and preferences, recommending tailored lounge, shopping, or city tour plans.',
    },
    {
      title: '4. Missed Anxiety',
      body: 'Delays from traffic, scheduling issues, or guide mishaps carry heavy consequences borne solely by travelers, which is the main barrier to leaving the airport.',
      solution: 'Solution: Real-time flight tracking, strict return-buffer management, and missed-flight insurance covering rapid verification and instant compensation.',
    },
  ],
  solutionTitle: 'Product Solution: One AI Entry, Three Layers of Fulfillment',
  solutionSubline: 'AI saves users from learning menus, and state machines prevent unverified operational promises. While judges see stunning chat cards, the business sells controlled airport service orchestration.',
  solutionFlow: [
    { title: 'One-sentence Request', body: '"I have a 10h layover in Singapore and want to see the city without baggage."' },
    { title: 'AI Safe Window Calc', body: 'Identify flights, arrival/departure times, customs, and security buffers to calculate available service time.' },
    { title: 'Recommend Routes', body: 'Micro-Tour: Baggage custody, lounge access, 4h city tour, transfers, and layover guarantee.' },
    { title: 'Fulfillment Tracking', body: 'Visualize RFID baggage tags, guide vehicles, return deadlines, and contingency backups.' },
  ],
  techTitle: 'Technical Talk: Explained Simply',
  techSubline: "LLMs handle 'understanding & explaining', business APIs define 'prices & bounds', and state machines ensure 'step-by-step execution'. Separate these layers: the demo stays cool, without hallucinations.",
  techStack: [
    { title: 'Stopover Gateway', body: 'Turn natural language requests into actionable plans, driving confirmation, booking, and fulfillment via cards.' },
    { title: 'State Machine', body: 'Manage orders, baggage, micro-tours, hotels, and layover protection through explainable state transitions.' },
    { title: 'Mock Hub Data', body: 'Debuting with Singapore Changi, ready to scale to Doha, Istanbul, and Dubai.' },
    { title: 'Fallback Demonstration', body: 'Automatically switches to deterministic concierge replies when LLM keys or network is unavailable.' },
  ],
  businessTitle: 'Business Value: Unlocking Revenue from Waiting Time',
  businessSubline: 'The first PoC targets high-value layover travelers willing to pay an extra ¥200-400 for peace of mind.',
  validationWindow90d: '90-Day Validation Window',
  metrics: [
    { label: 'Lounge AOV', before: 'Approx. ¥200', after: 'Target ¥450+' },
    { label: 'Package Penetration', before: 'TBD Baseline', after: '8% in 90 Days' },
    { label: 'Baggage Custody Rate', before: 'N/A', after: '30% in 90 Days' },
    { label: 'Fulfillment Target', before: 'Manual backup', after: 'Zero missed flights / pickups' },
  ],
  packages: [
    { name: 'Lite Pack', hours: '6-8h', body: 'Lounge access + Baggage storage + Fast-track security' },
    { name: 'Micro-Tour Pack', hours: '10-18h', body: 'Full baggage custody + 4h city tour + Transfers' },
    { name: 'Overnight Pack', hours: '12-36h', body: 'Hotel / Hourly room + Baggage custody + Transfers' },
  ],
  closingLabel: 'Closing',
  closingHeadline: "We aren't just selling sightseeing; we're selling layover time that never gets out of control.",
  enterLiveDemo: 'Enter Live Demo',
};

export default function PitchPage() {
  const { language } = useAppPreferences();
  const copy = language === 'zh-CN' ? zhCopy : enCopy;

  return (
    <div className="bg-slate-950 text-white">
      <section className="relative min-h-[calc(100svh-64px)] overflow-hidden px-5 pb-36 pt-10 sm:px-8 sm:py-16 lg:px-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-28"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=50&w=1200&fm=webp)',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.82)_46%,rgba(15,23,42,0.5)_100%)] lg:bg-[linear-gradient(90deg,rgba(2,6,23,0.98),rgba(15,23,42,0.76),rgba(15,23,42,0.42))]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-blue-100 backdrop-blur-xl sm:mb-8 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
              <Plane size={15} />
              {copy.hackathonDemo}
            </div>
            <h1 className="max-w-4xl font-black tracking-normal">
              <span className="block text-[2.45rem] leading-none text-white sm:inline sm:text-7xl">
                {copy.brand}
              </span>
              <span className="mt-2 block text-[2.2rem] leading-none text-white sm:mt-0 sm:inline sm:text-7xl">
                {' '}{copy.subBrand}
              </span>
              <span className="mt-4 block text-[1.85rem] leading-[1.12] text-blue-200 sm:mt-4 sm:text-6xl sm:leading-[1.04]">
                {copy.tagline}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] font-medium leading-7 text-slate-200 sm:mt-8 sm:text-xl sm:leading-9">
              {copy.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-black text-slate-100 sm:mt-8 sm:text-xs">
              {copy.tags.map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-xl">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <OpenConciergeButton
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5 sm:h-auto sm:rounded-2xl sm:py-3 cursor-pointer"
              >
                {copy.openChatDemo}
              </OpenConciergeButton>
              <Link
                href="/search"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/18 bg-white/10 px-5 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15 sm:h-auto sm:rounded-2xl sm:py-3"
              >
                {copy.viewTemplates}
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl sm:p-5">
            <div className="rounded-[1.5rem] bg-white p-4 text-slate-950 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    Demo Case
                  </div>
                  <div className="mt-2 text-xl font-black sm:text-2xl">{copy.demoCaseTitle}</div>
                </div>
                <div className="rounded-xl bg-blue-600 px-3 py-2 text-right text-white sm:rounded-2xl sm:px-4 sm:py-3">
                  <div className="text-[10px] font-bold opacity-80">{copy.recommended}</div>
                  <div className="text-lg font-black">{copy.microTour}</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
                {copy.timeline.map(({ time, label }) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3 sm:rounded-2xl sm:p-4">
                    <div className="text-lg font-black text-slate-950 sm:text-xl">{time}</div>
                    <div className="mt-1 text-xs font-bold text-slate-500">{label}</div>
                  </div>
                ))}
              </div>

              {/* 中间的跳转到 /dashborad 按钮 */}
              <Link
                href="/dashborad"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98] sm:mt-5 sm:rounded-2xl"
              >
                <span>{copy.enterDashboard}</span>
                <Route size={16} />
              </Link>

              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold leading-6 text-emerald-800 sm:mt-5 sm:rounded-2xl sm:p-4 sm:text-sm sm:leading-7">
                {copy.safetyBanner}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Painpoints, Packages, and Airports Sections with high-contrast light background */}
      <div className="bg-white text-slate-950 w-full border-t border-slate-100">
        
        {/* Target Painpoints Section */}
        <section id="problem" className="py-16 px-6 max-w-7xl mx-auto w-full text-slate-950">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-2">
            {language === 'zh-CN' 
              ? '中转旅客的“四大核心焦虑”与我们的一站式对策' 
              : 'Transit Travelers’ "Four Core Anxieties" and Our One-Stop Solutions'}
          </h2>
          <p className="text-slate-500 text-center text-sm mb-12">
            {language === 'zh-CN' 
              ? '针对 6-48 小时过境停留，重构中转全链路体验' 
              : 'Reconstructing the entire transit journey for 6-48h layovers'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {copy.painPoints.map((item, index) => {
              const Icon = [Clock3, Luggage, Compass, ShieldCheck][index];
              const colors = [
                { bg: 'bg-orange-100 text-orange-600', icon: 'text-orange-600' },
                { bg: 'bg-blue-100 text-blue-600', icon: 'text-blue-600' },
                { bg: 'bg-violet-100 text-violet-600', icon: 'text-violet-600' },
                { bg: 'bg-emerald-100 text-emerald-600', icon: 'text-emerald-600' },
              ][index];
              return (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-5 shrink-0`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed flex-1 font-medium">
                    {item.body}
                  </p>
                  <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold mt-auto">
                    🎯 {item.solution}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Package comparison */}
        <section className="py-16 px-6 border-t border-slate-100 text-slate-950">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-2">
              {language === 'zh-CN' ? '灵活定义 3 档核心中转套餐' : 'Flexibly Define 3 Layover Packages'}
            </h2>
            <p className="text-slate-500 text-center text-sm mb-12">
              {language === 'zh-CN' 
                ? '根据停留时长智能推荐，匹配高净值探索、带娃出游、纯能补给多重诉求' 
                : 'Smart recommendations by layover hours, matching diverse travel and rest needs'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => {
                const localPkg = localizePackage(pkg, language);
                return (
                  <div 
                    key={pkg.sku}
                    className="border border-slate-200/80 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col bg-white"
                  >
                    <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-semibold self-start mb-4">
                      {language === 'zh-CN' 
                        ? `中转 ${pkg.recommendedLayover.minHours}–${pkg.recommendedLayover.maxHours}h 推荐`
                        : `Transit ${pkg.recommendedLayover.minHours}–${pkg.recommendedLayover.maxHours}h Choice`}
                    </span>
                    <h3 className="font-bold text-xl text-slate-900 mb-1">{localPkg.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">{localPkg.tagline}</p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-black text-blue-600">¥{pkg.price}</span>
                      <span className="text-xs text-slate-400">/ {language === 'zh-CN' ? '起' : 'starting'}</span>
                    </div>
                    <div className="h-[1px] bg-slate-100 mb-6" />
                    <ul className="space-y-3 mb-8 flex-1 text-xs text-slate-600 font-medium">
                      {localPkg.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">✓</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                    <Link 
                      href="/search"
                      className="w-full py-3 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold rounded-xl text-center text-xs transition-all duration-200"
                    >
                      {language === 'zh-CN' ? '去定制选择' : 'Customize & Book'}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dynamic Scenarios Visual section */}
      <section className="py-16 px-6 bg-slate-50 text-slate-950 border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full text-xs font-black mb-4">
              <Compass size={12} className="animate-spin text-blue-600" />
              <span>{language === 'zh-CN' ? '流程控制与演示模拟' : 'Flow Control & Simulation'}</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-4 text-slate-900">
              {language === 'zh-CN' ? '极速演示模式 (Fast-Forward)' : 'Fast-Forward Demo Mode'}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
              {language === 'zh-CN' 
                ? '在实际中，行李在贵宾室寄存、城市游等要耗费 6-24 小时。为方便评审与验证，我们在订单管理和跟踪页嵌入了 **快速演示控制台**。' 
                : 'In reality, lounge custody and city tours take 6–24 hours. For easy review and verification, we embedded a Fast-Forward Control Panel in the tracking page.'}
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white mt-1 shrink-0">1</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {language === 'zh-CN' ? '模拟提交航班与套餐：' : 'Submit Flight & Package:'}
                  </h4>
                  <p className="text-[11px] text-slate-505 mt-0.5 font-medium">
                    {language === 'zh-CN' 
                      ? '自定中转小时数（如 12 小时），系统将生成对应的 RFID 行李电子标签和旅游行程表。' 
                      : 'Set custom layover hours to generate RFID tags and stopover itineraries.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white mt-1 shrink-0">2</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {language === 'zh-CN' ? '物理操作一键驱动：' : 'One-Click Verification:'}
                  </h4>
                  <p className="text-[11px] text-slate-505 mt-0.5 font-medium">
                    {language === 'zh-CN' 
                      ? '控制台中可一键完成“交付行李”、“行李到达贵宾厅”。无需漫长等待即可流转状态。' 
                      : 'Use the console to instantly trigger actions like bag drop-off or lounge delivery.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white mt-1 shrink-0">3</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {language === 'zh-CN' ? '模拟意外误机：' : 'Simulate Missed Connection:'}
                  </h4>
                  <p className="text-[11px] text-slate-505 mt-0.5 font-medium">
                    {language === 'zh-CN' 
                      ? '可一键模拟旅客在城市游中堵车或超时导致将要误机，触发 VIP 安检与改签紧急保障机制。' 
                      : 'Trigger traffic jams to simulate missed connections, testing rebooking and VIP security.'}
                  </p>
                </div>
              </div>
            </div>
            <Link 
              href="/search"
              className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              {language === 'zh-CN' ? '进入 Demo 演示' : 'Enter Demo Sandbox'}
            </Link>
          </div>
          
          <div className="flex-1 w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl relative overflow-hidden text-left text-slate-900">
            {/* Visual mock order */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs">🧳</span>
                <span className="text-xs font-black text-slate-800">
                  {language === 'zh-CN' ? '行李智能追踪 (RFID)' : 'Baggage Tracking (RFID)'}
                </span>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                {language === 'zh-CN' ? '转运中 (In Transit)' : 'In Transit'}
              </span>
            </div>

            {/* Timeline in black card */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              <div className="relative">
                <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-blue-600 border-4 border-slate-100" />
                <div className="text-xs font-bold text-slate-900">
                  {language === 'zh-CN' ? '收件登记' : 'Baggage Registered'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {language === 'zh-CN' ? '新加坡樟宜机场 T1 柜台已打包贴标' : 'Labeled at Changi Airport T1 counter'}
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-amber-500 border-4 border-slate-100 animate-ping" />
                <div className="text-xs font-bold text-amber-600">
                  {language === 'zh-CN' ? '转运中' : 'In Transit'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {language === 'zh-CN' ? '行李进入快速内部传送皮带，前往贵宾厅' : 'Baggage moving to lounge via conveyor belt'}
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-slate-100 border-4 border-white" />
                <div className="text-xs font-bold text-slate-400">
                  {language === 'zh-CN' ? '已送达贵宾厅' : 'Delivered to Lounge'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {language === 'zh-CN' ? '等待旅客中转后认领' : 'Waiting for traveler pickup'}
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] font-medium">
              <span className="text-slate-500 block">{language === 'zh-CN' ? '实时定位：' : 'Real-time GPS:'}</span>
              <span className="text-slate-800 font-mono block font-bold mt-0.5">T1 Lounge Depot Zone C-4</span>
            </div>
          </div>
        </div>
      </section>

        {/* Flagship Hub Airports */}
        <section className="py-16 px-6 border-t border-slate-100 text-slate-950">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-2">
              {language === 'zh-CN' ? '率先接入 4 大标志性国际中转枢纽' : 'First to Access 4 Flagship Transit Hubs'}
            </h2>
            <p className="text-slate-500 text-center text-sm mb-12">
              {language === 'zh-CN' 
                ? '精选枢纽进行灰度 PoC 试点，打通当地优质运营商' 
                : 'PoC pilots selected to connect with top local transit operators'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {airports.map((airport) => {
                const localAirport = localizeAirport(airport, language);
                return (
                  <div 
                    key={airport.code}
                    className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:translate-y-[-4px] transition-all duration-300"
                  >
                    <div 
                      className="h-32 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                      style={{ backgroundImage: `url(${airport.image})` }}
                    />
                    <div className="p-4 bg-white">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">
                        {airport.code}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-2">
                        {localAirport.nameZh}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        {language === 'zh-CN' 
                          ? (airport.code === 'SIN' ? '新加坡' : airport.code === 'DOH' ? '多哈' : airport.code === 'IST' ? '伊斯坦布尔' : '迪拜') 
                          : airport.city}
                      </p>
                      <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-full inline-block mt-3 border border-slate-200 font-bold">
                        {airport.visaFree 
                          ? (language === 'zh-CN' ? '免签/可落地签' : 'Visa-Free / VOA') 
                          : (language === 'zh-CN' ? '需办理电子签' : 'e-Visa Required')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
