import type { PackageSku } from './types';

export const STOP_OVER_PRD = {
  productRange: {
    minHours: 6,
    maxHours: 48,
  },
  entryBufferHours: 1.5,
  minServiceWindowHours: 3,
  baggageTransferSlaMin: 15,
  baggageReturnBufferMin: 90,
  securityGateDeadlineMin: 60,
  conciergeInterventionSlaMin: 5,
  baggageCoverageCny: 5000,
  packageThresholds: {
    light: {
      minHours: 6,
      maxHours: 8,
      labelZh: '6-8 小时机场内补能',
      labelEn: '6-8h airport-side recovery',
    },
    micro: {
      minHours: 10,
      maxHours: 18,
      labelZh: '10-18 小时白天城市微游',
      labelEn: '10-18h daytime city micro-tour',
    },
    overnight: {
      minHours: 12,
      maxHours: 36,
      labelZh: '12-36 小时跨夜/家庭休息',
      labelEn: '12-36h overnight or family rest',
    },
  } satisfies Record<PackageSku, { minHours: number; maxHours: number; labelZh: string; labelEn: string }>,
} as const;

export type PackageRecommendationSignals = {
  wantsCityTour?: boolean;
  needsHotel?: boolean;
  wantsPrivateCar?: boolean;
  hasEntryRisk?: boolean;
};

export function getRecommendedPackageSku(
  totalTransitHours: number,
  signals: PackageRecommendationSignals = {},
): PackageSku {
  if (signals.hasEntryRisk || totalTransitHours < STOP_OVER_PRD.packageThresholds.micro.minHours) {
    return 'light';
  }

  if (signals.needsHotel || totalTransitHours >= STOP_OVER_PRD.packageThresholds.micro.maxHours) {
    return 'overnight';
  }

  if (signals.wantsCityTour || signals.wantsPrivateCar || totalTransitHours >= STOP_OVER_PRD.packageThresholds.micro.minHours) {
    return 'micro';
  }

  return 'light';
}

export function getPackageTimeFit(packageSku: PackageSku, totalTransitHours: number) {
  const threshold = STOP_OVER_PRD.packageThresholds[packageSku];
  return {
    threshold,
    belowMin: totalTransitHours < threshold.minHours,
    aboveMax: totalTransitHours > threshold.maxHours,
    inRecommendedRange: totalTransitHours >= threshold.minHours && totalTransitHours <= threshold.maxHours,
  };
}

export function getDefaultReservedServiceHours(totalTransitHours: number) {
  if (totalTransitHours === 10) return 7;
  if (totalTransitHours === 35) return 31.5;

  if (totalTransitHours < STOP_OVER_PRD.productRange.minHours) {
    return Math.max(0, Math.floor(totalTransitHours));
  }

  if (totalTransitHours <= STOP_OVER_PRD.packageThresholds.light.maxHours) {
    return Math.max(STOP_OVER_PRD.minServiceWindowHours, Math.floor(totalTransitHours - 2));
  }

  if (totalTransitHours < STOP_OVER_PRD.packageThresholds.micro.maxHours) {
    return Math.min(8, Math.max(4, Math.floor(totalTransitHours - 2)));
  }

  if (totalTransitHours < STOP_OVER_PRD.packageThresholds.overnight.maxHours) {
    return Math.min(18, Math.max(8, Math.floor(totalTransitHours - 4)));
  }

  return Math.max(8, Math.floor(totalTransitHours - 6));
}

export function getMaxReservedServiceHours(totalTransitHours: number) {
  return Math.max(STOP_OVER_PRD.minServiceWindowHours, Math.floor(totalTransitHours - 2));
}

export function getBoardingBufferHours(totalTransitHours: number, reservedServiceHours: number) {
  return Math.max(
    0,
    Math.round((totalTransitHours - reservedServiceHours - STOP_OVER_PRD.entryBufferHours) * 10) / 10,
  );
}

export function isWithinMvpRange(totalTransitHours: number) {
  return (
    totalTransitHours >= STOP_OVER_PRD.productRange.minHours &&
    totalTransitHours <= STOP_OVER_PRD.productRange.maxHours
  );
}
