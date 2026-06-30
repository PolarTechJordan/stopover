'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/store/orderStore';
import { packages, addons, airports } from '@/lib/mockData';
import { PackageSku } from '@/lib/types';
import { formatHours, localizeAddon, localizeAirport, localizePackage, t } from '@/lib/appPreferences';
import { useAppPreferences } from '@/components/features/AppPreferenceProvider';
import { 
  Wifi, Car, Utensils, Compass, BedDouble, ShowerHead,
  CheckCircle, ArrowLeft, ArrowRight, ShieldCheck, Sparkles,
  UsersRound, BatteryCharging, Zap, SunMedium, Moon, ChefHat,
} from 'lucide-react';
import Link from 'next/link';

export default function PackagesPage() {
  const router = useRouter();
  const { language } = useAppPreferences();
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

  const recommendedSku = searchParams ? getRecommendedPackageSku(searchParams.totalTransitHours) : 'light';
  const [mealPersona, setMealPersona] = useState<'E' | 'I'>('E');
  const [mealEnergy, setMealEnergy] = useState<'high' | 'low'>('high');

  // If no package has been explicitly selected yet, default to the recommended one
  useEffect(() => {
    if (searchParams && !selectedPackageSku) {
      selectPackage(recommendedSku);
    }
  }, [searchParams, selectedPackageSku, recommendedSku, selectPackage]);

  const rawActivePackage = packages.find(p => p.sku === (selectedPackageSku || recommendedSku))!;
  const activePackage = localizePackage(rawActivePackage, language);
  const mealPeriod = useMemo(() => {
    if (!searchParams) return 'day' as const;
    const hour = Number(searchParams.arrivalTimeStr.slice(11, 13));
    return Number.isFinite(hour) && (hour < 7 || hour >= 18) ? 'night' as const : 'day' as const;
  }, [searchParams]);
  const mealRecommendation = useMemo(() => {
    const key = `${mealPeriod}-${mealPersona}-${mealEnergy}`;
    const map: Record<string, { nameZh: string; nameEn: string; noteZh: string; noteEn: string; tableZh: string; tableEn: string; score: number }> = {
      'day-E-high': {
        nameZh: '南洋热力拼桌团餐',
        nameEn: 'Nanyang Social Energy Table',
        noteZh: '白天高能量，适合把本地特色餐嵌入城市微游，提高停留期待感。',
        noteEn: 'High-energy daytime window pairs local flavors with the city route to raise stopover anticipation.',
        tableZh: '4-6 人拼桌',
        tableEn: '4-6 guest shared table',
        score: 96,
      },
      'day-E-low': {
        nameZh: '轻社交早午餐会合桌',
        nameEn: 'Light Social Brunch Table',
        noteZh: '保留一点社交氛围，但控制步行和等位时间。',
        noteEn: 'Keeps a light social layer while controlling walking and queue time.',
        tableZh: '2-4 人半开放桌',
        tableEn: '2-4 guest semi-private table',
        score: 92,
      },
      'day-I-high': {
        nameZh: '静享本地探索餐',
        nameEn: 'Quiet Local Discovery Meal',
        noteZh: '小范围探索，不强制拼桌，适合想体验但不想被打扰的旅客。',
        noteEn: 'A compact local food stop without forced socializing.',
        tableZh: '独立小桌',
        tableEn: 'Private small table',
        score: 93,
      },
      'day-I-low': {
        nameZh: '低噪补能暖食',
        nameEn: 'Low-Noise Recovery Meal',
        noteZh: '机场内完成，低移动、低决策，最适合疲惫或带娃场景。',
        noteEn: 'Airport-side, low-mobility and low-decision, best for tired travelers or families.',
        tableZh: '静音座位',
        tableEn: 'Quiet seating',
        score: 95,
      },
      'night-E-high': {
        nameZh: '夜航安全拼餐局',
        nameEn: 'Night-Safe Shared Supper',
        noteZh: '夜间不拉远距离，保留同路人氛围和安全会合点。',
        noteEn: 'Keeps the meal close to the travel path while preserving a safe shared-table feel.',
        tableZh: '3-5 人安全拼桌',
        tableEn: '3-5 guest safe shared table',
        score: 94,
      },
      'night-E-low': {
        nameZh: '轻拼宵夜补给',
        nameEn: 'Light Shared Late Supper',
        noteZh: '短时热食、低步行，降低红眼航班前的放弃率。',
        noteEn: 'Short hot meal, low walking, designed for red-eye recovery.',
        tableZh: '2-3 人短时拼桌',
        tableEn: '2-3 guest short table',
        score: 91,
      },
      'night-I-high': {
        nameZh: '夜间私享热食盒',
        nameEn: 'Private Night Hot Meal Box',
        noteZh: '靠近登机动线，安静补能，随时可撤回。',
        noteEn: 'Quiet hot meal near the boarding path, easy to exit at any time.',
        tableZh: '独立位',
        tableEn: 'Private seat',
        score: 93,
      },
      'night-I-low': {
        nameZh: '静音恢复热汤餐',
        nameEn: 'Silent Recovery Soup Meal',
        noteZh: '淋浴后热汤和休息区送达，核心是安全、热食、少走路。',
        noteEn: 'Warm soup after shower, delivered near rest areas with minimum walking.',
        tableZh: '低打扰座位',
        tableEn: 'Low-interruption seat',
        score: 97,
      },
    };
    const recommendation = map[key];
    return {
      name: language === 'zh-CN' ? recommendation.nameZh : recommendation.nameEn,
      note: language === 'zh-CN' ? recommendation.noteZh : recommendation.noteEn,
      table: language === 'zh-CN' ? recommendation.tableZh : recommendation.tableEn,
      score: recommendation.score,
    };
  }, [language, mealEnergy, mealPeriod, mealPersona]);
  const mealAddon = addons.find((item) => item.sku === 'ai-group-meal');
  const isMealSelected = selectedAddonSkus.includes('ai-group-meal');

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
              const isDisabled = searchParams.totalTransitHours < pkg.recommendedLayover.minHours;
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

          {activePackage.addons.includes('ai-group-meal') && mealAddon && (
            <div className="liquid-glass-dark relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
              <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/35 bg-cyan-200/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                      <Sparkles size={12} />
                      {language === 'zh-CN' ? '龙腾出行 AI 团餐匹配' : 'AI meal matching add-on'}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black text-orange-100">
                      {language === 'zh-CN' ? `随套餐加购 +¥${mealAddon.price}` : `Add-on +¥${mealAddon.price}`}
                    </span>
                  </div>

                  <h3 className="mt-3 text-2xl font-black tracking-normal text-white">{mealRecommendation.name}</h3>
                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-300">
                    {language === 'zh-CN'
                      ? `${mealRecommendation.note} 系统会把餐位、会合点和返场提醒写入同一张电子凭证，减少用户订票后的停留焦虑。`
                      : 'This optional meal slot is attached to the same voucher, with meeting point and return reminders kept inside the fulfillment flow.'}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    {[
                      {
                        label:
                          mealPeriod === 'day'
                            ? language === 'zh-CN' ? '白天停留' : 'Daytime stopover'
                            : language === 'zh-CN' ? '夜航停留' : 'Night stopover',
                        icon: mealPeriod === 'day' ? SunMedium : Moon,
                      },
                      {
                        label:
                          mealPersona === 'E'
                            ? language === 'zh-CN' ? 'E 型社交' : 'Extrovert social'
                            : language === 'zh-CN' ? 'I 型低打扰' : 'Introvert low-interruption',
                        icon: UsersRound,
                      },
                      {
                        label:
                          mealEnergy === 'high'
                            ? language === 'zh-CN' ? '高能量' : 'High energy'
                            : language === 'zh-CN' ? '低能量' : 'Low energy',
                        icon: mealEnergy === 'high' ? Zap : BatteryCharging,
                      },
                      { label: mealRecommendation.table, icon: ChefHat },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-3">
                          <Icon size={16} className="text-orange-200" />
                          <div className="mt-2 text-[11px] font-black text-slate-100">{item.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                      {(['E', 'I'] as const).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setMealPersona(item)}
                          className={`rounded-full px-3 py-2 text-[11px] font-black transition ${
                            mealPersona === item ? 'bg-cyan-200 text-slate-950' : 'bg-white/8 text-slate-300 hover:bg-white/14'
                          }`}
                        >
                          {item === 'E'
                            ? language === 'zh-CN' ? 'E 人社交' : 'Extrovert'
                            : language === 'zh-CN' ? 'I 人低打扰' : 'Introvert'}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {(['high', 'low'] as const).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setMealEnergy(item)}
                          className={`rounded-full px-3 py-2 text-[11px] font-black transition ${
                            mealEnergy === item ? 'bg-orange-200 text-slate-950' : 'bg-white/8 text-slate-300 hover:bg-white/14'
                          }`}
                        >
                          {item === 'high'
                            ? language === 'zh-CN' ? '高能量' : 'High energy'
                            : language === 'zh-CN' ? '低能量' : 'Low energy'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                  <div className="meal-pulse-ring mx-auto flex h-24 w-24 items-center justify-center rounded-full p-[4px]">
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950">
                      <span className="text-3xl font-black leading-none">{mealRecommendation.score}</span>
                      <span className="mt-1 text-[10px] font-black text-cyan-100">MATCH</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-xs font-semibold leading-6 text-slate-300">
                    {language === 'zh-CN'
                      ? '订票页推荐不打断主流程，只把最合适的餐位作为随票权益锁定。'
                      : 'The booking page keeps this optional and does not interrupt the core package flow.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAddon('ai-group-meal')}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition ${
                      isMealSelected
                        ? 'bg-cyan-200 text-slate-950 shadow-lg shadow-cyan-400/20'
                        : 'bg-white text-slate-950 hover:bg-cyan-50'
                    }`}
                  >
                    <Sparkles size={15} />
                    <span>{isMealSelected ? (language === 'zh-CN' ? '已加入订单' : 'Added') : (language === 'zh-CN' ? '加入 AI 团餐匹配' : 'Add meal matching')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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
