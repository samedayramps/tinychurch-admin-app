// components/groups/group-members-tab.tsx
'use client'

import { useState } from 'react'
import type { GroupMember } from '@/lib/dal/repositories/group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/hooks/use-toast'
import { 
  MoreVertical, 
  Shield,
  UserMinus,
  Crown,
  Mail,
  UserCog 
} from 'lucide-react'
import { formatDistance } from 'date-fns'
import { GroupInviteDialog } from './group-invite-dialog'
import type { Database } from '@/database.types'
import { removeGroupMember, updateMemberRole } from '@/lib/actions/groups'
import { createClient } from '@/lib/utils/supabase/client'

interface GroupMembersTabProps {
  group: {
    id: string
    organization_id: string
    name: string
    max_members: number | null
    members: GroupMember[]
  }
  isLeader: boolean
  currentUserId: string
  onMembersUpdate?: (updatedMembers: GroupMember[]) => void
}

export function GroupMembersTab({ 
  group,
  isLeader,
  currentUserId,
  onMembersUpdate
}: GroupMembersTabProps) {
  const [members, setMembers] = useState<GroupMember[]>(group.members)
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'remove' | 'promote' | 'demote'
    memberId: string
    memberName: string
    userId: string
  } | null>(null)
  const { toast } = useToast()

  // Sort members by role (leaders first) and then by name
  const sortedMembers = [...members].sort((a: GroupMember, b: GroupMember) => {
    if (a.role === 'leader' && b.role !== 'leader') return -1
    if (a.role !== 'leader' && b.role === 'leader') return 1
    return (a.profile.full_name || a.profile.email).localeCompare(
      b.profile.full_name || b.profile.email
    )
  })

  const handleAction = async () => {
    if (!confirmAction) return

    setLoading(confirmAction.memberId)
    try {
      let result;
      switch (confirmAction.type) {
        case 'remove':
          result = await removeGroupMember(group.id, confirmAction.userId)
          if (result.success) {
            const updatedMembers = members.filter(m => m.user_id !== confirmAction.userId)
            setMembers(updatedMembers)
            onMembersUpdate?.(updatedMembers)
          }
          break;
        case 'promote':
          result = await updateMemberRole(group.id, confirmAction.userId, 'leader')
          if (result.success) {
            const updatedMembers = members.map(m => 
              m.user_id === confirmAction.userId ? { ...m, role: 'leader' as const } : m
            )
            setMembers(updatedMembers)
            onMembersUpdate?.(updatedMembers)
          }
          break;
        case 'demote':
          result = await updateMemberRole(group.id, confirmAction.userId, 'member')
          if (result.success) {
            const updatedMembers = members.map(m => 
              m.user_id === confirmAction.userId ? { ...m, role: 'member' as const } : m
            )
            setMembers(updatedMembers)
            onMembersUpdate?.(updatedMembers)
          }
          break;
      }

      if (result?.error) {
        throw new Error(result.error)
      }

      toast({
        title: 'Success',
        description: `Member ${confirmAction.type === 'remove' ? 'removed' : 
          confirmAction.type === 'promote' ? 'promoted to leader' : 
          'changed to regular member'}`
      })
    } catch (error) {
      console.error('Action failed:', error)
      toast({
        title: 'Action Failed',
        description: error instanceof Error ? error.message : 'Failed to perform action',
        variant: 'destructive'
      })
    } finally {
      setLoading(null)
      setConfirmAction(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Group Members</CardTitle>
            <CardDescription>
              {members.length} members in total
              {group.max_members != null && group.max_members > 0 && ` (${group.max_members} maximum)`}
            </CardDescription>
          </div>
          {isLeader && (
            <GroupInviteDialog 
              groupId={group.id}
              organizationId={group.organization_id}
              onInviteSent={async () => {
                // Fetch updated member list
                const supabase = createClient()
                const { data: updatedMembers } = await supabase
                  .from('group_members')
                  .select(`
                    *,
                    profile:profiles (
                      id,
                      email,
                      full_name,
                      avatar_url
                    )
                  `)
                  .eq('group_id', group.id)
                  .is('deleted_at', null)

                if (updatedMembers) {
                  setMembers(updatedMembers)
                  onMembersUpdate?.(updatedMembers)
                }
              }}
            />
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                {isLeader && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {(member.profile.full_name || member.profile.email)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.profile.full_name || member.profile.email}
                      </div>
                      {member.profile.full_name && (
                        <div className="text-sm text-muted-foreground">
                          {member.profile.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.role === 'leader' ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Crown className="w-3 h-3" />
                        Leader
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit">Member</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.joined_at && (
                      <time dateTime={member.joined_at}>
                        {formatDistance(new Date(member.joined_at), new Date(), { addSuffix: true })}
                      </time>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={member.status === 'active' ? 'default' : 'secondary'}
                      className="w-fit"
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  {isLeader && member.user_id !== currentUserId && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            disabled={loading === member.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role !== 'leader' ? (
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({
                                type: 'promote',
                                memberId: member.id,
                                userId: member.user_id,
                                memberName: member.profile.full_name || member.profile.email
                              })}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Make Leader
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({
                                type: 'demote',
                                memberId: member.id,
                                userId: member.user_id,
                                memberName: member.profile.full_name || member.profile.email
                              })}
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Remove Leader Role
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setConfirmAction({
                              type: 'remove',
                              memberId: member.id,
                              userId: member.user_id,
                              memberName: member.profile.full_name || member.profile.email
                            })}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove from Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'remove' && 'Remove Member'}
              {confirmAction?.type === 'promote' && 'Promote to Leader'}
              {confirmAction?.type === 'demote' && 'Remove Leader Role'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'remove' && (
                `Are you sure you want to remove ${confirmAction.memberName} from the group?`
              )}
              {confirmAction?.type === 'promote' && (
                `Are you sure you want to make ${confirmAction.memberName} a group leader?
                They will be able to manage members and group settings.`
              )}
              {confirmAction?.type === 'demote' && (
                `Are you sure you want to remove leader role from ${confirmAction.memberName}?
                They will become a regular member.`
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={loading !== null}
            >
              Cancel
            </Button>
            <Button 
              variant={confirmAction?.type === 'remove' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={loading !== null}
            >
              {loading !== null ? (
                <span>Processing...</span>
              ) : (
                <span>Confirm</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}