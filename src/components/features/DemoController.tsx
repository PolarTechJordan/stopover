'use client';

import React, { useEffect, useState } from 'react';
import { useOrderStore } from '@/lib/store/orderStore';
import { getAvailableTriggers, orderTransitions } from '@/lib/state-machine/orderState';
import { OrderStatus } from '@/lib/types';
import { getPackageLabel } from '@/lib/appPreferences';
import { useAppPreferences } from '@/components/features/AppPreferenceProvider';
import { 
  Terminal, RotateCcw,
  Activity, ChevronDown, ChevronUp, HelpCircle, ShieldAlert 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const orderStatusLabels: Record<OrderStatus, { zh: string; en: string }> = {
  paid: { zh: '已支付', en: 'Paid' },
  baggage_received: { zh: '已交托行李', en: 'Baggage received' },
  in_lounge: { zh: '贵宾室休息中', en: 'In lounge' },
  in_city_tour: { zh: '城市微游中', en: 'On city micro-tour' },
  at_hotel: { zh: '合作酒店休息中', en: 'At partner hotel' },
  baggage_returning: { zh: '行李运送回中', en: 'Baggage returning' },
  boarded: { zh: '已领回行李/登机', en: 'Boarded' },
  completed: { zh: '行程已圆满完成', en: 'Trip completed' },
  missed_flight: { zh: '发生误机事件', en: 'Missed-flight event' },
  refunded: { zh: '误机险已赔付/退款', en: 'Refund issued' },
};

const transitionLabels: Record<string, { zh: string; en: string }> = {
  RECEIVE_BAGGAGE: {
    zh: '中转柜台收取托运行李，贴上 RFID 电子标签',
    en: 'Counter receives checked baggage and applies RFID tags',
  },
  ENTER_LOUNGE: {
    zh: '旅客进入机场贵宾室休息，行李转运至贵宾室专用寄存区',
    en: 'Traveler enters the lounge while baggage moves to the dedicated storage area',
  },
  START_CITY_TOUR: {
    zh: '旅客登上专属接送车，开启城市半日游/一日游',
    en: 'Traveler boards the dedicated transfer and starts the city micro-tour',
  },
  CHECK_IN_HOTEL: {
    zh: '旅客乘专车抵达合作酒店，办理入住，行李直送至房间',
    en: 'Traveler checks in at the partner hotel while baggage is delivered to the room',
  },
  ENTER_LOUNGE_AFTER_TOUR: {
    zh: '城市微游结束，专车送回机场，旅客进入贵宾厅享用餐食',
    en: 'Tour ends, transfer returns to airport, traveler enters lounge for dining',
  },
  CHECK_IN_HOTEL_AFTER_TOUR: {
    zh: '微游结束，专车送往合作酒店进行跨夜休息',
    en: 'Tour ends and transfer continues to the partner hotel for overnight rest',
  },
  PREPARE_RETURN: {
    zh: '离境航班起飞前 90 分钟，行李服务处开始将托管行李运往归还点',
    en: '90 minutes before departure, baggage custody starts return delivery',
  },
  PREPARE_RETURN_FROM_TOUR: {
    zh: '离境起飞时间临近，微游返程，行李运往机场归还点',
    en: 'As departure approaches, the tour returns and baggage moves to the airport return point',
  },
  CHECK_OUT: {
    zh: '酒店退房，专车送回机场，行李运往机场归还点',
    en: 'Hotel checkout starts, transfer returns to airport, baggage moves to return point',
  },
  BOARD: {
    zh: '旅客签收领回行李，完成快速安检，顺利登机',
    en: 'Traveler signs for baggage, clears fast-track security and boards',
  },
  COMPLETE: {
    zh: '中转旅程圆满完成，航段已起飞',
    en: 'Stopover journey is complete and the onward flight has departed',
  },
  TIMEOUT: {
    zh: '模拟路况异常或游客滞留，导致无法按时回机场，触发误机保障',
    en: 'Simulate traffic or traveler delay causing late airport return and protection trigger',
  },
  TIMEOUT_HOTEL: {
    zh: '因天气或特殊原因延误，触发误机保障',
    en: 'Weather or special delay triggers missed-flight protection',
  },
  REFUND: {
    zh: '启动“误机险”赔付流程，全额退款套餐费，并由客服协助改签下一班航班',
    en: 'Missed-flight coverage starts, package fee is refunded and support helps rebook',
  },
};

const stepLabels: Record<OrderStatus, { zh: string; en: string }> = {
  paid: { zh: '支付', en: 'Pay' },
  baggage_received: { zh: '托运', en: 'Bag' },
  in_lounge: { zh: '休息', en: 'Rest' },
  in_city_tour: { zh: '微游/休息', en: 'Tour/rest' },
  at_hotel: { zh: '酒店', en: 'Hotel' },
  baggage_returning: { zh: '返还', en: 'Return' },
  boarded: { zh: '登机', en: 'Board' },
  completed: { zh: '完结', en: 'Done' },
  missed_flight: { zh: '误机', en: 'Missed' },
  refunded: { zh: '退款', en: 'Refund' },
};

export default function DemoController() {
  const pathname = usePathname();
  const { language } = useAppPreferences();
  const { 
    currentOrder, transitionOrder, resetStore, demoLogs
  } = useOrderStore();
  const locale = language === 'zh-CN' ? 'zh' : 'en';
  const shouldDefaultOpen = pathname === '/order' || pathname === '/journey';
  
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return shouldDefaultOpen && !window.matchMedia('(max-width: 767px)').matches;
  });
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsOpen(shouldDefaultOpen && !event.matches);
    };

    mobileQuery.addEventListener('change', handleViewportChange);
    return () => mobileQuery.removeEventListener('change', handleViewportChange);
  }, [shouldDefaultOpen]);

  if (pathname === '/' || pathname === '/pitch') {
    return null;
  }

  if (!currentOrder) {
    if (pathname === '/search' || pathname === '/packages' || pathname === '/checkout') {
      return null;
    }

    return (
      <div className="fixed inset-x-3 bottom-3 z-50 hidden glass-card rounded-2xl p-4 shadow-xl border border-white/40 md:inset-x-auto md:bottom-6 md:right-6 md:block md:max-w-sm">
        <div className="flex items-center gap-2 text-primary font-bold mb-1">
          <Activity size={18} className="animate-pulse" />
          <span>{language === 'zh-CN' ? '中转游 Demo 演示控制台' : 'Stopover demo console'}</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          {language === 'zh-CN'
            ? '暂无活动订单。请先在页面中搜索航班并购买套餐以开启演示。'
            : 'No active order yet. Search flights and purchase a package to start the demo.'}
        </p>
        <Link 
          href="/search" 
          className="block w-full text-center py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-colors shadow-sm"
        >
          {language === 'zh-CN' ? '创建演示订单' : 'Create demo order'}
        </Link>
      </div>
    );
  }

  const availableTriggers = getAvailableTriggers(currentOrder.status);

  // Status mapping to Chinese titles and colors
  const statusConfig: Record<OrderStatus, { title: string; color: string; bg: string }> = {
    paid: { title: orderStatusLabels.paid[locale], color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    baggage_received: { title: orderStatusLabels.baggage_received[locale], color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    in_lounge: { title: orderStatusLabels.in_lounge[locale], color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    in_city_tour: { title: orderStatusLabels.in_city_tour[locale], color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    at_hotel: { title: orderStatusLabels.at_hotel[locale], color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    baggage_returning: { title: orderStatusLabels.baggage_returning[locale], color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    boarded: { title: orderStatusLabels.boarded[locale], color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    completed: { title: orderStatusLabels.completed[locale], color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    missed_flight: { title: orderStatusLabels.missed_flight[locale], color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    refunded: { title: orderStatusLabels.refunded[locale], color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' }
  };

  const currentStatusInfo = statusConfig[currentOrder.status] || { title: currentOrder.status, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };

  // Status list to render steps
  const orderSteps: { status: OrderStatus; label: string }[] = [
    { status: 'paid', label: stepLabels.paid[locale] },
    { status: 'baggage_received', label: stepLabels.baggage_received[locale] },
    { status: 'in_city_tour', label: stepLabels.in_city_tour[locale] },
    { status: 'baggage_returning', label: stepLabels.baggage_returning[locale] },
    { status: 'boarded', label: stepLabels.boarded[locale] },
    { status: 'completed', label: stepLabels.completed[locale] }
  ];

  // Helper to determine step visual state
  const getStepState = (status: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'paid', 'baggage_received', 'in_lounge', 'in_city_tour', 'at_hotel', 'baggage_returning', 'boarded', 'completed'
    ];
    
    // special cases
    const currentIndex = statusOrder.indexOf(currentOrder.status);
    if (currentOrder.status === 'missed_flight' || currentOrder.status === 'refunded') {
      return 'failed';
    }

    const stepIndex = statusOrder.indexOf(status);
    if (status === 'in_city_tour') {
      // Represents either lounge, tour, or hotel
      const isResting = ['in_lounge', 'in_city_tour', 'at_hotel'].includes(currentOrder.status);
      if (isResting) return 'current';
      if (currentIndex > statusOrder.indexOf('at_hotel')) return 'completed';
      return 'upcoming';
    }

    if (currentIndex === stepIndex) return 'current';
    if (currentIndex > stepIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div
      className={`fixed z-50 hidden glass-card shadow-2xl border border-white/50 overflow-hidden flex-col transition-all duration-300 md:flex ${
        isOpen
          ? 'inset-x-3 bottom-3 rounded-2xl md:inset-x-auto md:bottom-6 md:right-6 md:w-[360px]'
          : 'right-3 bottom-20 h-12 w-12 rounded-full md:bottom-6 md:right-6 md:h-12 md:w-12'
      }`}
    >
      {/* Header */}
      <div 
        className={`bg-gradient-to-r from-primary to-primary/90 text-white flex items-center cursor-pointer ${
          isOpen
            ? 'justify-between px-4 py-3'
            : 'h-12 justify-center px-0 md:h-auto md:justify-between md:px-4 md:py-3'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? undefined : language === 'zh-CN' ? '打开演示控制台' : 'Open demo console'}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Activity size={16} className={currentOrder.status === 'completed' ? '' : 'animate-pulse'} />
          <span className={isOpen ? '' : 'hidden'}>
            {language === 'zh-CN' ? '演示控制台 (Demo Mode)' : 'Demo console'}
          </span>
        </div>
        <div className={isOpen ? 'flex items-center gap-2' : 'hidden'}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowHelp(!showHelp);
            }} 
            className="p-1 hover:bg-white/20 rounded transition-colors text-white"
            title={language === 'zh-CN' ? '查看演示说明' : 'Show demo guide'}
          >
            <HelpCircle size={14} />
          </button>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 flex flex-col gap-3 max-h-[68vh] overflow-y-auto md:max-h-[480px]">
          {/* Help Panel */}
          {showHelp && (
            <div className="bg-blue-50/90 text-slate-700 text-xs p-3 rounded-xl border border-blue-200 leading-relaxed mb-1">
              <span className="font-bold text-blue-800 block mb-1">
                {language === 'zh-CN' ? '演示操作指南：' : 'Demo guide:'}
              </span>
              {language === 'zh-CN'
                ? '这是一个中转游逻辑演示沙盒。通过点击下方动作，您可以模拟现实中的各个业务场景，观测订单状态、行李追踪以及误机保障如何自动响应。'
                : 'This is a stopover logic sandbox. Trigger actions below to simulate operational scenarios and observe order state, baggage tracking and missed-flight protection.'}
            </div>
          )}

          {/* Top Info */}
          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
            <div>
              <span className="text-slate-400">{language === 'zh-CN' ? '订单号:' : 'Order:'}</span>
              <span className="font-semibold text-slate-800 ml-1">{currentOrder.orderId}</span>
            </div>
            <div>
              <span className="text-slate-400">{language === 'zh-CN' ? '套餐:' : 'Package:'}</span>
              <span className="font-semibold text-slate-800 ml-1">{getPackageLabel(currentOrder.package.sku, language)}</span>
            </div>
          </div>

          {/* Status steps indicator */}
          <div className="flex justify-between items-center my-1 overflow-x-auto px-1 pb-1">
            {orderSteps.map((step, idx) => {
              const state = getStepState(step.status);
              return (
                <React.Fragment key={step.status}>
                  {idx > 0 && (
                    <div className={`h-[2px] flex-1 mx-1 ${
                      state === 'completed' ? 'bg-primary' : 'bg-slate-200'
                    }`} />
                  )}
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-between text-[10px] font-bold ${
                      state === 'completed' ? 'bg-primary text-white' :
                      state === 'current' ? 'bg-accent text-white animate-bounce' :
                      state === 'failed' ? 'bg-rose-500 text-white' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      <span className="mx-auto">
                        {state === 'completed' ? '✓' : idx + 1}
                      </span>
                    </div>
                    <span className="text-[9px] mt-1 text-slate-500 scale-90">{step.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Current state display */}
          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${currentStatusInfo.bg}`}>
            <div className="flex items-center justify-between font-semibold mb-1">
              <span className="text-slate-700">{language === 'zh-CN' ? '当前业务状态:' : 'Current state:'}</span>
              <span className={currentStatusInfo.color}>{currentStatusInfo.title}</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              {orderTransitions.find(t => t.to === currentOrder.status)
                ? transitionLabels[orderTransitions.find(t => t.to === currentOrder.status)!.trigger]?.[locale]
                : language === 'zh-CN'
                  ? '订单已成功创建，等待开始中转。'
                  : 'Order is created and waiting for stopover handling.'}
            </p>
          </div>

          {/* Simulated Triggers / Actions */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              {language === 'zh-CN' ? '可用业务动作模拟:' : 'Available simulation actions:'}
            </span>
            {availableTriggers.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 italic">
                {language === 'zh-CN' ? '行程已结束，暂无可流转的动作。' : 'Journey is complete. No further transition is available.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {availableTriggers.map((t) => {
                  const isDanger = t.trigger === 'TIMEOUT' || t.trigger === 'TIMEOUT_HOTEL';
                  return (
                    <button
                      key={t.trigger}
                      onClick={() =>
                        transitionOrder(
                          t.trigger,
                          language === 'zh-CN'
                            ? `模拟操作成功：${transitionLabels[t.trigger]?.zh ?? t.description}`
                            : `Simulated action completed: ${transitionLabels[t.trigger]?.en ?? t.description}`,
                        )
                      }
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold text-left border flex items-center justify-between transition-all duration-200 ${
                        isDanger 
                          ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-primary hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      <span className="truncate">{(transitionLabels[t.trigger]?.[locale] ?? t.description).split(language === 'zh-CN' ? '，' : ',')[0]}</span>
                      {isDanger ? (
                        <ShieldAlert size={14} className="text-rose-500 flex-shrink-0 ml-1" />
                      ) : (
                        <span className="text-primary text-[10px] bg-blue-50 px-1.5 py-0.5 rounded ml-1 flex-shrink-0">
                          {language === 'zh-CN' ? '执行' : 'Run'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick links to track and detail pages */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs mt-1">
            <Link 
              href={`/order?id=${currentOrder.orderId}`}
              className="py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              {language === 'zh-CN' ? '电子凭证页' : 'Voucher'}
            </Link>
            <Link 
              href={`/journey?id=${currentOrder.orderId}`}
              className="py-1.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
            >
              {language === 'zh-CN' ? '实时追踪页' : 'Tracking'}
            </Link>
          </div>

          {/* Logs */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <Terminal size={12} />
                {language === 'zh-CN' ? '演示日志 (实时触发印记):' : 'Demo log:'}
              </span>
              <button 
                onClick={resetStore}
                className="text-slate-400 hover:text-rose-500 flex items-center gap-0.5"
                title={language === 'zh-CN' ? '清空并重启演示' : 'Clear and restart demo'}
              >
                <RotateCcw size={10} />
                <span>{language === 'zh-CN' ? '重置' : 'Reset'}</span>
              </button>
            </div>
            
            <div className="bg-slate-900 text-green-400 rounded-xl p-3 h-28 font-mono text-[9px] overflow-y-auto leading-relaxed border border-slate-800">
              {demoLogs.map((log, index) => (
                <div key={index} className="mb-1 last:mb-0 break-all select-all">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
