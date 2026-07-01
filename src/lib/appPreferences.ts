import type { Addon, AddonSku, Airport, Package, PackageSku } from './types';

export type LanguageCode = 'zh-CN' | 'en-US';
export type ThemeMode = 'light' | 'dark';
export type TextScale = 'compact' | 'comfortable' | 'large';

export type AppPreferences = {
  language: LanguageCode;
  theme: ThemeMode;
  textScale: TextScale;
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  language: 'zh-CN',
  theme: 'light',
  textScale: 'comfortable',
};

export const APP_PREFERENCES_STORAGE_KEY = 'stopover.app-preferences.v1';

type TranslationKey =
  | 'brand.name'
  | 'brand.short'
  | 'brand.subtitle'
  | 'nav.concierge'
  | 'nav.booking'
  | 'nav.pitch'
  | 'nav.status'
  | 'footer.title'
  | 'footer.body'
  | 'footer.rights'
  | 'preferences.language'
  | 'preferences.themeLight'
  | 'preferences.themeDark'
  | 'preferences.textScale'
  | 'preferences.textCompact'
  | 'preferences.textComfortable'
  | 'preferences.textLarge'
  | 'mobile.book'
  | 'mobile.back'
  | 'flow.search.title'
  | 'flow.search.step'
  | 'flow.packages.title'
  | 'flow.packages.step'
  | 'flow.checkout.title'
  | 'flow.checkout.step'
  | 'flow.order.title'
  | 'flow.order.step'
  | 'flow.journey.title'
  | 'flow.journey.step'
  | 'home.welcome'
  | 'home.sourceConnected'
  | 'home.sourceFallback'
  | 'home.assuranceLabel'
  | 'home.assuranceTitle'
  | 'home.assurancePrice'
  | 'home.recommendationFactors'
  | 'home.returnBuffer'
  | 'home.createOrder'
  | 'home.viewTracking'
  | 'home.currentRecommendation'
  | 'home.voucherBenefits'
  | 'home.fulfillmentTitle'
  | 'home.inputPlaceholder'
  | 'home.quickReplies'
  | 'search.title'
  | 'search.subtitle'
  | 'search.presetMode'
  | 'search.customMode'
  | 'search.caseSelector'
  | 'search.manualTitle'
  | 'search.hub'
  | 'search.arrivalFlight'
  | 'search.departureFlight'
  | 'search.arrivalTime'
  | 'search.departureTime'
  | 'search.timeAnalysis'
  | 'search.totalTimeline'
  | 'search.totalLayover'
  | 'search.tooShort'
  | 'search.entryBuffer'
  | 'search.serviceWindow'
  | 'search.boardingBuffer'
  | 'search.serviceSlider'
  | 'search.minBook'
  | 'search.sliderHint'
  | 'search.hubInfo'
  | 'search.policy'
  | 'search.policyAllowed'
  | 'search.policyManual'
  | 'search.lounge'
  | 'search.summary'
  | 'search.totalStay'
  | 'search.serviceTime'
  | 'search.next'
  | 'packages.back'
  | 'packages.title'
  | 'packages.subtitle'
  | 'packages.recommended'
  | 'packages.disabled'
  | 'packages.from'
  | 'packages.includes'
  | 'packages.safetyTitle'
  | 'packages.safetyBody'
  | 'packages.addons'
  | 'packages.noAddons'
  | 'packages.bill'
  | 'packages.total'
  | 'packages.next'
  | 'checkout.back'
  | 'checkout.title'
  | 'checkout.processingTitle'
  | 'checkout.processingBody'
  | 'checkout.successTitle'
  | 'checkout.successBody'
  | 'checkout.identityTitle'
  | 'checkout.identityNotice'
  | 'checkout.passengerName'
  | 'checkout.passport'
  | 'checkout.phone'
  | 'checkout.termsTitle'
  | 'checkout.rebooking'
  | 'checkout.baggagePolicy'
  | 'checkout.summary'
  | 'checkout.airport'
  | 'checkout.flightPlan'
  | 'checkout.services'
  | 'checkout.pay'
  | 'checkout.demoNotice'
  | 'order.notFound'
  | 'order.notFoundBody'
  | 'order.successTitle'
  | 'order.successBody'
  | 'order.voucher'
  | 'order.qrHint'
  | 'order.bookingDetails'
  | 'order.passengerName'
  | 'order.passport'
  | 'order.arrival'
  | 'order.departure'
  | 'order.product'
  | 'order.addons'
  | 'order.paid'
  | 'order.trackingTitle'
  | 'order.trackingBody'
  | 'order.openTracking'
  | 'journey.notFound'
  | 'journey.notFoundBody'
  | 'journey.titlePrefix'
  | 'journey.live'
  | 'journey.viewVoucher'
  | 'journey.baggageTab'
  | 'journey.itineraryTab'
  | 'journey.addonsTab'
  | 'journey.baggageStatus'
  | 'journey.rfid'
  | 'journey.baggageBody'
  | 'journey.pieces'
  | 'journey.coverage'
  | 'journey.timeline'
  | 'journey.serviceLine'
  | 'journey.airport'
  | 'journey.missedTitle'
  | 'journey.refund'
  | 'common.total'
  | 'common.hours'
  | 'common.pieces'
  | 'common.yuan'
  | 'common.loading';

