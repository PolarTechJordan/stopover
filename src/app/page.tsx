'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Compass, ShieldCheck, Briefcase, Clock, Plane, 
  MapPin, Utensils, ChevronRight, HelpCircle, AlertCircle 
} from 'lucide-react';
import { airports, packages } from '@/lib/mockData';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-sand to-sand/60 px-6 py-16 md:py-24 border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Subheading Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-6 animate-float">
            <Plane size={14} />
            <span>全新一代国际中转生态整合服务方案</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight max-w-4xl">
            把漫长枯燥的机场等待，<br/>
            升级为<span className="text-primary bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">轻装自由</span>的城市奇遇
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl leading-relaxed">
            专为中转 <strong>6–48 小时</strong> 旅客设计。以机场贵宾厅为信任锚，通过 <strong>行李全托管</strong> 和 <strong>标准化市区半日游</strong>，彻底消除时间、行李与误机焦虑。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link 
              href="/search" 
              className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/95 transition-all duration-200 flex items-center justify-center gap-2 group hover:translate-y-[-2px]"
            >
              <span>立即模拟预订套餐</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <a 
              href="#problem" 
              className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition-all duration-200 flex items-center justify-center"
            >
              了解设计理念
            </a>
          </div>

          {/* Quick Demo hint */}
          <div className="flex items-start gap-3 bg-accent/10 border border-accent/20 rounded-2xl p-4 text-left max-w-2xl">
            <AlertCircle className="text-accent flex-shrink-0 mt-0.5" size={18} />
            <div>
              <span className="font-semibold text-slate-800 text-sm block">如何玩转演示 Demo：</span>
              <span className="text-xs text-slate-600 leading-relaxed block mt-0.5">
                这是一个交互式沙盒。您可以先点击上方按钮进行模拟订购。订购支付后，屏幕右下角将出现“演示控制台”，允许您手动触发“交付行李”、“进入休息室”甚至“超时延误”等物理状态，观察状态机与行李轨迹如何联动响应。
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Painpoints Section */}
      <section id="problem" className="py-16 px-6 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-2">
          中转旅客的“三大核心焦虑”与我们的一站式对策
        </h2>
        <p className="text-slate-500 text-center text-sm mb-12">
          针对 6-48 小时过境停留，重构中转全链路体验
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-accent mb-5">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">1. 时间与决策焦虑</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed flex-1">
              漫长的中转等待期无事可做，候机室拥挤难熬；想出机场却被复杂的路线规划、语言障碍以及怕耽误登机的担忧劝退。
            </p>
            <div className="bg-sand/60 px-4 py-2.5 rounded-xl border border-sand-dark text-xs text-slate-700 font-semibold">
              🎯 <strong>对策</strong>：预设 3/4/6/8 小时固定时段标准化路线，向导陪同且全包，免做攻略。
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-primary mb-5">
              <Briefcase size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">2. 随身行李焦虑</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed flex-1">
              提取大件托运行李再次托运极为繁杂，拖着登机箱出行更让城市微游成为体力灾难，严重压制出行消费意愿。
            </p>
            <div className="bg-sand/60 px-4 py-2.5 rounded-xl border border-sand-dark text-xs text-slate-700 font-semibold">
              🎯 <strong>对策</strong>：柜台一键全托管，RFID 物联网跟踪，人包分离直抵贵宾室或酒店。
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">3. 误机安全焦虑</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed flex-1">
              堵车、向导不靠谱导致未能准时登机的灾难后果需要旅客独自承担，这是出港中转探索最大的决策阻碍。
            </p>
            <div className="bg-sand/60 px-4 py-2.5 rounded-xl border border-sand-dark text-xs text-slate-700 font-semibold">
              🎯 <strong>对策</strong>：航班动态前置触发，专人开辟 VIP 安检通道，误机承保并极速理赔。
            </div>
          </div>
        </div>
      </section>

      {/* Package comparison */}
      <section className="py-16 px-6 bg-white border-y border-slate-200/50">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-2">
            灵活定义 3 档核心中转套餐
          </h2>
          <p className="text-slate-500 text-center text-sm mb-12">
            根据停留时长智能推荐，匹配高净值探索、带娃出游、纯能补给多重诉求
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div 
                key={pkg.sku}
                className="border border-slate-200/80 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-semibold self-start mb-4">
                  中转 {pkg.recommendedLayover.minHours}–{pkg.recommendedLayover.maxHours}h 推荐
                </span>
                <h3 className="font-bold text-xl text-slate-900 mb-1">{pkg.name}</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{pkg.tagline}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-primary">¥{pkg.price}</span>
                  <span className="text-xs text-slate-400">/ 起</span>
                </div>
                <div className="h-[1px] bg-slate-100 mb-6" />
                <ul className="space-y-3 mb-8 flex-1 text-xs text-slate-600">
                  {pkg.includes.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/search"
                  className="w-full py-3 bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-semibold rounded-xl text-center text-xs transition-all duration-200"
                >
                  去定制选择
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flagship Hub Airports */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-2">
          率先接入 4 大标志性国际中转枢纽
        </h2>
        <p className="text-slate-500 text-center text-sm mb-12">
          精选枢纽进行灰度 PoC 试点，打通当地优质运营商
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {airports.map((airport) => (
            <div 
              key={airport.code}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:translate-y-[-4px] transition-all duration-300"
            >
              <div 
                className="h-32 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                style={{ backgroundImage: `url(${airport.image})` }}
              />
              <div className="p-4">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                  {airport.code}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-2">{airport.nameZh}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{airport.city}</p>
                <span className="text-[10px] text-slate-500 bg-sand/60 px-2 py-1 rounded-full inline-block mt-3 border border-sand-dark">
                  {airport.visaFree ? '免签/可落地签' : '需办理电子签'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Scenarios Visual section */}
      <section className="py-16 px-6 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <Compass size={12} className="animate-spin" />
              <span>流程控制与演示模拟</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">极速演示模式 (Fast-Forward)</h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              在实际中，行李在贵宾室寄存、城市游等要耗费 6-24 小时。为方便评审与验证，我们在订单管理和跟踪页嵌入了 **快速演示控制台**。
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white mt-1">1</div>
                <div>
                  <h4 className="text-xs font-bold">模拟提交航班与套餐：</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">自定中转小时数（如 12 小时），系统将生成对应的 RFID 行李电子标签和旅游行程表。</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white mt-1">2</div>
                <div>
                  <h4 className="text-xs font-bold">物理操作一键驱动：</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">控制台中可一键完成“交付行李”、“行李到达贵宾厅”。无需漫长等待即可流转状态。</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white mt-1">3</div>
                <div>
                  <h4 className="text-xs font-bold">模拟意外误机：</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">可一键模拟旅客在城市游中堵车或超时导致将要误机，触发 VIP 安检与改签紧急保障机制。</p>
                </div>
              </div>
            </div>
            <Link 
              href="/search"
              className="inline-block mt-8 px-6 py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/95 transition-colors shadow-lg shadow-primary/20"
            >
              进入 Demo 演示
            </Link>
          </div>
          
          <div className="flex-1 w-full max-w-sm glass-card-dark rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Visual mock order */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">🧳</div>
                <span className="text-xs font-bold">行李智能追踪 (RFID)</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                转运中 (In Transit)
              </span>
            </div>

            {/* Timeline in black card */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
              <div className="relative">
                <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-primary border-4 border-white/30" />
                <div className="text-xs font-bold text-white">收件登记</div>
                <div className="text-[10px] text-slate-400">新加坡樟宜机场 T1 柜台已打包贴标</div>
              </div>
              <div className="relative">
                <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-amber-500 border-4 border-white/30 animate-ping" />
                <div className="text-xs font-bold text-amber-400">转运中</div>
                <div className="text-[10px] text-slate-400">行李进入快速内部传送皮带，前往贵宾厅</div>
              </div>
              <div className="relative">
                <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-white/20" />
                <div className="text-xs font-bold text-slate-500">已送达贵宾厅</div>
                <div className="text-[10px] text-slate-600">等待旅客中转后认领</div>
              </div>
            </div>
            
            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-3 text-[11px]">
              <span className="text-slate-400 block">实时定位：</span>
              <span className="text-white font-mono block font-semibold mt-0.5">T1 Lounge Depot Zone C-4</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
