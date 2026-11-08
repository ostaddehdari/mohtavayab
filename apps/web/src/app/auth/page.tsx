import type { Metadata } from 'next';
import { AuthExperience } from '@/components/auth/auth-experience';

export const metadata: Metadata = {
  title: 'ورود امن',
  description: 'ورود، ثبت‌نام و بازیابی امن حساب هادی',
};

export default function AuthPage() {
  return <AuthExperience />;
}