const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  'zh-CN': {
    'brand.name': '龙腾中转礼遇',
    'brand.short': '龙腾中转礼遇',
    'brand.subtitle': '全程中转助手',
    'nav.concierge': '中转礼遇 Demo',
    'nav.booking': '预订中转套餐',
    'nav.pitch': '展示 PPT',
    'nav.status': '履约状态机 Demo',
    'footer.title': '龙腾中转礼遇 Web 演示原型',
    'footer.body': '以休息室为信任锚 + 行李全托管 + 模块化城市服务，激活长中转等待商机',
    'footer.rights': '© 2026 DragonPass / AILab. All rights reserved.',
    'preferences.language': 'EN',
    'preferences.themeLight': '亮色',
    'preferences.themeDark': '暗色',
    'preferences.textScale': '文字',
    'preferences.textCompact': '紧凑',
    'preferences.textComfortable': '标准',
    'preferences.textLarge': '大字',
    'mobile.book': '预订',
    'mobile.back': '返回上一页',
    'flow.search.title': '航班计划',
    'flow.search.step': 'Step 1/5',
    'flow.packages.title': '定制套餐',
    'flow.packages.step': 'Step 2/5',
    'flow.checkout.title': '确认支付',
    'flow.checkout.step': 'Step 3/5',
    'flow.order.title': '电子凭证',
    'flow.order.step': 'Step 4/5',
    'flow.journey.title': '行程追踪',
    'flow.journey.step': 'Step 5/5',
    'home.welcome': '您好，我是龙腾中转礼遇助手。告诉我您转机的机场、停留时长和行李件数，我会给出符合您需求的机场中转游的套餐包和返场保障建议',
    'home.sourceConnected': '中转礼遇模型在线',
    'home.sourceFallback': '本地业务引擎兜底',
    'home.assuranceLabel': 'Stopover 履约方案',
    'home.assuranceTitle': '中转确定性方案',
    'home.assurancePrice': '估算总价',
    'home.recommendationFactors': '推荐依据',
    'home.returnBuffer': '返场缓冲',
    'home.createOrder': '生成订单与电子凭证',
    'home.viewTracking': '查看履约追踪',
    'home.currentRecommendation': '当前推荐',
    'home.voucherBenefits': '可核销权益',
    'home.fulfillmentTitle': '下单与履约',
    'home.inputPlaceholder': '直接输入：中转时长、行李、想休息还是想出机场...',
    'home.quickReplies': '礼宾回答',
    'search.title': '选择您的中转航班计划',
    'search.subtitle': '按 PRD 核算总中转、服务窗口与返场缓冲',
    'search.presetMode': '切换为：预设真实案例演示',
    'search.customMode': '手动输入：自定义到达/离境航班',
    'search.caseSelector': '选择一个真实的航班中转案例进行模拟：',
    'search.manualTitle': '自定义输入中转枢纽航班时间',
    'search.hub': '中转枢纽',
    'search.arrivalFlight': '到达航班号',
    'search.departureFlight': '离境航班号',
    'search.arrivalTime': '到达中转枢纽具体时间',
    'search.departureTime': '离开中转枢纽具体时间',
    'search.timeAnalysis': '中转时长核算及手动预留套餐消费时长',
    'search.totalTimeline': '总计中转时间轴拆解',
    'search.totalLayover': '总时长',
    'search.tooShort': '总中转时间低于最低要求（6小时），无法为本航段定制中转游套餐。',
    'search.entryBuffer': '入境/中转核验 1.5h',
    'search.serviceWindow': '预留用于中转套餐',
    'search.boardingBuffer': '登机 buffer',
    'search.serviceSlider': '请手动拖拽设置您预留的中转服务时长',
    'search.minBook': '最低 6小时起订',
    'search.sliderHint': '预留时间越长，可选择的城市游越丰富',
    'search.hubInfo': '当前中转枢纽信息',
    'search.policy': '出关政策',
    'search.policyAllowed': 'Demo 合规模型显示该枢纽可做免签/落地签中转 PoC，实际售卖前仍需机场/边检核验。',
    'search.policyManual': '该枢纽暂不自动销售出机场路线，需要人工核验入境资格后才可开启城市服务。',
    'search.lounge': '联营贵宾厅',
    'search.summary': '匹配方案汇总',
    'search.totalStay': '总停留时长',
    'search.serviceTime': '预留服务时间',
    'search.next': '订制该时间段套餐方案',
    'packages.back': '返回修改航班',
    'packages.title': '匹配定制您的中转套餐',
    'packages.subtitle': '为您在中转枢纽的停留智能匹配最优方案',
    'packages.recommended': '智能推荐',
    'packages.disabled': '时长不足',
    'packages.from': '起',
    'packages.includes': '包含的服务细项',
    'packages.safetyTitle': '行李托管与安全保障承诺',
    'packages.safetyBody': '已包含 RFID 托管服务，每件随身行李保额上限达 ¥5,000。若由微游、酒店或合作接送服务导致误机，将提供改签协助与损失兜底补偿。',
    'packages.addons': '加购增值服务',
    'packages.noAddons': '当前套餐不支持加购其他增值项',
    'packages.bill': '账单明细',
    'packages.total': '总计金额',
    'packages.next': '前往结算付款',
    'checkout.back': '返回修改定制套餐',
    'checkout.title': '确认订单与履约核验信息',
    'checkout.processingTitle': '安全支付网关验证中',
    'checkout.processingBody': '正在模拟联接支付渠道。请勿关闭或刷新此页面。',
    'checkout.successTitle': '模拟支付已成功！',
    'checkout.successBody': '订单已生成电子凭证及 RFID 行李托管跟踪卡。正在跳转至电子凭证页...',
    'checkout.identityTitle': '中转履约核验信息',
    'checkout.identityNotice': '本 Demo 仅登记旅客姓名、证件号与联系方式用于机场服务核销、酒店入住或行李签收模拟；不提供签证/入境代办，也不进入营销画像。',
    'checkout.passengerName': '旅客姓名拼音（如护照所示）',
    'checkout.passport': '证件号码',
    'checkout.phone': '联系电话（含国别码）',
    'checkout.termsTitle': '模拟付款保障条款',
    'checkout.rebooking': '无忧改签保障：凡预定微游或酒店专车服务，如因我方责任导致未能按时返回机场误机，将负责后续改签协助及滞留期间餐宿补偿。',
    'checkout.baggagePolicy': '行李全托管保险：行李托管自交付贴标至领回签字期间承保，如发生破损、遗失，每件最高赔付额度为人民币 5,000 元。',
    'checkout.summary': '订单汇总',
    'checkout.airport': '中转机场',
    'checkout.flightPlan': '航班计划',
    'checkout.services': '已订服务',
    'checkout.pay': '一键模拟担保支付',
    'checkout.demoNotice': '本交易为 Demo 模拟扣款验证，不会产生任何实际银行账单。',
    'order.notFound': '订单不存在或已过期',
    'order.notFoundBody': '请重新预定中转套餐。',
    'order.successTitle': '您的中转套餐已订购成功！',
    'order.successBody': '电子服务凭证已下发。在柜台出示二维码即可核销履约。',
    'order.voucher': '电子凭证',
    'order.qrHint': '抵达中转柜台后，向工作人员出示此二维码，办理行李托管及服务启用。',
    'order.bookingDetails': '预订明细',
    'order.passengerName': '旅客姓名拼音',
    'order.passport': '证件号码',
    'order.arrival': '到达航班',
    'order.departure': '离境航班',
    'order.product': '已购中转产品',
    'order.addons': '加购增值项',
    'order.paid': '付款实额',
    'order.trackingTitle': '实时行李全托管追踪已开启',
    'order.trackingBody': '系统已激活该行程的 RFID 行李跟踪状态机。进入追踪页可查看行李转运、微游/酒店履约节点和误机保障。',
    'order.openTracking': '进入行程看板与行李追踪',
    'journey.notFound': '未找到对应行程信息',
    'journey.notFoundBody': '请确认您的订单号。',
    'journey.titlePrefix': '正在追踪',
    'journey.live': '实时定位已连接',
    'journey.viewVoucher': '查看电子凭证 (QR)',
    'journey.baggageTab': '行李全托管',
    'journey.itineraryTab': '中转行程履约明细',
    'journey.addonsTab': '我的核销权益卡',
    'journey.baggageStatus': '当前行李托管状态',
    'journey.rfid': 'RFID 安全保障中',
    'journey.baggageBody': '行李目前由中转仓储系统实时跟踪保护。离境航班起飞前 90 分钟，系统将指派服务人员将行李送抵安检口/登机口交接点。',
    'journey.pieces': '托运件数',
    'journey.coverage': '保障额度',
    'journey.timeline': 'RFID 全程转运生命周期',
    'journey.serviceLine': '已启用产品服务线',
    'journey.airport': '中转枢纽',
    'journey.missedTitle': '触发中转“无忧保障计划”',
    'journey.refund': '点击一键申请退还套餐费',
    'common.total': '总计',
    'common.hours': '小时',
    'common.pieces': '件',
    'common.yuan': '¥',
    'common.loading': '正在加载...',
  },
  'en-US': {
    'brand.name': 'DragonPass Stopover',
    'brand.short': 'DragonPass Concierge Agent',
    'brand.subtitle': 'Stopover concierge',
    'nav.concierge': 'AI Concierge',
    'nav.booking': 'Book a stopover',
    'nav.pitch': 'Pitch deck',
    'nav.status': 'Fulfillment state machine',
    'footer.title': 'DragonPass Stopover Web Demo Prototype',
    'footer.body': 'A lounge-anchored, baggage-secure, modular city micro-tour product for long layovers.',
    'footer.rights': '© 2026 DragonPass / AILab. All rights reserved.',
    'preferences.language': '中',
    'preferences.themeLight': 'Light',
    'preferences.themeDark': 'Dark',
    'preferences.textScale': 'Text',
    'preferences.textCompact': 'Compact',
    'preferences.textComfortable': 'Standard',
    'preferences.textLarge': 'Large',
    'mobile.book': 'Book',
    'mobile.back': 'Go back',
    'flow.search.title': 'Flight plan',
    'flow.search.step': 'Step 1/5',
    'flow.packages.title': 'Packages',
    'flow.packages.step': 'Step 2/5',
    'flow.checkout.title': 'Checkout',
    'flow.checkout.step': 'Step 3/5',
    'flow.order.title': 'Voucher',
    'flow.order.step': 'Step 4/5',
    'flow.journey.title': 'Tracking',
    'flow.journey.step': 'Step 5/5',
    'home.welcome': 'Hello! I am your DragonPass Stopover Concierge. Tell me your layover airport, duration, and baggage count, and I will recommend stopover packages and return transfer plans.',
    'home.sourceConnected': 'DragonPass concierge model online',
    'home.sourceFallback': 'Local business engine fallback',
    'home.assuranceLabel': 'Stopover fulfillment plan',
    'home.assuranceTitle': 'Layover certainty plan',
    'home.assurancePrice': 'Estimated total',
    'home.recommendationFactors': 'Recommendation factors',
    'home.returnBuffer': 'Return buffer',
    'home.createOrder': 'Create order and voucher',
    'home.viewTracking': 'View fulfillment tracking',
    'home.currentRecommendation': 'Current recommendation',
    'home.voucherBenefits': 'Voucher benefits',
    'home.fulfillmentTitle': 'Order and fulfillment',
    'home.inputPlaceholder': 'Type your layover hours, baggage, and whether you want rest or city access...',
    'home.quickReplies': 'Concierge reply',
    'search.title': 'Choose your stopover flight plan',
    'search.subtitle': 'Calculate layover time and reserve a safe service window',
    'search.presetMode': 'Switch to preset demo cases',
    'search.customMode': 'Manual input: arrival and departure flights',
    'search.caseSelector': 'Choose a realistic layover case to simulate:',
    'search.manualTitle': 'Enter your stopover flight times',
    'search.hub': 'Stopover hub',
    'search.arrivalFlight': 'Arrival flight',
    'search.departureFlight': 'Departure flight',
    'search.arrivalTime': 'Arrival time at hub',
    'search.departureTime': 'Departure time from hub',
    'search.timeAnalysis': 'Layover time analysis and reserved service window',
    'search.totalTimeline': 'Total layover timeline',
    'search.totalLayover': 'Total duration',
    'search.tooShort': 'Total layover is below the 6-hour minimum and cannot be packaged.',
    'search.entryBuffer': 'Entry / transit checks 1.5h',
    'search.serviceWindow': 'Reserved stopover service',
    'search.boardingBuffer': 'Boarding buffer',
    'search.serviceSlider': 'Drag to reserve your stopover service window',
    'search.minBook': 'Minimum booking: 6 hours',
    'search.sliderHint': 'A longer service window unlocks richer city routes',
    'search.hubInfo': 'Current hub information',
    'search.policy': 'Border policy',
    'search.policyAllowed': 'The demo compliance model marks this hub as eligible for visa-free / visa-on-arrival PoC; live sales still require airport and border checks.',
    'search.policyManual': 'This hub does not auto-sell city routes. Entry eligibility must be checked manually before city service is enabled.',
    'search.lounge': 'Partner lounge',
    'search.summary': 'Recommendation summary',
    'search.totalStay': 'Total layover',
    'search.serviceTime': 'Reserved service time',
    'search.next': 'Build package for this window',
    'packages.back': 'Back to flight plan',
    'packages.title': 'Match your stopover package',
    'packages.subtitle': 'The best package for your stopover window',
    'packages.recommended': 'Recommended',
    'packages.disabled': 'Not enough time',
    'packages.from': 'from',
    'packages.includes': 'Included services',
    'packages.safetyTitle': 'Baggage custody and safety promise',
    'packages.safetyBody': 'Includes RFID custody with coverage up to ¥5,000 per carry-on. If our tour, hotel or transfer causes a missed connection, rebooking assistance and compensation support are triggered.',
    'packages.addons': 'Add-on services',
    'packages.noAddons': 'This package has no available add-ons',
    'packages.bill': 'Bill summary',
    'packages.total': 'Total',
    'packages.next': 'Continue to checkout',
    'checkout.back': 'Back to package',
    'checkout.title': 'Confirm order and fulfillment details',
    'checkout.processingTitle': 'Secure payment gateway check',
    'checkout.processingBody': 'Simulating payment channel verification. Do not close or refresh this page.',
    'checkout.successTitle': 'Demo payment succeeded',
    'checkout.successBody': 'The order, voucher and RFID baggage tracking card have been generated. Redirecting to voucher...',
    'checkout.identityTitle': 'Fulfillment verification details',
    'checkout.identityNotice': 'This demo only records name, document number and contact details for service redemption, hotel check-in or baggage handover simulation. It does not provide visa or immigration processing, and data is not used for marketing profiles.',
    'checkout.passengerName': 'Passenger name as in passport',
    'checkout.passport': 'Document number',
    'checkout.phone': 'Phone with country code',
    'checkout.termsTitle': 'Demo protection terms',
    'checkout.rebooking': 'Missed-connection care: if our tour, hotel or transfer service causes a late return, rebooking assistance and meal / lodging compensation support are triggered.',
    'checkout.baggagePolicy': 'Baggage custody insurance: from handover to signed return, damage or loss is covered up to ¥5,000 per piece.',
    'checkout.summary': 'Order summary',
    'checkout.airport': 'Stopover airport',
    'checkout.flightPlan': 'Flight plan',
    'checkout.services': 'Booked services',
    'checkout.pay': 'Simulate secured payment',
    'checkout.demoNotice': 'This is a demo payment simulation and will not create a real bank charge.',
    'order.notFound': 'Order not found or expired',
    'order.notFoundBody': 'Please book a new stopover package.',
    'order.successTitle': 'Your stopover package is booked',
    'order.successBody': 'Your service voucher is ready. Show the QR code at the transfer counter to start fulfillment.',
    'order.voucher': 'Voucher',
    'order.qrHint': 'Show this QR code at the transfer counter to activate baggage custody and your service flow.',
    'order.bookingDetails': 'Booking details',
    'order.passengerName': 'Passenger name',
    'order.passport': 'Document number',
    'order.arrival': 'Arrival flight',
    'order.departure': 'Departure flight',
    'order.product': 'Stopover product',
    'order.addons': 'Add-ons',
    'order.paid': 'Paid amount',
    'order.trackingTitle': 'Live RFID baggage tracking is active',
    'order.trackingBody': 'The RFID baggage state machine is now active. Open tracking to view baggage transfer, tour / hotel milestones and missed-connection care.',
    'order.openTracking': 'Open journey and baggage tracking',
    'journey.notFound': 'Journey not found',
    'journey.notFoundBody': 'Please check your order number.',
    'journey.titlePrefix': 'Tracking stopover journey',
    'journey.live': 'Live location connected',
    'journey.viewVoucher': 'View voucher (QR)',
    'journey.baggageTab': 'Baggage custody',
    'journey.itineraryTab': 'Fulfillment itinerary',
    'journey.addonsTab': 'Voucher benefits',
    'journey.baggageStatus': 'Current baggage status',
    'journey.rfid': 'RFID protected',
    'journey.baggageBody': 'Baggage is tracked by the stopover custody system. Ninety minutes before departure, staff will return it to the designated gate handover point.',
    'journey.pieces': 'Pieces',
    'journey.coverage': 'Coverage',
    'journey.timeline': 'RFID custody lifecycle',
    'journey.serviceLine': 'Product service line active',
    'journey.airport': 'Hub',
    'journey.missedTitle': 'Missed-connection care triggered',
    'journey.refund': 'Apply for package refund',
    'common.total': 'Total',
    'common.hours': 'hours',
    'common.pieces': 'pcs',
    'common.yuan': '¥',
    'common.loading': 'Loading...',
  },
};

