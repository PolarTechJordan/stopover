import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StopoverOrder, AirportCode, PackageSku, AddonSku, Flight, BaggageStatus, BaggageTracking } from '../types';
import { packages, airports, addons, tourRoutes, mockFlightCases } from '../mockData';
import { getNextStatus } from '../state-machine/orderState';
import dayjs from 'dayjs';

interface SearchParams {
  airportCode: AirportCode;
  arrivalFlightNo: string;
  departureFlightNo: string;
  layoverHours: number;
  totalTransitHours: number;
  arrivalTimeStr: string;
  departureTimeStr: string;
  baggagePieces?: number;
}

interface OrderState {
  searchParams: SearchParams | null;
  selectedPackageSku: PackageSku | null;
  selectedAddonSkus: AddonSku[];
  currentOrder: StopoverOrder | null;
  isDemoMode: boolean;
  demoLogs: string[];
  
  // Actions
  setSearchParams: (params: SearchParams) => void;
  selectPackage: (sku: PackageSku) => void;
  toggleAddon: (sku: AddonSku) => void;
  clearCustomizations: () => void;
  createOrder: () => StopoverOrder;
  transitionOrder: (trigger: string, contextMessage?: string) => void;
  triggerBaggageUpdate: (status: BaggageStatus, location: string, description: string) => void;
  triggerTourUpdate: (status: 'scheduled' | 'ongoing' | 'returning' | 'completed' | 'delayed') => void;
  toggleDemoMode: (val: boolean) => void;
  addDemoLog: (log: string) => void;
  resetStore: () => void;
}

const airlineByPrefix: Record<string, string> = {
  EK: '阿联酋航空',
  QR: '卡塔尔航空',
  SQ: '新加坡航空',
  TK: '土耳其航空',
  TR: '酷航',
};

