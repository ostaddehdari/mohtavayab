'use client';

import { useRive } from '@rive-app/react-canvas';
import { useReducedMotion } from 'motion/react';

export function RiveTransfer() {
  const reduceMotion = useReducedMotion();
  const { RiveComponent } = useRive({
    src: '/mohtavayab/rive/transfer-demo.riv',
    autoplay: !reduceMotion,
  });

  if (reduceMotion) {
    return (
      <div className="rive-fallback" role="img" aria-label="انتقال کنترل‌شده محتوا بین شبکه‌ها">
        <span>منبع</span>
        <i aria-hidden="true">←</i>
        <span>مقصد</span>
      </div>
    );
  }

  return <RiveComponent className="rive-canvas" aria-label="نمونه تعاملی انتقال محتوا" />;
}
