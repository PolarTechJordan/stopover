'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrderStore } from '@/lib/store/orderStore';
import { packages, addons, airports, mockFlightCases } from '@/lib/mockData';
import { getDefaultReservedServiceHours } from '@/lib/prdRules';
import { formatHours, localizeAddon, localizeAirport, localizePackage, t } from '@/lib/appPreferences';
import { getPackageTimeFit, getRecommendedPackageSku } from '@/lib/prdRules';
import { useAppPreferences } from '@/components/features/AppPreferenceProvider';
import { 
  Wifi, Car, Utensils, Compass, BedDouble, ShowerHead,
  CheckCircle, ArrowLeft, ArrowRight, ShieldCheck, Sparkles,
  UsersRound, BatteryCharging, Zap, SunMedium, Moon, ChefHat,
} from 'lucide-react';
import Link from 'next/link';

function PackagesContent() {
  const router = useRouter();
  const searchParamsQuery = useSearchParams();
  const caseId = searchParamsQuery.get('id');
  const { language } = useAppPreferences();
  const { 
    searchParams, selectedPackageSku, selectedAddonSkus,
    selectPackage, toggleAddon, setSearchParams
  } = useOrderStore();

  // If a case ID is provided, initialize search params from that case
  useEffect(() => {
    if (caseId) {
      const caseItem = mockFlightCases.find(c => c.id === caseId);
      if (caseItem) {
        setSearchParams({
          airportCode: caseItem.airportCode,
          arrivalFlightNo: caseItem.arrivalFlightNo,
          departureFlightNo: caseItem.departureFlightNo,
          layoverHours: getDefaultReservedServiceHours(caseItem.calculatedLayover),
          totalTransitHours: caseItem.calculatedLayover,
          arrivalTimeStr: caseItem.arrivalTimeStr,
          departureTimeStr: caseItem.departureTimeStr,
          baggagePieces: 1
        });
        
        // Select appropriate package SKU matching the case
        let sku: 'light' | 'micro' | 'overnight' = 'light';
        if (caseId === 'case-10h') sku = 'micro';
        else if (caseId === 'case-23h' || caseId === 'case-35h') sku = 'overnight';
        selectPackage(sku);
      }
    }
  }, [caseId, setSearchParams, selectPackage]);

  useEffect(() => {
    // If search params don't exist and we're not loading from a caseId, go back to search
    if (!searchParams && !caseId) {
      router.push('/search');
    }
  }, [searchParams, caseId, router]);

  const recommendedSku = searchParams ? getRecommendedPackageSku(searchParams.totalTransitHours) : 'light';

  // If no package has been explicitly selected yet, default to the recommended one
  useEffect(() => {
    if (searchParams && !selectedPackageSku) {
      selectPackage(recommendedSku);
    }
  }, [searchParams, selectedPackageSku, recommendedSku, selectPackage]);

  const rawActivePackage = packages.find(p => p.sku === (selectedPackageSku || recommendedSku))!;
  const activePackage = localizePackage(rawActivePackage, language);
  if (!searchParams) return null;

  const currentAirport = localizeAirport(airports.find(a => a.code === searchParams.airportCode)!, language);

  // Map icon strings to components
  const iconMap: Record<string, React.ReactNode> = {
    Wifi: <Wifi size={18} />,
    Car: <Car size={18} />,
    BedDouble: <BedDouble size={18} />,
    ShowerHead: <ShowerHead size={18} />,
    Utensils: <Utensils size={18} />,
    Sparkles: <Sparkles size={18} />,
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
          <span>{t(language, 'packages.back')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{t(language, 'flow.packages.step')}</span>
          <span className="text-slate-400 text-xs">{t(language, 'flow.packages.title')}</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">{t(language, 'packages.title')}</h1>
        <p className="text-sm text-slate-500">
          {t(language, 'packages.subtitle')} <span className="text-primary font-bold">{currentAirport.nameZh}</span>
          <span className="text-primary font-bold ml-1">{formatHours(searchParams.totalTransitHours, language)}</span>
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Package Selector */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((rawPkg) => {
              const pkg = localizePackage(rawPkg, language);
              const isRecommended = pkg.sku === recommendedSku;
              const isSelected = selectedPackageSku === pkg.sku;
              const timeFit = getPackageTimeFit(pkg.sku, searchParams.totalTransitHours);
              const isDisabled = timeFit.belowMin;
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
                      {language === 'zh-CN'
                        ? `时长不足 (需≥${pkg.recommendedLayover.minHours}h)`
                        : `${t(language, 'packages.disabled')} (min ${pkg.recommendedLayover.minHours}h)`}
                    </span>
                  ) : timeFit.aboveMax && !isRecommended ? (
                    <span className="absolute top-[-10px] right-3 text-[9px] bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {language === 'zh-CN' ? '非 PRD 首选' : 'Not primary fit'}
                    </span>
                  ) : isRecommended ? (
                    <span className="absolute top-[-10px] right-3 text-[9px] bg-accent text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {t(language, 'packages.recommended')}
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
                    <span className="text-[10px] text-slate-400 ml-1">{t(language, 'packages.from')}</span>
                  </div>
                </div>
              );
            })}
          </div>



          {/* Selected Package Details */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-primary" />
              <span>{t(language, 'packages.includes')}</span>
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
                  <span className="font-bold text-slate-800">{t(language, 'packages.safetyTitle')}：</span>
                  {t(language, 'packages.safetyBody')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Customizations / Summary */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Addons List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">{t(language, 'packages.addons')}</h3>
            
            {activePackage.addons.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">{t(language, 'packages.noAddons')}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activePackage.addons.map((addonSku) => {
                  const ad = localizeAddon(addons.find(a => a.sku === addonSku)!, language);
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
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">{t(language, 'packages.bill')}</h3>
            
            <div className="space-y-3 text-xs border-b border-white/10 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">{activePackage.name}</span>
                <span className="font-semibold text-white">¥{activePackage.price}</span>
              </div>
              
              {selectedAddonSkus.map((sku) => {
                if (!activePackage.addons.includes(sku)) return null;
                const ad = localizeAddon(addons.find(a => a.sku === sku)!, language);
                return (
                  <div key={sku} className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{ad.name}</span>
                    <span className="font-semibold text-white">¥{ad.price}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-baseline justify-between mb-6">
              <span className="text-xs text-slate-400 font-bold">{t(language, 'packages.total')}:</span>
              <span className="text-3xl font-black text-accent">
                ¥{calculateTotal()}
              </span>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all"
            >
              <span>{t(language, 'packages.next')}</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center py-20 text-xs text-slate-500">正在加载套餐配置...</div>}>
      <PackagesContent />
    </Suspense>
  );
}
