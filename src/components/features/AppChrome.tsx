'use client';

import Link from 'next/link';
import DemoController from '@/components/features/DemoController';
import MobileAppHeader from '@/components/features/MobileAppHeader';
import PreferenceToolbar from '@/components/features/PreferenceToolbar';
import { t } from '@/lib/appPreferences';
import { useAppPreferences } from './AppPreferenceProvider';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const { language } = useAppPreferences();

  return (
    <div className="flex min-h-full flex-col">
      <MobileAppHeader />

      <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-slate-200/60 bg-white/82 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4 md:flex">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="group flex min-w-0 items-center gap-2">
            <div className="meal-pulse-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg p-[1px] text-white shadow-md transition-transform duration-200 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-950 text-sm font-extrabold">
                龙
              </div>
            </div>
            <span className="truncate text-lg font-extrabold tracking-normal text-slate-950 sm:text-xl">
              {t(language, 'brand.name')} <span className="text-sm font-semibold text-accent">Stopover</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
            <Link href="/" className="transition-colors hover:text-primary">
              {t(language, 'nav.concierge')}
            </Link>
            <Link href="/search" className="transition-colors hover:text-primary">
              {t(language, 'nav.booking')}
            </Link>
            <Link href="/pitch" className="transition-colors hover:text-primary">
              {t(language, 'nav.pitch')}
            </Link>
            <span className="text-slate-300">|</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
              {t(language, 'nav.status')}
            </span>
          </nav>
          <PreferenceToolbar />
        </div>
      </header>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>

      <footer className="hidden border-t border-slate-800 bg-slate-950 px-6 py-8 text-center text-xs text-slate-400 md:block">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="mb-1 text-sm font-bold text-slate-200">{t(language, 'footer.title')}</p>
            <p>{t(language, 'footer.body')}</p>
          </div>
          <p>{t(language, 'footer.rights')}</p>
        </div>
      </footer>

      <DemoController />
    </div>
  );
}
