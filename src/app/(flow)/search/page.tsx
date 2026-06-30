'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/store/orderStore';
import { airports, mockFlightCases } from '@/lib/mockData';
import { AirportCode } from '@/lib/types';
import { formatHours, localizeAirport, t } from '@/lib/appPreferences';
import { useAppPreferences } from '@/components/features/AppPreferenceProvider';
import { 
  Clock, ChevronRight, Check, Info,
  AlertTriangle, Calendar, RefreshCw,
} from 'lucide-react';
import dayjs from 'dayjs';

const MIN_BOOKABLE_HOURS = 6;
const ENTRY_BUFFER_HOURS = 1.5;
const MIN_SERVICE_HOURS = 3;

function getDefaultReservedHours(totalHours: number) {
  if (totalHours < MIN_BOOKABLE_HOURS) return Math.max(0, Math.floor(totalHours));
  if (totalHours <= 8) return Math.max(MIN_SERVICE_HOURS, Math.floor(totalHours - 2));
  if (totalHours < 18) return Math.min(8, Math.max(4, Math.floor(totalHours - 2)));
  if (totalHours < 36) return Math.min(18, Math.max(8, Math.floor(totalHours - 4)));
  return Math.max(8, Math.floor(totalHours - 6));
}

const airlineLabels: Record<string, string> = {
  新加坡航空: 'Singapore Airlines',
  卡塔尔航空: 'Qatar Airways',
  土耳其航空: 'Turkish Airlines',
  酷航: 'Scoot',
};

const flightCaseEnglishCopy: Record<string, { label: string; period: string; description: string }> = {
  'case-4h': {
    label: '4h non-bookable boundary sample (Singapore)',
    period: 'Below MVP minimum',
    description: 'Ultra-short 4h layover is below the PRD 6h booking floor. Use this case to demo the non-bookable boundary and airport-only alternatives.',
  },
  'case-10h': {
    label: '10h daytime layover (Singapore - classic micro-tour)',
    period: 'Morning arrival',
    description: '10h daytime layover. Recommended fit: City Micro-Tour, with an 8h reserved service window for a classic city route.',
  },
  'case-23h': {
    label: '23h overnight layover (Singapore - family rest)',
    period: 'Noon arrival',
    description: 'Ideal overnight window. Recommended fit: Overnight Rest, including a 6h airport hotel recovery block.',
  },
  'case-35h': {
    label: '35h long cross-day layover (Doha - private deep tour)',
    period: 'Late-night arrival',
    description: 'Long cross-day stopover with enough time for overnight rest, private transfer and a deeper Doha or desert itinerary.',
  },
};

function localizeAirline(name: string, language: 'zh-CN' | 'en-US') {
  return language === 'zh-CN' ? name : airlineLabels[name] ?? name;
}

