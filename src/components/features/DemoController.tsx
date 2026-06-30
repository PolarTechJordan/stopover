'use client';

import React, { useState } from 'react';
import { useOrderStore } from '@/lib/store/orderStore';
import { getAvailableTriggers, orderTransitions } from '@/lib/state-machine/orderState';
import { OrderStatus } from '@/lib/types';
import { 
  Terminal, RotateCcw, AlertTriangle, CheckCircle, 
  Activity, ChevronDown, ChevronUp, Clock, HelpCircle, ShieldAlert 
} from 'lucide-react';
import Link from 'next/link';

export default function DemoController() {
  const { 
    currentOrder, transitionOrder, resetStore, demoLogs, 
    isDemoMode, toggleDemoMode 
  } = useOrderStore();
  
  const [isOpen, setIsOpen] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  if (!currentOrder) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-sm glass-card rounded-2xl p-4 shadow-xl border border-white/40">
        <div className="flex items-center gap-2 text-primary font-bold mb-1">
          <Activity size={18} className="animate-pulse" />
          <span>中转游 Demo 演示控制台</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          暂无活动订单。请先在页面中搜索航班并购买套餐以开启演示。
        </p>
        <Link 
          href="/search" 
          className="block w-full text-center py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-colors shadow-sm"
        >
          创建演示订单
        </Link>
      </div>
    );
  }

  const availableTriggers = getAvailableTriggers(currentOrder.status);

  // Status mapping to Chinese titles and colors
  const statusConfig: Record<OrderStatus, { title: string; color: string; bg: string }> = {
    paid: { title: '已支付', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    baggage_received: { title: '已交托行李', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    in_lounge: { title: '贵宾室休息中', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    in_city_tour: { title: '城市微游中', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    at_hotel: { title: '合作酒店休息中', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    baggage_returning: { title: '行李运送回中', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    boarded: { title: '已领回行李/登机', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
    completed: { title: '行程已圆满完成', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    missed_flight: { title: '发生误机事件', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    refunded: { title: '误机险已赔付/退款', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' }
  };

  const currentStatusInfo = statusConfig[currentOrder.status] || { title: currentOrder.status, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };

  // Status list to render steps
  const orderSteps: { status: OrderStatus; label: string }[] = [
    { status: 'paid', label: '支付' },
    { status: 'baggage_received', label: '托运' },
    { status: 'in_city_tour', label: '微游/休息' },
    { status: 'baggage_returning', label: '返还' },
    { status: 'boarded', label: '登机' },
    { status: 'completed', label: '完结' }
  ];

  // Helper to determine step visual state
  const getStepState = (status: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'paid', 'baggage_received', 'in_lounge', 'in_city_tour', 'at_hotel', 'baggage_returning', 'boarded', 'completed'
    ];
    
    // special cases
    let currentIndex = statusOrder.indexOf(currentOrder.status);
    if (currentOrder.status === 'missed_flight' || currentOrder.status === 'refunded') {
      return 'failed';
    }

    let stepIndex = statusOrder.indexOf(status);
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
    <div className="fixed bottom-6 right-6 z-50 w-[360px] glass-card rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col transition-all duration-300">
      {/* Header */}
      <div 
        className="px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-white flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Activity size={16} className={currentOrder.status === 'completed' ? '' : 'animate-pulse'} />
          <span>演示控制台 (Demo Mode)</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowHelp(!showHelp);
            }} 
            className="p-1 hover:bg-white/20 rounded transition-colors text-white"
            title="查看演示说明"
          >
            <HelpCircle size={14} />
          </button>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 flex flex-col gap-3 max-h-[480px] overflow-y-auto">
          {/* Help Panel */}
          {showHelp && (
            <div className="bg-blue-50/90 text-slate-700 text-xs p-3 rounded-xl border border-blue-200 leading-relaxed mb-1">
              <span className="font-bold text-blue-800 block mb-1">演示操作指南：</span>
              这是一个中转游逻辑演示沙盒。通过点击下方动作，您可以**模拟现实中的各个业务场景**，观测订单状态、行李追踪以及误机保障如何自动响应。
            </div>
          )}

          {/* Top Info */}
          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
            <div>
              <span className="text-slate-400">订单号:</span>
              <span className="font-semibold text-slate-800 ml-1">{currentOrder.orderId}</span>
            </div>
            <div>
              <span className="text-slate-400">套餐:</span>
              <span className="font-semibold text-slate-800 ml-1">{currentOrder.package.name}</span>
            </div>
          </div>

          {/* Status steps indicator */}
          <div className="flex justify-between items-center my-1 px-1">
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
              <span className="text-slate-700">当前业务状态:</span>
              <span className={currentStatusInfo.color}>{currentStatusInfo.title}</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              {orderTransitions.find(t => t.to === currentOrder.status)?.description || '订单已成功创建，等待开始中转。'}
            </p>
          </div>

          {/* Simulated Triggers / Actions */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-slate-400">可用业务动作模拟:</span>
            {availableTriggers.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 italic">
                行程已结束，暂无可流转的动作。
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {availableTriggers.map((t) => {
                  const isDanger = t.trigger === 'TIMEOUT' || t.trigger === 'TIMEOUT_HOTEL';
                  return (
                    <button
                      key={t.trigger}
                      onClick={() => transitionOrder(t.trigger, `模拟操作成功：${t.description}`)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold text-left border flex items-center justify-between transition-all duration-200 ${
                        isDanger 
                          ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-primary hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      <span className="truncate">{t.description.split('，')[0]}</span>
                      {isDanger ? (
                        <ShieldAlert size={14} className="text-rose-500 flex-shrink-0 ml-1" />
                      ) : (
                        <span className="text-primary text-[10px] bg-blue-50 px-1.5 py-0.5 rounded ml-1 flex-shrink-0">执行</span>
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
              href={`/order/${currentOrder.orderId}`}
              className="py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              电子凭证页
            </Link>
            <Link 
              href={`/journey/${currentOrder.orderId}`}
              className="py-1.5 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
            >
              实时追踪页
            </Link>
          </div>

          {/* Logs */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <Terminal size={12} />
                演示日志 (实时触发印记):
              </span>
              <button 
                onClick={resetStore}
                className="text-slate-400 hover:text-rose-500 flex items-center gap-0.5"
                title="清空并重启演示"
              >
                <RotateCcw size={10} />
                <span>重置</span>
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
