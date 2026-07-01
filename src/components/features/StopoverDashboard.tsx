'use client';

import Link from 'next/link';
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Car,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  Globe2,
  Headphones,
  Home,
  Languages,
  Luggage,
  MapPinned,
  Menu,
  Moon,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  ShieldCheck,
  Star,
  SunMedium,
  TicketCheck,
  UserRound,
} from 'lucide-react';
import { useAppPreferences } from './AppPreferenceProvider';
import { STOP_OVER_PRD } from '@/lib/prdRules';
import { useOrderStore } from '@/lib/store/orderStore';

type DashboardCopy = {
  brand: string;
  subBrand: string;
  headline: string;
  subline: string;
  nav: string[];
  promise: string;
  promiseItems: Array<{ title: string; body: string }>;
  help: string;
  concierge: string;
  routeTitle: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  stopoverCode: string;
  stopoverCity: string;
  stopoverDuration: string;
  arrives: string;
  departs: string;
  terminal: string;
  layover: string;
  today: string;
  arrivalTime: string;
  departureTime: string;
  terminalValue: string;
  layoverValue: string;
  recommendedTitle: string;
  recommendedBody: string;
  bestValue: string;
  packageName: string;
  packageBadge: string;
  packagePrice: string;
  lounge: string;
  loungeBody: string;
  cityRoute: string;
  cityRouteBody: string;
  baggage: string;
  baggageBody: string;
  tags: string[];
  priceUnit: string;
  viewOrder: string;
  viewPackages: string;
  baggageJourney: string;
  viewDetails: string;
  timeline: Array<{ time: string; title: string; body: string; status: string }>;
  routeAssurance: string;
  viewItinerary: string;
  milestones: Array<{ time: string; title: string; body: string }>;
  guarantee: string;
  guaranteeBody: string;
  buffer: string;
  bufferValue: string;
  backBy: string;
  backByValue: string;
  protection: string;
  protectionBody: string;
  protectionItems: string[];
  included: string;
  stats: Array<{ value: string; label: string }>;
  askBeforeBook: string;
  chatExperts: string;
  profileName: string;
  languageToggle: string;
  light: string;
  dark: string;
  textScale: string;
  mobileMenu: string;
};

