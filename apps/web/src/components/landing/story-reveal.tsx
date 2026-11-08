'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';

export function StoryReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !root.current) return;
    let disposed = false;
    let revert: (() => void) | undefined;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (disposed || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const items = gsap.utils.toArray<HTMLElement>('[data-story-step]');
        items.forEach((item, index) => {
          gsap.fromTo(
            item,
            { autoAlpha: 0.25, y: 56 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 82%',
                end: 'top 48%',
                scrub: index === 0 ? false : 0.45,
              },
            },
          );
        });
      }, root);
      revert = () => context.revert();
    })();

    return () => {
      disposed = true;
      revert?.();
    };
  }, [reduceMotion]);

  return <div ref={root}>{children}</div>;
}
