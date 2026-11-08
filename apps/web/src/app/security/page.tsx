import type { Metadata } from 'next';
import { SecurityCenter } from '@/components/auth/security-center';

export const metadata: Metadata = {
  title: 'امنیت حساب',
  description: 'مدیریت MFA، نشست‌ها و دستگاه‌های حساب هادی',
};

export default function SecurityPage() {
  return <SecurityCenter />;
}