const zhCopy: DashboardCopy = {
  brand: '龙腾',
  subBrand: '中转礼遇',
  headline: '6 至 48 小时中转，全程安心托付',
  subline: '贵宾厅信任锚 · 行李安全 · 时间有保障',
  nav: ['仪表盘', '预订中转', '我的行程', '我的订单'],
  promise: 'DragonPass 承诺',
  promiseItems: [
    { title: '贵宾厅可信', body: '全球网络，核验服务' },
    { title: '行李安全', body: 'RFID 托管，端到端' },
    { title: '时间保障', body: '固定路线，准时返场' },
    { title: '误机保护', body: '异常兜底与协助改签' },
  ],
  help: '需要帮助？',
  concierge: '24/7 中转礼遇助手',
  routeTitle: '中转概览',
  fromCode: 'PVG',
  fromCity: '上海',
  toCode: 'LHR',
  toCity: '伦敦',
  stopoverCode: 'SIN',
  stopoverCity: '新加坡樟宜',
  stopoverDuration: '中转停留',
  arrivalTime: '08:30',
  departureTime: '18:30',
  terminalValue: 'T1',
  layoverValue: '10h',
  arrives: '抵达',
  departs: '离境',
  terminal: '航站楼',
  layover: '停留',
  today: '今天',
  recommendedTitle: '为你推荐',
  recommendedBody: '基于行李托管、返场缓冲和城市体验综合推荐。',
  bestValue: '最佳价值',
  packageName: '新加坡樟宜经典微游包',
  packageBadge: '10h PRD 样例',
  packagePrice: '¥780',
  lounge: '贵宾厅',
  loungeBody: '2h 休息室信任锚',
  cityRoute: '城市路线',
  cityRouteBody: '滨海湾 / 鱼尾狮 / 牛车水',
  baggage: '行李',
  baggageBody: 'RFID 托管',
  tags: ['10 小时白天中转', '固定 4h 路线', '起飞前 90min 行李返场', '60min 安检口阈值'],
  priceUnit: '/ 人',
  viewOrder: '查看详情并下单',
  viewPackages: '查看全部套餐',
  baggageJourney: '你的行李旅程',
  viewDetails: '查看详情',
  timeline: [
    { time: '08:50', title: '已在 SIN T1 接收', body: 'RFID 标签：DP 8847 3092 18', status: '已完成' },
    { time: '09:10', title: '贵宾厅托管中', body: '樟宜 T1 环亚贵宾厅行李区', status: '进行中' },
    { time: '17:00', title: '准备返还', body: '起飞前 90 分钟送往交接点', status: '' },
    { time: '17:30', title: '安检口阈值', body: '起飞前 60 分钟必须到达', status: '' },
  ],
  routeAssurance: '城市路线与时间保障',
  viewItinerary: '查看行程',
  milestones: [
    { time: '09:20', title: '向导接驳', body: '固定车辆' },
    { time: '10:00', title: '滨海湾花园', body: '地标拍照' },
    { time: '11:10', title: '鱼尾狮公园', body: '经典动线' },
    { time: '12:00', title: '牛车水餐食', body: '本地午餐' },
    { time: '13:00', title: '回到机场', body: '贵宾厅补能' },
  ],
  guarantee: '准时保障',
  guaranteeBody: '返场时间按后续航班倒推，并持续监控交通、天气和运营异常。',
  buffer: '缓冲',
  bufferValue: '90min',
  backBy: '返场',
  backByValue: '17:30',
  protection: '误机保护',
  protectionBody: '安心享受中转。若服务链路导致误机，我们负责兜底。',
  protectionItems: ['改签下一可用航班', '必要时安排酒店住宿', '餐食与本地交通补贴', '客服 5 分钟内介入'],
  included: '已包含在套餐中',
  stats: [
    { value: '8%', label: '90 天套餐渗透率目标' },
    { value: '¥450+', label: '单中转客单目标' },
    { value: '30%', label: '行李托管转化目标' },
    { value: '3-5', label: 'MVP PoC 枢纽' },
  ],
  askBeforeBook: '预订前还有问题？',
  chatExperts: '咨询中转专家',
  profileName: 'AILab',
  languageToggle: '中文 | EN',
  light: '亮色',
  dark: '暗色',
  textScale: '字号',
  mobileMenu: '菜单',
};