function getAirlineName(flightNo: string) {
  return airlineByPrefix[flightNo.substring(0, 2).toUpperCase()] ?? '合作航司';
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      searchParams: null,
      selectedPackageSku: null,
      selectedAddonSkus: [],
      currentOrder: null,
      isDemoMode: true, // Default to demo mode for Vibe Coding
      demoLogs: ['系统初始化成功，准备中转行程模拟...'],

      setSearchParams: (params) => set({ searchParams: params }),
      selectPackage: (sku) => set({ selectedPackageSku: sku }),
      
      toggleAddon: (sku) => set((state) => {
        const index = state.selectedAddonSkus.indexOf(sku);
        if (index > -1) {
          return { selectedAddonSkus: state.selectedAddonSkus.filter((s) => s !== sku) };
        } else {
          return { selectedAddonSkus: [...state.selectedAddonSkus, sku] };
        }
      }),

      clearCustomizations: () => set({ selectedPackageSku: null, selectedAddonSkus: [] }),

      toggleDemoMode: (val) => set({ isDemoMode: val }),

      addDemoLog: (log) => set((state) => ({
        demoLogs: [`[${new Date().toLocaleTimeString()}] ${log}`, ...state.demoLogs]
      })),

      createOrder: () => {
        const { searchParams, selectedPackageSku, selectedAddonSkus } = get();
        if (!searchParams || !selectedPackageSku) {
          throw new Error('Missing search params or package selection');
        }

        const selectedPkg = packages.find((p) => p.sku === selectedPackageSku)!;
        const selectedAirport = airports.find((a) => a.code === searchParams.airportCode)!;

        // Mock flight details
        const arrivalFlight: Flight = {
          flightNo: searchParams.arrivalFlightNo,
          airline: getAirlineName(searchParams.arrivalFlightNo),
          from: 'PVG',
          to: searchParams.airportCode,
          arrivalTime: dayjs(searchParams.arrivalTimeStr).toISOString(),
          departureTime: dayjs(searchParams.arrivalTimeStr).subtract(5, 'hour').toISOString(),
          terminal: 'T3',
        };

        const departureFlight: Flight = {
          flightNo: searchParams.departureFlightNo,
          airline: getAirlineName(searchParams.departureFlightNo),
          from: searchParams.airportCode,
          to: 'LHR',
          arrivalTime: dayjs(searchParams.departureTimeStr).add(12, 'hour').toISOString(),
          departureTime: dayjs(searchParams.departureTimeStr).toISOString(),
          terminal: 'T1',
        };

        const orderId = 'SO' + Math.floor(100000 + Math.random() * 900000);
        const rfidTag = 'RFID' + Math.floor(10000000 + Math.random() * 90000000);
        const baggagePieces = Math.max(0, searchParams.baggagePieces ?? 1);

        // Calculate amounts
        let totalAmount = selectedPkg.price;
        // Sum addon prices
        selectedAddonSkus.forEach((addonSku) => {
          if (selectedPkg.addons.includes(addonSku)) {
            totalAmount += addons.find((addon) => addon.sku === addonSku)?.price ?? 0;
          }
        });

        // All three PRD packages include either luggage storage or full托管.
        const hasBaggage = true;
        const baggage: BaggageTracking | undefined = hasBaggage ? {
          trackingId: 'BAG' + Math.floor(100000 + Math.random() * 900000),
          orderId,
          rfidTag,
          pieceCount: baggagePieces,
          pickupAt: dayjs(arrivalFlight.arrivalTime).toISOString(),
          currentLocation: selectedAirport.nameZh + ' - 待收件',
          status: 'received' as const,
          photoUrl: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&q=80&w=600',
          history: [
            {
              status: 'received',
              timestamp: dayjs(arrivalFlight.arrivalTime).format('HH:mm:ss'),
              location: '中转柜台系统联通',
              description: '系统已成功关联行李，等待旅客抵达柜台后交付办理。'
            }
          ]
        } : undefined;

        // Setup City Tour if micro
        const selectedRoute = tourRoutes.find((route) => route.id === selectedAirport.cityTourRoutes[0]);
        const cityTour = selectedPkg.sku === 'micro' ? {
          routeId: selectedAirport.cityTourRoutes[0],
          routeName: selectedRoute?.name ?? `${selectedAirport.nameZh}经典 4 小时微游`,
          departureTime: '09:00',
          guideId: 'GUIDE88',
          guideName: '陈向导 (John Chen)',
          guidePhone: '+65 8812 3456',
          vehicleId: 'VEH99',
          vehicleNo: 'SBS 8888Y',
          status: 'scheduled' as const
        } : undefined;

        // Setup Hotel if overnight
        const hotel = selectedPkg.sku === 'overnight' ? {
          hotelId: 'HOTEL101',
          hotelName: selectedAirport.code === 'SIN' ? '新加坡樟宜机场皇冠假日酒店' : '多哈机场航站楼酒店',
          roomNo: '8402',
          checkIn: '14:00',
          checkOut: '20:00'
        } : undefined;

        const newOrder: StopoverOrder = {
          orderId,
          userId: 'USER_WEI',
          arrivalFlight,
          departureFlight,
          layoverAirport: searchParams.airportCode,
          layoverHours: searchParams.layoverHours,
          totalTransitHours: searchParams.totalTransitHours,
          package: selectedPkg,
          addons: selectedAddonSkus,
          totalAmount,
          status: 'paid',
          createdAt: new Date().toISOString(),
          baggage,
          cityTour,
          hotel
        };

        set({
          currentOrder: newOrder,
          demoLogs: [`[${new Date().toLocaleTimeString()}] 订单 ${orderId} 创建并支付成功！状态：已支付。`]
        });

        return newOrder;
      },

      transitionOrder: (trigger, contextMessage) => {
        const { currentOrder } = get();
        if (!currentOrder) return;

        const nextStatus = getNextStatus(currentOrder.status, trigger);
        if (nextStatus === currentOrder.status) return;

        // Update baggage tracking status if needed based on order status transitions
        let updatedBaggage = currentOrder.baggage;
        if (updatedBaggage) {
          let bagStatus: BaggageStatus = updatedBaggage.status;
          let bagLoc = updatedBaggage.currentLocation;
          let bagDesc = '';
          let bagTime = '';

          const arrTime = dayjs(currentOrder.arrivalFlight.arrivalTime);
          const depTime = dayjs(currentOrder.departureFlight.departureTime);

          if (trigger === 'RECEIVE_BAGGAGE') {
            bagStatus = 'received';
            bagLoc = '中转服务台';
            bagDesc = '行李已在中转柜台交付收取，RFID 标签已激活绑定并开始托管。';
            bagTime = arrTime.add(20, 'minute').format('HH:mm:ss');
          } else if (trigger === 'ENTER_LOUNGE') {
            bagStatus = 'at_lounge';
            bagLoc = 'T1 环亚贵宾厅寄存库';
            bagDesc = '行李已安全运抵贵宾厅专属行李托管库。';
            bagTime = arrTime.add(50, 'minute').format('HH:mm:ss');
          } else if (trigger === 'START_CITY_TOUR') {
            bagStatus = 'in_transit';
            bagLoc = '机场贵宾厅寄存中心';
            bagDesc = '旅客出发前往市区微游，行李在机场贵宾厅妥善保管中。';
            bagTime = arrTime.add(45, 'minute').format('HH:mm:ss');
          } else if (trigger === 'CHECK_IN_HOTEL') {
            bagStatus = 'at_hotel';
            bagLoc = currentOrder.hotel?.hotelName + ' ' + currentOrder.hotel?.roomNo + '房';
            bagDesc = '专车运送，行李已送达合作酒店前台并配送至房间。';
            bagTime = arrTime.add(90, 'minute').format('HH:mm:ss');
          } else if (trigger === 'PREPARE_RETURN' || trigger === 'PREPARE_RETURN_FROM_TOUR' || trigger === 'CHECK_OUT') {
            bagStatus = 'returning';
            bagLoc = '登机口行李交接处';
            bagDesc = '行李已被专人从贵宾厅/酒店库取出，正运回安检口/登机口。';
            bagTime = depTime.subtract(90, 'minute').format('HH:mm:ss');
          } else if (trigger === 'BOARD') {
            bagStatus = 'delivered';
            bagLoc = '登机口 / 飞机货舱';
            bagDesc = '旅客在安检出口签收领回行李，行李转交装机，状态完成。';
            bagTime = depTime.subtract(60, 'minute').format('HH:mm:ss');
          }

          if (bagStatus !== updatedBaggage.status || bagLoc !== updatedBaggage.currentLocation) {
            updatedBaggage = {
              ...updatedBaggage,
              status: bagStatus,
              currentLocation: bagLoc,
              history: [
                ...updatedBaggage.history,
                {
                  status: bagStatus,
                  timestamp: bagTime || dayjs().format('HH:mm:ss'),
                  location: bagLoc,
                  description: bagDesc
                }
              ]
            };
          }
        }

        // Update city tour status based on order status transitions
        let updatedCityTour = currentOrder.cityTour;
        if (updatedCityTour) {
          if (trigger === 'START_CITY_TOUR') {
            updatedCityTour = { ...updatedCityTour, status: 'ongoing' };
          } else if (trigger === 'ENTER_LOUNGE_AFTER_TOUR') {
            updatedCityTour = { ...updatedCityTour, status: 'completed' };
          } else if (trigger === 'PREPARE_RETURN_FROM_TOUR') {
            updatedCityTour = { ...updatedCityTour, status: 'returning' };
          } else if (trigger === 'TIMEOUT') {
            updatedCityTour = { ...updatedCityTour, status: 'delayed' };
          }
        }

        const logMsg = contextMessage || `订单状态流转：${currentOrder.status} -> ${nextStatus}`;
        
        set((state) => ({
          currentOrder: state.currentOrder ? {
            ...state.currentOrder,
            status: nextStatus,
            baggage: updatedBaggage,
            cityTour: updatedCityTour
          } : null,
          demoLogs: [`[${new Date().toLocaleTimeString()}] ${logMsg}`, ...state.demoLogs]
        }));
      },

      triggerBaggageUpdate: (status, location, description) => {
        const { currentOrder } = get();
        if (!currentOrder || !currentOrder.baggage) return;

        let bagTime = '';
        const arrTime = dayjs(currentOrder.arrivalFlight.arrivalTime);
        const depTime = dayjs(currentOrder.departureFlight.departureTime);

        if (status === 'received') {
          bagTime = arrTime.add(20, 'minute').format('HH:mm:ss');
        } else if (status === 'at_lounge') {
          bagTime = arrTime.add(50, 'minute').format('HH:mm:ss');
        } else if (status === 'in_transit') {
          bagTime = arrTime.add(45, 'minute').format('HH:mm:ss');
        } else if (status === 'at_hotel') {
          bagTime = arrTime.add(90, 'minute').format('HH:mm:ss');
        } else if (status === 'returning') {
          bagTime = depTime.subtract(90, 'minute').format('HH:mm:ss');
        } else if (status === 'delivered') {
          bagTime = depTime.subtract(60, 'minute').format('HH:mm:ss');
        }

        const updatedBaggage = {
          ...currentOrder.baggage,
          status,
          currentLocation: location,
          history: [
            ...currentOrder.baggage.history,
            {
              status,
              timestamp: bagTime || dayjs().format('HH:mm:ss'),
              location,
              description
            }
          ]
        };

        set((state) => ({
          currentOrder: state.currentOrder ? {
            ...state.currentOrder,
            baggage: updatedBaggage
          } : null,
          demoLogs: [`[${new Date().toLocaleTimeString()}] 行李状态更新：${status} (${location}) - ${description}`, ...state.demoLogs]
        }));
      },

      triggerTourUpdate: (status) => {
        const { currentOrder } = get();
        if (!currentOrder || !currentOrder.cityTour) return;

        const updatedCityTour = {
          ...currentOrder.cityTour,
          status
        };

        set((state) => ({
          currentOrder: state.currentOrder ? {
            ...state.currentOrder,
            cityTour: updatedCityTour
          } : null,
          demoLogs: [`[${new Date().toLocaleTimeString()}] 城市微游调度状态更新：${status}`, ...state.demoLogs]
        }));
      },

      resetStore: () => set({
        searchParams: null,
        selectedPackageSku: null,
        selectedAddonSkus: [],
        currentOrder: null,
        demoLogs: ['系统已重置。']
      })
    }),
    {
      name: 'stopover-order-storage', // unique name for localStorage key
    }
  )
);

