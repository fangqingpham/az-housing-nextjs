import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminGuard from '@/components/admin/AdminGuard'

export const metadata = { title: 'Admin — A-Z Housing CRM' }

export default function AdminCrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1ede7' }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
          {/* Spacer for mobile fixed top bar */}
          <div className="mobile-top-spacer" />
          {children}
        </div>
      </div>
      <style>{`
        .mobile-top-spacer { display: none; height: 52px; }
        @media (max-width: 767px) { .mobile-top-spacer { display: block; } }
      `}</style>
    </AdminGuard>
  )
}
