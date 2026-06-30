'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  BriefcaseBusiness,
  CalendarClock,
  Car,
  Check,
  CircleDollarSign,
  Clock3,
  Compass,
  CreditCard,
  HelpCircle,
  Luggage,
  Map,
  MessageCircle,
  Plane,
  QrCode,
  Route,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShowerHead,
  Sparkles,
  TicketCheck,
  UserRound,
  Utensils,
  Wifi,
} from 'lucide-react';
import {
  buildConciergePlan,
  buildDeterministicReply,
  type ConciergeMessage,
  type ConciergePlan,
  type ConciergeProfile,
} from '@/lib/conciergeEngine';
import { conciergePersonas, type ConciergePersonaTemplate } from '@/lib/conciergePersonas';
import { addons, airports, packages } from '@/lib/mockData';
import type { AddonSku, PackageSku } from '@/lib/types';
import { useOrderStore } from '@/lib/store/orderStore';

type ChatItem = ConciergeMessage & {
  id: string;
  source?: string;
};

const initialPersona = conciergePersonas[0];
const initialResolved = buildConciergePlan(
  initialPersona.scenarioPrompt,
  initialPersona.profile,
  initialPersona.defaultAddons,
);

const iconMap = {
  esim: Wifi,
  transfer: Car,
  'hotel-dayuse': BedDouble,
  shower: ShowerHead,
  'meal-voucher': Utensils,
  'private-car': Compass,
} satisfies Record<AddonSku, React.ComponentType<{ size?: number; className?: string }>>;