export function getMockOrderForCaseId(caseId: string): StopoverOrder | null {
  const caseItem = mockFlightCases.find(c => c.id === caseId);
  if (!caseItem) return null;

  let sku: PackageSku = 'light';
  if (caseId === 'case-10h') sku = 'micro';
  else if (caseId === 'case-23h' || caseId === 'case-35h') sku = 'overnight';

  const pkg = packages.find(p => p.sku === sku) ?? packages[0];
  const airport = airports.find(a => a.code === caseItem.airportCode) ?? airports[0];

  const arrivalFlight: Flight = {
    flightNo: caseItem.arrivalFlightNo,
    airline: caseItem.arrivalAirline,
    from: 'PVG',
    to: caseItem.airportCode,
    arrivalTime: dayjs(caseItem.arrivalTimeStr).toISOString(),
    departureTime: dayjs(caseItem.arrivalTimeStr).subtract(5, 'hour').toISOString(),
    terminal: 'T3',
  };

  const departureFlight: Flight = {
    flightNo: caseItem.departureFlightNo,
    airline: caseItem.departureAirline,
    from: caseItem.airportCode,
    to: 'LHR',
    arrivalTime: dayjs(caseItem.departureTimeStr).add(12, 'hour').toISOString(),
    departureTime: dayjs(caseItem.departureTimeStr).toISOString(),
    terminal: 'T1',
  };

  const orderId = caseId;
  const rfidTag = 'RFID' + Math.floor(10000000 + Math.random() * 90000000);

  const baggage: BaggageTracking = {
    trackingId: 'BAG' + Math.floor(100000 + Math.random() * 900000),
    orderId,
    rfidTag,
    pieceCount: 1,
    pickupAt: dayjs(arrivalFlight.arrivalTime).toISOString(),
    currentLocation: airport.nameZh + (sku === 'overnight' ? ' - 酒店送达' : ' - 贵宾厅托管'),
    status: sku === 'overnight' ? 'at_hotel' : 'at_lounge',
    photoUrl: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&q=80&w=600',
    history: [
      {
        status: 'received',
        timestamp: dayjs(arrivalFlight.arrivalTime).add(20, 'minute').format('HH:mm:ss'),
        location: '中转柜台系统联通',
        description: '系统已成功关联行李，并已于中转柜台交付收取。'
      },
      {
        status: sku === 'overnight' ? 'at_hotel' : 'at_lounge',
        timestamp: dayjs(arrivalFlight.arrivalTime).add(50, 'minute').format('HH:mm:ss'),
        location: sku === 'overnight' ? '合作酒店前台' : 'T1 环亚贵宾厅寄存库',
        description: sku === 'overnight' ? '行李已安全运抵合作酒店前台并配送至房间。' : '行李已妥善存放入贵宾厅托管库。'
      }
    ]
  };

  const selectedRoute = tourRoutes.find((route) => route.id === airport.cityTourRoutes[0]);
  const cityTour = sku === 'micro' || caseId === 'case-35h' ? {
    routeId: airport.cityTourRoutes[0],
    routeName: selectedRoute?.name ?? `${airport.nameZh}经典 4 小时微游`,
    departureTime: '09:00',
    guideId: 'GUIDE88',
    guideName: '陈向导 (John Chen)',
    guidePhone: '+65 8812 3456',
    vehicleId: 'VEH99',
    vehicleNo: 'SBS 8888Y',
    status: 'ongoing' as const
  } : undefined;

  const hotel = sku === 'overnight' ? {
    hotelId: 'HOTEL101',
    hotelName: airport.code === 'SIN' ? '新加坡樟宜机场皇冠假日酒店' : '多哈机场航站楼酒店',
    roomNo: '8402',
    checkIn: '14:00',
    checkOut: '20:00'
  } : undefined;

  return {
    orderId,
    userId: 'USER_WEI',
    arrivalFlight,
    departureFlight,
    layoverAirport: caseItem.airportCode,
    layoverHours: caseItem.calculatedLayover,
    totalTransitHours: caseItem.calculatedLayover,
    package: pkg,
    addons: sku === 'micro' ? ['esim'] : [],
    totalAmount: pkg.price,
    status: 'paid',
    createdAt: new Date().toISOString(),
    baggage,
    cityTour,
    hotel
  };
}
