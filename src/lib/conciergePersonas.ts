import type { AddonSku, AirportCode, PackageSku } from './types';
import type { ConciergeProfile } from './conciergeEngine';

export type ConciergePersonaTemplate = {
  id: string;
  name: string;
  shortName: string;
  personaType: string;
  packageSku: PackageSku;
  airportCode: AirportCode;
  profile: ConciergeProfile;
  headline: string;
  scenarioPrompt: string;
  context: string;
  painPoints: string[];
  productFit: string[];
  defaultAddons: AddonSku[];
  demoQuestions: string[];
  entitlementHighlights: Array<{
    label: string;
    value: string;
  }>;
  operationsNotes: string[];
};

export const conciergePersonas: ConciergePersonaTemplate[] = [
  {
    id: 'sin-business-micro',
    name: '探索型商旅：10 小时白天新加坡中转',
    shortName: '商旅微游',
    personaType: '高净值商旅 / 首次到访',
    packageSku: 'micro',
    airportCode: 'SIN',
    profile: {
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
    },
    headline: '想轻装出机场，4 小时看核心地标，又不能误机。',
    scenarioPrompt: '我在新加坡中转 10 小时，随身有一个登机箱，想轻装出机场看看城市，别误机。',
    context: '用户对价格不敏感，关心确定性、行李安全和路线是否足够经典。',
    painPoints: ['怕拖箱出门不方便', '不了解新加坡路线和返程时间', '担心城市交通导致误机'],
    productFit: ['微游包', '行李 RFID 全托管', '樟宜地标经典 4 小时微游', 'VIP 快速安检与误机保障'],
    defaultAddons: ['esim', 'meal-voucher'],
    demoQuestions: ['如果路上堵车会怎么处理？', '行李在哪儿取？', '能不能加一个 eSIM？'],
    entitlementHighlights: [
      { label: '推荐套餐', value: '微游包 ¥780 起' },
      { label: '路线', value: '滨海湾花园 / 鱼尾狮 / 牛车水' },
      { label: '返场', value: '16:50 前回机场' },
    ],
    operationsNotes: ['09:20 向导接驳', '13:00 结束城市路线', '起飞前 90 分钟行李送回'],
  },
  {
    id: 'sin-family-overnight',
    name: '家庭旅客：23 小时跨夜新加坡中转',
    shortName: '家庭过夜',
    personaType: '带娃家庭 / 需要补眠',
    packageSku: 'overnight',
    airportCode: 'SIN',
    profile: {
      airportCode: 'SIN',
      arrivalFlightNo: 'SQ825',
      departureFlightNo: 'SQ308',
      arrivalTimeStr: '2026-07-01 13:30',
      departureTimeStr: '2026-07-02 12:30',
      totalTransitHours: 23,
      layoverHours: 16,
      baggagePieces: 2,
      partyType: 'family',
      wantsCityTour: false,
      needsHotel: true,
      wantsPrivateCar: false,
    },
    headline: '带孩子和两件行李，核心诉求是睡好、吃好、别折腾。',
    scenarioPrompt: '我们一家三口在新加坡跨夜中转 23 小时，有孩子和两件行李，想找酒店休息，第二天顺利登机。',
    context: '家庭用户对儿童休息、酒店钟点房、行李送房和接送确定性更敏感，纯观光优先级低。',
    painPoints: ['孩子精力有限', '行李多，不想反复搬运', '不熟悉机场酒店和接送流程'],
    productFit: ['过夜包', '合作机场酒店/钟点房', '行李直送酒店', '机场餐饮券和专车接送'],
    defaultAddons: ['hotel-dayuse', 'meal-voucher'],
    demoQuestions: ['孩子累了能不能直接去酒店？', '行李能送到房间吗？', '第二天几点要回机场？'],
    entitlementHighlights: [
      { label: '推荐套餐', value: '过夜包 ¥980 起' },
      { label: '住宿', value: '合作酒店 6h 房' },
      { label: '行李', value: '2 件 RFID 托管' },
    ],
    operationsNotes: ['抵达后行李送酒店', '酒店核销后进入补眠', '离境前 120 分钟专车返场'],
  },
  {
    id: 'sin-red-eye-light',
    name: '红眼补能型：6.5 小时机场内中转',
    shortName: '短停补能',
    personaType: '红眼航班 / 只想洗澡睡觉',
    packageSku: 'light',
    airportCode: 'SIN',
    profile: {
      airportCode: 'SIN',
      arrivalFlightNo: 'TR101',
      departureFlightNo: 'TR720',
      arrivalTimeStr: '2026-07-01 01:10',
      departureTimeStr: '2026-07-01 07:40',
      totalTransitHours: 6.5,
      layoverHours: 4,
      baggagePieces: 1,
      partyType: 'rest',
      wantsCityTour: false,
      needsHotel: false,
      wantsPrivateCar: false,
    },
    headline: '时间不够出机场，重点是贵宾厅、淋浴、快速安检。',
    scenarioPrompt: '我凌晨到樟宜，中转 6 个半小时，只想洗个澡睡一会儿，不想出机场。',
    context: '用户不需要城市游，礼宾要主动拦截风险，推荐机场内轻享权益。',
    painPoints: ['睡眠不足', '凌晨服务少', '担心出机场来不及'],
    productFit: ['轻享包', '贵宾厅 3 小时', '淋浴升级', '快速安检'],
    defaultAddons: ['shower', 'meal-voucher'],
    demoQuestions: ['为什么不建议出机场？', '贵宾厅能洗澡吗？', '餐券可以在哪用？'],
    entitlementHighlights: [
      { label: '推荐套餐', value: '轻享包 ¥280 起' },
      { label: '休息', value: '贵宾厅 3h' },
      { label: '边界', value: '不建议出机场' },
    ],
    operationsNotes: ['T+20 分钟寄存行李', '进入贵宾厅补眠', '起飞前 90 分钟进入安检'],
  },
  {
    id: 'doh-premium-private',
    name: '高端私享：35 小时多哈跨天中转',
    shortName: '多哈私享',
    personaType: '高端自由行 / 包车定制',
    packageSku: 'overnight',
    airportCode: 'DOH',
    profile: {
      airportCode: 'DOH',
      arrivalFlightNo: 'QR871',
      departureFlightNo: 'QR003',
      arrivalTimeStr: '2026-07-01 23:30',
      departureTimeStr: '2026-07-03 10:30',
      totalTransitHours: 35,
      layoverHours: 18,
      baggagePieces: 1,
      partyType: 'premium',
      wantsCityTour: true,
      needsHotel: true,
      wantsPrivateCar: true,
    },
    headline: '时间充裕，想酒店休息后包车深度看多哈。',
    scenarioPrompt: '我在多哈中转 35 小时，想先睡一晚，第二天包车看城市和沙漠，行李不要自己管。',
    context: '用户预算更高，礼宾要把过夜包作为底座，再推荐包车/司机/专属向导。',
    painPoints: ['深夜抵达', '跨天行程复杂', '想灵活改路线但不能影响返场'],
    productFit: ['过夜包', '私人包车 4h/8h', '酒店接送', '双语司机兼向导'],
    defaultAddons: ['private-car', 'transfer', 'esim'],
    demoQuestions: ['包车路线能现场改吗？', '沙漠行程会不会影响返程？', '酒店和行李怎么衔接？'],
    entitlementHighlights: [
      { label: '推荐套餐', value: '过夜包 + 包车' },
      { label: '城市', value: '多哈 / 沙漠 / 珍珠岛' },
      { label: '服务', value: '司机兼向导' },
    ],
    operationsNotes: ['深夜先入住酒店', '次日包车按返程截止线调度', '离境前 120 分钟返场'],
  },
  {
    id: 'ist-visa-risk',
    name: '合规拦截：伊斯坦布尔签证不确定中转',
    shortName: '签证风险',
    personaType: '目的地政策不确定 / 需要风控解释',
    packageSku: 'light',
    airportCode: 'IST',
    profile: {
      airportCode: 'IST',
      arrivalFlightNo: 'TK027',
      departureFlightNo: 'TK1983',
      arrivalTimeStr: '2026-07-01 09:00',
      departureTimeStr: '2026-07-01 17:30',
      totalTransitHours: 8.5,
      layoverHours: 6,
      baggagePieces: 1,
      partyType: 'business',
      wantsCityTour: true,
      needsHotel: false,
      wantsPrivateCar: false,
    },
    headline: '用户想出机场，但签证/入境政策不确定，礼宾必须先做合规拦截。',
    scenarioPrompt: '我在伊斯坦布尔中转 8 个半小时，想去蓝色清真寺看看，但不确定签证能不能入境。',
    context: 'PRD 明确第一版不做签证服务，只纳入免签/落地签中转地；礼宾要解释边界并给机场内替代方案。',
    painPoints: ['签证资格不确定', '中转时间不长', '用户想出机场但风险高'],
    productFit: ['轻享包', '机场内休息权益', '餐饮券', '人工签证核验提示'],
    defaultAddons: ['meal-voucher', 'shower'],
    demoQuestions: ['为什么不能直接卖城市游？', '如果我确认有签证呢？', '机场内有什么替代权益？'],
    entitlementHighlights: [
      { label: '推荐动作', value: '先核验签证' },
      { label: '默认套餐', value: '轻享包' },
      { label: '风险', value: '不承诺入境服务' },
    ],
    operationsNotes: ['签证未确认前不生成城市游订单', '可降级机场内权益', '人工礼宾可接入核验'],
  },
];

export function getPersonaTemplate(id: string) {
  return conciergePersonas.find((item) => item.id === id) ?? conciergePersonas[0];
}
