import '@fontsource-variable/vazirmatn';
import '@mohtavayab/ui/tokens.css';
import './styles.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MotionProvider } from '@/components/motion-provider';

export const metadata: Metadata = {
  title: {
    default: 'هادی | محتوا‌یاب',
    template: '%s | هادی',
  },
  description: 'سامانهٔ جامع رصد، تحلیل و انتقال محتوای شبکه‌های اجتماعی',
  applicationName: 'هادی / محتوا‌یاب',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a className="skip-link" href="#main-content">
          رفتن به محتوای اصلی
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
