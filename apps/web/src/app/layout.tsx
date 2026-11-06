import '@fontsource-variable/vazirmatn';
import './styles.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'هادی | محتوا‌یاب',
  description: 'سامانهٔ جامع رصد، تحلیل و انتقال محتوای شبکه‌های اجتماعی',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
