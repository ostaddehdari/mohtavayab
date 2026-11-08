export type MotionEngine = {
  id: 'motion' | 'gsap-scrolltrigger' | 'lenis' | 'three' | 'rive';
  role: string;
  scope: 'landing' | 'dashboard' | 'shared';
  lazy: boolean;
  reducedMotion: 'disable' | 'fade-only' | 'static-fallback';
};

export const motionEngines: MotionEngine[] = [
  {
    id: 'motion',
    role: 'تعامل سایدبار، Drawer، بازخورد و ورود کنترل‌شدهٔ اجزا',
    scope: 'shared',
    lazy: false,
    reducedMotion: 'fade-only',
  },
  {
    id: 'gsap-scrolltrigger',
    role: 'روایت مرحله‌ای مسیر داده در Landing',
    scope: 'landing',
    lazy: true,
    reducedMotion: 'disable',
  },
  {
    id: 'lenis',
    role: 'اسکرول نرم و هماهنگ فقط در Landing عمومی',
    scope: 'landing',
    lazy: true,
    reducedMotion: 'disable',
  },
  {
    id: 'three',
    role: 'گراف سه‌بعدی شبکه در Hero با سقف ۳۰ فریم',
    scope: 'landing',
    lazy: true,
    reducedMotion: 'static-fallback',
  },
  {
    id: 'rive',
    role: 'نمای تعاملی وضعیت انتقال و Onboarding',
    scope: 'landing',
    lazy: true,
    reducedMotion: 'static-fallback',
  },
];

export function shouldUseContinuousAnimation(
  reducedMotion: boolean,
  documentVisible: boolean,
  elementVisible: boolean,
): boolean {
  return !reducedMotion && documentVisible && elementVisible;
}
