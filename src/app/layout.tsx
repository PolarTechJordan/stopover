import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AppChrome from "@/components/features/AppChrome";
import { AppPreferenceProvider } from "@/components/features/AppPreferenceProvider";
import { APP_PREFERENCES_STORAGE_KEY } from "@/lib/appPreferences";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "龙腾出行 Stopover | AI 中转套餐与微游服务",
  description: "解决中转旅客时间、行李和体验焦虑。以机场贵宾室为信任锚，提供行李全托管、标准化城市微游和误机保障体验。",
};

const preferenceBootScript = `
try {
  var stored = JSON.parse(localStorage.getItem('${APP_PREFERENCES_STORAGE_KEY}') || '{}');
  var root = document.documentElement;
  var theme = stored.theme === 'dark' || stored.theme === 'light' ? stored.theme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  var language = stored.language === 'en-US' || stored.language === 'zh-CN' ? stored.language : 'zh-CN';
  var textScale = stored.textScale === 'compact' || stored.textScale === 'large' || stored.textScale === 'comfortable' ? stored.textScale : 'comfortable';
  root.dataset.theme = theme;
  root.dataset.lang = language;
  root.dataset.textScale = textScale;
  root.lang = language;
  root.style.colorScheme = theme;
} catch (error) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full min-h-full bg-sand text-slate-900 font-sans selection:bg-primary/20">
        <Script
          id="stopover-preferences"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: preferenceBootScript }}
        />
        <AppPreferenceProvider>
          <AppChrome>{children}</AppChrome>
        </AppPreferenceProvider>
      </body>
    </html>
  );
}
