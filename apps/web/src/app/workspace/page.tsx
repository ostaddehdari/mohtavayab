import type { Metadata } from 'next';
import { WorkspaceAdmin } from '@/components/workspace/workspace-admin';

export const metadata: Metadata = {
  title: 'فضای کاری و دسترسی‌ها | هادی',
  description: 'مدیریت اعضا، نقش‌ها، دعوت‌ها و حساب‌های خدمت هادی',
};

export default function WorkspacePage() {
  return <WorkspaceAdmin />;
}
