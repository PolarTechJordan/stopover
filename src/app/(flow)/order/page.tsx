'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrderStore, getMockOrderForCaseId } from '@/lib/store/orderStore';
import { QRCodeSVG } from 'qrcode.react';
import { addons } from '@/lib/mockData';
import { getAddonLabel, getPackageLabel, t } from '@/lib/appPreferences';
import { useAppPreferences } from '@/components/features/AppPreferenceProvider';
import { 
  CheckCircle, Plane, Briefcase,
  ArrowRight, User, Sparkles, ChefHat,
} from 'lucide-react';
import Link from 'next/link';

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const { language } = useAppPreferences();
  const orderId = searchParams.get('id');
  const { currentOrder: storeOrder } = useOrderStore();

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
        <h2 className="text-xl font-bold text-slate-800">{t(language, 'order.notFound')}</h2>
        <p className="text-xs text-slate-500 mt-2">{t(language, 'order.notFoundBody')}</p>
        <Link 
          href="/search" 
          className="inline-block mt-4 px-6 py-2 bg-primary text-white text-xs font-semibold rounded-xl"
        >
          {t(language, 'nav.booking')}
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
  const addonNames = currentOrder.addons
    .map((sku) => addons.find((item) => item.sku === sku) ? getAddonLabel(sku, language) : sku)
    .join('、');


  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-5 pb-24 sm:px-6 sm:py-8 md:pb-8 flex flex-col gap-2">
      {/* Step Indicator */}
      <div className="mb-5 hidden items-center gap-3 justify-center md:mb-6 md:flex md:justify-start">
        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{t(language, 'flow.order.step')}</span>
        <span className="text-slate-400 text-xs">{t(language, 'flow.order.title')}</span>
      </div>

      <div className="text-center md:text-left mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-start">
          <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-600 md:h-10 md:w-10">
            <CheckCircle size={25} />
          </div>
          <div>
            <h1 className="text-[1.65rem] font-black leading-tight text-slate-900 md:text-2xl">{t(language, 'order.successTitle')}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {t(language, 'order.successBody')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-8">
        {/* Left 2 cols: Ticket QR card */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-lg flex flex-col items-center justify-between text-center relative overflow-hidden sm:p-6">
            {/* Aviation decorative strip */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-accent" />
            
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">
              Stopover Voucher
            </span>
            <span className="text-xs text-primary font-black mt-1">
              {getPackageLabel(currentOrder.package.sku, language)} ({t(language, 'order.voucher')})
            </span>

            {/* QR Code Container */}
            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center sm:my-6">
              <QRCodeSVG 
                value={qrContent} 
                size={150}
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
              {t(language, 'order.qrHint')}
            </p>
          </div>

          <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-md flex flex-col gap-3 md:hidden">
            <h4 className="font-bold text-xs text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} />
              <span>{t(language, 'order.trackingTitle')}</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t(language, 'order.trackingBody')}
            </p>
            <Link
              href={`/journey?id=${currentOrder.orderId}`}
              className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl text-center text-xs flex items-center justify-center gap-2 group transition-all"
            >
              <span>{t(language, 'order.openTracking')}</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right 3 cols: Order Summary details */}
        <div className="md:col-span-3 flex flex-col gap-4 md:gap-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4 sm:p-6">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
              {t(language, 'order.bookingDetails')}
            </h3>

            {/* Traveler info */}
            <div className="grid grid-cols-2 gap-3 text-xs sm:gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">{t(language, 'order.passengerName')}</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <User size={12} className="text-slate-400" />
                  <span>Mr. Wei</span>
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">{t(language, 'order.passport')}</span>
                <span className="font-bold text-slate-800">E88998899</span>
              </div>
            </div>

            {/* Flight info */}
            <div className="h-[1px] bg-slate-100" />
            
            <div className="flex items-center justify-between gap-2 text-xs bg-sand/30 p-3 rounded-xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400">{t(language, 'order.arrival')}</span>
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
                <span className="text-[9px] text-slate-400 mt-1 font-bold">
                  {language === 'zh-CN' ? `${currentOrder.totalTransitHours}h 中转` : `${currentOrder.totalTransitHours}h layover`}
                </span>
                <span className="text-[8px] text-slate-400 mt-0.5 whitespace-nowrap">
                  {language === 'zh-CN' ? `(预留 ${currentOrder.layoverHours}h)` : `(reserved ${currentOrder.layoverHours}h)`}
                </span>
              </div>

              <div className="flex flex-col text-right">
                <span className="text-[9px] text-slate-400">{t(language, 'order.departure')}</span>
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
              <span className="text-[10px] text-slate-400 block mb-1">{t(language, 'order.product')}</span>
              <div className="flex justify-between font-bold text-slate-800">
                <span>{getPackageLabel(currentOrder.package.sku, language)}</span>
                <span>¥{currentOrder.package.price}</span>
              </div>
              {currentOrder.addons.length > 0 && (
                <div className="text-slate-500 mt-1 text-[11px] leading-relaxed">
                  + {t(language, 'order.addons')}: {addonNames}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-slate-100" />



            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400 font-bold">{t(language, 'order.paid')}:</span>
              <span className="text-xl font-extrabold text-primary">¥{currentOrder.totalAmount}</span>
            </div>
          </div>

          {/* CTA redirect to Tracking page */}
          <div className="hidden bg-slate-900 text-white rounded-3xl p-6 shadow-md md:flex md:flex-col md:gap-3">
            <h4 className="font-bold text-xs text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} />
              <span>{t(language, 'order.trackingTitle')}</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t(language, 'order.trackingBody')}
            </p>
            
            <Link 
              href={`/journey?id=${currentOrder.orderId}`}
              className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl text-center text-xs flex items-center justify-center gap-2 group transition-all"
            >
              <span>{t(language, 'order.openTracking')}</span>
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
