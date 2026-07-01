'use client';

import { FormEvent, type ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  ChevronDown,
  Clock3,
  CreditCard,
  ExternalLink,
  Luggage,
  MapPinned,
  Navigation,
  PackageCheck,
  Plane,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TicketCheck,
} from 'lucide-react';
import {
  buildConciergePlan,
  buildDeterministicReply,
  defaultConciergeProfile,
  type ConciergeMessage,
  type ConciergePlan,
  type ConciergeProfile,
} from '@/lib/conciergeEngine';
import { useOrderStore } from '@/lib/store/orderStore';
import type { AddonSku, OrderStatus, StopoverOrder } from '@/lib/types';
import { useAppPreferences } from './AppPreferenceProvider';

type ChatItem = ConciergeMessage & {
  id: string;
  source?: string;
};

const seedPromptZh = '我在新加坡中转 10 小时，有 1 件行李，想轻松看一下城市但不能误机。';
const seedResolved = buildConciergePlan(seedPromptZh, defaultConciergeProfile, ['esim', 'ai-group-meal']);
const conciergeNameZh = '龙腾中转礼遇助手';
const conciergeNameEn = 'DragonPass Stopover Concierge';

type ConciergeActionId = 'package' | 'order' | 'baggage' | 'service' | 'return' | 'protect' | 'tracking';