const packageTone: Record<PackageSku, { label: string; className: string }> = {
  light: { label: '机场内补能', className: 'bg-sky-50 text-sky-700 border-sky-100' },
  micro: { label: '城市微游', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  overnight: { label: '跨夜休息', className: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ConciergeDemo() {
  const router = useRouter();
  const {
    setSearchParams,
    clearCustomizations,
    selectPackage,
    toggleAddon,
    createOrder,
    currentOrder,
  } = useOrderStore();
  const [activePersonaId, setActivePersonaId] = useState(initialPersona.id);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '我是 Stopover 中转礼宾。你可以直接说航班、中转时长、行李和想做什么，也可以点左侧角色模板开始演示。',
      source: 'system',
    },
  ]);
  const [profile, setProfile] = useState<ConciergeProfile>(initialResolved.profile);
  const [plan, setPlan] = useState<ConciergePlan>(initialResolved.plan);
  const [selectedAddons, setSelectedAddons] = useState<AddonSku[]>(initialResolved.plan.recommendedAddons);
  const [inputValue, setInputValue] = useState(initialPersona.scenarioPrompt);
  const [isAsking, setIsAsking] = useState(false);
  const [lastSource, setLastSource] = useState('ready');

  const activePersona = useMemo(
    () => conciergePersonas.find((item) => item.id === activePersonaId) ?? initialPersona,
    [activePersonaId],
  );
  const activePackage = packages.find((item) => item.sku === plan.packageSku) ?? packages[0];
  const airport = airports.find((item) => item.code === plan.airportCode) ?? airports[0];
  const validSelectedAddons = selectedAddons.filter((sku) => activePackage.addons.includes(sku));
  const totalPrice = validSelectedAddons.reduce((sum, sku) => {
    return sum + (addons.find((item) => item.sku === sku)?.price ?? 0);
  }, activePackage.price);

  const askConcierge = async (message: string, nextProfile = profile, nextAddons = selectedAddons) => {
    const trimmed = message.trim();
    if (!trimmed || isAsking) return;

    const userMessage: ChatItem = {
      id: makeId('user'),
      role: 'user',
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setIsAsking(true);

    try {
      const response = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.map(({ role, content }) => ({ role, content })),
          profile: nextProfile,
          selectedAddons: nextAddons,
        }),
      });

      if (!response.ok) {
        throw new Error(`concierge api ${response.status}`);
      }

      const data = await response.json();
      const nextPlan = data.plan as ConciergePlan | undefined;
      const nextResolvedProfile = data.profile as ConciergeProfile | undefined;
      const reply =
        typeof data.reply === 'string' && data.reply.trim()
          ? data.reply.trim()
          : nextPlan
            ? buildDeterministicReply(nextPlan)
            : '我会先按中转时长、行李和返场缓冲帮你核算方案。';

      if (nextPlan) {
        setPlan(nextPlan);
      }
      if (nextResolvedProfile) {
        setProfile(nextResolvedProfile);
      }
      if (Array.isArray(nextPlan?.recommendedAddons) && nextAddons.length === 0) {
        setSelectedAddons(nextPlan.recommendedAddons);
      }
      setLastSource(typeof data.source === 'string' ? data.source : 'dashscope');
      setMessages((current) => [
        ...current,
        {
          id: makeId('assistant'),
          role: 'assistant',
          content: reply,
          source: typeof data.source === 'string' ? data.source : 'dashscope',
        },
      ]);
    } catch (error) {
      console.warn('Concierge API fallback', error);
      const local = buildConciergePlan(trimmed, nextProfile, nextAddons);
      setProfile(local.profile);
      setPlan(local.plan);
      setLastSource('fallback:client');
      setMessages((current) => [
        ...current,
        {
          id: makeId('assistant'),
          role: 'assistant',
          content: buildDeterministicReply(local.plan),
          source: 'fallback:client',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const selectPersonaTemplate = (persona: ConciergePersonaTemplate) => {
    const resolved = buildConciergePlan(persona.scenarioPrompt, persona.profile, persona.defaultAddons);
    setActivePersonaId(persona.id);
    setProfile(resolved.profile);
    setPlan(resolved.plan);
    setSelectedAddons(resolved.plan.recommendedAddons);
    setInputValue('');
    setMessages([
      {
        id: makeId('persona-user'),
        role: 'user',
        content: persona.scenarioPrompt,
      },
      {
        id: makeId('persona-assistant'),
        role: 'assistant',
        content: buildDeterministicReply(resolved.plan),
        source: 'template',
      },
    ]);
    setLastSource('template');
  };

  const toggleLocalAddon = (sku: AddonSku) => {
    setSelectedAddons((current) =>
      current.includes(sku) ? current.filter((item) => item !== sku) : [...current, sku],
    );
  };

  const createConciergeOrder = () => {
    clearCustomizations();
    setSearchParams({
      airportCode: profile.airportCode,
      arrivalFlightNo: profile.arrivalFlightNo,
      departureFlightNo: profile.departureFlightNo,
      arrivalTimeStr: profile.arrivalTimeStr,
      departureTimeStr: profile.departureTimeStr,
      layoverHours: profile.layoverHours,
      totalTransitHours: profile.totalTransitHours,
      baggagePieces: profile.baggagePieces,
    });
    selectPackage(plan.packageSku);
    validSelectedAddons.forEach((sku) => toggleAddon(sku));
    const order = createOrder();
    router.push(`/order?id=${order.orderId}`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6fbff_0%,#eef5f8_46%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:px-8 lg:py-8">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/80 bg-white/78 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Sparkles size={17} className="text-blue-600" />
              <span>演示角色模板</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              每个角色都带航班、画像、痛点、套餐和权益数据，用来演示真实礼宾对话。
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-2 md:overflow-visible md:pb-0">
            {conciergePersonas.map((persona) => {
              const isActive = persona.id === activePersonaId;
              const tone = packageTone[persona.packageSku];

              return (
                <button
                  key={persona.id}
                  onClick={() => selectPersonaTemplate(persona)}
                  className={`w-[260px] shrink-0 rounded-2xl border p-3 text-left transition md:w-full ${
                    isActive
                      ? 'border-blue-200 bg-white shadow-md ring-2 ring-blue-100'
                      : 'border-white/80 bg-white/70 hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-slate-900">{persona.shortName}</div>
                      <div className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">
                        {persona.personaType}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black ${tone.className}`}>
                      {tone.label}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] font-semibold leading-5 text-slate-600">
                    {persona.headline}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-slate-400">
                    <Plane size={12} />
                    <span>{persona.profile.arrivalFlightNo}</span>
                    <span>→</span>
                    <span>{persona.profile.departureFlightNo}</span>
                    <span>{persona.profile.totalTransitHours}h</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-[680px] overflow-hidden rounded-3xl border border-white/80 bg-white/78 shadow-2xl shadow-blue-950/8 backdrop-blur-xl lg:min-h-[760px]">
          <header className="border-b border-slate-100 bg-white/80 px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                    S
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-slate-950">Stopover AI 礼宾 App</h1>
                    <p className="text-[11px] font-bold text-slate-400">
                      {lastSource.startsWith('dashscope') ? 'Qwen 多轮对话已连接' : '本地业务引擎兜底'} · {airport.nameZh}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: '中转', value: `${profile.totalTransitHours}h`, icon: Clock3 },
                  { label: '行李', value: `${profile.baggagePieces}件`, icon: Luggage },
                  { label: '返场', value: '90min', icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl bg-slate-50 px-3 py-2">
                      <Icon size={14} className="mx-auto text-blue-600" />
                      <div className="mt-1 text-xs font-black text-slate-900">{item.value}</div>
                      <div className="text-[9px] font-bold text-slate-400">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </header>

          <div className="grid min-h-[560px] grid-rows-[1fr_auto] lg:min-h-[620px]">
            <div className="space-y-4 overflow-y-auto px-5 py-5">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-black text-blue-700">
                  <BadgeCheck size={15} />
                  <span>{activePersona.name}</span>
                </div>
                <p className="mt-2 text-xs font-semibold leading-6 text-blue-900/75">
                  {activePersona.context}
                </p>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Sparkles size={15} />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-semibold leading-6 shadow-sm ${
                      message.role === 'user'
                        ? 'rounded-tr-md bg-slate-950 text-white'
                        : 'rounded-tl-md border border-slate-100 bg-white text-slate-700'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-blue-600">
                        礼宾回答
                      </span>
                    )}
                    {message.content}
                    {message.source && (
                      <div className="mt-2 text-[9px] font-bold text-slate-400">
                        {message.source}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white">
                      <UserRound size={15} />
                    </div>
                  )}
                </div>
              ))}

              {isAsking && (
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Sparkles size={15} />
                  </div>
                  <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-4 py-3 text-sm font-black text-slate-500 shadow-sm">
                    正在读取 PRD 知识、套餐规则和当前会话...
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t border-slate-100 bg-white/85 p-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {[...activePersona.demoQuestions, ...plan.quickReplies].slice(0, 6).map((question) => (
                  <button
                    key={question}
                    onClick={() => void askConcierge(question)}
                    className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-[11px] font-extrabold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void askConcierge(inputValue);
                }}
                className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200 transition focus-within:ring-blue-200"
              >
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="直接输入：中转时长、行李、想休息还是想出机场..."
                />
                <button
                  type="submit"
                  disabled={isAsking || !inputValue.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  title="发送给礼宾"
                >
                  <Send size={17} />
                </button>
              </form>
            </footer>
          </div>
        </main>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xl shadow-blue-950/8">
            <div
              className="h-32 bg-cover bg-center"
              style={{ backgroundImage: `url(${airport.image})` }}
            />
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                    当前推荐
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">{plan.packageName}</h2>
                  <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">{plan.summary}</p>
                </div>
                <div className="rounded-2xl bg-blue-600 px-3 py-2 text-right text-white shadow-lg shadow-blue-600/25">
                  <div className="text-[10px] font-bold opacity-80">总价</div>
                  <div className="text-xl font-black">¥{totalPrice}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {plan.modules.map((item) => {
                  const moduleIcon =
                    item.key === 'lounge'
                      ? BriefcaseBusiness
                      : item.key === 'baggage'
                        ? Luggage
                        : item.key === 'route'
                          ? Map
                          : TicketCheck;
                  const Icon = moduleIcon;

                  return (
                    <div key={item.key} className="rounded-2xl bg-slate-50 p-3">
                      <Icon size={16} className="text-blue-600" />
                      <div className="mt-2 text-[10px] font-bold text-slate-400">{item.label}</div>
                      <div className="mt-1 text-xs font-black leading-5 text-slate-800">{item.value}</div>
                    </div>
                  );
                })}
              </div>

              {plan.routeName && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                    <Route size={16} />
                    <span>{plan.routeName}</span>
                  </div>
                  <p className="mt-2 text-[11px] font-semibold leading-5 text-emerald-800/75">
                    {plan.routeSpots.join(' / ')} · {plan.routeDuration}
                  </p>
                </div>
              )}

              {plan.missingSlots.length > 0 && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-800">
                    <ShieldAlert size={15} />
                    <span>需要确认</span>
                  </div>
                  <p className="mt-2 text-[11px] font-semibold leading-5 text-amber-800/75">
                    {plan.missingSlots.join('、')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/82 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-950">可核销权益</h3>
              <span className="text-[10px] font-black text-slate-400">同一订单凭证</span>
            </div>
            <div className="space-y-2">
              {activePackage.addons.map((sku) => {
                const Icon = iconMap[sku];
                const item = addons.find((addon) => addon.sku === sku);
                const checked = selectedAddons.includes(sku);

                return (
                  <button
                    key={sku}
                    onClick={() => toggleLocalAddon(sku)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      checked ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          checked ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'
                        }`}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-black leading-5 text-slate-800">{item?.name ?? sku}</div>
                          <div className="shrink-0 text-xs font-black text-blue-600">+¥{item?.price ?? 0}</div>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-4 text-slate-500">
                          {item?.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl">
            <div className="flex items-center gap-2 text-sm font-black">
              <QrCode size={18} className="text-orange-300" />
              <span>下单与履约</span>
            </div>
            <div className="mt-4 space-y-3">
              {plan.timeline.slice(0, 4).map((item) => (
                <div key={`${item.time}-${item.label}`} className="grid grid-cols-[58px_12px_1fr] gap-2">
                  <span className="text-[10px] font-black text-slate-400">{item.time}</span>
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-orange-300" />
                  <div>
                    <div className="text-xs font-black text-slate-100">{item.label}</div>
                    <div className="mt-0.5 text-[10px] font-semibold leading-4 text-slate-400">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={createConciergeOrder}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-950 transition hover:bg-blue-50"
            >
              <CreditCard size={15} />
              <span>生成订单与电子凭证</span>
              <ArrowRight size={14} />
            </button>
            <Link
              href={currentOrder ? `/journey?id=${currentOrder.orderId}` : '/journey'}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-white transition hover:bg-white/10"
            >
              <CalendarClock size={15} />
              <span>查看履约追踪</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500">
            <div className="rounded-2xl bg-white/80 px-2 py-3 shadow-sm">
              <Check className="mx-auto mb-1 text-emerald-600" size={14} />
              多轮对话
            </div>
            <div className="rounded-2xl bg-white/80 px-2 py-3 shadow-sm">
              <HelpCircle className="mx-auto mb-1 text-blue-600" size={14} />
              知识问答
            </div>
            <div className="rounded-2xl bg-white/80 px-2 py-3 shadow-sm">
              <CircleDollarSign className="mx-auto mb-1 text-orange-500" size={14} />
              权益下单
            </div>
          </div>
        </aside>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              title: '角色模板覆盖核心人群',
              body: '商旅、家庭、红眼补能、高端包车和签证风险场景都能一键进入对话。',
              icon: UserRound,
            },
            {
              title: 'LLM 负责礼宾与问答',
              body: '后端带完整 history 与 PRD 知识上下文；无 Key 时按同一业务引擎兜底。',
              icon: MessageCircle,
            },
            {
              title: '同一状态机生成订单',
              body: '聊天确认后复用套餐、加购、RFID 行李与履约追踪，不再只是静态脚本。',
              icon: ShieldCheck,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <Icon size={22} className="text-blue-600" />
                <h3 className="mt-4 text-base font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