const enCopy: DashboardCopy = {
  brand: 'DRAGONPASS',
  subBrand: 'STOPOVER',
  headline: '6–48 Hour Layover, Handled.',
  subline: 'Lounge trust. Baggage safe. Time well spent.',
  nav: ['Dashboard', 'Book Stopover', 'My Trips', 'My Orders'],
  promise: 'DragonPass Promise',
  promiseItems: [
    { title: 'Lounge Trust', body: 'Global network, verified' },
    { title: 'Baggage Safe', body: 'RFID custody, end-to-end' },
    { title: 'Time Assured', body: 'Fixed routes, on-time back' },
    { title: "You're Protected", body: 'Missed-flight protection' },
  ],
  help: 'Need help?',
  concierge: '24/7 Concierge',
  routeTitle: 'Stopover overview',
  fromCode: 'PVG',
  fromCity: 'Shanghai',
  toCode: 'LHR',
  toCity: 'London',
  stopoverCode: 'SIN',
  stopoverCity: 'Singapore Changi',
  stopoverDuration: 'Stopover Duration',
  arrivalTime: '08:30',
  departureTime: '18:30',
  terminalValue: 'T1',
  layoverValue: '10h',
  arrives: 'Arrives',
  departs: 'Departs',
  terminal: 'Terminal',
  layover: 'Layover',
  today: 'Today',
  recommendedTitle: 'Recommended for You',
  recommendedBody: 'Curated stopover package with baggage custody and time assurance.',
  bestValue: 'Best Value',
  packageName: 'Singapore Classic Micro-Tour',
  packageBadge: '10h PRD case',
  packagePrice: '¥780',
  lounge: 'Lounge',
  loungeBody: '2h lounge anchor',
  cityRoute: 'City Route',
  cityRouteBody: 'Gardens / Merlion / Chinatown',
  baggage: 'Baggage',
  baggageBody: 'RFID Custody',
  tags: ['10h daytime layover', 'Fixed 4h route', '90min baggage return', '60min security threshold'],
  priceUnit: '/p',
  viewOrder: 'View Details & Order',
  viewPackages: 'View all packages',
  baggageJourney: 'Your Baggage Journey',
  viewDetails: 'View details',
  timeline: [
    { time: '08:50', title: 'Received at SIN T1', body: 'RFID Tag: DP 8847 3092 18', status: 'Completed' },
    { time: '09:10', title: 'Stored at lounge', body: 'Changi T1 Plaza Premium baggage area', status: 'In Progress' },
    { time: '17:00', title: 'Ready for return', body: '90 minutes before departure', status: '' },
    { time: '17:30', title: 'Security threshold', body: 'Must reach security 60 minutes before departure', status: '' },
  ],
  routeAssurance: 'Your City Route & Time Assurance',
  viewItinerary: 'View itinerary',
  milestones: [
    { time: '09:20', title: 'Guide pickup', body: 'Fixed vehicle' },
    { time: '10:00', title: 'Gardens by the Bay', body: 'Landmark stop' },
    { time: '11:10', title: 'Merlion Park', body: 'Classic route' },
    { time: '12:00', title: 'Chinatown meal', body: 'Local lunch' },
    { time: '13:00', title: 'Back to airport', body: 'Lounge recovery' },
  ],
  guarantee: 'On-Time Guarantee',
  guaranteeBody: 'Traffic, weather, and operations are monitored in real time. If delays occur, we adjust and protect your return.',
  buffer: 'Buffer',
  bufferValue: '90min',
  backBy: 'Back by',
  backByValue: '17:30',
  protection: 'Missed-Flight Protection',
  protectionBody: "Relax and enjoy your stopover. We've got your back.",
  protectionItems: [
    'Rebooking on next available flight',
    'Hotel accommodation if needed',
    'Meal & local transport allowance',
    'Concierge intervention within 5 minutes',
  ],
  included: 'Included in this package',
  stats: [
    { value: '8%', label: '90-day package penetration target' },
    { value: '¥450+', label: 'ARPL target' },
    { value: '30%', label: 'Baggage custody conversion target' },
    { value: '3-5', label: 'MVP PoC hubs' },
  ],
  askBeforeBook: 'Questions before you book?',
  chatExperts: 'Chat with our Stopover Experts',
  profileName: 'AILab',
  languageToggle: '中文 | EN',
  light: 'Light',
  dark: 'Dark',
  textScale: 'Aa',
  mobileMenu: 'Menu',
};

const navLinks = ['/dashboard', '/packages', '/journey', '/order'];
const navIcons = [Home, Plane, BriefcaseBusiness, FileText];
const statIcons = [Star, Globe2, Building2, Clock3];

const loungeImage =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=50&w=300&fm=webp';

