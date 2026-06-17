import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tenant Placement Services',
  description: 'Professional tenant placement services across Canada. A-Z Housing Solutions screens applicants, verifies references, coordinates leases, and finds quality tenants for your rental property.',
  keywords: ['tenant placement Canada', 'find tenants', 'tenant screening', 'rental property management', 'landlord services Canada'],
  alternates: { canonical: 'https://www.azhouse.ca/tenant-placement' },
  openGraph: {
    title: 'Tenant Placement Services | A-Z Housing Solutions',
    description: 'Professional tenant placement services. We screen applicants, verify references, and find quality tenants for your rental property across Canada.',
    url: 'https://www.azhouse.ca/tenant-placement',
  },
}

export default function TenantPlacementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