const packageTranslations: Record<PackageSku, Record<LanguageCode, Pick<Package, 'name' | 'tagline' | 'includes'>>> = {
  light: {
    'zh-CN': {
      name: '轻享包',
      tagline: '6–8 小时中转首选，轻量小憩，去疲补能',
      includes: [
        '机场联营贵宾厅使用权 (3小时)',
        '随身行李寄存与安全托管',
        '快速安检绿色通道 (Fast Track)',
        '贵宾厅内洗漱淋浴与高速 Wi-Fi',
      ],
    },
    'en-US': {
      name: 'Lounge Ease',
      tagline: 'Best for 6-8h layovers: rest, refresh and fast track',
      includes: [
        'Partner airport lounge access for 3 hours',
        'Carry-on storage and secure custody',
        'Fast Track security channel',
        'Lounge shower, Wi-Fi and charging',
      ],
    },
  },
  micro: {
    'zh-CN': {
      name: '微游包',
      tagline: '10–18 小时白天中转首选，轻装出机场，探秘城市',
      includes: [
        '随身行李全托管 (中转柜台收取，直达贵宾厅寄存)',
        '机场联营贵宾厅使用权 (2小时)',
        '标准化城市半日游 (4-6小时，含专车+中文/英文向导)',
        '往返市区机场专属接送机专车',
        '特制当地风味特色午餐/晚餐',
        '中转延误/误机全面安心保障与改签协助',
      ],
    },
    'en-US': {
      name: 'City Micro-Tour',
      tagline: 'Best for 10-18h daytime layovers: city access without baggage drag',
      includes: [
        'Full carry-on custody from transfer counter to lounge storage',
        'Partner airport lounge access for 2 hours',
        'Standard 4-6h city micro-tour with car and bilingual guide',
        'Dedicated airport-city round-trip transfer',
        'Local lunch or dinner stop',
        'Missed-connection care and rebooking assistance',
      ],
    },
  },
  overnight: {
    'zh-CN': {
      name: '过夜包',
      tagline: '12–36 小时跨夜中转首选，舒适床铺与探索双重满足',
      includes: [
        '随身行李全托管 (中转柜台收取，直送合作酒店房间)',
        '合作星级酒店钟点房/过夜房 (6小时舒适入住)',
        '机场 ↔ 合作酒店专属接送专车',
        '机场贵宾厅餐食券 (1小时快速用餐)',
        '中转延误/误机全面安心保障与改签协助',
      ],
    },
    'en-US': {
      name: 'Overnight Rest',
      tagline: 'Best for 12-36h or overnight layovers: hotel rest plus return certainty',
      includes: [
        'Full carry-on custody from transfer counter to partner hotel',
        'Partner hotel day-use / overnight room for 6 hours',
        'Dedicated airport-hotel transfers',
        'Airport lounge meal voucher for a quick 1-hour stop',
        'Missed-connection care and rebooking assistance',
      ],
    },
  },
};

