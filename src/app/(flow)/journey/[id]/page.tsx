'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/store/orderStore';
import { tourRoutes, airports, addons } from '@/lib/mockData';
import { BaggageStatus } from '@/lib/types';
import { 
  Briefcase, Clock, Compass, ShieldCheck, MapPin, 
  User, Phone, Car, ShieldAlert, Award, Wifi, 
  Coffee, RefreshCw, AlertTriangle, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JourneyPage({ params }: PageProps) {
  const router = useRouter();
  const { currentOrder, transitionOrder } = useOrderStore();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'baggage' | 'itinerary' | 'addons'>('baggage');

  useEffect(() => {
    params.then((res) => setOrderId(res.id));
  }, [params]);

  if (!currentOrder || (orderId && currentOrder.orderId !== orderId)) {
    return (
      <div className="flex-1 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">未找到对应行程信息</h2>
        <p className="text-xs text-slate-500 mt-2">请确认您的订单号。</p>
        <Link href="/search" className="inline-block mt-4 px-6 py-2 bg-primary text-white text-xs font-semibold rounded-xl">
          重新预订
        </Link>
      </div>
    );
  }

  const currentAirport = airports.find(a => a.code === currentOrder.layoverAirport)!;
  const tourDetail = currentOrder.cityTour ? tourRoutes.find(r => r.id === currentOrder.cityTour?.routeId) : null;

  // Formatting date
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Baggage timeline steps
  const baggageSteps: { status: BaggageStatus; label: string; desc: string }[] = [
    { status: 'received', label: '柜台收件', desc: '中转柜台已扫码贴标' },
    { status: 'in_transit', label: '内场转运', desc: '行李正送往专属仓库' },
    { status: 'at_lounge', label: '送抵保管', desc: '行李已送达贵宾室/酒店' },
    { status: 'returning', label: '出库运回', desc: '专人正将行李运送至归还点' },
    { status: 'delivered', label: '领回签收', desc: '旅客已认领，关联卡注销' }
  ];

  // Helper to determine step visual style in journey timeline
  const getBaggageStepIndex = (status: BaggageStatus) => {
    const order: BaggageStatus[] = ['received', 'in_transit', 'at_lounge', 'returning', 'delivered'];
    
    // overnight package baggage status could be 'at_hotel', map it to 'at_lounge' for visual step simplicity
    let currentStatus: BaggageStatus = status;
    if (status === 'at_hotel') currentStatus = 'at_lounge';

    return order.indexOf(currentStatus);
  };

  const currentBaggageStepIdx = currentOrder.baggage ? getBaggageStepIndex(currentOrder.baggage.status) : -1;

  return (
    <div className="flex-1 py-8 px-6 max-w-7xl mx-auto w-full">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400">实时行程追踪面板</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">实时定位已连接</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>正在追踪 {currentOrder.orderId} 的中转行程</span>
          </h1>
        </div>

        <Link 
          href={`/order/${currentOrder.orderId}`}
          className="text-xs bg-white border border-slate-200 hover:border-slate-300 font-bold px-4 py-2.5 rounded-xl text-slate-700 transition-colors shadow-sm"
        >
          查看电子凭证 (QR)
        </Link>
      </div>

      {/* Extreme Delay / Missed Flight Guarantee Alert */}
      {currentOrder.status === 'missed_flight' && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 animate-bounce">
            <ShieldAlert size={26} />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-rose-800 text-lg mb-1">⚠️ 触发中转“无忧保障计划” (SOP 启动)</h3>
            <p className="text-xs text-rose-700 leading-relaxed mb-4">
              因城市微游路况延误，致使您未能于登机前 60 分钟到达安检口，系统已自动判定误机并触发安全托管应急机制。
            </p>
            
            <div className="bg-white/80 rounded-2xl p-4 border border-rose-100 text-xs text-slate-700 leading-relaxed mb-4 space-y-2">
              <div className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">1.</span>
                <span>我们已为您改签至后段航班 <strong>SQ322 (新加坡港 → 伦敦希思罗)</strong>，起飞时间延后 4 小时，改签手续费已全额垫付。</span>
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
              点击一键申请退还套餐费
            </button>
          </div>
        </div>
      )}

      {currentOrder.status === 'refunded' && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 mb-8 flex gap-5 items-start">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle size={26} />
          </div>
          <div>
            <h3 className="font-extrabold text-emerald-800 text-lg mb-1">✓ 误机险赔付成功，理赔已入账</h3>
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
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('baggage')}
          className={`flex-1 py-3 font-bold text-sm text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'baggage' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase size={16} />
          <span>行李智能全托管 ({currentOrder.baggage ? '已开启' : '无行李'})</span>
        </button>
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex-1 py-3 font-bold text-sm text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'itinerary' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Compass size={16} />
          <span>中转行程履约明细</span>
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`flex-1 py-3 font-bold text-sm text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'addons' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wifi size={16} />
          <span>我的核销权益卡</span>
        </button>
      </div>

      {/* Tab Content 1: Baggage Tracking */}
      {activeTab === 'baggage' && (
        <div className="flex flex-col gap-6">
          {/* Main Baggage State Card */}
          {currentOrder.baggage ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
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
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">当前行李托管状态</span>
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
                    RFID 安全保障中
                  </span>
                </div>
                
                <h3 className="font-extrabold text-xl text-slate-800">
                  {currentOrder.baggage.currentLocation}
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  行李目前由中转仓储系统实时跟踪保护。离港航班起飞前 90 分钟，系统将指派服务人员自动将行李送抵指定登机口。
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">托运件数:</span>
                    <span className="text-slate-800">1件手提登机箱</span>
                  </div>
                  <div className="w-[1px] h-6 bg-slate-100" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">保障额度:</span>
                    <span className="text-emerald-600">最高赔付 ¥5,000</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center text-xs text-slate-500">
              您的套餐 (轻享包) 未包含行李全托管转运服务。随身行李寄存已通过机场自动寄存柜完成，请妥善保管提取钥匙。
            </div>
          )}

          {/* Timeline */}
          {currentOrder.baggage && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-6">RFID 全程转运生命周期</h4>
              
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
                          {matchedHistory ? matchedHistory.location : step.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {matchedHistory ? matchedHistory.description : step.desc}
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
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">已启用 {currentOrder.package.name} 产品服务线</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                中转港：{currentAirport.nameZh} | 总中转：{currentOrder.totalTransitHours}小时 (服务预留：{currentOrder.layoverHours}小时) | 限额内无门槛兑换履约
              </p>
            </div>
          </div>

          {/* Micro package city tour timetable */}
          {currentOrder.package.sku === 'micro' && tourDetail && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[9px] bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded font-bold">
                  标准化城市微游路线已指派
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 mt-2">
                  {tourDetail.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{tourDetail.description}</p>
              </div>

              {/* Guide & Car Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sand/30 p-4 rounded-2xl border border-slate-100">
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
                    <div key={index} className="flex gap-4 items-start text-xs">
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
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold">
                  过夜包星级合作酒店钟点房已开通
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 mt-2">
                  {currentOrder.hotel.hotelName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">机场内部或航站楼直连尊享，无需出航站楼即可快速入住。</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
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
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
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
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
              {/* QR */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center flex-shrink-0">
                <div className="w-28 h-28 bg-slate-300 flex items-center justify-center font-bold text-xs text-slate-500 rounded-lg">
                  [ eSIM QR CODE ]
                </div>
              </div>
              
              <div className="flex-grow space-y-2 text-xs">
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold">
                  中转地 eSIM 激活卡
                </span>
                <h3 className="font-bold text-slate-800">4G/5G 高速流量包 (5GB)已开通</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  请在飞机落地中转前，使用手机摄像头扫描左侧二维码即可将 eSIM 流量卡安装至蜂窝设置中。APN 将自动选择，无需换卡。
                </p>
                <div className="font-mono bg-slate-100 px-3 py-1.5 rounded text-[10px] text-slate-600 select-all inline-block font-semibold">
                  激活码：SMDP.IO$OVERSEASE-8899
                </div>
              </div>
            </div>
          )}

          {/* Meal Voucher */}
          {currentOrder.addons.includes('meal-voucher') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
              {/* Barcode */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 w-full md:w-48">
                <div className="h-12 bg-slate-800 w-full rounded flex items-center justify-center text-white font-mono text-[10px] tracking-[4px]">
                  ||||||||||||||||||
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1">9877-6544-2101</span>
              </div>
              
              <div className="flex-grow space-y-2 text-xs">
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
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex gap-4 items-center">
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
