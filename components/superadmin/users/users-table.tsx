'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontalIcon, PencilIcon, TrashIcon, ShieldAlertIcon, MailIcon, BanIcon, CheckCircleIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { deleteUserAction } from '@/lib/actions/users'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/lib/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from '@/lib/utils/supabase/client'
import { resendInvitation, suspendUser, reactivateUser } from '@/lib/actions/user-management'
import type { Database } from '@/database.types'

interface UsersTableProps {
  users: Array<{
    id: string
    email: string
    full_name: string
    status: 'invited' | 'active' | 'inactive' | 'suspended' | 'deleted'
    is_active: boolean
    is_superadmin: boolean
    created_at: string
    invitation_sent_at?: string | null
    last_active_at?: string | null
    organization_members: Array<{
      role: string
      organizations: {
        name: string
      }
    }>
  }>
}

export function UsersTable({ users }: UsersTableProps) {
  const { toast } = useToast()
  const router = useRouter()

  async function handleDelete(userId: string, userEmail: string) {
    try {
      await deleteUserAction(userId)
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  const getUserStatusBadge = (user: UsersTableProps['users'][0]) => {
    switch (user.status) {
      case 'invited':
        return <Badge variant="warning">Invited</Badge>
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'deleted':
        return <Badge variant="outline">Deleted</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getLastActivity = (user: UsersTableProps['users'][0]) => {
    if (user.status === 'invited' && user.invitation_sent_at) {
      return `Invited ${formatDate(user.invitation_sent_at)}`
    }
    if (user.last_active_at) {
      return `Active ${formatDate(user.last_active_at)}`
    }
    return 'Never'
  }

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link 
                  href={`/superadmin/users/${user.id}`}
                  className="hover:underline"
                >
                  {user.full_name || '—'}
                </Link>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getUserStatusBadge(user)}</TableCell>
              <TableCell>
                {user.organization_members?.[0]?.organizations.name || '—'}
              </TableCell>
              <TableCell>
                {user.is_superadmin ? (
                  <Badge variant="secondary">Superadmin</Badge>
                ) : (
                  <Badge>{user.organization_members?.[0]?.role || 'Member'}</Badge>
                )}
              </TableCell>
              <TableCell>{getLastActivity(user)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href={`/superadmin/users/${user.id}`}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    {user.status === 'invited' && (
                      <DropdownMenuItem onClick={async () => {
                        try {
                          const result = await resendInvitation(user.id)
                          toast({
                            title: "Success",
                            description: result.message,
                          })
                          router.refresh()
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: error instanceof Error ? error.message : "Failed to resend invitation",
                            variant: "destructive",
                          })
                        }
                      }}>
                        <MailIcon className="w-4 h-4 mr-2" />
                        Resend Invitation
                      </DropdownMenuItem>
                    )}
                    {user.status === 'active' && (
                      <DropdownMenuItem onClick={() => suspendUser(user.id)}>
                        <BanIcon className="w-4 h-4 mr-2" />
                        Suspend User
                      </DropdownMenuItem>
                    )}
                    {user.status === 'suspended' && (
                      <DropdownMenuItem onClick={() => reactivateUser(user.id)}>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Reactivate User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(user.id, user.email)}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 