const addonTranslations: Record<AddonSku, Record<LanguageCode, Pick<Addon, 'name' | 'description'>>> = {
  esim: {
    'zh-CN': {
      name: '中转地 eSIM 高速流量包',
      description: '中转地 4G/5G 本地高速流量，免换卡即开即用，支持热点分享，5GB 流量。',
    },
    'en-US': {
      name: 'Stopover eSIM data pack',
      description: 'Local 4G/5G data for the stopover city. No physical SIM swap, hotspot supported, 5GB included.',
    },
  },
  transfer: {
    'zh-CN': {
      name: '机场 ↔ 市区/酒店双向专属专车接送',
      description: '高档 B 级轿车，专业双语司机，举牌接机，准时安全，省去排队打车烦恼。',
    },
    'en-US': {
      name: 'Dedicated airport-city / hotel transfer',
      description: 'Premium sedan or van with bilingual driver, meet-and-greet pickup and reliable return timing.',
    },
  },
  'hotel-dayuse': {
    'zh-CN': {
      name: '加购：合作酒店钟点房续住 (4小时)',
      description: '在过夜包基础上额外增加 4 小时酒店房间使用时间，方便更久休憩或倒时差。',
    },
    'en-US': {
      name: 'Hotel day-use extension (4h)',
      description: 'Extend your partner hotel room by 4 hours for deeper rest or jet-lag recovery.',
    },
  },
  shower: {
    'zh-CN': {
      name: '机场淋浴房升级单点权益',
      description: '非贵宾厅用户亦可凭券前往机场指定淋浴中心，享 30 分钟舒适淋浴及全套高档备品。',
    },
    'en-US': {
      name: 'Airport shower upgrade',
      description: 'Redeem a 30-minute airport shower session with premium amenities at a partner facility.',
    },
  },

  'meal-voucher': {
    'zh-CN': {
      name: '机场地标美食核销券 (面值 ¥100)',
      description: '可在樟宜机场“星耀樟宜”、多哈“黄铜熊”旁等 30+ 合作餐饮店作 ¥100 等值无门槛抵扣。',
    },
    'en-US': {
      name: 'Airport dining voucher (¥100 face value)',
      description: 'Redeem at 30+ partner restaurants around airport landmarks such as Jewel Changi and Hamad Airport.',
    },
  },
  'private-car': {
    'zh-CN': {
      name: '升级：豪华包车/专属定制随性游 (4小时)',
      description: '升级为独立包车，路线由您决定，随走随停，专属配车与私人导游全程贴心服务。',
    },
    'en-US': {
      name: 'Private car custom tour upgrade (4h)',
      description: 'Upgrade to a private car and guide, with a flexible route controlled by the return deadline.',
    },
  },
};

