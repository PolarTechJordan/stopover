'use client';

import { ALargeSmall, Languages, Moon, SunMedium } from 'lucide-react';
import { t } from '@/lib/appPreferences';
import { useAppPreferences } from './AppPreferenceProvider';

type PreferenceToolbarProps = {
  compact?: boolean;
  showTextScale?: boolean;
};

export default function PreferenceToolbar({ compact = false, showTextScale = true }: PreferenceToolbarProps) {
  const { language, theme, textScale, toggleLanguage, toggleTheme, cycleTextScale } = useAppPreferences();
  const isChinese = language === 'zh-CN';
  const isDark = theme === 'dark';
  const textScaleLabel =
    textScale === 'compact'
      ? t(language, 'preferences.textCompact')
      : textScale === 'large'
        ? t(language, 'preferences.textLarge')
        : t(language, 'preferences.textComfortable');

  return (
    <div className={`flex shrink-0 items-center ${compact ? 'gap-1' : 'gap-1.5'}`} aria-label="Display preferences">
      <button
        type="button"
        onClick={toggleLanguage}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white/82 font-black text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark-pref-surface ${
          compact ? 'h-9 px-2.5 text-[11px]' : 'h-10 px-3 text-xs'
        }`}
        aria-label={isChinese ? 'Switch to English' : '切换到中文'}
        title={isChinese ? 'Switch to English' : '切换到中文'}
      >
        <Languages size={compact ? 13 : 14} />
        <span>{t(language, 'preferences.language')}</span>
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/82 text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark-pref-surface ${
          compact ? 'h-9 w-9' : 'h-10 w-10'
        }`}
        aria-label={isDark ? t(language, 'preferences.themeLight') : t(language, 'preferences.themeDark')}
        title={isDark ? t(language, 'preferences.themeLight') : t(language, 'preferences.themeDark')}
      >
        {isDark ? <SunMedium size={compact ? 15 : 16} /> : <Moon size={compact ? 15 : 16} />}
      </button>

      {showTextScale && (
        <button
          type="button"
          onClick={cycleTextScale}
          className={`inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 bg-white/82 font-black text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark-pref-surface ${
            compact ? 'h-9 px-2.5 text-[10px]' : 'h-10 px-3 text-[11px]'
          }`}
          aria-label={t(language, 'preferences.textScale')}
          title={`${t(language, 'preferences.textScale')}: ${textScaleLabel}`}
        >
          <ALargeSmall size={compact ? 14 : 15} />
          <span>{textScaleLabel}</span>
        </button>
      )}
    </div>
  );
}
