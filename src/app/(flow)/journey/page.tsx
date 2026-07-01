'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrderStore, getMockOrderForCaseId } from '@/lib/store/orderStore';
import { tourRoutes, airports } from '@/lib/mockData';
import { BaggageStatus } from '@/lib/types';
import { formatHours, formatPieces, getPackageLabel, localizeAirport, t } from '@/lib/appPreferences';
import { useAppPreferences } from '@/components/features/AppPreferenceProvider';
import { 
  Briefcase, Clock, Compass, MapPin,
  User, Phone, Car, ShieldAlert, Wifi,
  CheckCircle, Sparkles, ChefHat, QrCode,
} from 'lucide-react';
import Link from 'next/link';

function localizeBaggageLocation(location: string, airportName: string, language: 'zh-CN' | 'en-US') {
  if (language === 'zh-CN') return location;

  if (location.includes('待收件')) return `${airportName} - Awaiting handoff`;
  if (location === '中转柜台系统联通') return 'Transit counter system linked';
  if (location === '中转服务台') return 'Transit service counter';
  if (location === 'T1 环亚贵宾厅寄存库') return 'T1 Plaza Premium Lounge storage';
  if (location === '机场贵宾厅寄存中心') return 'Airport lounge custody center';
  if (location === '登机口行李交接处') return 'Gate baggage handover point';
  if (location === '登机口 / 飞机货舱') return 'Gate / aircraft hold';
  if (location.includes('房')) return location.replace('房', ' room');
  return location;
}

function localizeBaggageDescription(description: string, language: 'zh-CN' | 'en-US') {
  if (language === 'zh-CN') return description;

  const descriptions: Record<string, string> = {
    '系统已成功关联行李，等待旅客抵达柜台后交付办理。':
      'Baggage is linked to the order and waiting for traveler handoff at the counter.',
    '行李已在中转柜台交付收取，RFID 标签已激活绑定并开始托管。':
      'Baggage has been handed over at the transit counter; RFID custody is active.',
    '行李已安全运抵贵宾厅专属行李托管库。':
      'Baggage has arrived safely at the dedicated lounge custody area.',
    '旅客出发前往市区微游，行李在机场贵宾厅妥善保管中。':
      'Traveler has started the city micro-tour; baggage remains secured at the airport lounge.',
    '专车运送，行李已送达合作酒店前台并配送至房间。':
      'Dedicated transfer has delivered baggage to the partner hotel front desk and room.',
    '行李已被专人从贵宾厅/酒店库取出，正运回安检口/登机口。':
      'Staff have collected baggage from lounge or hotel storage and are returning it to security or gate handover.',
    '旅客在安检出口签收领回行李，行李转交装机，状态完成。':
      'Traveler has signed for baggage near security; baggage is handed to flight loading and the state is complete.',
  };

  return descriptions[description] ?? description;
}

