'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import type { MemberWithProfile } from '@/lib/dal/repositories/organization-member'
import { useToast } from '@/lib/hooks/use-toast'
import { AddOrganizationMemberDialog } from '@/components/shared/dialogs/add-organization-member-dialog'

interface OrganizationMembersTabProps {
  organizationId: string
}

export function OrganizationMembersTab({ organizationId }: OrganizationMembersTabProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const handleRemoveMember = async (memberId: string) => {
    try {
      // Implementation here
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive',
      })
    }
  }

  const refreshMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profile:profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organizationId)

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Failed to load members:', error)
      toast({
        title: 'Error',
        description: 'Failed to load organization members',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function loadMembers() {
      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select(`
            *,
            profile:profiles (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('organization_id', organizationId)

        if (error) throw error
        setMembers(data || [])
      } catch (error) {
        console.error('Failed to load members:', error)
        toast({
          title: 'Error',
          description: 'Failed to load organization members',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadMembers()
  }, [organizationId, supabase, toast])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                Manage organization members and their roles
              </CardDescription>
            </div>
            <AddOrganizationMemberDialog 
              organizationId={organizationId}
              onSuccess={refreshMembers}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">
                    {member.profile?.full_name || member.profile?.email || '—'}
                  </TableCell>
                  <TableCell>{member.profile?.email || '—'}</TableCell>
                  <TableCell>
                    <Badge>{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.user_id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No members found
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