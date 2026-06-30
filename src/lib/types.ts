export type AirportCode = 'SIN' | 'DOH' | 'IST' | 'DXB';

export interface Airport {
  code: AirportCode;
  name: string;
  city: string;
  nameZh: string;
  image: string;
  loungeLocation: string;
  visaFree: boolean;
  cityTourRoutes: string[];
}

export interface Flight {
  flightNo: string;          // "TR123"
  airline: string;           // "酷航"
  from: string;
  to: string;
  arrivalTime: string;       // ISO or simple time
  departureTime: string;     // ISO or simple time
  terminal: string;
}

export type PackageSku = 'light' | 'micro' | 'overnight';

export interface Package {
  sku: PackageSku;
  name: string;              // "轻享包"
  tagline: string;           // "6-8h 纯休息最佳"
  price: number;             // 单位：元 (为了Demo简洁，可以使用元而非分，或者用元并支持格式化)
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

export interface Addon {
  sku: AddonSku;
  name: string;
  price: number;
  description: string;
  iconName: string;
}

export type BaggageStatus =
  | 'received'      // 中转柜台收件
  | 'in_transit'    // 转运中
  | 'at_lounge'     // 到达贵宾厅
  | 'at_hotel'      // 到达酒店
  | 'returning'     // 送回中
  | 'delivered'     // 已送回
  | 'lost';         // 异常

export interface BaggageTrackingHistory {
  status: BaggageStatus;
  timestamp: string;
  location: string;
  description: string;
}

export interface BaggageTracking {
  trackingId: string;
  orderId: string;
  rfidTag: string;
  pickupAt: string;          // ISO
  currentLocation: string;   // "樟宜机场 T1 贵宾厅"
  status: BaggageStatus;
  photoUrl: string;
  history: BaggageTrackingHistory[];
}

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
  totalTransitHours: number;
  package: Package;
  addons: AddonSku[];
  totalAmount: number;       // 元
  status: OrderStatus;
  createdAt: string;
  baggage?: BaggageTracking;
  cityTour?: {
    routeId: string;
    routeName: string;
    departureTime: string;   // "09:00"
    guideId: string;
    guideName: string;
    guidePhone: string;
    vehicleId: string;
    vehicleNo: string;
    status: 'scheduled' | 'ongoing' | 'returning' | 'completed' | 'delayed';
  };
  hotel?: {
    hotelId: string;
    hotelName: string;
    roomNo: string;
    checkIn: string;
    checkOut: string;
  };
}
