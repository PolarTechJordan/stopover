'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  BriefcaseBusiness,
  CalendarClock,
  Car,
  ChefHat,
  Check,
  CircleDollarSign,
  Clock3,
  Compass,
  CreditCard,
  Gem,
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
import {
  formatHours,
  formatPieces,
  getPackageLabel,
  localizeAddon,
  localizeAirport,
  localizePackage,
  t,
} from '@/lib/appPreferences';
import { STOP_OVER_PRD } from '@/lib/prdRules';
import type { AddonSku, PackageSku } from '@/lib/types';
import { useOrderStore } from '@/lib/store/orderStore';
import { useAppPreferences } from '@/components/features/AppPreferenceProvider';

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

const packageToneEnglish: Record<PackageSku, string> = {
  light: 'Airport-side recovery',
  micro: 'City micro-tour',
  overnight: 'Overnight rest',
};

const personaEnglishCopy: Record<string, { name: string; shortName: string; personaType: string; headline: string; scenarioPrompt: string; context: string; demoQuestions: string[] }> = {
  'sin-business-micro': {
    name: 'Explorer business traveler: 10h daytime Singapore stopover',
    shortName: 'Business Micro-Tour',
    personaType: 'Premium business traveler / first visit',
    headline: 'Wants a light city loop, core landmarks and no missed connection.',
    scenarioPrompt: 'I have a 10-hour stopover in Singapore with one carry-on. I want to see the city lightly without missing my flight.',
    context: 'Price sensitivity is low; certainty, baggage safety and a classic route matter most.',
    demoQuestions: ['I am extroverted and high-energy. What should I eat?', 'Where do I pick up my baggage?', 'Can I add an eSIM?'],
  },
  'sin-family-overnight': {
    name: 'Family traveler: 23h overnight Singapore stopover',
    shortName: 'Family Overnight',
    personaType: 'Family with child / needs sleep',
    headline: 'Needs sleep, food and less friction with two bags and a child.',
    scenarioPrompt: 'My family has a 23-hour overnight stopover in Singapore with a child and two bags. We want hotel rest and a smooth next flight.',
    context: 'Family travelers care about child rest, day-use rooms, baggage-to-room service and predictable transfer timing.',
    demoQuestions: ['Can tired kids go straight to the hotel?', 'How should a low-energy family meal work?', 'When should we return to the airport?'],
  },
  'sin-red-eye-light': {
    name: 'Red-eye recovery: 6.5h airport-side stopover',
    shortName: 'Red-Eye Recovery',
    personaType: 'Red-eye passenger / shower and sleep',
    headline: 'Too short for city exit; lounge, shower and fast-track matter most.',
    scenarioPrompt: 'I arrive at Changi after midnight with a 6.5-hour stopover. I just want to shower and sleep without leaving the airport.',
    context: 'The concierge should block city-exit risk and recommend airport-side recovery benefits.',
    demoQuestions: ['Why not leave the airport?', 'What food works for low energy at night?', 'Can I shower in the lounge?'],
  },
  'doh-premium-private': {
    name: 'Premium private: 35h cross-day Doha stopover',
    shortName: 'Doha Private',
    personaType: 'Premium leisure / private transfer',
    headline: 'Enough time for hotel rest, then a private Doha and desert route.',
    scenarioPrompt: 'I have a 35-hour stopover in Doha. I want to sleep first, then take a private city and desert route without handling baggage.',
    context: 'Higher budget traveler; Overnight Rest is the base, with private car, driver and guide layered on top.',
    demoQuestions: ['Can the private route change on site?', 'Will the desert route affect return time?', 'How do hotel and baggage connect?'],
  },
  'ist-visa-risk': {
    name: 'Compliance block: Istanbul entry eligibility uncertain',
    shortName: 'Visa Risk',
    personaType: 'Entry policy uncertain / needs risk control',
    headline: 'Wants to leave the airport, but entry policy must be checked before selling a city tour.',
    scenarioPrompt: 'I have an 8.5-hour stopover in Istanbul and want to see the Blue Mosque, but I am not sure whether my visa allows entry.',
    context: 'The first version does not provide visa services; the concierge should explain the boundary and offer airport-side alternatives.',
    demoQuestions: ['Why not sell the city tour directly?', 'What if I confirm I have a visa?', 'What airport-side alternatives are available?'],
  },
};

function localizePersona(persona: ConciergePersonaTemplate, language: 'zh-CN' | 'en-US') {
  if (language === 'zh-CN') return persona;
  return {
    ...persona,
    ...(personaEnglishCopy[persona.id] ?? {}),
  };
}



