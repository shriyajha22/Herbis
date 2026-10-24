import { Metadata } from 'next';
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell';

export const metadata: Metadata = {
  title: 'Admin Control Panel | PrimeBrew Herbis',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
