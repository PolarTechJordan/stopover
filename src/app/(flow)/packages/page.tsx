'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/store/orderStore';
import { packages, addons, airports } from '@/lib/mockData';
import { PackageSku } from '@/lib/types';
import { 
  Wifi, Car, Utensils, Compass, BedDouble, ShowerHead,
  CheckCircle, ArrowLeft, ArrowRight, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

export default function PackagesPage() {
  const router = useRouter();
  const { 
    searchParams, selectedPackageSku, selectedAddonSkus,
    selectPackage, toggleAddon 
  } = useOrderStore();

  useEffect(() => {
    // If search params don't exist, go back to search
    if (!searchParams) {
      router.push('/search');
    }
  }, [searchParams, router]);

  // Decide recommended package based on layover duration
  const getRecommendedPackageSku = (hours: number): PackageSku => {
    if (hours < 10) return 'light';
    if (hours >= 10 && hours < 18) return 'micro';
    return 'overnight';
  };

  const recommendedSku = searchParams ? getRecommendedPackageSku(searchParams.layoverHours) : 'light';

  // If no package has been explicitly selected yet, default to the recommended one
  useEffect(() => {
    if (searchParams && !selectedPackageSku) {
      selectPackage(recommendedSku);
    }
  }, [searchParams, selectedPackageSku, recommendedSku, selectPackage]);

  if (!searchParams) return null;

  const currentAirport = airports.find(a => a.code === searchParams.airportCode)!;

  const activePackage = packages.find(p => p.sku === (selectedPackageSku || recommendedSku))!;

  // Map icon strings to components
  const iconMap: Record<string, React.ReactNode> = {
    Wifi: <Wifi size={18} />,
    Car: <Car size={18} />,
    BedDouble: <BedDouble size={18} />,
    ShowerHead: <ShowerHead size={18} />,
    Utensils: <Utensils size={18} />,
    Compass: <Compass size={18} />,
  };

  // Get current total price
  const calculateTotal = () => {
    let price = activePackage.price;
    selectedAddonSkus.forEach((sku) => {
      // only count if addon is supported by the active package
      if (activePackage.addons.includes(sku)) {
        const adInfo = addons.find(a => a.sku === sku);
        if (adInfo) {
          price += adInfo.price;
        }
      }
    });
    return price;
  };

  const handleNext = () => {
    router.push('/checkout');
  };

  return (
    <div className="flex-1 py-8 px-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Step Indicator */}
      <div className="mb-8 hidden items-center justify-between md:flex">
        <Link href="/search" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-semibold transition-colors">
          <ArrowLeft size={14} />
          <span>返回修改航班</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Step 2 of 5</span>
          <span className="text-slate-400 text-xs">定制个性化中转套餐</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">匹配定制您的中转套餐</h1>
        <p className="text-sm text-slate-500">
          为您在中转港 <span className="text-primary font-bold">{currentAirport.nameZh}</span> 的 
          <span className="text-primary font-bold ml-1">{searchParams.layoverHours} 小时</span> 停留智能匹配最优方案
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Package Selector */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const isRecommended = pkg.sku === recommendedSku;
              const isSelected = selectedPackageSku === pkg.sku;
              const isDisabled = searchParams.layoverHours < pkg.recommendedLayover.minHours;
              return (
                <div
                  key={pkg.sku}
                  onClick={() => !isDisabled && selectPackage(pkg.sku)}
                  className={`rounded-2xl p-5 border flex flex-col transition-all duration-300 relative ${
                    isDisabled
                      ? 'bg-slate-50/80 border-slate-200/60 opacity-60 cursor-not-allowed select-none'
                      : isSelected
                        ? 'cursor-pointer bg-white border-primary shadow-md ring-2 ring-primary/10'
                        : 'cursor-pointer bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {isDisabled ? (
                    <span className="absolute top-[-10px] right-3 text-[9px] bg-slate-400 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      时长不足 (需≥{pkg.recommendedLayover.minHours}h)
                    </span>
                  ) : isRecommended ? (
                    <span className="absolute top-[-10px] right-3 text-[9px] bg-accent text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      智能推荐
                    </span>
                  ) : null}
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold text-base ${isDisabled ? 'text-slate-400' : 'text-slate-900'}`}>{pkg.name}</h3>
                    {!isDisabled && (
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <span className="text-[9px] font-bold">✓</span>}
                      </div>
                    )}
                  </div>

                  <p className={`text-[11px] mb-4 leading-relaxed flex-grow ${isDisabled ? 'text-slate-400' : 'text-slate-500'}`}>{pkg.tagline}</p>
                  
                  <div className={`flex items-baseline gap-0.5 mt-2 ${isDisabled ? 'text-slate-400' : 'text-primary'}`}>
                    <span className="text-xs font-semibold">¥</span>
                    <span className="text-2xl font-black">{pkg.price}</span>
                    <span className="text-[10px] text-slate-400 ml-1">起</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Package Details */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-primary" />
              <span>包含的服务细项：</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePackage.includes.map((inc, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-slate-600 bg-sand/30 p-3 rounded-xl border border-slate-100">
                  <span className="text-primary font-bold mt-0.5">✓</span>
                  <span>{inc}</span>
                </div>
              ))}
            </div>
            
            {activePackage.sku !== 'light' && (
              <div className="mt-6 flex items-start gap-2 bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed">
                <ShieldCheck size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">行李托管与安全保障承诺：</span>
                  已包含 RFID 智能卡托管服务，每件随身行李保额上限达 ¥5,000。享受延误险，若由微游或合作接送服务导致延误错失后续航班，我们将提供全额改签协助与损失兜底补偿。
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Customizations / Summary */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Addons List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">加购增值服务</h3>
            
            {activePackage.addons.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">当前套餐不支持加购其他增值项</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activePackage.addons.map((addonSku) => {
                  const ad = addons.find(a => a.sku === addonSku)!;
                  const isChecked = selectedAddonSkus.includes(addonSku);
                  return (
                    <div 
                      key={addonSku}
                      onClick={() => toggleAddon(addonSku)}
                      className={`cursor-pointer rounded-xl p-3 border text-xs flex items-start gap-3 transition-all ${
                        isChecked 
                          ? 'border-primary bg-blue-50/40' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg ${
                        isChecked ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {iconMap[ad.iconName] || <Wifi size={18} />}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{ad.name}</span>
                          <span className="text-primary font-extrabold">+¥{ad.price}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{ad.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checkout Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">账单明细</h3>
            
            <div className="space-y-3 text-xs border-b border-white/10 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">{activePackage.name}</span>
                <span className="font-semibold text-white">¥{activePackage.price}</span>
              </div>
              
              {selectedAddonSkus.map((sku) => {
                if (!activePackage.addons.includes(sku)) return null;
                const ad = addons.find(a => a.sku === sku)!;
                return (
                  <div key={sku} className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{ad.name}</span>
                    <span className="font-semibold text-white">¥{ad.price}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-baseline justify-between mb-6">
              <span className="text-xs text-slate-400 font-bold">总计金额:</span>
              <span className="text-3xl font-black text-accent">
                ¥{calculateTotal()}
              </span>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all"
            >
              <span>前往结算付款</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
