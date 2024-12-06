'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Edit2 } from 'lucide-react'
import type { Profile } from '@/lib/types/auth'

interface UserTableProps {
  setIsLoading: (loading: boolean) => void
}

export function UserTable({ setIsLoading }: UserTableProps) {
  const router = useRouter()
  const [users, setUsers] = useState<Profile[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            organization_members (
              organizations (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [supabase, setIsLoading])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Organizations</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name || '—'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.organization_members?.map(member => 
                  member.organizations.name
                ).join(', ') || '—'}
              </TableCell>
              <TableCell>
                {user.is_superadmin ? 'Superadmin' : 'User'}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/superadmin/users/${user.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 