const airportTranslations: Record<string, Record<LanguageCode, Pick<Airport, 'nameZh' | 'name' | 'loungeLocation'>>> = {
  SIN: {
    'zh-CN': {
      name: '新加坡樟宜国际机场',
      nameZh: '新加坡樟宜',
      loungeLocation: 'T1 环亚贵宾厅 (Plaza Premium Lounge)',
    },
    'en-US': {
      name: 'Singapore Changi Airport',
      nameZh: 'Singapore Changi',
      loungeLocation: 'T1 Plaza Premium Lounge',
    },
  },
  DOH: {
    'zh-CN': {
      name: '多哈哈马德国际机场',
      nameZh: '多哈哈马德',
      loungeLocation: 'Al Mourjan 商务贵宾厅',
    },
    'en-US': {
      name: 'Hamad International Airport',
      nameZh: 'Doha Hamad',
      loungeLocation: 'Al Mourjan Business Lounge',
    },
  },
  IST: {
    'zh-CN': {
      name: '伊斯坦布尔机场',
      nameZh: '伊斯坦布尔',
      loungeLocation: 'IGA Premium Lounge',
    },
    'en-US': {
      name: 'Istanbul Airport',
      nameZh: 'Istanbul',
      loungeLocation: 'IGA Premium Lounge',
    },
  },
  DXB: {
    'zh-CN': {
      name: '迪拜国际机场',
      nameZh: '迪拜国际',
      loungeLocation: 'Marhaba Lounge (T3)',
    },
    'en-US': {
      name: 'Dubai International Airport',
      nameZh: 'Dubai International',
      loungeLocation: 'Marhaba Lounge (T3)',
    },
  },
};

export function t(language: LanguageCode, key: TranslationKey) {
  return translations[language][key] ?? translations['zh-CN'][key] ?? key;
}

export function localizePackage(pkg: Package, language: LanguageCode): Package {
  return {
    ...pkg,
    ...packageTranslations[pkg.sku][language],
  };
}

export function getPackageLabel(sku: PackageSku, language: LanguageCode) {
  return packageTranslations[sku][language].name;
}

export function localizeAddon(addon: Addon, language: LanguageCode): Addon {
  return {
    ...addon,
    ...addonTranslations[addon.sku][language],
  };
}

export function getAddonLabel(sku: AddonSku, language: LanguageCode) {
  return addonTranslations[sku][language].name;
}

export function localizeAirport(airport: Airport, language: LanguageCode): Airport {
  return {
    ...airport,
    ...(airportTranslations[airport.code]?.[language] ?? {}),
  };
}

export function formatHours(value: number, language: LanguageCode) {
  return language === 'zh-CN' ? `${value} 小时` : `${value}h`;
}

export function formatPieces(value: number, language: LanguageCode) {
  return language === 'zh-CN' ? `${value} 件` : `${value} pc${value === 1 ? '' : 's'}`;
}