function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function displaySourceLabel(source: string | undefined, language: 'zh-CN' | 'en-US') {
  const isChinese = language === 'zh-CN';
  if (source?.startsWith('dashscope')) return isChinese ? '中转礼遇模型' : 'DragonPass model';
  if (source === 'template') return isChinese ? '模板流程' : 'Template flow';
  if (source === 'system') return isChinese ? '中转礼遇助手' : 'DragonPass Concierge';
  if (source?.startsWith('fallback')) return isChinese ? '业务规则兜底' : 'Rule fallback';
  return isChinese ? '业务引擎' : 'Business engine';
}

export default function ConciergeDemo() {
  const router = useRouter();
  const { language } = useAppPreferences();
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
      content: t(language, 'home.welcome'),
      source: 'system',
    },
  ]);

  useEffect(() => {
    setMessages((current) => {
      if (current.length === 1 && current[0].id === 'welcome') {
        return [
          {
            ...current[0],
            content: t(language, 'home.welcome'),
          },
        ];
      }
      return current;
    });
  }, [language]);
  const [profile, setProfile] = useState<ConciergeProfile>(initialResolved.profile);
  const [plan, setPlan] = useState<ConciergePlan>(initialResolved.plan);
  const [selectedAddons, setSelectedAddons] = useState<AddonSku[]>(initialResolved.plan.recommendedAddons);

  const [inputValue, setInputValue] = useState(initialPersona.scenarioPrompt);
  const [isAsking, setIsAsking] = useState(false);
  const [lastSource, setLastSource] = useState('ready');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);

  const activePersona = useMemo(
    () => conciergePersonas.find((item) => item.id === activePersonaId) ?? initialPersona,
    [activePersonaId],
  );
  const localizedActivePersona = localizePersona(activePersona, language);
  const composerValue =
    language === 'en-US' && inputValue === activePersona.scenarioPrompt
      ? localizedActivePersona.scenarioPrompt
      : inputValue;
  const localizedQuickReplies =
    language === 'zh-CN'
      ? [...activePersona.demoQuestions, ...plan.quickReplies].slice(0, 6)
      : [
          ...localizedActivePersona.demoQuestions,
          'Create the order',
          'Show baggage custody details',
          'Switch to overnight rest plan',
        ].slice(0, 6);
  const activePackage = localizePackage(packages.find((item) => item.sku === plan.packageSku) ?? packages[0], language);
  const airport = localizeAirport(airports.find((item) => item.code === plan.airportCode) ?? airports[0], language);
  const validSelectedAddons = selectedAddons.filter((sku) => activePackage.addons.includes(sku));
  const totalPrice = validSelectedAddons.reduce((sum, sku) => {
    return sum + (addons.find((item) => item.sku === sku)?.price ?? 0);
  }, activePackage.price);

  const localizedPlanSummary =
    language === 'zh-CN'
      ? plan.summary
      : plan.packageSku === 'light'
        ? 'A low-risk airport-side plan focused on lounge rest, baggage storage and fast-track certainty.'
        : plan.packageSku === 'micro'
          ? 'A fixed city micro-tour plan: hand off baggage, complete a compact route, and return with buffer.'
          : 'An overnight rest plan combining hotel, transfers, baggage custody and return assurance in one order.';
  const localizedSafeguards =
    language === 'zh-CN'
      ? plan.safeguards
      : [
          `Baggage return starts ${STOP_OVER_PRD.baggageReturnBufferMin} minutes before departure, and the traveler must reach security ${STOP_OVER_PRD.securityGateDeadlineMin} minutes before departure.`,
          `Baggage is photographed, RFID-tagged within ${STOP_OVER_PRD.baggageTransferSlaMin} minutes and covered up to ¥${STOP_OVER_PRD.baggageCoverageCny} per piece.`,
          `If our route or transfer causes a missed connection, rebooking, lodging and concierge intervention within ${STOP_OVER_PRD.conciergeInterventionSlaMin} minutes are triggered.`,
        ];
  const localizedModules =
    language === 'zh-CN'
      ? plan.modules
      : [
          { key: 'lounge', label: 'Lounge anchor', value: plan.packageSku === 'light' ? '3h' : plan.packageSku === 'micro' ? '2h' : '1h' },
          { key: 'baggage', label: 'Baggage custody', value: profile.baggagePieces > 0 ? `RFID ${formatPieces(profile.baggagePieces, language)}` : 'No checked custody' },
          { key: 'route', label: plan.packageSku === 'overnight' && !profile.wantsPrivateCar ? 'Hotel rest' : 'City service', value: plan.packageSku === 'light' ? 'Airport-side rest' : plan.routeName ? 'Fixed return-safe route' : 'Hotel / transfer flow' },
          { key: 'addons', label: 'Add-ons', value: validSelectedAddons.length ? validSelectedAddons.map((sku) => localizeAddon(addons.find((item) => item.sku === sku)!, language).name).join(', ') : 'Optional' },
        ];

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [isAsking, messages]);

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
          locale: language,
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
            ? buildDeterministicReply(nextPlan, language)
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
          content: buildDeterministicReply(local.plan, language),
          source: 'fallback:client',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const selectPersonaTemplate = (persona: ConciergePersonaTemplate) => {
    const resolved = buildConciergePlan(persona.scenarioPrompt, persona.profile, persona.defaultAddons);
    const localizedPersona = localizePersona(persona, language);
    setActivePersonaId(persona.id);
    setProfile(resolved.profile);
    setPlan(resolved.plan);
    setSelectedAddons(resolved.plan.recommendedAddons);

    setInputValue('');
    setMessages([
      {
        id: makeId('persona-user'),
        role: 'user',
        content: localizedPersona.scenarioPrompt,
      },
      {
        id: makeId('persona-assistant'),
        role: 'assistant',
        content: buildDeterministicReply(resolved.plan, language),
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
    <div className="aurora-surface animate-aurora-flow relative flex h-[calc(100dvh-57px)] min-h-0 flex-col overflow-hidden text-slate-950 md:h-auto md:min-h-screen md:overflow-visible">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(247,251,255,0.2)_0%,rgba(219,232,246,0.44)_72%,rgba(15,23,42,0.18)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(90deg,rgba(40,231,255,0.18),rgba(255,122,69,0.12),rgba(124,61,255,0.16))] blur-3xl" />
      <section className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden md:mx-auto md:grid md:h-auto md:max-w-7xl md:grid-cols-1 md:gap-5 md:overflow-visible md:px-4 md:py-5 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:px-8 lg:py-8">
        <aside className="hidden space-y-4 lg:block">
          <div className="liquid-glass-dark rounded-3xl p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-black">
              <Gem size={17} className="text-cyan-200" />
              <span>{language === 'zh-CN' ? '龙腾出行履约场景舱' : 'Stopover scenario deck'}</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-300">
              {language === 'zh-CN'
                ? '航班、停留时段、行李、路线和返场缓冲进入同一个匹配引擎，推荐套餐与履约节点一起锁定。'
                : 'Flights, layover time, baggage, route and return buffer feed one recommendation engine.'}
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-2 md:overflow-visible md:pb-0">
            {conciergePersonas.map((persona) => {
              const isActive = persona.id === activePersonaId;
              const tone = packageTone[persona.packageSku];
              const localizedPersona = localizePersona(persona, language);

              return (
                <button
                  key={persona.id}
                  onClick={() => selectPersonaTemplate(persona)}
                  className={`w-[260px] shrink-0 rounded-2xl border p-3 text-left transition md:w-full ${
                    isActive
                      ? 'border-cyan-200/70 bg-white/92 shadow-2xl shadow-cyan-950/20 ring-2 ring-cyan-200/40'
                      : 'border-white/15 bg-white/10 text-white backdrop-blur-xl hover:border-white/30 hover:bg-white/16'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={`text-sm font-black ${isActive ? 'text-slate-900' : 'text-white'}`}>{localizedPersona.shortName}</div>
                      <div className={`mt-1 text-[11px] font-semibold leading-4 ${isActive ? 'text-slate-500' : 'text-slate-300'}`}>
                        {localizedPersona.personaType}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black ${tone.className}`}>
                      {language === 'zh-CN' ? tone.label : packageToneEnglish[persona.packageSku]}
                    </span>
                  </div>
                  <p className={`mt-3 text-[11px] font-semibold leading-5 ${isActive ? 'text-slate-600' : 'text-slate-200'}`}>
                    {localizedPersona.headline}
                  </p>
                  <div className={`mt-3 flex items-center gap-2 text-[10px] font-black ${isActive ? 'text-slate-400' : 'text-cyan-100/75'}`}>
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

        <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden border-0 border-white/80 bg-white/90 shadow-none backdrop-blur-2xl md:min-h-[680px] md:rounded-3xl md:border md:bg-white/78 md:shadow-2xl md:shadow-cyan-950/18 lg:min-h-[760px]">
          <header className="hidden shrink-0 border-b border-white/50 bg-white/88 px-4 py-3 backdrop-blur-2xl md:block md:bg-white/72 md:px-5 md:py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="meal-pulse-ring flex h-9 w-9 items-center justify-center rounded-2xl p-[1px] text-sm font-black text-white md:h-10 md:w-10">
                    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950">
                      龙
                    </div>
                  </div>
                  <div>
                    <h1 className="text-base font-black text-slate-950 md:text-lg">{t(language, 'brand.name')}</h1>
                    <p className="text-[11px] font-bold text-slate-400">
                      {lastSource.startsWith('dashscope') ? t(language, 'home.sourceConnected') : t(language, 'home.sourceFallback')} · RFID · {airport.nameZh}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden grid-cols-3 gap-2 text-center sm:grid">
                {[
                  { label: language === 'zh-CN' ? '中转' : 'Layover', value: `${profile.totalTransitHours}h`, icon: Clock3 },
                  { label: language === 'zh-CN' ? '行李' : 'Bags', value: formatPieces(profile.baggagePieces, language), icon: Luggage },
                  { label: language === 'zh-CN' ? '返场' : 'Return', value: '90min', icon: ShieldCheck },
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

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
              <div className="rounded-2xl border border-white/60 bg-white/72 p-4 shadow-sm backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-black text-blue-700">
                  <BadgeCheck size={15} />
                  <span>{localizedActivePersona.name}</span>
                </div>
                <p className="mt-2 text-xs font-semibold leading-6 text-blue-900/75">
                  {localizedActivePersona.context}
                </p>
              </div>

              <div className="liquid-glass-dark relative overflow-hidden rounded-3xl p-4 text-white shadow-2xl md:p-5">
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/35 bg-cyan-200/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                          <ShieldCheck size={12} />
                          {t(language, 'home.assuranceLabel')}
                        </span>
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black text-orange-100">
                          {formatHours(profile.totalTransitHours, language)} · {airport.code}
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-black leading-tight tracking-normal text-white md:text-3xl">
                        {getPackageLabel(plan.packageSku, language)}
                      </h2>
                      <p className="mt-2 max-w-xl text-xs font-semibold leading-6 text-slate-200">
                        {localizedPlanSummary}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl">
                      <div className="meal-pulse-ring flex h-16 w-16 items-center justify-center rounded-full p-[3px]">
                        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950 text-white">
                          <span className="text-xl font-black leading-none">90</span>
                          <span className="text-[9px] font-black text-cyan-100">MIN</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{t(language, 'home.returnBuffer')}</div>
                        <div className="mt-1 text-lg font-black text-orange-200">RFID</div>
                        <div className="mt-1 text-[10px] font-semibold text-slate-400">
                          {language === 'zh-CN' ? '行李 + 返场兜底' : 'Baggage + return care'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {localizedSafeguards.map((reason, index) => (
                        <div key={reason} className="rounded-2xl border border-white/14 bg-slate-950/46 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                          <div className="mb-2 flex items-center gap-2 text-[10px] font-black text-cyan-100">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-200/18 text-cyan-50">
                              {index + 1}
                            </span>
                            <span>{t(language, 'home.recommendationFactors')}</span>
                          </div>
                          <p className="text-[11px] font-semibold leading-5 text-slate-100">{reason}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-white/14 bg-slate-950/58 p-3">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          { label: localizedModules[0]?.value ?? '', icon: BriefcaseBusiness },
                          { label: localizedModules[1]?.value ?? '', icon: Luggage },
                          { label: localizedModules[2]?.label ?? '', icon: Map },
                          { label: localizedModules[3]?.label ?? '', icon: TicketCheck },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className="rounded-xl bg-white/10 px-2 py-2 text-[10px] font-black text-slate-100">
                              <Icon size={13} className="mb-1 text-orange-200" />
                              {item.label}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 rounded-xl bg-white/8 px-3 py-2">
                        <div className="text-[10px] font-black text-slate-300">{language === 'zh-CN' ? '履约动线' : 'Fulfillment path'}</div>
                        <div className="mt-1 text-[11px] font-semibold leading-5 text-white">
                          {localizedModules.map((item) => `${item.label}: ${item.value}`).join(' · ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={createConciergeOrder}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-950 transition hover:bg-cyan-50"
                  >
                    <CreditCard size={15} />
                    <span>{t(language, 'home.createOrder')}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                      {t(language, 'home.currentRecommendation')}
                    </div>
                    <h2 className="mt-1 truncate text-base font-black text-slate-950">{getPackageLabel(plan.packageSku, language)}</h2>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-blue-600 px-3 py-2 text-right text-white shadow-lg shadow-blue-600/25">
                    <div className="text-[9px] font-bold opacity-80">{t(language, 'home.assurancePrice')}</div>
                    <div className="text-lg font-black">¥{totalPrice}</div>
                  </div>
                </div>
                <button
                  onClick={createConciergeOrder}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition active:scale-[0.99]"
                >
                  <CreditCard size={15} />
                  <span>{t(language, 'home.createOrder')}</span>
                  <ArrowRight size={14} />
                </button>
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
                        {t(language, 'home.quickReplies')}
                      </span>
                    )}
                    {message.id === 'welcome' ? t(language, 'home.welcome') : message.content}
                    {message.source && (
                      <div className="mt-2 text-[9px] font-bold text-slate-400">
                        {displaySourceLabel(message.source, language)}
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
                    {language === 'zh-CN' ? '正在读取 PRD 知识、套餐规则和当前会话...' : 'Reading PRD knowledge, package rules and current context...'}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="shrink-0 border-t border-slate-100 bg-white/96 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] md:bg-white/85 md:p-4 md:shadow-none">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {localizedQuickReplies.map((question) => (
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
                  void askConcierge(composerValue);
                }}
                className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200 transition focus-within:ring-blue-200"
              >
                <input
                  value={composerValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder={t(language, 'home.inputPlaceholder')}
                />
                <button
                  type="submit"
                  disabled={isAsking || !composerValue.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  title={language === 'zh-CN' ? '发送给礼宾' : 'Send to concierge'}
                >
                  <Send size={17} />
                </button>
              </form>
            </footer>
          </div>
        </main>

        <aside className="hidden space-y-4 lg:block">
          <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/12 shadow-2xl shadow-cyan-950/25 backdrop-blur-2xl">
            <div
              className="relative h-36 bg-cover bg-center"
              style={{ backgroundImage: `url(${airport.image})` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,25,0.14),rgba(6,12,25,0.78))]" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="rounded-full bg-white/16 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-xl">
                  龙腾出行推荐
                </span>
                <span className="rounded-full bg-cyan-200 px-3 py-1 text-[10px] font-black text-slate-950">
                  {airport.code}
                </span>
              </div>
            </div>
            <div className="space-y-4 p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                    {t(language, 'home.currentRecommendation')}
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-white">{getPackageLabel(plan.packageSku, language)}</h2>
                </div>
                <div className="rounded-2xl bg-cyan-200 px-3 py-2 text-right text-slate-950 shadow-lg shadow-cyan-400/25">
                  <div className="text-[10px] font-bold opacity-80">{t(language, 'home.assurancePrice')}</div>
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
                    <div key={item.key} className="rounded-2xl bg-white/10 p-3">
                      <Icon size={16} className="text-cyan-100" />
                      <div className="mt-2 text-[10px] font-bold text-slate-400">
                        {localizedModules.find((moduleItem) => moduleItem.key === item.key)?.label ?? item.label}
                      </div>
                      <div className="mt-1 text-xs font-black leading-5 text-white">
                        {localizedModules.find((moduleItem) => moduleItem.key === item.key)?.value ?? item.value}
                      </div>
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
                    <span>{language === 'zh-CN' ? '需要确认' : 'Needs confirmation'}</span>
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
              <h3 className="text-sm font-black text-slate-950">{t(language, 'home.voucherBenefits')}</h3>
              <span className="text-[10px] font-black text-slate-400">同一订单凭证</span>
            </div>
            <div className="space-y-2">
              {activePackage.addons.map((sku) => {
                const Icon = iconMap[sku];
                const item = addons.find((addon) => addon.sku === sku);
                const localizedItem = item ? localizeAddon(item, language) : null;
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
                          <div className="text-xs font-black leading-5 text-slate-800">{localizedItem?.name ?? sku}</div>
                          <div className="shrink-0 text-xs font-black text-blue-600">+¥{item?.price ?? 0}</div>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-4 text-slate-500">
                          {localizedItem?.description}
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
              <span>{t(language, 'home.fulfillmentTitle')}</span>
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
              <span>{t(language, 'home.createOrder')}</span>
              <ArrowRight size={14} />
            </button>
            <Link
              href={currentOrder ? `/journey?id=${currentOrder.orderId}` : '/journey'}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-white transition hover:bg-white/10"
            >
              <CalendarClock size={15} />
              <span>{t(language, 'home.viewTracking')}</span>
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

      <section className="hidden border-y border-slate-200 bg-white px-4 py-10 sm:px-6 md:block lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              title: '角色模板覆盖核心人群',
              body: '商旅、家庭、红眼补能、高端包车和签证风险场景都能一键进入对话。',
              icon: UserRound,
            },
            {
              title: '中转礼遇助手负责陪伴与问答',
              body: '后端带完整 history 与 PRD 知识上下文；无模型连接时按同一业务引擎兜底。',
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
