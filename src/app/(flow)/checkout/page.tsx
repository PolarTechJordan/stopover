'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/store/orderStore';
import { packages, addons, airports } from '@/lib/mockData';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    searchParams, selectedPackageSku, selectedAddonSkus, createOrder 
  } = useOrderStore();

  const [passengerName, setPassengerName] = useState('JORDAN ZHOU');
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

  const currentAirport = airports.find(a => a.code === searchParams.airportCode)!;
  const activePackage = packages.find(p => p.sku === selectedPackageSku)!;

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
            <h3 className="font-extrabold text-lg text-slate-900">安全支付网关验证中</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              正在模拟联接 Stripe / 支付宝 支付渠道。请勿关闭或刷新此页面。
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isPaid && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl border border-slate-100 flex flex-col items-center gap-4">
            <CheckCircle2 className="text-green-500" size={54} />
            <h3 className="font-extrabold text-xl text-slate-900">模拟支付已成功！</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              订单已扣款，系统已成功生成电子凭证及 RFID 行李托管跟踪卡。正在跳转至电子凭证页...
            </p>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/packages" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-semibold transition-colors">
          <ArrowLeft size={14} />
          <span>返回修改定制套餐</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Step 3 of 5</span>
          <span className="text-slate-400 text-xs">安全收银台付款</span>
        </div>
      </div>

      <h1 className="text-3xl font-black text-slate-900 text-center md:text-left mb-8">
        确认订单与填写申报信息
      </h1>

      <form onSubmit={handlePay} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left col: Traveler info inputs */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-1">
              中转入境申报基本信息
            </h3>
            
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-700 leading-relaxed">
              ⚠️ <strong>出港中转申报提醒</strong>：根据中转地边防与海关要求，城市游及酒店托管前需要登记旅客的真实护照拼音拼写，以供落地快速签批及行李海关检验。
            </div>

            <div>
              <label htmlFor="pname" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                旅客姓名拼音 (如护照所示)
              </label>
              <input
                id="pname"
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value.toUpperCase())}
                placeholder="ZHOU JORDAN"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="passport" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  护照号码 (Passport No.)
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
                  联系电话 (含国别码)
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
              模拟付款保障条款
            </h3>
            
            <div className="space-y-4 text-xs text-slate-500">
              <div className="flex gap-2">
                <ShieldCheck className="text-primary flex-shrink-0" size={16} />
                <p>
                  <strong>无忧改签保障 (Missed Flight Care)</strong>：凡预定微游或酒店专车服务，如因车辆发生意外故障、交通大拥堵等我方责任导致未能按时返回机场误机，我们将负责赔付后续改签机票及滞留期间餐宿费用。
                </p>
              </div>
              
              <div className="flex gap-2">
                <ShieldCheck className="text-primary flex-shrink-0" size={16} />
                <p>
                  <strong>行李全托管保险 (Baggage Safety Policy)</strong>：行李托管自交付贴标至领回签字期间，由太平洋/美亚承保行李险，如发生破损、遗失，每件最高赔付额度为人民币 5,000 元。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right col: Checkout details & Action */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">订单汇总</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="text-[10px] text-slate-400">中转机场</span>
                <span className="font-bold text-slate-800">
                  {currentAirport.nameZh} ({currentAirport.code})
                </span>
              </div>

              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="text-[10px] text-slate-400">航班计划</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>{searchParams.arrivalFlightNo}</span>
                  <span className="text-slate-300">→</span>
                  <span>{searchParams.departureFlightNo}</span>
                </span>
                <span className="text-[10px] text-slate-400 flex flex-col gap-0.5 mt-0.5">
                  <span>总中转停留：{searchParams.totalTransitHours} 小时</span>
                  <span>服务预留时间：{searchParams.layoverHours} 小时</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3">
                <span className="text-[10px] text-slate-400">已订服务</span>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{activePackage.name}</span>
                  <span>¥{activePackage.price}</span>
                </div>
                {selectedAddonSkus.map((sku) => {
                  if (!activePackage.addons.includes(sku)) return null;
                  const ad = addons.find(a => a.sku === sku)!;
                  return (
                    <div key={sku} className="flex justify-between text-slate-500 scale-95 origin-left">
                      <span>+ {ad.name}</span>
                      <span>¥{ad.price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="font-bold text-slate-700">实付总额:</span>
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
              <span>一键模拟担保支付</span>
            </button>
            
            <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed">
              本交易为 Demo 模拟扣款验证，不会产生任何实际银行账单。
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
