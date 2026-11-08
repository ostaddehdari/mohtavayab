import { describe, expect, it } from 'vitest';
import { motionEngines, shouldUseContinuousAnimation } from './motion-policy';

describe('motion policy', () => {
  it('registers every required engine with an accessibility fallback', () => {
    expect(motionEngines.map((engine) => engine.id).sort()).toEqual(
      ['gsap-scrolltrigger', 'lenis', 'motion', 'rive', 'three'].sort(),
    );
    expect(motionEngines.every((engine) => engine.reducedMotion.length > 0)).toBe(true);
  });

  it('stops continuous rendering when motion or visibility policy forbids it', () => {
    expect(shouldUseContinuousAnimation(true, true, true)).toBe(false);
    expect(shouldUseContinuousAnimation(false, false, true)).toBe(false);
    expect(shouldUseContinuousAnimation(false, true, false)).toBe(false);
    expect(shouldUseContinuousAnimation(false, true, true)).toBe(true);
  });
});
