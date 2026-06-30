'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/store/orderStore';
import { airports, mockFlightCases, MockFlightCase } from '@/lib/mockData';
import { AirportCode } from '@/lib/types';
import { 
  Plane, Clock, ChevronRight, HelpCircle, Check, Info, 
  AlertTriangle, Calendar, Award, Compass, RefreshCw 
} from 'lucide-react';
import dayjs from 'dayjs';

export default function SearchPage() {
  const router = useRouter();
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
        
        // Default reserved hours to: calculatedLayover - 2 (with minimum 6 and maximum based on case)
        if (c.calculatedLayover <= 4) {
          setReservedHours(4); // short
        } else if (c.calculatedLayover === 10) {
          setReservedHours(8); // reserve 8h out of 10h
        } else if (c.calculatedLayover === 23) {
          setReservedHours(16); // reserve 16h out of 23h
        } else if (c.calculatedLayover === 35) {
          setReservedHours(28); // reserve 28h out of 35h
        } else {
          setReservedHours(Math.max(6, c.calculatedLayover - 3));
        }
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
            if (roundedHours < 6) {
              setReservedHours(roundedHours);
            } else {
              setReservedHours(Math.min(roundedHours - 2, Math.max(6, Math.floor(roundedHours - 3))));
            }
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

  const currentAirportInfo = airports.find(a => a.code === selectedAirport)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedTotalHours < 4) {
      alert('您的航班总中转时长低于 4 小时，无法订购中转套餐。请选择其他预设。');
      return;
    }
    
    // Save to store
    setSearchParams({
      airportCode: selectedAirport,
      arrivalFlightNo: arrivalFlight.toUpperCase(),
      departureFlightNo: departureFlight.toUpperCase(),
      layoverHours: reservedHours,
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
    return dayjs(str).format('MM月DD日 HH:mm');
  };

  return (
    <div className="flex-1 py-8 px-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Step 1 of 5</span>
            <span className="text-slate-400 text-xs">自动核算中转时间与手动预留决策</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">选择您的中转航班计划</h1>
        </div>
        
        {/* Toggle Custom Mode */}
        <button
          onClick={() => setIsCustomMode(!isCustomMode)}
          className="text-xs bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 font-bold px-4 py-2.5 rounded-xl text-slate-700 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw size={12} className={isCustomMode ? 'animate-spin' : ''} />
          <span>{isCustomMode ? '切换为：预设真实案例演示' : '手动输入：自定义到达/离境航班'}</span>
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
                选择一个真实的航班中转案例进行模拟：
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockFlightCases.map((c) => {
                  const isActive = selectedCaseId === c.id;
                  const isShort = c.calculatedLayover < 4;
                  
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
                        {c.calculatedLayover}小时中转 ({c.periodDesc.split(' / ')[0]})
                      </span>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {c.airportCode}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {c.label.split(' (')[0]}
                        </span>
                      </div>

                      {/* Flight Details */}
                      <div className="text-[11px] text-slate-500 space-y-1 my-2 flex-grow">
                        <div className="flex items-center justify-between">
                          <span>到达：<strong>{c.arrivalFlightNo}</strong> ({c.arrivalAirline})</span>
                          <span>{formatDateTimeText(c.arrivalTimeStr)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>离境：<strong>{c.departureFlightNo}</strong> ({c.departureAirline})</span>
                          <span>{formatDateTimeText(c.departureTimeStr)}</span>
                        </div>
                      </div>

                      <div className="h-[1px] bg-slate-100 my-2" />

                      <p className="text-[10px] text-slate-400 italic">
                        {c.description}
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
                自定义输入中转港航班时间
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    中转枢纽港
                  </label>
                  <select
                    value={selectedAirport}
                    onChange={(e) => setSelectedAirport(e.target.value as AirportCode)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold bg-white"
                  >
                    {airports.map(a => (
                      <option key={a.code} value={a.code}>{a.code} - {a.nameZh}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    到达航班号
                  </label>
                  <input
                    type="text"
                    value={arrivalFlight}
                    onChange={(e) => setArrivalFlight(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-primary"
                    placeholder="如 SQ833"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    离境航班号
                  </label>
                  <input
                    type="text"
                    value={departureFlight}
                    onChange={(e) => setDepartureFlight(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-primary"
                    placeholder="如 SQ306"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1 text-slate-500">
                    <Calendar size={12} />
                    <span>到达中转港具体时间</span>
                  </label>
                  <input
                    type="text"
                    value={arrDateStr}
                    onChange={(e) => setArrDateStr(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-primary"
                    placeholder="格式: YYYY-MM-DD HH:mm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1 text-slate-500">
                    <Calendar size={12} />
                    <span>离开中转港具体时间</span>
                  </label>
                  <input
                    type="text"
                    value={depDateStr}
                    onChange={(e) => setDepDateStr(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-primary"
                    placeholder="格式: YYYY-MM-DD HH:mm"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                提示：手动输入的时间格式应符合 `YYYY-MM-DD HH:mm` (例如 2026-07-01 13:30)。系统会根据输入差值自动重新核算总中转小时数。
              </p>
            </div>
          )}

          {/* Time Analysis and reserved slider section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span>中转时长核算及手动预留套餐消费时长</span>
            </h3>

            {/* Visual Bar Graph breakdown */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>总计中转时间轴拆解</span>
                <span className="text-slate-700">总时长: <strong className="text-primary">{calculatedTotalHours}小时</strong></span>
              </div>
              
              {calculatedTotalHours < 4 ? (
                /* Warning state */
                <div className="h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-xs text-rose-500 font-bold gap-2">
                  <AlertTriangle size={14} />
                  <span>总中转时间低于最低要求（4小时），无法为本航段定制中转游套餐。</span>
                </div>
              ) : (
                /* Segment bar */
                <div>
                  <div className="h-8 w-full rounded-xl overflow-hidden flex text-[10px] font-bold text-white shadow-inner">
                    {/* Entry Buffer */}
                    <div 
                      className="bg-slate-300 text-slate-700 flex items-center justify-center transition-all"
                      style={{ width: `${(1.5 / calculatedTotalHours) * 100}%` }}
                      title="落地通关 buffer: 1.5小时"
                    >
                      <span className="truncate px-1">入境核验 1.5h</span>
                    </div>
                    {/* Reserved packages time */}
                    <div 
                      className="bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center animate-pulse-glow transition-all"
                      style={{ width: `${(reservedHours / calculatedTotalHours) * 100}%` }}
                      title={`预留用于中转套餐游览的可用时长: ${reservedHours}小时`}
                    >
                      <span className="truncate px-1">预留用于中转套餐 {reservedHours}h</span>
                    </div>
                    {/* Boarding Buffer */}
                    <div 
                      className="bg-slate-400 flex items-center justify-center transition-all"
                      style={{ width: `${(Math.max(0, calculatedTotalHours - reservedHours - 1.5) / calculatedTotalHours) * 100}%` }}
                      title={`安检登机 buffer: ${Math.max(0, calculatedTotalHours - reservedHours - 1.5)}小时`}
                    >
                      <span className="truncate px-1">登机 buffer {Math.max(0, Math.round((calculatedTotalHours - reservedHours - 1.5) * 10) / 10)}h</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-1">
                    <span>机场落地 (0h)</span>
                    <span className="text-primary font-bold">套餐可用区间: 4 至 {calculatedTotalHours}小时</span>
                    <span>航班重新起飞 ({calculatedTotalHours}h)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Slider to select reserved hours */}
            {calculatedTotalHours >= 4 && (
              <div className="mt-2 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-600">
                    请手动拖拽设置您预留的中转消费时长 (Reserved Hours)
                  </label>
                  <span className="text-xl font-extrabold text-primary">
                    {reservedHours} <span className="text-xs font-semibold text-slate-400">小时</span>
                  </span>
                </div>
                
                <input
                  type="range"
                  min="4"
                  max={calculatedTotalHours}
                  step="1"
                  value={reservedHours}
                  onChange={(e) => setReservedHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-2">
                  <span>最低 4小时起订</span>
                  <span className="text-slate-500">预留时间越长，可选择的城市游越丰富</span>
                  <span>上限 {calculatedTotalHours}小时</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Hub info and proceed CTA (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Airport details card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
            <h3 className="font-bold text-xs text-slate-400 mb-4 uppercase tracking-wider">当前中转港枢纽信息</h3>
            
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
                  <strong>出关政策</strong>：{currentAirportInfo.visaFree ? '对持中国护照免签，中转可自由出港观光。' : '中转城市游需要持电子签证 (e-Visa)。'}
                </p>
              </div>
              <div className="flex gap-2">
                <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>联程贵宾厅</strong>：{currentAirportInfo.loungeLocation} (T1航站楼，含洗漱淋浴、高端热食、Wi-Fi)。
                </p>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col gap-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">匹配方案汇总</h3>
            
            <div className="space-y-3 text-xs border-b border-white/10 pb-4 mb-2">
              <div className="flex justify-between">
                <span className="text-slate-400">中转机场</span>
                <span className="font-semibold text-white">{currentAirportInfo.nameZh} ({currentAirportInfo.code})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">总停留时长</span>
                <span className="font-semibold text-white">{calculatedTotalHours} 小时</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">预留消费时间</span>
                <span className="font-semibold text-white text-accent">{reservedHours} 小时</span>
              </div>
            </div>

            {calculatedTotalHours < 4 ? (
              <div className="py-2.5 px-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs text-center font-bold">
                ⚠️ 中转时间不足 4 小时，无法订购
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all"
              >
                <span>订制该时间段套餐方案</span>
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
            
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              预留中转时间将被传入下一步以精准推荐轻享包、微游包或过夜包服务。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
