import Link from 'next/link'

export default function Sidebar() {
  return (
    <nav>
      {/* ... existing links ... */}
      <Link href="/superadmin/messaging">Messaging</Link>
    </nav>
  )
} 