import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DemoController from "@/components/features/DemoController";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "中转游 Stopover | 机场生态一站式中转套餐与微游服务",
  description: "解决中转旅客时间、行李和体验焦虑。以机场贵宾室为信任锚，提供行李全托管与标准化城市微游体验。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-sand text-slate-900 flex flex-col font-sans selection:bg-primary/20">
        {/* Navigation */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform duration-200">
                S
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-950 via-primary to-slate-950 bg-clip-text text-transparent sm:text-xl">
                Stopover <span className="text-accent font-medium text-sm">中转游</span>
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-primary transition-colors">AI 礼宾 Demo</Link>
            <Link href="/search" className="hover:text-primary transition-colors">预订中转套餐</Link>
            <Link href="/pitch" className="hover:text-primary transition-colors">展示 PPT</Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              Qwen + State Machine Demo
            </span>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex min-w-0 flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="hidden bg-slate-900 text-slate-400 text-xs py-8 px-6 border-t border-slate-800 text-center md:block">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-200 mb-1 text-sm">Stopover 中转游项目 Web 演示原型</p>
              <p>以休息室为信任锚 + 行李全托管 + 模块化城市服务，激活长中转等待商机</p>
            </div>
            <p>© 2026 PolarTech / Jordan. All rights reserved.</p>
          </div>
        </footer>

        {/* Floating Demo Controller */}
        <DemoController />
      </body>
    </html>
  );
}
