'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, Home, Map, Plane, TicketCheck } from 'lucide-react';
import { useOrderStore } from '@/lib/store/orderStore';

type FlowHeaderConfig = {
  title: string;
  step: string;
  fallback: string;
};

const flowHeaders: Record<string, Omit<FlowHeaderConfig, 'fallback'> & { fallback: string }> = {
  '/search': {
    title: '航班计划',
    step: 'Step 1/5',
    fallback: '/',
  },
  '/packages': {
    title: '定制套餐',
    step: 'Step 2/5',
    fallback: '/search',
  },
  '/checkout': {
    title: '确认支付',
    step: 'Step 3/5',
    fallback: '/packages',
  },
  '/order': {
    title: '电子凭证',
    step: 'Step 4/5',
    fallback: '/checkout',
  },
  '/journey': {
    title: '行程追踪',
    step: 'Step 5/5',
    fallback: '/order',
  },
};

function readStack() {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem('stopover.mobileRouteStack') ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  window.sessionStorage.setItem('stopover.mobileRouteStack', JSON.stringify(stack.slice(-20)));
}

export default function MobileAppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentOrder } = useOrderStore();
  const stackRef = useRef<string[]>([]);

  const flowConfig = flowHeaders[pathname ?? ''];
  const fallback = useMemo(() => {
    if (pathname === '/journey' && currentOrder) {
      return `/order?id=${currentOrder.orderId}`;
    }
    return flowConfig?.fallback ?? '/';
  }, [currentOrder, flowConfig?.fallback, pathname]);
  const rightAction = useMemo(() => {
    if (!currentOrder) {
      return {
        href: '/',
        label: '返回首页',
        Icon: Home,
      };
    }

    if (pathname === '/journey') {
      return {
        href: `/order?id=${currentOrder.orderId}`,
        label: '查看电子凭证',
        Icon: TicketCheck,
      };
    }

    return {
      href: `/journey?id=${currentOrder.orderId}`,
      label: '查看行程追踪',
      Icon: Map,
    };
  }, [currentOrder, pathname]);

  useEffect(() => {
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    const existingStack = readStack();
    const existingIndex = existingStack.lastIndexOf(currentUrl);
    const nextStack = existingIndex >= 0 ? existingStack.slice(0, existingIndex + 1) : [...existingStack, currentUrl];

    writeStack(nextStack);
    stackRef.current = nextStack;
  }, [pathname]);

  const handleBack = () => {
    if (stackRef.current.length > 1) {
      router.back();
      return;
    }

    router.push(fallback);
  };
  const RightActionIcon = rightAction.Icon;

  if (!flowConfig) {
    return (
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-black text-white shadow-sm">
              S
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black leading-tight text-slate-950">Stopover 中转游</div>
              <div className="truncate text-[10px] font-bold text-slate-400">AI 礼宾 App Demo</div>
            </div>
          </Link>
          <Link
            href="/search"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-black text-white shadow-sm"
          >
            <Plane size={13} />
            <span>预订</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/92 px-3 py-2.5 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-800 transition active:scale-95 active:bg-slate-200"
          aria-label="返回上一页"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-primary">{flowConfig.step}</div>
          <div className="truncate text-base font-black leading-tight text-slate-950">{flowConfig.title}</div>
        </div>

        <Link
          href={rightAction.href}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition active:scale-95"
          aria-label={rightAction.label}
        >
          <RightActionIcon size={18} />
        </Link>
      </div>
    </header>
  );
}
