'use client';

import { getStatusColor, getStatusDisplay } from '@/lib/utils';

export default function OrderStatusBadge({ status, deliveryType = 'home' }) {
  const colors = getStatusColor(status);
  const display = getStatusDisplay(status, deliveryType);

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      <span className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`}></span>
      <span>{display.emoji}</span>
      <span>{display.label}</span>
    </span>
  );
}