function JourneyContent() {
  const searchParams = useSearchParams();
  const { language } = useAppPreferences();
  const orderId = searchParams.get('id');
  const { currentOrder: storeOrder, transitionOrder } = useOrderStore();
  const [activeTab, setActiveTab] = useState<'baggage' | 'itinerary' | 'addons'>('baggage');

  // Resolve order: matching ID in store, or case ID fallback, or storeOrder, or case-10h fallback
  let currentOrder = null;
  if (orderId) {
    if (storeOrder && storeOrder.orderId === orderId) {
      currentOrder = storeOrder;
    } else {
      currentOrder = getMockOrderForCaseId(orderId);
    }
  } else {
    currentOrder = storeOrder || getMockOrderForCaseId('case-10h');
  }

  if (!currentOrder) {
    return (
      <div className="flex-1 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">{t(language, 'journey.notFound')}</h2>
        <p className="text-xs text-slate-500 mt-2">{t(language, 'journey.notFoundBody')}</p>
        <Link href="/search" className="inline-block mt-4 px-6 py-2 bg-primary text-white text-xs font-semibold rounded-xl">
          {t(language, 'nav.booking')}
        </Link>
      </div>
    );
  }

  const currentAirport = localizeAirport(airports.find(a => a.code === currentOrder.layoverAirport)!, language);
  const tourDetail = currentOrder.cityTour ? tourRoutes.find(r => r.id === currentOrder.cityTour?.routeId) : null;

  // Baggage timeline steps
  const baggageSteps: { status: BaggageStatus; label: string; desc: string }[] =
    language === 'zh-CN'
      ? [
          { status: 'received', label: '柜台收件', desc: '中转柜台已扫码贴标' },
          { status: 'in_transit', label: '内场转运', desc: '行李正送往专属仓库' },
          { status: 'at_lounge', label: '送抵保管', desc: '行李已送达贵宾室/酒店' },
          { status: 'returning', label: '出库运回', desc: '专人正将行李运送至归还点' },
          { status: 'delivered', label: '领回签收', desc: '旅客已认领，关联卡注销' },
        ]
      : [
          { status: 'received', label: 'Counter handoff', desc: 'Counter scan and RFID tag attached' },
          { status: 'in_transit', label: 'Airside transfer', desc: 'Baggage is moving to secure storage' },
          { status: 'at_lounge', label: 'In custody', desc: 'Baggage is stored at lounge or hotel' },
          { status: 'returning', label: 'Returning', desc: 'Staff are moving baggage to handover point' },
          { status: 'delivered', label: 'Signed return', desc: 'Traveler has reclaimed baggage' },
        ];

  // Helper to determine step visual style in journey timeline
  const getBaggageStepIndex = (status: BaggageStatus) => {
    const order: BaggageStatus[] = ['received', 'in_transit', 'at_lounge', 'returning', 'delivered'];
    
    // overnight package baggage status could be 'at_hotel', map it to 'at_lounge' for visual step simplicity
    let currentStatus: BaggageStatus = status;
    if (status === 'at_hotel') currentStatus = 'at_lounge';

    return order.indexOf(currentStatus);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-5 pb-24 sm:px-6 sm:py-8 md:pb-8">
      {/* Top Breadcrumb & Status */}
      <div className="mb-5 flex flex-col items-start justify-between gap-4 border-b border-slate-200/60 pb-5 md:mb-8 md:flex-row md:items-center md:pb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400">{t(language, 'flow.journey.title')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">{t(language, 'journey.live')}</span>
          </div>
          <h1 className="flex items-center gap-2 break-words text-xl font-black leading-tight text-slate-900 md:text-2xl">
            <span>
              {language === 'zh-CN'
                ? `正在追踪 ${currentOrder.orderId} 的中转行程`
                : `${t(language, 'journey.titlePrefix')} ${currentOrder.orderId}`}
            </span>
          </h1>
        </div>

        <Link 
          href={`/order?id=${currentOrder.orderId}`}
          className="w-full text-center text-xs bg-white border border-slate-200 hover:border-slate-300 font-bold px-4 py-3 rounded-xl text-slate-700 transition-colors shadow-sm md:w-auto md:py-2.5"
        >
          {t(language, 'journey.viewVoucher')}
        </Link>
      </div>

      {/* Extreme Delay / Missed Flight Guarantee Alert */}
      {currentOrder.status === 'missed_flight' && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-4 mb-5 flex flex-col gap-4 items-start md:mb-8 md:flex-row md:gap-5 md:p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 animate-bounce">
            <ShieldAlert size={26} />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-rose-800 text-base mb-1 md:text-lg">{t(language, 'journey.missedTitle')}</h3>
            <p className="text-xs text-rose-700 leading-relaxed mb-4">
              {language === 'zh-CN'
                ? '因城市微游路况延误，致使您未能于登机前 60 分钟到达安检口，系统已自动判定误机并触发安全托管应急机制。'
                : 'The city micro-tour return is late and the traveler did not reach security 60 minutes before departure. The missed-connection SOP is now active.'}
            </p>
            
            <div className="bg-white/80 rounded-2xl p-4 border border-rose-100 text-xs text-slate-700 leading-relaxed mb-4 space-y-2">
              <div className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">1.</span>
                <span>
                  我们已为您改签至后段航班{' '}
                  <strong>
                    {currentOrder.departureFlight.flightNo} ({currentAirport.nameZh} → {currentOrder.departureFlight.to})
                  </strong>
                  ，起飞时间延后 4 小时，改签手续费已全额垫付。
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">2.</span>
                <span>您的行李已自动运往 <strong>T1 贵宾室行李分拨中心</strong>，无需办理重复提取托运，您可在贵宾厅继续享受淋浴与餐食。</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">3.</span>
                <span>加赠 ¥500 误机慰问金，您可随时联系在线客服进行提取。</span>
              </div>
            </div>

            <button
              onClick={() => transitionOrder('REFUND', '旅客触发误机保险理赔，套餐全额退款成功！')}
              className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
            >
              {t(language, 'journey.refund')}
            </button>
          </div>
        </div>
      )}

      {currentOrder.status === 'refunded' && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-4 mb-5 flex gap-4 items-start md:mb-8 md:gap-5 md:p-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle size={26} />
          </div>
          <div>
            <h3 className="font-extrabold text-emerald-800 text-base mb-1 md:text-lg">
              {language === 'zh-CN' ? '误机险赔付成功，理赔已入账' : 'Missed-connection refund completed'}
            </h3>
            <p className="text-xs text-emerald-700 leading-relaxed mb-1">
              套餐实付金额 <strong>¥{currentOrder.totalAmount}</strong> 已全额退款原路退回。
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              改签机票已出，您的行李将在重新起飞前 60 分钟送达新航班登机口，请妥善安排后续候机时间。
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto border-b-0 pb-1 md:mb-6 md:gap-0 md:border-b md:border-slate-200 md:overflow-visible md:pb-0">
        <button
          onClick={() => setActiveTab('baggage')}
          className={`min-w-[165px] flex-1 rounded-2xl border px-3 py-3 font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 md:min-w-0 md:rounded-none md:border-x-0 md:border-t-0 md:border-b-2 md:text-sm ${
            activeTab === 'baggage' 
              ? 'border-primary bg-white text-primary shadow-sm md:bg-transparent md:shadow-none' 
              : 'border-slate-200 bg-white/70 text-slate-500 hover:text-slate-700 md:border-transparent md:bg-transparent'
          }`}
        >
          <Briefcase size={16} />
          <span>{t(language, 'journey.baggageTab')}</span>
        </button>
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`min-w-[165px] flex-1 rounded-2xl border px-3 py-3 font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 md:min-w-0 md:rounded-none md:border-x-0 md:border-t-0 md:border-b-2 md:text-sm ${
            activeTab === 'itinerary' 
              ? 'border-primary bg-white text-primary shadow-sm md:bg-transparent md:shadow-none' 
              : 'border-slate-200 bg-white/70 text-slate-500 hover:text-slate-700 md:border-transparent md:bg-transparent'
          }`}
        >
          <Compass size={16} />
          <span>{t(language, 'journey.itineraryTab')}</span>
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`min-w-[165px] flex-1 rounded-2xl border px-3 py-3 font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 md:min-w-0 md:rounded-none md:border-x-0 md:border-t-0 md:border-b-2 md:text-sm ${
            activeTab === 'addons' 
              ? 'border-primary bg-white text-primary shadow-sm md:bg-transparent md:shadow-none' 
              : 'border-slate-200 bg-white/70 text-slate-500 hover:text-slate-700 md:border-transparent md:bg-transparent'
          }`}
        >
          <Wifi size={16} />
          <span>{t(language, 'journey.addonsTab')}</span>
        </button>
      </div>

      {/* Tab Content 1: Baggage Tracking */}
      {activeTab === 'baggage' && (
        <div className="flex flex-col gap-6">
          {/* Main Baggage State Card */}
          {currentOrder.baggage ? (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4 items-center sm:p-6 md:flex-row md:gap-6">
              {/* Photo Mock */}
              <div 
                className="w-full md:w-48 h-36 bg-cover bg-center rounded-2xl border border-slate-200 flex-shrink-0 relative overflow-hidden"
                style={{ backgroundImage: `url(${currentOrder.baggage.photoUrl})` }}
              >
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-[9px] text-white px-2 py-0.5 rounded font-mono">
                  RFID: {currentOrder.baggage.rfidTag}
                </div>
              </div>
              
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t(language, 'journey.baggageStatus')}</span>
                  <span className="shrink-0 text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
                    {t(language, 'journey.rfid')}
                  </span>
                </div>
                
                <h3 className="font-extrabold text-lg text-slate-800 md:text-xl">
                  {localizeBaggageLocation(currentOrder.baggage.currentLocation, currentAirport.nameZh, language)}
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t(language, 'journey.baggageBody')}
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">{t(language, 'journey.pieces')}:</span>
                    <span className="text-slate-800">{formatPieces(currentOrder.baggage.pieceCount ?? 1, language)}</span>
                  </div>
                  <div className="w-[1px] h-6 bg-slate-100" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">{t(language, 'journey.coverage')}:</span>
                    <span className="text-emerald-600">{language === 'zh-CN' ? '最高赔付 ¥5,000' : 'Up to ¥5,000'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center text-xs text-slate-500">
              {language === 'zh-CN'
                ? '您的套餐未包含行李全托管转运服务。随身行李寄存已通过机场自动寄存柜完成，请妥善保管提取钥匙。'
                : 'This package does not include full baggage transfer. Carry-on storage is handled by the airport locker flow.'}
            </div>
          )}

          {/* Timeline */}
          {currentOrder.baggage && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm sm:p-6">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-5 md:mb-6">{t(language, 'journey.timeline')}</h4>
              
              <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {baggageSteps.map((step, idx) => {
                  const currentIdx = getBaggageStepIndex(currentOrder.baggage!.status);
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isUpcoming = idx > currentIdx;

                  // Find matched history description if completed or current
                  const matchedHistory = currentOrder.baggage?.history.find(h => {
                    if (step.status === 'at_lounge') {
                      return h.status === 'at_lounge' || h.status === 'at_hotel';
                    }
                    return h.status === step.status;
                  });

                  return (
                    <div key={step.status} className="relative flex flex-col md:flex-row gap-2 md:gap-8 items-start">
                      {/* Node circle */}
                      <div className={`absolute left-[-20px] top-1.5 w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                        isCompleted ? 'bg-primary border-primary' :
                        isCurrent ? 'bg-accent border-accent animate-pulse-glow animate-ping' :
                        'bg-white border-slate-300'
                      }`}>
                        {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                      </div>

                      <div className="flex-shrink-0 md:w-28 text-left">
                        <span className={`text-xs font-bold block ${
                          isCurrent ? 'text-accent' : isCompleted ? 'text-primary' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {matchedHistory ? matchedHistory.timestamp : '--:--'}
                        </span>
                      </div>

                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${isUpcoming ? 'text-slate-400' : 'text-slate-800'}`}>
                          {matchedHistory ? localizeBaggageLocation(matchedHistory.location, currentAirport.nameZh, language) : step.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {matchedHistory ? localizeBaggageDescription(matchedHistory.description, language) : step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Itinerary Details */}
      {activeTab === 'itinerary' && (
        <div className="flex flex-col gap-6">
          {/* Package brief */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-start gap-3 sm:p-6 sm:items-center sm:gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                {t(language, 'journey.serviceLine')}: {getPackageLabel(currentOrder.package.sku, language)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t(language, 'journey.airport')}: {currentAirport.nameZh} | {language === 'zh-CN' ? '总中转' : 'Total'}: {formatHours(currentOrder.totalTransitHours, language)} ({language === 'zh-CN' ? '服务预留' : 'reserved'}: {formatHours(currentOrder.layoverHours, language)})
              </p>
            </div>
          </div>

          {/* Micro package city tour timetable */}
          {currentOrder.package.sku === 'micro' && tourDetail && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col gap-5 sm:p-6 md:gap-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[9px] bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded font-bold">
                  标准化城市微游路线已指派
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-2 md:text-lg">
                  {tourDetail.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{tourDetail.description}</p>
              </div>

              {/* Guide & Car Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sand/30 p-3 rounded-2xl border border-slate-100 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-500">
                    陈
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 block">指派中文向导</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <User size={12} className="text-slate-400" />
                      {currentOrder.cityTour?.guideName}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Phone size={10} className="text-slate-400" />
                      {currentOrder.cityTour?.guidePhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200/60 pt-3 md:pt-0 md:pl-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                    <Car size={20} />
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 block">接驳接送专车</span>
                    <span className="font-bold text-slate-800 block mt-0.5">{currentOrder.cityTour?.vehicleNo}</span>
                    <span className="text-[10px] text-slate-500 block">车型：高档 7 座商务丰田阿尔法</span>
                  </div>
                </div>
              </div>

              {/* Detailed Tour Hourly Timeline */}
              <div>
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">微游时间单细则 (向导严格把控)</h4>
                <div className="space-y-4">
                  {tourDetail.schedule.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start text-xs sm:gap-4">
                      <span className="font-mono font-bold text-primary bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100 flex-shrink-0">
                        {item.time}
                      </span>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{item.activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Overnight package hotel voucher */}
          {currentOrder.package.sku === 'overnight' && currentOrder.hotel && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col gap-5 sm:p-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold">
                  过夜包星级合作酒店钟点房已开通
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-2 md:text-lg">
                  {currentOrder.hotel.hotelName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">机场内部或航站楼直连尊享，无需出航站楼即可快速入住。</p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3 sm:gap-4">
                <div className="bg-sand/30 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 block">房间号</span>
                  <span className="text-base font-extrabold text-slate-800">{currentOrder.hotel.roomNo}</span>
                </div>
                <div className="bg-sand/30 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 block">已租时段</span>
                  <span className="text-sm font-bold text-slate-800">6 小时</span>
                </div>
                <div className="bg-sand/30 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 block">接驳服务</span>
                  <span className="text-sm font-bold text-slate-800">专车接送已含</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                👉 <strong>入住与离店办理</strong>：专车会将您从航站楼中转服务点直送至酒店前台。出示护照即可免押金办卡入住。退房后，专车会在大堂等候送回出发大厅，行李转运团队会自动完成海关复运。
              </div>
            </div>
          )}

          {/* Light package Lounge brief */}
          {currentOrder.package.sku === 'light' && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4 sm:p-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-base">机场贵宾休息室准入指南</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">免出关，安检内极致补给体验</p>
              </div>
              
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex gap-2">
                  <MapPin className="text-primary flex-shrink-0 mt-0.5" size={14} />
                  <div>
                    <span className="font-semibold block text-slate-800">贵宾厅位置：</span>
                    <span>{currentAirport.loungeLocation} (支持安检内直接步行前往)</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Clock className="text-primary flex-shrink-0 mt-0.5" size={14} />
                  <div>
                    <span className="font-semibold block text-slate-800">尊享时限：</span>
                    <span>3 小时无门槛使用，包含全套自助餐饮、淋浴间使用权及按摩椅。</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Value Addons vouchers */}
      {activeTab === 'addons' && (
        <div className="flex flex-col gap-6">
          {/* eSIM Voucher */}
          {currentOrder.addons.includes('esim') && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4 items-center sm:p-6 md:flex-row md:gap-6">
              {/* QR */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center flex-shrink-0">
                <div className="w-28 h-28 bg-slate-300 flex items-center justify-center font-bold text-xs text-slate-500 rounded-lg">
                  [ eSIM QR CODE ]
                </div>
              </div>
              
              <div className="flex-grow space-y-2 text-xs text-center md:text-left">
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded font-bold">
                  中转地 eSIM 激活卡
                </span>
                <h3 className="font-bold text-slate-800">4G/5G 高速流量包 (5GB)已开通</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  请在飞机落地中转前，使用手机摄像头扫描左侧二维码即可将 eSIM 流量卡安装至蜂窝设置中。APN 将自动选择，无需换卡。
                </p>
                <div className="max-w-full break-all font-mono bg-slate-100 px-3 py-1.5 rounded text-[10px] text-slate-600 select-all inline-block font-semibold">
                  激活码：SMDP.IO$OVERSEASE-8899
                </div>
              </div>
            </div>
          )}



          {/* Meal Voucher */}
          {currentOrder.addons.includes('meal-voucher') && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4 items-center sm:p-6 md:flex-row md:gap-6">
              {/* Barcode */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 w-full md:w-48">
                <div className="h-12 bg-slate-800 w-full rounded flex items-center justify-center text-white font-mono text-[10px] tracking-[4px]">
                  ||||||||||||||||||
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1">9877-6544-2101</span>
              </div>
              
              <div className="flex-grow space-y-2 text-xs text-center md:text-left">
                <span className="text-[9px] bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded font-bold">
                  机场地标美食核销餐饮券 (¥100面值)
                </span>
                <h3 className="font-bold text-slate-800">立享无门槛抵扣 ¥100 元</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  可用于中转航站楼商业街、星耀樟宜等合作商铺。结账时向收银员出示上方条形码扫码即可全额扣减。
                </p>
              </div>
            </div>
          )}

          {/* Transfer */}
          {currentOrder.addons.includes('transfer') && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex gap-3 items-start sm:p-6 sm:gap-4 sm:items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                <Car size={20} />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-800">往返市区/酒店双向专车特权已开启</h4>
                <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  到达航站楼出站口时，双语司机会举牌迎接您，行李将会放置在后备箱，直达目的地。
                </p>
              </div>
            </div>
          )}

          {/* If no addons, show tip */}
          {!currentOrder.addons.includes('esim') && !currentOrder.addons.includes('meal-voucher') && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center text-xs text-slate-500">
              您当前没有订购单点增值项（如 eSIM 流量包、餐饮消费券）。在套餐内含的贵宾室或微游服务已足够保障您的基础中转体验。
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function JourneyPage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center py-20 text-xs text-slate-500">正在加载中转行程面板...</div>}>
      <Suspense fallback={<div className="text-xs">Loading...</div>}>
        <JourneyContent />
      </Suspense>
    </Suspense>
  );
}
