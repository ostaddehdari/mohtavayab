import type { Metadata } from 'next';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export const metadata: Metadata = {
  title: 'داشبورد عملیات',
  description: 'نمونه تعاملی اتاق فرمان هادی',
};

export default function DashboardPage() {
  return <DashboardShell />;
}
