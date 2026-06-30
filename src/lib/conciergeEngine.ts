import { addons, airports, packages, tourRoutes } from './mockData';
import { getAddonLabel, getPackageLabel, type LanguageCode } from './appPreferences';
import type { AddonSku, AirportCode, PackageSku } from './types';

export type ConciergeIntent =
  | 'profile'
  | 'package'
  | 'baggage'
  | 'tour'
  | 'addons'
  | 'private'
  | 'fulfillment'
  | 'checkout'
  | 'general';

export type ConciergeProfile = {
  airportCode: AirportCode;
  arrivalFlightNo: string;
  departureFlightNo: string;
  arrivalTimeStr: string;
  departureTimeStr: string;
  totalTransitHours: number;
  layoverHours: number;
  baggagePieces: number;
  partyType: 'business' | 'family' | 'rest' | 'premium';
  wantsCityTour: boolean;
  needsHotel: boolean;
  wantsPrivateCar: boolean;
};

export type ConciergePlan = {
  intent: ConciergeIntent;
  packageSku: PackageSku;
  packageName: string;
  packagePrice: number;
  airportCode: AirportCode;
  airportName: string;
  summary: string;
  reason: string;
  routeId: string | null;
  routeName: string | null;
  routeDuration: string | null;
  routeSpots: string[];
  recommendedAddons: AddonSku[];
  modules: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  timeline: Array<{
    time: string;
    label: string;
    detail: string;
  }>;
  safeguards: string[];
  missingSlots: string[];
  quickReplies: string[];
};

export type ConciergeMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export const defaultConciergeProfile: ConciergeProfile = {
  airportCode: 'SIN',
  arrivalFlightNo: 'SQ833',
  departureFlightNo: 'SQ322',
  arrivalTimeStr: '2026-07-01 08:30',
  departureTimeStr: '2026-07-01 18:30',
  totalTransitHours: 10,
  layoverHours: 8,
  baggagePieces: 1,
  partyType: 'business',
  wantsCityTour: true,
  needsHotel: false,
  wantsPrivateCar: false,
};

const airportAliases: Array<{ code: AirportCode; patterns: string[] }> = [
  { code: 'SIN', patterns: ['sin', '新加坡', '樟宜', 'changi'] },
  { code: 'DOH', patterns: ['doh', '多哈', '哈马德', 'hamad', 'doha'] },
  { code: 'IST', patterns: ['ist', '伊斯坦布尔', 'istanbul'] },
  { code: 'DXB', patterns: ['dxb', '迪拜', 'dubai'] },
];

function clampLayover(totalHours: number, packageSku: PackageSku) {
  if (packageSku === 'light') {
    return Math.max(3, Math.min(totalHours, totalHours - 2));
  }

  if (packageSku === 'micro') {
    return Math.max(6, Math.min(8, totalHours - 2));
  }

  return Math.max(8, Math.min(18, totalHours - 4));
}

function findAirportCode(message: string): AirportCode | null {
  const normalized = message.toLowerCase();
  const match = airportAliases.find((item) =>
    item.patterns.some((pattern) => normalized.includes(pattern.toLowerCase())),
  );
  return match?.code ?? null;
}

