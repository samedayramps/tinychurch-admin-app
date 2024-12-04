import { UserManagement } from '@/components/superadmin/user-management'

export default async function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users Management</h1>
      <UserManagement />
    </div>
  )
} 