export default function SearchPage() {
  const router = useRouter();
  const { language } = useAppPreferences();
  const { setSearchParams, clearCustomizations } = useOrderStore();

  // State
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-10h');
  const [selectedAirport, setSelectedAirport] = useState<AirportCode>('SIN');
  const [arrivalFlight, setArrivalFlight] = useState('SQ833');
  const [departureFlight, setDepartureFlight] = useState('SQ322');
  
  // Custom or auto dates
  const [arrDateStr, setArrDateStr] = useState('2026-07-01 08:30');
  const [depDateStr, setDepDateStr] = useState('2026-07-01 18:30');
  
  const [calculatedTotalHours, setCalculatedTotalHours] = useState<number>(10);
  const [reservedHours, setReservedHours] = useState<number>(8);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Sync state when case changes
  useEffect(() => {
    if (!isCustomMode) {
      const c = mockFlightCases.find(caseItem => caseItem.id === selectedCaseId);
      if (c) {
        setSelectedAirport(c.airportCode);
        setArrivalFlight(c.arrivalFlightNo);
        setDepartureFlight(c.departureFlightNo);
        setArrDateStr(c.arrivalTimeStr);
        setDepDateStr(c.departureTimeStr);
        setCalculatedTotalHours(c.calculatedLayover);
        
        setReservedHours(getDefaultReservedHours(c.calculatedLayover));
      }
    }
  }, [selectedCaseId, isCustomMode]);

  // Handle custom date/time change and recompute layover
  useEffect(() => {
    if (isCustomMode) {
      try {
        const arr = dayjs(arrDateStr);
        const dep = dayjs(depDateStr);
        if (arr.isValid() && dep.isValid()) {
          const diffHours = dep.diff(arr, 'hour', true);
          const roundedHours = Math.round(diffHours * 10) / 10;
          if (roundedHours > 0) {
            setCalculatedTotalHours(roundedHours);
            // bounds for reserved hours
            setReservedHours(getDefaultReservedHours(roundedHours));
          } else {
            setCalculatedTotalHours(0);
            setReservedHours(0);
          }
        }
      } catch (err) {
        console.error('Date parsing error', err);
      }
    }
  }, [arrDateStr, depDateStr, isCustomMode]);

  const currentAirportInfo = localizeAirport(airports.find(a => a.code === selectedAirport)!, language);
  const maxReservedHours = Math.max(MIN_SERVICE_HOURS, Math.floor(calculatedTotalHours - 2));
  const safeReservedHours = Math.min(reservedHours, maxReservedHours);
  const boardingBufferHours = Math.max(0, Math.round((calculatedTotalHours - safeReservedHours - ENTRY_BUFFER_HOURS) * 10) / 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedTotalHours < MIN_BOOKABLE_HOURS) {
      alert(language === 'zh-CN' ? '您的航班总中转时长低于 6 小时，无法订购中转套餐。请选择其他预设。' : 'This layover is below the 6-hour minimum for stopover packages.');
      return;
    }
    
    // Save to store
    setSearchParams({
      airportCode: selectedAirport,
      arrivalFlightNo: arrivalFlight.toUpperCase(),
      departureFlightNo: departureFlight.toUpperCase(),
      layoverHours: safeReservedHours,
      totalTransitHours: calculatedTotalHours,
      arrivalTimeStr: arrDateStr,
      departureTimeStr: depDateStr
    });
    
    // Clear previous selections to avoid conflict
    clearCustomizations();

    // Redirect to packages step
    router.push('/packages');
  };

  // Format date readable
  const formatDateTimeText = (str: string) => {
    return dayjs(str).format(language === 'zh-CN' ? 'MM月DD日 HH:mm' : 'MMM D, HH:mm');
  };

  return (
    <div className="flex-1 py-8 px-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{t(language, 'flow.search.step')}</span>
            <span className="text-slate-400 text-xs">{t(language, 'search.subtitle')}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">{t(language, 'search.title')}</h1>
        </div>
        
        {/* Toggle Custom Mode */}
        <button
          onClick={() => setIsCustomMode(!isCustomMode)}
          className="text-xs bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 font-bold px-4 py-2.5 rounded-xl text-slate-700 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw size={12} className={isCustomMode ? 'animate-spin' : ''} />
          <span>{isCustomMode ? t(language, 'search.presetMode') : t(language, 'search.customMode')}</span>
        </button>
      </div>

      {/* Main Grid: Fully stretched to 7xl container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Preset Case List or Manual Form (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {!isCustomMode ? (
            /* PRESET MODE */
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t(language, 'search.caseSelector')}
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockFlightCases.map((c) => {
                  const isActive = selectedCaseId === c.id;
                  const isShort = c.calculatedLayover < MIN_BOOKABLE_HOURS;
                  const englishCopy = flightCaseEnglishCopy[c.id];
                  const caseLabel = language === 'zh-CN' ? c.label : englishCopy?.label ?? c.label;
                  const periodLabel = language === 'zh-CN' ? c.periodDesc.split(' / ')[0] : englishCopy?.period ?? c.periodDesc;
                  const caseDescription = language === 'zh-CN' ? c.description : englishCopy?.description ?? c.description;
                  
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`cursor-pointer rounded-2xl p-5 border text-left flex flex-col transition-all duration-300 relative ${
                        isActive
                          ? 'bg-white border-primary shadow-md ring-2 ring-primary/10'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm shadow-inner-white'
                      }`}
                    >
                      {/* Badge for case */}
                      <span className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded font-bold ${
                        isShort 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : isActive 
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {formatHours(c.calculatedLayover, language)} ({periodLabel})
                      </span>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {c.airportCode}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {caseLabel.split(' (')[0]}
                        </span>
                      </div>

                      {/* Flight Details */}
                      <div className="text-[11px] text-slate-500 space-y-1 my-2 flex-grow">
                        <div className="flex items-center justify-between">
                          <span>{language === 'zh-CN' ? '到达' : 'Arrive'}: <strong>{c.arrivalFlightNo}</strong> ({localizeAirline(c.arrivalAirline, language)})</span>
                          <span>{formatDateTimeText(c.arrivalTimeStr)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{language === 'zh-CN' ? '离境' : 'Depart'}: <strong>{c.departureFlightNo}</strong> ({localizeAirline(c.departureAirline, language)})</span>
                          <span>{formatDateTimeText(c.departureTimeStr)}</span>
                        </div>
                      </div>

                      <div className="h-[1px] bg-slate-100 my-2" />

                      <p className="text-[10px] text-slate-400 italic">
                        {caseDescription}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CUSTOM MODE FORM */
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-6">
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-3">
                {t(language, 'search.manualTitle')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t(language, 'search.hub')}
                  </label>
                  <select
                    value={selectedAirport}
                    onChange={(e) => setSelectedAirport(e.target.value as AirportCode)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold bg-white"
                  >
                    {airports.map(a => (
                      <option key={a.code} value={a.code}>{a.code} - {localizeAirport(a, language).nameZh}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t(language, 'search.arrivalFlight')}
                  </label>
                  <input
                    type="text"
                    value={arrivalFlight}
                    onChange={(e) => setArrivalFlight(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-primary"
                    placeholder={language === 'zh-CN' ? '如 SQ833' : 'e.g. SQ833'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t(language, 'search.departureFlight')}
                  </label>
                  <input
                    type="text"
                    value={departureFlight}
                    onChange={(e) => setDepartureFlight(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-primary"
                    placeholder={language === 'zh-CN' ? '如 SQ306' : 'e.g. SQ306'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1 text-slate-500">
                    <Calendar size={12} />
                    <span>{t(language, 'search.arrivalTime')}</span>
                  </label>
                  <input
                    type="text"
                    value={arrDateStr}
                    onChange={(e) => setArrDateStr(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-primary"
                    placeholder={language === 'zh-CN' ? '格式: YYYY-MM-DD HH:mm' : 'Format: YYYY-MM-DD HH:mm'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1 text-slate-500">
                    <Calendar size={12} />
                    <span>{t(language, 'search.departureTime')}</span>
                  </label>
                  <input
                    type="text"
                    value={depDateStr}
                    onChange={(e) => setDepDateStr(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-primary"
                    placeholder={language === 'zh-CN' ? '格式: YYYY-MM-DD HH:mm' : 'Format: YYYY-MM-DD HH:mm'}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'zh-CN'
                  ? '提示：手动输入的时间格式应符合 `YYYY-MM-DD HH:mm` (例如 2026-07-01 13:30)。系统会根据输入差值自动重新核算总中转小时数。'
                  : 'Tip: use `YYYY-MM-DD HH:mm` format, for example 2026-07-01 13:30. The system recalculates layover hours from the difference.'}
              </p>
            </div>
          )}

          {/* Time Analysis and reserved slider section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span>{t(language, 'search.timeAnalysis')}</span>
            </h3>

            {/* Visual Bar Graph breakdown */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>{t(language, 'search.totalTimeline')}</span>
                <span className="text-slate-700">{t(language, 'search.totalLayover')}: <strong className="text-primary">{formatHours(calculatedTotalHours, language)}</strong></span>
              </div>
              
              {calculatedTotalHours < MIN_BOOKABLE_HOURS ? (
                /* Warning state */
                <div className="h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-xs text-rose-500 font-bold gap-2">
                  <AlertTriangle size={14} />
                  <span>{t(language, 'search.tooShort')}</span>
                </div>
              ) : (
                /* Segment bar */
                <div>
                  <div className="h-8 w-full rounded-xl overflow-hidden flex text-[10px] font-bold text-white shadow-inner">
                    {/* Entry Buffer */}
                    <div 
                      className="bg-slate-300 text-slate-700 flex items-center justify-center transition-all"
                      style={{ width: `${(ENTRY_BUFFER_HOURS / calculatedTotalHours) * 100}%` }}
                      title={t(language, 'search.entryBuffer')}
                    >
                      <span className="truncate px-1">{t(language, 'search.entryBuffer')}</span>
                    </div>
                    {/* Reserved packages time */}
                    <div 
                      className="bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center animate-pulse-glow transition-all"
                      style={{ width: `${(safeReservedHours / calculatedTotalHours) * 100}%` }}
                      title={`${t(language, 'search.serviceWindow')}: ${formatHours(safeReservedHours, language)}`}
                    >
                      <span className="truncate px-1">{t(language, 'search.serviceWindow')} {safeReservedHours}h</span>
                    </div>
                    {/* Boarding Buffer */}
                    <div 
                      className="bg-slate-400 flex items-center justify-center transition-all"
                      style={{ width: `${(boardingBufferHours / calculatedTotalHours) * 100}%` }}
                      title={`${t(language, 'search.boardingBuffer')}: ${formatHours(boardingBufferHours, language)}`}
                    >
                      <span className="truncate px-1">{t(language, 'search.boardingBuffer')} {boardingBufferHours}h</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-1">
                    <span>{language === 'zh-CN' ? '机场落地' : 'Arrival'} (0h)</span>
                    <span className="text-primary font-bold">
                      {language === 'zh-CN' ? `套餐起订：${MIN_BOOKABLE_HOURS} 小时` : `Package minimum: ${MIN_BOOKABLE_HOURS}h`}
                    </span>
                    <span>{language === 'zh-CN' ? '航班重新起飞' : 'Departure'} ({calculatedTotalHours}h)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Slider to select reserved hours */}
            {calculatedTotalHours >= MIN_BOOKABLE_HOURS && (
              <div className="mt-2 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-600">
                    {t(language, 'search.serviceSlider')}
                  </label>
                  <span className="text-xl font-extrabold text-primary">
                    {safeReservedHours} <span className="text-xs font-semibold text-slate-400">{t(language, 'common.hours')}</span>
                  </span>
                </div>
                
                <input
                  type="range"
                  min={MIN_SERVICE_HOURS}
                  max={maxReservedHours}
                  step="1"
                  value={safeReservedHours}
                  onChange={(e) => setReservedHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-2">
                  <span>{t(language, 'search.minBook')}</span>
                  <span className="text-slate-500">{t(language, 'search.sliderHint')}</span>
                  <span>{language === 'zh-CN' ? '上限' : 'Max'} {formatHours(maxReservedHours, language)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Hub info and proceed CTA (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Airport details card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
            <h3 className="font-bold text-xs text-slate-400 mb-4 uppercase tracking-wider">{t(language, 'search.hubInfo')}</h3>
            
            <div 
              className="h-36 rounded-2xl bg-cover bg-center mb-4 border border-slate-100 shadow-sm"
              style={{ backgroundImage: `url(${currentAirportInfo.image})` }}
            />
            
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded font-black">
                {currentAirportInfo.code}
              </span>
              <span className="font-extrabold text-base text-slate-800">{currentAirportInfo.nameZh}</span>
            </div>

            <div className="space-y-4 text-xs text-slate-600 flex-grow">
              <div className="flex gap-2">
                <Check size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>{t(language, 'search.policy')}</strong>：{currentAirportInfo.visaFree ? t(language, 'search.policyAllowed') : t(language, 'search.policyManual')}
                </p>
              </div>
              <div className="flex gap-2">
                <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>{t(language, 'search.lounge')}</strong>：{currentAirportInfo.loungeLocation} {language === 'zh-CN' ? '（含洗漱淋浴、热食、Wi-Fi）。' : '(shower, hot food and Wi-Fi included).'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col gap-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">{t(language, 'search.summary')}</h3>
            
            <div className="space-y-3 text-xs border-b border-white/10 pb-4 mb-2">
              <div className="flex justify-between">
                <span className="text-slate-400">{t(language, 'checkout.airport')}</span>
                <span className="font-semibold text-white">{currentAirportInfo.nameZh} ({currentAirportInfo.code})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t(language, 'search.totalStay')}</span>
                <span className="font-semibold text-white">{formatHours(calculatedTotalHours, language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t(language, 'search.serviceTime')}</span>
                <span className="font-semibold text-white text-accent">{formatHours(safeReservedHours, language)}</span>
              </div>
            </div>

            {calculatedTotalHours < MIN_BOOKABLE_HOURS ? (
              <div className="py-2.5 px-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs text-center font-bold">
                ⚠️ {t(language, 'search.tooShort')}
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all"
              >
                <span>{t(language, 'search.next')}</span>
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
            
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              {language === 'zh-CN'
                ? '预留服务时间将传入下一步；套餐推荐按总中转时长和 PRD 阈值计算。'
                : 'The reserved service window carries forward; package recommendation is based on total layover duration and PRD thresholds.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