function extractHours(message: string) {
  const match = message.match(/(\d+(?:\.\d+)?)\s*(小时|小時|h|H)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function inferIntent(message: string): ConciergeIntent {
  const lower = message.toLowerCase();

  if (/(下单|付款|支付|确认|生成|凭证|二维码|qr)/i.test(message)) return 'checkout';
  if (/(履约|追踪|状态|rfid|进度|误机|保障|赔付|改签)/i.test(message)) return 'fulfillment';
  if (/(行李|箱|托管|寄存|rfid|保险)/i.test(message)) return 'baggage';
  if (/(包车|私人|定制|司机|专车)/i.test(message)) return 'private';
  if (/(路线|城市|微游|景点|出机场|观光|一日|半日)/i.test(message)) return 'tour';
  if (/(esim|流量|餐|团餐|券|酒店|钟点|淋浴|加购|增值|接送|能量|社交|安静)/i.test(lower)) return 'addons';
  if (/(套餐|价格|多少钱|费用|推荐|选哪个|方案)/i.test(message)) return 'package';
  if (/(航班|中转|到达|离境|机场|时间|小时)/i.test(message)) return 'profile';

  return 'general';
}

function inferPackage(profile: ConciergeProfile, forceAirportRisk = false): PackageSku {
  if (forceAirportRisk) return 'light';
  if (profile.needsHotel || profile.totalTransitHours >= 18) return 'overnight';
  if (profile.wantsCityTour || profile.wantsPrivateCar || profile.totalTransitHours >= 10) return 'micro';
  return 'light';
}

function buildTimeline(profile: ConciergeProfile, packageSku: PackageSku) {
  if (packageSku === 'light') {
    return [
      { time: 'T+20min', label: '柜台交包', detail: '扫码核验订单，随身行李贴 RFID 或寄存标签' },
      { time: 'T+35min', label: '进入贵宾厅', detail: '3 小时休息、淋浴、餐食和 Wi-Fi' },
      { time: '起飞前90min', label: '取回行李', detail: '系统提醒签收，进入快速安检' },
    ];
  }

  if (packageSku === 'micro') {
    return [
      { time: '08:50', label: '中转柜台交包', detail: '行李拍照登记，RFID 绑定订单' },
      { time: '09:20', label: '向导接驳出发', detail: '固定路线和车辆信息同步到订单' },
      { time: '13:00', label: '城市微游结束', detail: '完成核心景点与餐食，预留返程缓冲' },
      { time: '16:50', label: '回到机场', detail: '触发 VIP 安检和行李归还节点' },
    ];
  }

  return [
    { time: 'T+20min', label: '柜台交包', detail: '行李转运至合作酒店或贵宾厅库位' },
    { time: 'T+90min', label: '酒店入住', detail: '钟点房/过夜房核销，支持补眠和淋浴' },
    { time: '起飞前120min', label: '专车返场', detail: '退房后接送回机场，系统倒计时' },
    { time: '起飞前90min', label: '行李送回', detail: '签收后进入快速安检和登机流程' },
  ];
}

function recommendAddons(profile: ConciergeProfile, packageSku: PackageSku): AddonSku[] {
  const result = new Set<AddonSku>();

  result.add('esim');

  if (packageSku === 'light') {
    result.add('ai-group-meal');
    result.add('shower');
    result.add('meal-voucher');
  }

  if (packageSku === 'micro') {
    result.add('transfer');
    result.add('ai-group-meal');
  }

  if (packageSku === 'overnight') {
    result.add('hotel-dayuse');
    result.add('transfer');
    result.add('ai-group-meal');
  }

  if (profile.wantsPrivateCar) {
    result.add('private-car');
  }

  return [...result].filter((sku) => packages.find((item) => item.sku === packageSku)?.addons.includes(sku));
}

export function resolveConciergeProfile(
  message: string,
  previous: Partial<ConciergeProfile> = {},
): ConciergeProfile {
  const base = { ...defaultConciergeProfile, ...previous };
  const airportCode = findAirportCode(message) ?? base.airportCode;
  const totalTransitHours = extractHours(message) ?? base.totalTransitHours;
  const lowered = message.toLowerCase();
  const wantsPrivateCar = base.wantsPrivateCar || /(包车|私人|定制|司机|专车)/i.test(message);
  const needsHotel = base.needsHotel || /(过夜|酒店|钟点|睡|休息房|孩子|家庭|红眼)/i.test(message);
  const wantsCityTour =
    wantsPrivateCar ||
    base.wantsCityTour ||
    /(城市|微游|景点|出机场|观光|逛|路线|city|tour)/i.test(lowered);
  const partyType = /(孩子|儿童|家庭|老人)/i.test(message)
    ? 'family'
    : /(睡|淋浴|红眼|休息)/i.test(message)
      ? 'rest'
      : wantsPrivateCar
        ? 'premium'
        : base.partyType;
  const baggagePieces = /(不带行李|没有行李|无行李)/i.test(message)
    ? 0
    : /(2件|两件|两个箱|两个行李)/i.test(message)
      ? 2
      : base.baggagePieces;
  const airport = airports.find((item) => item.code === airportCode);
  const hasVisaRisk = !!airport && !airport.visaFree && /(签证|入境|visa|不确定|不清楚|没有签证)/i.test(message);
  const packageSku = inferPackage({
    ...base,
    airportCode,
    totalTransitHours,
    wantsCityTour,
    needsHotel,
    wantsPrivateCar,
    partyType,
    baggagePieces,
  }, hasVisaRisk);

  return {
    ...base,
    airportCode,
    totalTransitHours,
    layoverHours: clampLayover(totalTransitHours, packageSku),
    baggagePieces,
    partyType,
    wantsCityTour,
    needsHotel,
    wantsPrivateCar,
  };
}

export function buildConciergePlan(
  message: string,
  previous: Partial<ConciergeProfile> = {},
  selectedAddons: AddonSku[] = [],
): { profile: ConciergeProfile; plan: ConciergePlan } {
  const profile = resolveConciergeProfile(message, previous);
  const intent = inferIntent(message);
  const airportForRisk = airports.find((item) => item.code === profile.airportCode);
  const hasVisaRisk =
    !!airportForRisk && !airportForRisk.visaFree && /(签证|入境|visa|不确定|不清楚|没有签证)/i.test(message);
  const packageSku = inferPackage(profile, hasVisaRisk);
  const selectedPackage = packages.find((item) => item.sku === packageSku) ?? packages[0];
  const airport = airports.find((item) => item.code === profile.airportCode) ?? airports[0];
  const shouldShowRoute = packageSku === 'micro' || profile.wantsPrivateCar;
  const route = shouldShowRoute
    ? tourRoutes.find((item) => item.airport === profile.airportCode && item.id.includes('classic')) ??
      tourRoutes.find((item) => item.airport === profile.airportCode) ??
      null
    : null;
  const recommendedAddons = [...new Set([...recommendAddons(profile, packageSku), ...selectedAddons])].filter((sku) =>
    selectedPackage.addons.includes(sku),
  );
  const addonNames = recommendedAddons
    .map((sku) => addons.find((item) => item.sku === sku)?.name)
    .filter(Boolean)
    .join('、');
  const missingSlots: string[] = [];

  if (!message.trim()) {
    missingSlots.push('中转机场', '总中转时长');
  }

  if (profile.totalTransitHours < 6) {
    missingSlots.push('可订购时长不足 6 小时');
  }

  const routeSummary =
    packageSku === 'overnight' && !profile.wantsPrivateCar
      ? '合作酒店/钟点房 + 专车接送'
      : route
        ? `${route.name}，覆盖${route.spots.slice(0, 3).join('、')}`
        : '机场内休息与补能';
  const summary =
    packageSku === 'light'
      ? `${profile.totalTransitHours} 小时中转更适合轻享包，重点解决休息、寄存和快速安检。`
      : packageSku === 'micro'
        ? `${profile.totalTransitHours} 小时中转可做微游包：先交包，再完成固定城市路线，回机场留足缓冲。`
        : `${profile.totalTransitHours} 小时或跨夜中转适合过夜包，把行李、酒店、接送和返场保障合成一单。`;

  const quickReplies =
    intent === 'checkout'
      ? ['生成电子凭证', '查看履约追踪', '重新核算方案']
      : intent === 'baggage'
        ? ['行李丢了怎么赔', 'RFID 什么时候绑定', '回机场前多久送回']
        : intent === 'addons'
        ? ['加 AI 团餐匹配', '我要包车升级', '只想加酒店钟点房']
          : ['我要下单', '看行李托管细节', '换成过夜休息方案'];

  return {
    profile,
    plan: {
      intent,
      packageSku,
      packageName: selectedPackage.name,
      packagePrice: selectedPackage.price,
      airportCode: airport.code,
      airportName: airport.nameZh,
      summary,
      reason:
        packageSku === 'micro'
          ? `PRD 要求微游包覆盖 10-18 小时白天中转；当前 ${profile.totalTransitHours} 小时满足固定路线和 60 分钟前返场要求。`
          : packageSku === 'overnight'
            ? '跨夜或长停旅客更需要酒店/钟点房、接送和补眠，城市游不是第一优先级。'
            : '短停旅客风险主要在时间和安检，优先休息室、寄存和快速安检，不建议出机场。',
      routeId: shouldShowRoute ? route?.id ?? null : null,
      routeName: shouldShowRoute ? route?.name ?? null : null,
      routeDuration: shouldShowRoute ? route?.duration ?? null : null,
      routeSpots: shouldShowRoute ? route?.spots ?? [] : [],
      recommendedAddons,
      modules: [
        { key: 'lounge', label: '休息室信任锚', value: packageSku === 'light' ? '3 小时' : packageSku === 'micro' ? '2 小时' : '1 小时' },
        { key: 'baggage', label: '行李托管', value: profile.baggagePieces > 0 ? `RFID ${profile.baggagePieces} 件` : '无托管行李' },
        { key: 'route', label: packageSku === 'overnight' && !profile.wantsPrivateCar ? '酒店/钟点房' : '城市服务', value: routeSummary },
        { key: 'addons', label: '增值项', value: addonNames || '可按需加购' },
      ],
      timeline: buildTimeline(profile, packageSku),
      safeguards: [
        '返场时间按离境航班倒推，默认保留 90 分钟安检缓冲。',
        '行李交付后拍照登记并绑定 RFID，最高 ¥5000/件保障。',
        '若我方路线或接送导致误机，自动进入改签协助、餐宿补偿和客服介入。',
      ],
      missingSlots,
      quickReplies,
    },
  };
}

export function buildDeterministicReply(plan: ConciergePlan, language: LanguageCode = 'zh-CN') {
  if (language === 'en-US') {
    if (plan.missingSlots.includes('可订购时长不足 6 小时')) {
      return 'This layover is below 6 hours, so I would not sell a city or hotel package. The safe option is airport-side rest, dining and fast-track support.';
    }

    if (plan.intent === 'baggage') {
      return `Baggage is photographed, RFID-tagged and linked to the order. This plan includes ${plan.modules.find((item) => item.key === 'baggage')?.value}. Return is triggered 90 minutes before departure, with coverage up to ¥5,000 per piece.`;
    }

    if (plan.intent === 'addons') {
      const labels = plan.recommendedAddons.map((sku) => getAddonLabel(sku, language)).join(', ');
      return `Yes. The best add-ons are ${labels || 'eSIM and meal matching'}, and I will attach them to the same voucher.`;
    }

    if (plan.intent === 'checkout') {
      return `Ready to book. I will create a ${getPackageLabel(plan.packageSku, language)} order with QR voucher, RFID baggage card and fulfillment tracking.`;
    }

    if (plan.intent === 'fulfillment') {
      return 'Fulfillment moves through counter handoff, service start, return, baggage handback and boarding. If the return threshold is breached, fast return and concierge intervention start automatically.';
    }

    const packageSummary =
      plan.packageSku === 'light'
        ? 'This is a short layover, so the safest value is lounge rest, baggage storage and fast track.'
        : plan.packageSku === 'micro'
          ? 'This layover can support a fixed city micro-tour after baggage handoff, with enough return buffer.'
          : 'This long or overnight layover needs hotel rest, transfers, baggage custody and return assurance in one order.';
    return `${packageSummary} I recommend ${getPackageLabel(plan.packageSku, language)}, from ¥${plan.packagePrice}.`;
  }

  if (plan.missingSlots.includes('可订购时长不足 6 小时')) {
    return '这段中转低于 6 小时，不建议购买城市或酒店服务。我只能给你机场内休息、餐饮券和快速安检方案。';
  }

  if (plan.intent === 'baggage') {
    return `行李会在柜台拍照、贴 RFID 并绑定订单，当前方案含 ${plan.modules.find((item) => item.key === 'baggage')?.value}。取回节点会在起飞前 90 分钟自动提醒，最高 ¥5000/件保障。`;
  }

  if (plan.intent === 'addons') {
    return `可以加购。当前最适合的是${plan.recommendedAddons.map((sku) => addons.find((item) => item.sku === sku)?.name).filter(Boolean).join('、') || 'eSIM 和 AI 团餐匹配'}，我会把价格合并进同一张电子凭证。`;
  }

  if (plan.intent === 'checkout') {
    return `可以下单。我会按 ${plan.packageName} 生成订单，包含二维码凭证、RFID 行李卡和履约追踪入口。`;
  }

  if (plan.intent === 'fulfillment') {
    return '履约会按柜台交包、服务开始、返场、行李送回、登机签收五个节点推进；一旦返程超阈值，会自动切换快速返程和客服介入。';
  }

  return `${plan.summary} 我推荐 ${plan.packageName}，起价 ¥${plan.packagePrice}；${plan.reason}`;
}