export default function StopoverDashboard() {
  const { language, theme, textScale, toggleLanguage, toggleTheme, cycleTextScale } = useAppPreferences();
  const copy = language === 'zh-CN' ? zhCopy : enCopy;
  const isDark = theme === 'dark';
  const scaleLabel = textScale === 'large' ? 'Large' : textScale === 'compact' ? 'Small' : 'Regular';

  return (
    <div className={isDark ? 'min-h-screen bg-[#050d1b] text-white' : 'min-h-screen bg-[#061a34] text-white'}>
      <div className="mx-auto flex min-h-screen max-w-[1620px] flex-col p-3 sm:p-4">
        <div className="flex min-h-[calc(100vh-24px)] flex-1 flex-col overflow-hidden rounded-lg border border-white/15 bg-[#06152c] shadow-2xl shadow-black/35">
          <header className="border-b border-white/12 bg-[#071a36] px-4 py-3 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/" className="flex min-w-0 items-center gap-4">
                <div className="leading-none">
                  <div className="text-base font-black tracking-normal text-white md:text-lg">{copy.brand}</div>
                  <div className="text-base font-semibold tracking-[0.08em] text-white md:text-lg">{copy.subBrand}</div>
                </div>
                <div className="hidden h-9 w-px bg-white/18 sm:block" />
                <div className="hidden min-w-0 sm:block">
                  <div className="truncate text-sm font-semibold text-white md:text-base">{copy.headline}</div>
                  <div className="truncate text-xs font-medium text-slate-300">{copy.subline}</div>
                </div>
              </Link>

              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/18 bg-white/6 px-3 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
                  aria-label={language === 'zh-CN' ? 'Switch to English' : '切换到中文'}
                >
                  <Languages size={16} />
                  <span className="hidden sm:inline">{copy.languageToggle}</span>
                  <span className="sm:hidden">{language === 'zh-CN' ? '中' : 'EN'}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/18 bg-white/6 px-3 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
                  aria-label={isDark ? copy.light : copy.dark}
                >
                  {isDark ? <SunMedium size={16} /> : <Moon size={16} />}
                  <span className="hidden md:inline">{isDark ? copy.dark : copy.light}</span>
                </button>
                <button
                  type="button"
                  onClick={cycleTextScale}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/18 bg-white/6 px-3 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
                  aria-label={copy.textScale}
                >
                  <span className="font-black">{copy.textScale}</span>
                  <span className="hidden sm:inline">{scaleLabel}</span>
                </button>
                {/* Profile display removed */}
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/18 bg-white/6 text-white lg:hidden"
                  aria-label={copy.mobileMenu}
                >
                  <Menu size={19} />
                </button>
              </div>
            </div>
          </header>

          <div className="grid flex-1 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_330px]">
            <Sidebar copy={copy} />

            <main className={isDark ? 'min-w-0 bg-[#0d1727] text-[#f7fbff]' : 'min-w-0 bg-[#f8fafc] text-[#071632]'}>
              <div className="space-y-4 p-4 md:p-6">
                <RouteSummary copy={copy} isDark={isDark} />

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_minmax(340px,0.78fr)]">
                  <section className="space-y-4">
                    <RecommendationCard copy={copy} isDark={isDark} />
                    <CityRouteCard copy={copy} isDark={isDark} />
                  </section>
                  <section className="space-y-4">
                    <BaggageJourney copy={copy} isDark={isDark} />
                    <ProtectionCard copy={copy} isDark={isDark} />
                  </section>
                </div>
              </div>
            </main>

            <PhonePreview copy={copy} />
          </div>

          <StatsBar copy={copy} />
        </div>
      </div>
    </div>
  );
}

