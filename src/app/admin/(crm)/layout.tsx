// No server-side auth check — handled by AdminGuard client component
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminGuard from '@/components/admin/AdminGuard'

export const metadata = { title: 'Admin — A-Z Housing CRM' }

export default function AdminCrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f1ede7' }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
          {children}
        </div>
      </div>
    </AdminGuard>
  )
}
