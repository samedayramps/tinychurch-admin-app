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
import { MoreHorizontalIcon, UserMinusIcon, ShieldIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/hooks/use-toast'

interface OrganizationUsersTableProps {
  users: Array<{
    id: string
    role: string
    profiles: {
      id: string
      email: string
      full_name: string
      avatar_url: string | null
      is_active: boolean
    }
  }>
  organizationSlug: string
}

export function OrganizationUsersTable({ users, organizationSlug }: OrganizationUsersTableProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User removed from organization",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive",
      })
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.profiles.full_name?.charAt(0) || user.profiles.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{user.profiles.full_name}</span>
              </div>
            </TableCell>
            <TableCell>{user.profiles.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? "secondary" : "default"}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.profiles.is_active ? "default" : "destructive"}>
                {user.profiles.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/org/${organizationSlug}/users/${user.profiles.id}`)}>
                    <ShieldIcon className="w-4 h-4 mr-2" />
                    Manage Role
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRemoveUser(user.profiles.id)}
                    className="text-destructive"
                  >
                    <UserMinusIcon className="w-4 h-4 mr-2" />
                    Remove from Organization
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 