function Sidebar({ copy }: { copy: DashboardCopy }) {
  const { currentOrder } = useOrderStore();
  const currentOrderId = currentOrder?.orderId || 'case-10h';

  const dynamicNavLinks = [
    '/dashborad',
    '/packages?id=case-10h',
    `/journey?id=${currentOrderId}`,
    `/order?id=${currentOrderId}`
  ];

  return (
    <aside className="hidden min-h-0 flex-col justify-between border-r border-white/12 bg-[#06152c] px-4 py-5 lg:flex">
      <nav className="space-y-2">
        {copy.nav.map((label, index) => {
          const Icon = navIcons[index];
          const active = index === 0;
          return (
            <Link
              key={label}
              href={dynamicNavLinks[index]}
              className={`flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                active
                  ? 'border-l-4 border-[#ff7a00] bg-white/10 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={1.9} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4">
        <div className="rounded-lg border border-white/12 bg-white/5 p-4">
          <h2 className="mb-4 text-sm font-semibold text-white">{copy.promise}</h2>
          <div className="space-y-4">
            {copy.promiseItems.map((item, index) => {
              const Icon = [Clock3, Luggage, ShieldCheck, TicketCheck][index];
              return (
                <div key={item.title} className="flex gap-3">
                  <Icon className="mt-0.5 shrink-0 text-white" size={18} strokeWidth={1.8} />
                  <div>
                    <div className="text-xs font-semibold text-white">{item.title}</div>
                    <div className="mt-0.5 text-[11px] leading-snug text-slate-400">{item.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center justify-between rounded-lg border border-white/12 bg-[#071b38] px-4 py-3 text-white transition hover:bg-white/8"
        >
          <div className="flex items-center gap-3">
            <Headphones className="text-[#ff7a00]" size={24} />
            <div>
              <div className="text-xs text-slate-300">{copy.help}</div>
              <div className="text-xs font-black text-[#ff7a00]">{copy.concierge}</div>
            </div>
          </div>
          <ChevronRight size={18} />
        </Link>
      </div>
    </aside>
  );
}

function RouteSummary({ copy, isDark }: { copy: DashboardCopy; isDark: boolean }) {
  return (
    <section
      className={`grid gap-4 rounded-lg border p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_420px] ${
        isDark ? 'border-white/10 bg-[#101d31]' : 'border-slate-200 bg-white'
      }`}
      aria-label={copy.routeTitle}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <AirportLabel code={copy.fromCode} city={copy.fromCity} />
        <div className="flex min-w-0 flex-1 items-center gap-2 px-0 sm:gap-3 sm:px-4">
          <Plane className={isDark ? 'text-[#89b4ff]' : 'text-[#0b2d62]'} size={24} />
          <div className="relative h-px flex-1 border-t border-dashed border-[#8da0bd]">
            <span
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] whitespace-nowrap rounded-full border px-3 py-1 text-center text-xs font-black shadow-sm ${
                isDark ? 'border-white/10 bg-[#101d31] text-[#ffb366]' : 'border-slate-200 bg-white text-[#ff6b00]'
              }`}
            >
              <span className="text-sm font-black sm:text-base">
                {copy.stopoverCode} · {copy.layoverValue}
              </span>
            </span>
          </div>
        </div>
        <AirportLabel code={copy.toCode} city={copy.toCity} alignRight />
      </div>

      <div className={`grid grid-cols-2 rounded-lg border sm:grid-cols-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
        <FlightStat icon={PlaneLanding} label={copy.arrives} value={copy.arrivalTime} note={copy.today} />
        <FlightStat icon={PlaneTakeoff} label={copy.departs} value={copy.departureTime} note={copy.today} />
        <FlightStat icon={Building2} label={copy.terminal} value={copy.terminalValue} note={copy.stopoverCity} />
        <FlightStat icon={Clock3} label={copy.layover} value={copy.layoverValue} note={copy.stopoverCode} />
      </div>
    </section>
  );
}

function AirportLabel({ code, city, alignRight = false }: { code: string; city: string; alignRight?: boolean }) {
  return (
    <div className={alignRight ? 'text-left sm:text-right' : 'text-left'}>
      <div className="text-3xl font-black tracking-normal md:text-4xl">{code}</div>
      <div className="mt-1 text-sm font-medium opacity-80">{city}</div>
    </div>
  );
}

function FlightStat({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Plane;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="min-w-0 border-slate-200/70 px-3 py-3 text-center [&:not(:last-child)]:border-r">
      <Icon className="mx-auto mb-2 text-[#2f74df]" size={18} />
      <div className="text-xs font-semibold opacity-75">{label}</div>
      <div className="mt-1 text-base font-black">{value}</div>
      {note ? <div className="text-[10px] font-medium opacity-65">{note}</div> : null}
    </div>
  );
}

function RecommendationCard({ copy, isDark }: { copy: DashboardCopy; isDark: boolean }) {
  return (
    <section className={`rounded-lg border p-4 shadow-sm ${isDark ? 'border-white/10 bg-[#101d31]' : 'border-slate-200 bg-white'}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{copy.recommendedTitle}</h2>
          <p className="mt-1 text-sm font-medium opacity-70">{copy.recommendedBody}</p>
        </div>
      </div>

      <div className={`grid overflow-hidden rounded-lg border md:grid-cols-[190px_minmax(0,1fr)] ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
        <div
          className="relative min-h-[190px] bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(6, 21, 44, 0.08), rgba(6, 21, 44, 0.28)), url(${loungeImage})`,
          }}
        >
          <span className="absolute left-3 top-3 rounded bg-[#ff6b00] px-2 py-1 text-xs font-black text-white">
            {copy.bestValue}
          </span>
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-4 p-4">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className={`text-xl font-black leading-tight ${isDark ? 'text-white' : 'text-[#071632]'}`}>{copy.packageName}</h3>
              <span className={`rounded-lg px-3 py-1 text-xs font-black ${isDark ? 'bg-white/10 text-slate-100' : 'bg-[#eaf1fb] text-[#0f3e86]'}`}>{copy.packageBadge}</span>
            </div>
            <div className="mt-5 grid gap-3 text-sm 2xl:grid-cols-3">
              <Feature icon={Headphones} title={copy.lounge} body={copy.loungeBody} />
              <Feature icon={MapPinned} title={copy.cityRoute} body={copy.cityRouteBody} />
              <Feature icon={Luggage} title={copy.baggage} body={copy.baggageBody} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {copy.tags.map((tag) => (
                <span key={tag} className={`rounded px-2 py-1 text-[11px] font-semibold ${isDark ? 'bg-white/8 text-slate-200' : 'bg-[#edf3fb] text-[#23405f]'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div>
              <div className="text-2xl font-black">{copy.packagePrice}</div>
              <div className="text-xs font-medium opacity-65">{copy.priceUnit}</div>
            </div>
            <Link
              href="/packages?id=case-10h"
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded bg-[#f97316] px-4 text-xs font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-[#ea580c] active:scale-[0.98] sm:text-sm 2xl:w-auto 2xl:min-w-[156px]"
            >
              <span>{copy.viewOrder}</span>
              <ChevronRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      <Link href="/packages?id=case-10h" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0b5fff]">
        <span>{copy.viewPackages}</span>
        <ChevronRight size={16} />
      </Link>
    </section>
  );
}

function Feature({ icon: Icon, title, body }: { icon: typeof Plane; title: string; body: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 font-black">
      <Icon className="text-[#2f74df]" size={16} />
        <span>{title}</span>
      </div>
      <div className="mt-1 text-xs font-medium opacity-65">{body}</div>
    </div>
  );
}

function BaggageJourney({ copy, isDark }: { copy: DashboardCopy; isDark: boolean }) {
  return (
    <section className={`rounded-lg border p-4 shadow-sm ${isDark ? 'border-white/10 bg-[#101d31]' : 'border-slate-200 bg-white'}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">{copy.baggageJourney}</h2>
        <Link href="/journey" className="text-xs font-semibold text-[#0b5fff]">
          {copy.viewDetails}
        </Link>
      </div>
      <div className="space-y-1">
        {copy.timeline.map((item, index) => {
          const isActive = index === 1;
          const isDone = index === 0;
          return (
            <div key={`${item.time}-${item.title}`} className="grid grid-cols-[26px_56px_minmax(0,1fr)_auto] gap-3">
              <div className="relative flex justify-center">
                <div
                  className={`z-10 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isActive
                        ? 'border-[#ff6b00] bg-[#ff6b00] text-white'
                        : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {isDone ? <Check size={14} strokeWidth={3} /> : <Luggage size={13} />}
                </div>
                {index < copy.timeline.length - 1 ? <div className="absolute bottom-0 top-7 w-px bg-slate-200" /> : null}
              </div>
              <div className={`text-sm font-semibold ${isActive ? 'text-[#ff6b00]' : ''}`}>{item.time}</div>
              <div className="min-w-0 pb-5">
                <div className={`text-sm font-black ${isActive ? 'text-[#ff6b00]' : ''}`}>{item.title}</div>
                <div className="mt-1 text-xs font-medium opacity-65">{item.body}</div>
              </div>
              {item.status ? (
                <span className={`h-fit rounded px-2 py-1 text-[10px] font-semibold ${isActive ? 'bg-orange-100 text-[#c45100]' : 'bg-emerald-100 text-emerald-700'}`}>
                  {item.status}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className={`mt-2 flex gap-3 rounded-lg border p-3 ${isDark ? 'border-[#315fba]/50 bg-[#0d2757]' : 'border-[#b9cff8] bg-[#eef5ff]'}`}>
        <ShieldCheck className="mt-0.5 shrink-0 text-[#0b5fff]" size={24} />
        <p className={`text-sm font-semibold leading-relaxed ${isDark ? 'text-[#cfe0ff]' : 'text-[#0f3e86]'}`}>
          {languageAwareAssurance(copy)}
        </p>
      </div>
    </section>
  );
}

function languageAwareAssurance(copy: DashboardCopy) {
  return copy === zhCopy
    ? `我们会在起飞前 ${STOP_OVER_PRD.baggageReturnBufferMin} 分钟启动行李返场，并确保你在起飞前 ${STOP_OVER_PRD.securityGateDeadlineMin} 分钟抵达安检口。`
    : `Baggage return starts ${STOP_OVER_PRD.baggageReturnBufferMin} minutes before departure, with a ${STOP_OVER_PRD.securityGateDeadlineMin}-minute security threshold.`;
}

function CityRouteCard({ copy, isDark }: { copy: DashboardCopy; isDark: boolean }) {
  return (
    <section className={`rounded-lg border p-4 shadow-sm ${isDark ? 'border-white/10 bg-[#101d31]' : 'border-slate-200 bg-white'}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 className="text-lg font-black">{copy.routeAssurance}</h2>
        <Link href="/journey" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b5fff]">
          <span>{copy.viewItinerary}</span>
          <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="flex items-center justify-between gap-2 sm:col-span-5">
          <RouteNode icon={Car} label={copy === zhCopy ? '机场出发' : 'Depart airport'} />
          {copy.milestones.map((item) => (
            <RouteNode key={item.time} icon={item.title.includes('Airport') || item.title.includes('机场') ? Plane : Building2} label={item.title} time={item.time} note={item.body} />
          ))}
        </div>
      </div>
      <div className={`mt-5 grid gap-4 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#2f74df]" size={24} />
          <div>
            <div className="text-sm font-black">{copy.guarantee}</div>
            <div className="mt-1 text-xs font-medium leading-relaxed opacity-65">{copy.guaranteeBody}</div>
          </div>
        </div>
        <Metric label={copy.buffer} value={copy.bufferValue} />
        <Metric label={copy.backBy} value={copy.backByValue} />
      </div>
    </section>
  );
}

function RouteNode({
  icon: Icon,
  label,
  time,
  note,
}: {
  icon: typeof Plane;
  label: string;
  time?: string;
  note?: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      <div className="mb-2 flex w-full items-center">
        <div className="h-px flex-1 bg-slate-300" />
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b8c7dc] bg-[#ffffff] text-[#0f3e86] shadow-sm">
          <Icon size={18} />
        </div>
        <div className="h-px flex-1 bg-slate-300" />
      </div>
      {time ? <div className="text-sm font-black">{time}</div> : null}
      <div className="mt-1 max-w-[92px] text-[11px] font-semibold leading-tight">{label}</div>
      {note ? <div className="mt-0.5 text-[10px] font-medium opacity-60">{note}</div> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[92px] border-l border-slate-200 pl-4">
      <div className="text-[11px] font-semibold opacity-60">{label}</div>
      <div className="mt-1 text-base font-black">{value}</div>
    </div>
  );
}

function ProtectionCard({ copy, isDark }: { copy: DashboardCopy; isDark: boolean }) {
  return (
    <section className={`rounded-lg border p-4 shadow-sm ${isDark ? 'border-white/10 bg-[#101d31]' : 'border-slate-200 bg-white'}`}>
      <h2 className="text-lg font-black">{copy.protection}</h2>
      <p className="mt-1 text-sm font-medium opacity-70">{copy.protectionBody}</p>
      <div className="mt-5 space-y-3">
        {copy.protectionItems.map((item) => (
          <div key={item} className="flex gap-3 text-sm font-medium">
            <Check className="mt-0.5 shrink-0 text-emerald-600" size={16} strokeWidth={3} />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className={`mt-5 flex items-center gap-3 rounded-lg border p-3 ${isDark ? 'border-[#315fba]/50 bg-[#0d2757]' : 'border-[#b9cff8] bg-[#eef5ff]'}`}>
        <ShieldCheck className="shrink-0 text-[#0b5fff]" size={24} />
        <span className={`text-sm font-black ${isDark ? 'text-[#cfe0ff]' : 'text-[#0f3e86]'}`}>{copy.included}</span>
      </div>
    </section>
  );
}

function PhonePreview({ copy }: { copy: DashboardCopy }) {
  return (
    <aside className="relative hidden overflow-hidden border-l border-white/12 bg-[#071a36] xl:block">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]" />
      <div className="relative mx-auto mt-8 w-[286px] rounded-[36px] border-[8px] border-[#24334b] bg-[#06152c] p-3 shadow-2xl shadow-black/45">
        <div className="mx-auto mb-3 h-5 w-24 rounded-b-2xl bg-[#071a36]" />
        <div className="overflow-hidden rounded-[24px] bg-[#ffffff] text-[#071632]">
          <div className="bg-[#06152c] px-4 pb-5 pt-8 text-white">
            <div className="mb-5 flex items-center justify-between">
              <div className="leading-none">
                <div className="text-sm font-black">{copy.brand}</div>
                <div className="text-sm tracking-[0.08em]">{copy.subBrand}</div>
              </div>
              <Menu size={18} />
            </div>
            <div className="rounded-lg bg-[#ffffff] p-4 text-[#071632]">
              <div className="flex items-center justify-between">
                <AirportLabel code={copy.fromCode} city={copy.fromCity} />
                <Plane className="text-[#0f3e86]" size={20} />
                <AirportLabel code={copy.toCode} city={copy.toCity} alignRight />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-200 pt-3 text-center">
                <TinyStat label={copy.arrives} value={copy.arrivalTime} />
                <TinyStat label={copy.departs} value={copy.departureTime} />
                <TinyStat label={copy.terminal} value={copy.terminalValue} />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-3">
            <div className="rounded-lg border border-[#d7e1ec] bg-[#ffffff] p-3">
              <div className="mb-2 text-xs font-black">{copy.recommendedTitle}</div>
              <div className="grid grid-cols-[86px_minmax(0,1fr)] gap-3">
                <div
                  className="h-96 max-h-28 rounded bg-cover bg-center"
                  style={{ backgroundImage: `url(${loungeImage})` }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-black leading-tight">{copy.packageName}</div>
                  <div className="mt-2 text-base font-black">{copy.packagePrice}</div>
                  <Link href="/packages?id=case-10h" className="mt-3 flex h-9 items-center justify-center rounded bg-[#f97316] text-xs font-black text-white">
                    {copy.viewOrder.replace(' & ', ' &\u00a0')}
                  </Link>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[#d7e1ec] bg-[#ffffff] p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-black">{copy.baggageJourney}</div>
                <Bell size={14} className="text-[#0b5fff]" />
              </div>
              {copy.timeline.slice(0, 4).map((item, index) => (
                <div key={item.time} className="flex items-center gap-2 py-1 text-[11px]">
                  <span className={index === 1 ? 'font-black text-[#ff6b00]' : 'font-semibold text-[#52627a]'}>{item.time}</span>
                  <span className="truncate">{item.title}</span>
                </div>
              ))}
            </div>
            <Link href="/packages?id=case-10h" className="flex h-11 items-center justify-center rounded bg-[#f97316] text-sm font-black text-white">
              {copy.viewOrder}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TinyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[10px] font-semibold text-[#52627a]">{label}</div>
      <div className="text-sm font-black">{value}</div>
    </div>
  );
}

function StatsBar({ copy }: { copy: DashboardCopy }) {
  return (
    <footer className="border-t border-white/12 bg-[#06152c] px-4 py-4 md:px-6">
      <div className="grid gap-4 md:grid-cols-[repeat(4,minmax(0,1fr))_minmax(260px,1.2fr)]">
        {copy.stats.map((stat, index) => {
          const Icon = statIcons[index];
          return (
            <div key={stat.label} className="flex items-center gap-3 text-white">
              <Icon className="shrink-0 text-slate-200" size={28} strokeWidth={1.8} />
              <div>
                <div className="text-xl font-black">{stat.value}</div>
                <div className="text-xs font-medium text-slate-300">{stat.label}</div>
              </div>
            </div>
          );
        })}
        <Link
          href="/"
          className="flex items-center justify-between rounded-lg border border-white/16 bg-white/5 px-4 py-3 text-white transition hover:bg-white/9"
        >
          <div className="flex items-center gap-3">
            <Headphones size={26} />
            <div>
              <div className="text-xs font-medium text-slate-300">{copy.askBeforeBook}</div>
              <div className="text-sm font-black text-[#ff7a00]">{copy.chatExperts}</div>
            </div>
          </div>
          <ChevronRight className="text-[#ff7a00]" size={18} />
        </Link>
      </div>
    </footer>
  );
}
