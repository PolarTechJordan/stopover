'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrderStore } from '@/lib/store/orderStore';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircle, Plane, Briefcase, MapPin, 
  ArrowRight, ShieldCheck, User, Calendar 
} from 'lucide-react';
import Link from 'next/link';

function OrderDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const { currentOrder } = useOrderStore();

  if (!currentOrder || (orderId && currentOrder.orderId !== orderId)) {
    return (
      <div className="flex-1 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">订单不存在或已过期</h2>
        <p className="text-xs text-slate-500 mt-2">请重新预定中转套餐。</p>
        <Link 
          href="/search" 
          className="inline-block mt-4 px-6 py-2 bg-primary text-white text-xs font-semibold rounded-xl"
        >
          返回预订
        </Link>
      </div>
    );
  }

  // Generate QR code content
  const qrContent = `https://stopover.polartech.com/scan/${currentOrder.orderId}`;

  // Formatted date helper
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 py-8 px-6 max-w-7xl mx-auto w-full flex flex-col gap-2">
      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Step 4 of 5</span>
        <span className="text-slate-400 text-xs">生成出行电子凭证</span>
      </div>

      <div className="text-center md:text-left mb-8">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-start">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">您的中转套餐已订购成功！</h1>
            <p className="text-xs text-slate-500 mt-1">
              电子服务凭证已下发。在柜台出示二维码即可核销履约。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left 2 cols: Ticket QR card */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg flex flex-col items-center justify-between text-center relative overflow-hidden">
            {/* Aviation decorative strip */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-accent" />
            
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">
              Stopover Voucher
            </span>
            <span className="text-xs text-primary font-black mt-1">
              {currentOrder.package.name} (电子凭证)
            </span>

            {/* QR Code Container */}
            <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
              <QRCodeSVG 
                value={qrContent} 
                size={140}
                bgColor={"#F8FAFC"}
                fgColor={"#0F172A"}
                level={"L"}
                includeMargin={false}
              />
            </div>

            <div className="font-mono text-base font-extrabold text-slate-800 tracking-wider">
              {currentOrder.orderId}
            </div>

            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed max-w-[180px] mx-auto">
              抵达中转柜台后，向工作人员出示此二维码，办理行李全托管及服务启用。
            </p>
          </div>
        </div>

        {/* Right 3 cols: Order Summary details */}
        <div className="md:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
              预订明细
            </h3>

            {/* Traveler info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">旅客姓名拼音</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <User size={12} className="text-slate-400" />
                  <span>JORDAN ZHOU</span>
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">护照号码</span>
                <span className="font-bold text-slate-800">E88998899</span>
              </div>
            </div>

            {/* Flight info */}
            <div className="h-[1px] bg-slate-100" />
            
            <div className="flex items-center justify-between text-xs bg-sand/30 p-3 rounded-xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400">到达航班</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Plane size={11} className="rotate-90 text-primary" />
                  <span>{currentOrder.arrivalFlight.flightNo}</span>
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5">{formatDate(currentOrder.arrivalFlight.arrivalTime)}</span>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black">
                  {currentOrder.layoverAirport}
                </span>
                <span className="text-[9px] text-slate-400 mt-1 font-bold">{currentOrder.totalTransitHours}h 中转</span>
                <span className="text-[8px] text-slate-400 mt-0.5 whitespace-nowrap">(预留 {currentOrder.layoverHours}h)</span>
              </div>

              <div className="flex flex-col text-right">
                <span className="text-[9px] text-slate-400">离境航班</span>
                <span className="font-bold text-slate-800 flex items-center justify-end gap-1">
                  <Plane size={11} className="text-accent" />
                  <span>{currentOrder.departureFlight.flightNo}</span>
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5">{formatDate(currentOrder.departureFlight.departureTime)}</span>
              </div>
            </div>

            {/* Package details */}
            <div className="h-[1px] bg-slate-100" />

            <div className="text-xs">
              <span className="text-[10px] text-slate-400 block mb-1">已购中转产品</span>
              <div className="flex justify-between font-bold text-slate-800">
                <span>{currentOrder.package.name}</span>
                <span>¥{currentOrder.package.price}</span>
              </div>
              {currentOrder.addons.length > 0 && (
                <div className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  + 加购增值项: {currentOrder.addons.join(', ')}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-slate-100" />

            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400 font-bold">付款实额:</span>
              <span className="text-xl font-extrabold text-primary">¥{currentOrder.totalAmount}</span>
            </div>
          </div>

          {/* CTA redirect to Tracking page */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col gap-3">
            <h4 className="font-bold text-xs text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} />
              <span>实时行李全托管追踪已开启</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              系统已激活该行程的行李 RFID 跟踪状态机。您可以点击下方按钮进入“实时行程追踪页”查看行李在后台转运的详细信息，或查看城市微游导游接送时刻表。
            </p>
            
            <Link 
              href={`/journey?id=${currentOrder.orderId}`}
              className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl text-center text-xs flex items-center justify-center gap-2 group transition-all"
            >
              <span>进入行程看板与行李追踪</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center py-20 text-xs text-slate-500">正在加载订单凭证信息...</div>}>
      <OrderDetailContent />
    </Suspense>
  );
}
