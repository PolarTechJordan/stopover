'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/store/orderStore';
import { packages, addons, airports } from '@/lib/mockData';
import { localizeAddon, localizeAirport, localizePackage, t } from '@/lib/appPreferences';
import { useAppPreferences } from '@/components/features/AppPreferenceProvider';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Loader2, Sparkles, ChefHat } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useAppPreferences();
  const { 
    searchParams, selectedPackageSku, selectedAddonSkus, createOrder 
  } = useOrderStore();

  const [passengerName, setPassengerName] = useState('Mr. Wei');
  const [passportNo, setPassportNo] = useState('E88998899');
  const [phone, setPhone] = useState('+86 138 0000 8888');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!searchParams || !selectedPackageSku) {
      router.push('/search');
    }
  }, [searchParams, selectedPackageSku, router]);

  if (!searchParams || !selectedPackageSku) return null;

  const currentAirport = localizeAirport(airports.find(a => a.code === searchParams.airportCode)!, language);
  const activePackage = localizePackage(packages.find(p => p.sku === selectedPackageSku)!, language);


  // Calculate final total
  const calculateTotal = () => {
    let price = activePackage.price;
    selectedAddonSkus.forEach((sku) => {
      if (activePackage.addons.includes(sku)) {
        const adInfo = addons.find(a => a.sku === sku);
        if (adInfo) {
          price += adInfo.price;
        }
      }
    });
    return price;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network delay for mock payment processing
    setTimeout(() => {
      // Actually create order in state store
      const order = createOrder();
      setIsSubmitting(false);
      setIsPaid(true);

      // Redirect to Order Confirmation page after 1.5s
      setTimeout(() => {
        router.push(`/order?id=${order.orderId}`);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="flex-1 py-8 px-6 max-w-7xl mx-auto w-full relative flex flex-col gap-2">
      {/* Loading Modal for payment processing */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-float">
            <Loader2 className="text-primary animate-spin" size={48} />
            <h3 className="font-extrabold text-lg text-slate-900">{t(language, 'checkout.processingTitle')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(language, 'checkout.processingBody')}
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isPaid && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl border border-slate-100 flex flex-col items-center gap-4">
            <CheckCircle2 className="text-green-500" size={54} />
            <h3 className="font-extrabold text-xl text-slate-900">{t(language, 'checkout.successTitle')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(language, 'checkout.successBody')}
            </p>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="mb-8 hidden items-center justify-between md:flex">
        <Link href="/packages" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-semibold transition-colors">
          <ArrowLeft size={14} />
          <span>{t(language, 'checkout.back')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{t(language, 'flow.checkout.step')}</span>
          <span className="text-slate-400 text-xs">{t(language, 'flow.checkout.title')}</span>
        </div>
      </div>

      <h1 className="text-3xl font-black text-slate-900 text-center md:text-left mb-8">
        {t(language, 'checkout.title')}
      </h1>

      <form onSubmit={handlePay} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left col: Traveler info inputs */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-1">
              {t(language, 'checkout.identityTitle')}
            </h3>
            
            <div>
              <label htmlFor="pname" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t(language, 'checkout.passengerName')}
              </label>
              <input
                id="pname"
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value.toUpperCase())}
                placeholder="Mr. Wei"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="passport" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {t(language, 'checkout.passport')}
                </label>
                <input
                  id="passport"
                  type="text"
                  value={passportNo}
                  onChange={(e) => setPassportNo(e.target.value.toUpperCase())}
                  placeholder="E12345678"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {t(language, 'checkout.phone')}
                </label>
                <input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+86 13800000000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              {t(language, 'checkout.termsTitle')}
            </h3>
            
            <div className="space-y-4 text-xs text-slate-500">
              <div className="flex gap-2">
                <ShieldCheck className="text-primary flex-shrink-0" size={16} />
                <p>
                  <strong>{language === 'zh-CN' ? '无忧改签保障' : 'Missed-connection care'}</strong>{language === 'zh-CN' ? '：' : ': '}{t(language, 'checkout.rebooking')}
                </p>
              </div>
              
              <div className="flex gap-2">
                <ShieldCheck className="text-primary flex-shrink-0" size={16} />
                <p>
                  <strong>{language === 'zh-CN' ? '行李全托管保险' : 'Baggage custody insurance'}</strong>{language === 'zh-CN' ? '：' : ': '}{t(language, 'checkout.baggagePolicy')}
                </p>
              </div>
            </div>
          </div>


        </div>

        {/* Right col: Checkout details & Action */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">{t(language, 'checkout.summary')}</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="text-[10px] text-slate-400">{t(language, 'checkout.airport')}</span>
                <span className="font-bold text-slate-800">
                  {currentAirport.nameZh} ({currentAirport.code})
                </span>
              </div>

              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="text-[10px] text-slate-400">{t(language, 'checkout.flightPlan')}</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>{searchParams.arrivalFlightNo}</span>
                  <span className="text-slate-300">→</span>
                  <span>{searchParams.departureFlightNo}</span>
                </span>
                <span className="text-[10px] text-slate-400 flex flex-col gap-0.5 mt-0.5">
                  <span>{language === 'zh-CN' ? '总中转停留' : 'Total layover'}{language === 'zh-CN' ? '：' : ': '}{searchParams.totalTransitHours}h</span>
                  <span>{language === 'zh-CN' ? '服务预留时间' : 'Reserved service'}{language === 'zh-CN' ? '：' : ': '}{searchParams.layoverHours}h</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3">
                <span className="text-[10px] text-slate-400">{t(language, 'checkout.services')}</span>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{activePackage.name}</span>
                  <span>¥{activePackage.price}</span>
                </div>
                {selectedAddonSkus.map((sku) => {
                  if (!activePackage.addons.includes(sku)) return null;
                  const ad = localizeAddon(addons.find(a => a.sku === sku)!, language);
                  return (
                    <div key={sku} className="flex justify-between text-slate-500 scale-95 origin-left">
                      <span>+ {ad.name}</span>
                      <span>¥{ad.price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="font-bold text-slate-700">{language === 'zh-CN' ? '实付总额' : 'Amount due'}:</span>
                <span className="text-2xl font-black text-primary">
                  ¥{calculateTotal()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-2 mt-6"
            >
              <CreditCard size={16} />
              <span>{t(language, 'checkout.pay')}</span>
            </button>
            
            <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed">
              {t(language, 'checkout.demoNotice')}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
