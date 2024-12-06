'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Profile } from '@/lib/types/auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AddOrganizationMemberDialog } from '@/components/shared/dialogs/add-organization-member-dialog'
import { useRouter } from 'next/navigation'

interface UserOrganizationsTabProps {
  user: Profile
}

export function UserOrganizationsTab({ user }: UserOrganizationsTabProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                Manage user organization memberships
              </CardDescription>
            </div>
            <AddOrganizationMemberDialog 
              userId={user.id}
              onSuccess={() => router.refresh()}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.organization_members?.map((member) => (
                <TableRow key={member.organizations.id}>
                  <TableCell>{member.organizations.name}</TableCell>
                  <TableCell>
                    <Badge>{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!user.organization_members || user.organization_members.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No organization memberships
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 