type ConciergeAction = {
  id: ConciergeActionId;
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  detail: string;
  className: string;
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isDashScopeSource(source?: string) {
  return Boolean(source?.startsWith('dashscope:'));
}

function sourceLabel(source: string | undefined, isChinese: boolean) {
  if (isDashScopeSource(source)) return isChinese ? '礼宾模型在线' : 'Concierge model online';
  if (source === 'system') return isChinese ? '中转礼遇助手' : 'DragonPass Concierge';
  if (source === 'template') return isChinese ? '模板流程' : 'Template flow';
  if (source?.startsWith('fallback')) return isChinese ? '规则兜底' : 'Rule fallback';
  return isChinese ? '业务引擎' : 'Business engine';
}

function statusLabel(status: OrderStatus, isChinese: boolean) {
  const zh: Record<OrderStatus, string> = {
    paid: '已支付，待柜台交包',
    baggage_received: '行李已收件',
    in_lounge: '贵宾厅休息中',
    in_city_tour: '城市微游中',
    at_hotel: '酒店休息中',
    baggage_returning: '行李返场中',
    boarded: '已签收登机',
    completed: '行程已完成',
    missed_flight: '误机保障已触发',
    refunded: '赔付退款已完成',
  };
  const en: Record<OrderStatus, string> = {
    paid: 'Paid, awaiting baggage handoff',
    baggage_received: 'Baggage received',
    in_lounge: 'In lounge',
    in_city_tour: 'On city tour',
    at_hotel: 'At hotel',
    baggage_returning: 'Baggage returning',
    boarded: 'Boarded',
    completed: 'Trip completed',
    missed_flight: 'Protection triggered',
    refunded: 'Refund completed',
  };

  return isChinese ? zh[status] : en[status];
}

export default function MobileConciergeAgent() {
  const router = useRouter();
  const { language } = useAppPreferences();
  const {
    clearCustomizations,
    setSearchParams,
    selectPackage,
    toggleAddon,
    createOrder,
    currentOrder,
    transitionOrder,
    addDemoLog,
  } = useOrderStore();
  const isChinese = language === 'zh-CN';
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<ConciergeProfile>(seedResolved.profile);
  const [plan, setPlan] = useState<ConciergePlan>(seedResolved.plan);
  const [selectedAddons, setSelectedAddons] = useState<AddonSku[]>(seedResolved.plan.recommendedAddons);
  const [inputValue, setInputValue] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [lastSource, setLastSource] = useState('ready');
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 'mobile-welcome',
      role: 'assistant',
      content: isChinese
        ? '我是龙腾中转礼遇助手。告诉我机场、停留时长和行李，我会用自然语言对话和卡片带你完成套餐、行李托管、下单与返场保障。'
        : 'I am DragonPass Stopover Concierge. Tell me your airport, layover time and baggage, and I will guide package, baggage custody, order and return assurance through conversation plus cards.',
      source: 'system',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(messages.length);

  const quickReplies = useMemo(
    () =>
      isChinese
        ? ['按 10 小时中转推荐方案', '行李怎么托管和送回？', '如果城市游误机怎么办？', '我要下单']
        : ['Recommend a 10h plan', 'How is baggage returned?', 'What if the city route causes a miss?', 'Create my order'],
    [isChinese],
  );

  const summaryModules = useMemo(
    () => [
      {
        icon: Clock3,
        label: isChinese ? '停留' : 'Layover',
        value: `${profile.totalTransitHours}h`,
      },
      {
        icon: Luggage,
        label: isChinese ? '行李' : 'Bags',
        value: isChinese ? `${profile.baggagePieces} 件` : `${profile.baggagePieces} pc`,
      },
      {
        icon: ShieldCheck,
        label: isChinese ? '返场缓冲' : 'Return buffer',
        value: '90min',
      },
    ],
    [isChinese, profile.baggagePieces, profile.totalTransitHours],
  );

  useEffect(() => {
    const hasNewMessage = messages.length > previousMessageCountRef.current || isAsking;
    previousMessageCountRef.current = messages.length;
    if (!isOpen || !hasNewMessage) return;
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [isAsking, isOpen, messages.length]);

  useEffect(() => {
    const openConcierge = () => setIsOpen(true);
    window.addEventListener('stopover:open-concierge', openConcierge);
    return () => window.removeEventListener('stopover:open-concierge', openConcierge);
  }, []);

  const businessActions = useMemo<ConciergeAction[]>(
    () => [
      {
        id: 'package',
        icon: PackageCheck,
        label: isChinese ? '套餐匹配' : 'Match package',
        detail: isChinese ? '三档 SKU + 增值项' : '3 SKUs + add-ons',
        className: 'border-blue-100 bg-blue-50 text-[#0f3e86]',
      },
      {
        id: 'order',
        icon: CreditCard,
        label: isChinese ? '生成订单' : 'Create order',
        detail: isChinese ? 'QR 凭证 + RFID 卡' : 'QR voucher + RFID',
        className: 'border-orange-100 bg-orange-50 text-[#9a4300]',
      },
      {
        id: 'baggage',
        icon: Luggage,
        label: isChinese ? '柜台交包' : 'Handoff bags',
        detail: isChinese ? '触发行李托管' : 'Start custody',
        className: 'border-cyan-100 bg-cyan-50 text-[#075985]',
      },
      {
        id: 'service',
        icon: MapPinned,
        label:
          plan.packageSku === 'overnight'
            ? isChinese
              ? '酒店入住'
              : 'Hotel check-in'
            : plan.packageSku === 'light'
              ? isChinese
                ? '进贵宾厅'
                : 'Enter lounge'
              : isChinese
                ? '开始微游'
                : 'Start tour',
        detail: isChinese ? '进入服务履约' : 'Run fulfillment',
        className: 'border-emerald-100 bg-emerald-50 text-[#047857]',
      },
      {
        id: 'return',
        icon: Navigation,
        label: isChinese ? '返场送回' : 'Return flow',
        detail: isChinese ? '起飞前 90 分钟' : '90min before departure',
        className: 'border-slate-200 bg-slate-50 text-[#334155]',
      },
      {
        id: 'protect',
        icon: ShieldAlert,
        label: isChinese ? '误机保障' : 'Protection',
        detail: isChinese ? '改签 + 餐宿赔付' : 'Rebook + compensate',
        className: 'border-rose-100 bg-rose-50 text-[#be123c]',
      },
    ],
    [isChinese, plan.packageSku],
  );

  const appendActionNotice = (content: string) => {
    setMessages((current) => [
      ...current,
      {
        id: makeId('mobile-action'),
        role: 'assistant',
        content,
        source: 'system',
      },
    ]);
  };

  const askConcierge = async (message: string, nextProfile = profile, nextAddons = selectedAddons) => {
    const trimmed = message.trim();
    if (!trimmed || isAsking) return;

    const userMessage: ChatItem = {
      id: makeId('mobile-user'),
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
            : isChinese
              ? '我会先按中转时长、行李和返场缓冲帮你核算方案。'
              : 'I will calculate the package from layover time, baggage and return buffer.';

      if (nextPlan) {
        setPlan(nextPlan);
        if (Array.isArray(nextPlan.recommendedAddons)) {
          setSelectedAddons(nextPlan.recommendedAddons);
        }
      }
      if (nextResolvedProfile) {
        setProfile(nextResolvedProfile);
      }

      setLastSource(typeof data.source === 'string' ? data.source : 'dashscope');
      setMessages((current) => [
        ...current,
        {
          id: makeId('mobile-assistant'),
          role: 'assistant',
          content: reply,
          source: typeof data.source === 'string' ? data.source : 'dashscope',
        },
      ]);
    } catch (error) {
      console.warn('Mobile concierge fallback', error);
      const local = buildConciergePlan(trimmed, nextProfile, nextAddons);
      setProfile(local.profile);
      setPlan(local.plan);
      setSelectedAddons(local.plan.recommendedAddons);
      setLastSource('fallback:client');
      setMessages((current) => [
        ...current,
        {
          id: makeId('mobile-assistant'),
          role: 'assistant',
          content: buildDeterministicReply(local.plan, language),
          source: 'fallback:client',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void askConcierge(inputValue);
  };

  const createOrderFromPlan = (navigateTo?: 'order' | 'journey') => {
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
    [...new Set(selectedAddons)].forEach((sku) => toggleAddon(sku));
    const order = createOrder();
    addDemoLog(
      isChinese
        ? `助手按 ${plan.packageName} 创建订单 ${order.orderId}，已生成 QR 凭证与 RFID 行李卡。`
        : `Concierge created order ${order.orderId} from ${plan.packageName}.`,
    );

    if (navigateTo) {
      setIsOpen(false);
      router.push(navigateTo === 'journey' ? `/journey?id=${order.orderId}` : `/order?id=${order.orderId}`);
    }

    return order;
  };

  const createConciergeOrder = () => {
    createOrderFromPlan('order');
  };

  const ensureOrderForAction = () => useOrderStore.getState().currentOrder ?? createOrderFromPlan();

  const getLatestOrder = (fallback: StopoverOrder) => useOrderStore.getState().currentOrder ?? fallback;

  const runBusinessAction = (action: ConciergeActionId) => {
    if (action === 'package') {
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
      [...new Set(selectedAddons)].forEach((sku) => toggleAddon(sku));
      setIsOpen(false);
      router.push('/packages');
      return;
    }

    if (action === 'order') {
      createConciergeOrder();
      return;
    }

    const order = ensureOrderForAction();

    if (action === 'tracking') {
      setIsOpen(false);
      router.push(`/journey?id=${order.orderId}`);
      return;
    }

    if (action === 'baggage') {
      if (getLatestOrder(order).status === 'paid') {
        transitionOrder(
          'RECEIVE_BAGGAGE',
          isChinese ? '助手触发：柜台扫码收件，RFID 标签已绑定订单。' : 'Concierge triggered baggage handoff and RFID binding.',
        );
      }
      setIsOpen(false);
      router.push(`/journey?id=${order.orderId}`);
      return;
    }

    if (action === 'service') {
      let latest = getLatestOrder(order);
      if (latest.status === 'paid') {
        transitionOrder(
          'RECEIVE_BAGGAGE',
          isChinese ? '助手触发：柜台扫码收件，RFID 标签已绑定订单。' : 'Concierge triggered baggage handoff and RFID binding.',
        );
        latest = getLatestOrder(order);
      }

      if (latest.status === 'baggage_received') {
        const trigger =
          latest.package.sku === 'micro'
            ? 'START_CITY_TOUR'
            : latest.package.sku === 'overnight'
              ? 'CHECK_IN_HOTEL'
              : 'ENTER_LOUNGE';
        transitionOrder(
          trigger,
          isChinese ? '助手触发：服务节点已开始，订单状态机继续推进。' : 'Concierge triggered the next fulfillment step.',
        );
      }
      setIsOpen(false);
      router.push(`/journey?id=${order.orderId}`);
      return;
    }

    if (action === 'return') {
      let latest = getLatestOrder(order);
      if (latest.status === 'paid') {
        transitionOrder('RECEIVE_BAGGAGE', isChinese ? '助手触发：柜台交包完成。' : 'Baggage handoff completed.');
        latest = getLatestOrder(order);
      }
      if (latest.status === 'baggage_received') {
        transitionOrder(
          latest.package.sku === 'overnight'
            ? 'CHECK_IN_HOTEL'
            : latest.package.sku === 'micro'
              ? 'START_CITY_TOUR'
              : 'ENTER_LOUNGE',
          isChinese ? '助手触发：进入主服务节点。' : 'Main fulfillment step started.',
        );
        latest = getLatestOrder(order);
      }

      const returnTrigger =
        latest.status === 'in_city_tour'
          ? 'PREPARE_RETURN_FROM_TOUR'
          : latest.status === 'at_hotel'
            ? 'CHECK_OUT'
            : latest.status === 'in_lounge'
              ? 'PREPARE_RETURN'
              : null;

      if (returnTrigger) {
        transitionOrder(
          returnTrigger,
          isChinese
            ? '助手触发：起飞前 90 分钟返场与行李送回流程已启动。'
            : 'Concierge triggered 90-minute return and baggage handback flow.',
        );
      }
      setIsOpen(false);
      router.push(`/journey?id=${order.orderId}`);
      return;
    }

    if (action === 'protect') {
      let latest = getLatestOrder(order);

      if (latest.package.sku === 'light') {
        appendActionNotice(
          isChinese
            ? '轻享包不离开机场，通常不进入城市游误机保障分支。你可以先切到微游包或过夜包，再演示改签与赔付。'
            : 'The light package stays airport-side, so it usually does not enter the city-tour missed-flight branch. Switch to micro-tour or overnight to demo protection.',
        );
        return;
      }

      if (latest.status === 'paid') {
        transitionOrder('RECEIVE_BAGGAGE', isChinese ? '助手触发：柜台交包完成。' : 'Baggage handoff completed.');
        latest = getLatestOrder(order);
      }
      if (latest.status === 'baggage_received') {
        transitionOrder(
          latest.package.sku === 'micro' ? 'START_CITY_TOUR' : 'CHECK_IN_HOTEL',
          isChinese ? '助手触发：进入可触发保障的服务节点。' : 'Fulfillment moved into a protection-capable state.',
        );
        latest = getLatestOrder(order);
      }

      if (latest.status === 'in_city_tour' || latest.status === 'at_hotel') {
        transitionOrder(
          latest.status === 'in_city_tour' ? 'TIMEOUT' : 'TIMEOUT_HOTEL',
          isChinese
            ? '助手触发：返场阈值被突破，误机保障 SOP 已启动。'
            : 'Concierge triggered missed-flight protection SOP.',
        );
      }
      setIsOpen(false);
      router.push(`/journey?id=${order.orderId}`);
    }
  };

  return (
    <div>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="concierge-launcher flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-[#12345f] bg-[#06152c] px-4 py-3 text-left text-white shadow-2xl shadow-black/35 active:scale-[0.99]"
          aria-label={isChinese ? '打开龙腾中转礼遇助手' : 'Open DragonPass Stopover Concierge'}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="meal-pulse-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-[1px]">
              <span className="flex h-full w-full items-center justify-center rounded-xl bg-[#06152c]">
                <Bot size={20} />
              </span>
            </span>
            <span className="concierge-launcher-copy min-w-0">
              <span className="block truncate text-sm font-black">
                {isChinese ? conciergeNameZh : conciergeNameEn}
              </span>
              <span className="block truncate text-[11px] font-semibold text-slate-300">
                {isChinese ? '对话 + 业务动作 · 下单追踪保障' : 'Conversation + actions · order tracking'}
              </span>
            </span>
          </span>
          <Sparkles className="concierge-launcher-sparkle shrink-0 text-[#ff7a00]" size={20} />
        </button>
      )}

      {isOpen && (
        <section
          className="concierge-dialog flex flex-col overflow-hidden rounded-t-[24px] border border-[#1d3559] bg-[#f8fafc] text-[#071632] shadow-2xl shadow-black/40 md:rounded-[18px]"
          role="dialog"
          aria-modal="true"
          aria-label={isChinese ? '龙腾中转礼遇助手对话框' : 'DragonPass Stopover Concierge dialog'}
        >
          <div className="bg-[#06152c] px-4 pb-2.5 pt-2.5 text-white md:px-3 md:pb-2 md:pt-2">
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/24 md:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Bot size={20} className="text-[#7dd3fc]" />
                  <h2 className="truncate text-[13px] font-black leading-4">
                    {isChinese ? conciergeNameZh : conciergeNameEn}
                  </h2>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-slate-300">
                  {isDashScopeSource(lastSource)
                    ? isChinese
                      ? '礼宾模型在线，支持多轮自然语言核算'
                      : 'Concierge model online for multi-turn planning'
                    : isChinese
                      ? '也可用模板与本地业务规则快速跑通流程'
                      : 'Template and local business rules keep the flow deterministic'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white active:scale-95"
                aria-label={isChinese ? '收起礼宾对话框' : 'Collapse concierge dialog'}
              >
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="concierge-summary-modules mt-2 flex gap-1.5 overflow-hidden">
              {summaryModules.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-white/12 bg-white/8 px-2 py-1.5 md:px-1.5 md:py-1">
                    <Icon size={12} className="shrink-0 text-[#7dd3fc]" />
                    <div className="min-w-0">
                      <div className="truncate text-[9px] font-semibold leading-3 text-slate-300 md:text-[8px]">{item.label}</div>
                      <div className="truncate text-[11px] font-black leading-4 text-white">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2.5 md:px-3 md:py-2">
            <div className="mb-2.5 rounded-2xl border border-[#d7e1ec] bg-[#ffffff] p-2.5 shadow-sm md:mb-2 md:rounded-xl md:p-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-[#64748b]">
                    {isChinese ? '当前推荐' : 'Current recommendation'}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] font-black leading-4">{plan.packageName}</div>
                  <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold leading-4 text-[#52627a]">{plan.summary}</p>
                </div>
                <div className="shrink-0 rounded-xl bg-[#eaf1fb] px-2.5 py-1.5 text-center">
                  <div className="text-[10px] font-black text-[#0b5fff]">{plan.airportCode}</div>
                  <div className="text-[13px] font-black leading-4 text-[#071632]">¥{plan.packagePrice}</div>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={createConciergeOrder}
                  className="flex h-8 flex-1 items-center justify-center gap-2 rounded-xl bg-[#f97316] px-3 text-[12px] font-black text-white shadow-lg shadow-orange-600/20 active:scale-[0.98]"
                >
                  <TicketCheck size={15} />
                  <span>{isChinese ? '按此方案下单' : 'Order this plan'}</span>
                </button>
                <Link
                  href="/search"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d7e1ec] bg-[#ffffff] text-[#0b5fff]"
                  aria-label={isChinese ? '打开手动预订' : 'Open manual booking'}
                >
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>

            <div className="mb-2.5 rounded-2xl border border-[#d7e1ec] bg-[#ffffff] p-2.5 shadow-sm md:mb-2 md:rounded-xl md:p-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black text-[#0b5fff]">
                    {isChinese ? '业务关键节点' : 'Business checkpoints'}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold leading-4 text-[#64748b]">
                    {isChinese
                      ? '这些按钮会真实写入订单状态机、行李轨迹和追踪页。'
                      : 'These actions write into the order state machine, baggage timeline and tracking page.'}
                  </p>
                </div>
                {currentOrder ? (
                  <Link
                    href={`/journey?id=${currentOrder.orderId}`}
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 rounded-xl bg-[#06152c] px-2.5 py-1.5 text-[10px] font-black text-white"
                  >
                    {currentOrder.orderId}
                  </Link>
                ) : null}
              </div>

              {currentOrder ? (
                <div className="mt-2 rounded-xl border border-[#d7e1ec] bg-[#f8fafc] px-3 py-1.5 text-[10px] font-black text-[#334155]">
                  {statusLabel(currentOrder.status, isChinese)}
                </div>
              ) : null}

              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {businessActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => runBusinessAction(action.id)}
                      className={`min-h-10 rounded-xl border px-2 py-1.5 text-left active:scale-[0.98] ${action.className}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] font-black">
                        <Icon size={13} className="shrink-0" />
                        <span className="truncate">{action.label}</span>
                      </div>
                      <div className="mt-0.5 line-clamp-1 text-[8px] font-semibold opacity-75">{action.detail}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[84%] rounded-2xl px-3 py-2 text-[12px] font-medium leading-5 ${
                        isUser
                          ? 'rounded-br-md bg-[#0b5fff] text-white'
                          : 'rounded-bl-md border border-[#d7e1ec] bg-[#ffffff] text-[#17223a]'
                      }`}
                    >
                      {message.content}
                      {!isUser && message.source ? (
                        <div className="mt-1 text-[10px] font-black text-[#8a98ab]">
                          {sourceLabel(message.source, isChinese)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-[#d7e1ec] bg-[#ffffff] px-3 py-2 text-[12px] font-black leading-5 text-[#52627a]">
                    {isChinese ? '中转礼遇助手正在核算方案...' : 'DragonPass Concierge is calculating...'}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-[#d7e1ec] bg-[#ffffff] px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5 md:px-3 md:pb-3 md:pt-2">
            <div className="concierge-quick-replies mb-2 flex gap-2 overflow-x-auto pb-1">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() =>
                    /下单|Create my order/i.test(reply) ? runBusinessAction('order') : void askConcierge(reply)
                  }
                  className="shrink-0 rounded-full border border-[#d7e1ec] bg-[#f1f6fb] px-2.5 py-1.5 text-[11px] font-black text-[#0f3e86] active:scale-[0.98]"
                >
                  {reply}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                rows={1}
                placeholder={isChinese ? '问中转礼遇助手：机场、时长、行李、预算...' : 'Ask DragonPass Concierge: airport, bags, budget...'}
                className="max-h-20 min-h-10 flex-1 resize-none rounded-2xl border border-[#d7e1ec] bg-[#f8fafc] px-3 py-2.5 text-[12px] font-semibold leading-5 text-[#071632] outline-none focus:border-[#0b5fff]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isAsking}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#06152c] text-white disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
                aria-label={isChinese ? '发送给礼宾' : 'Send to concierge'}
              >
                {isAsking ? <Plane size={17} /> : <Send size={17} />}
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
