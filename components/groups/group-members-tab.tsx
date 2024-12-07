// components/groups/group-members-tab.tsx
'use client'

import { useState } from 'react'
import { GroupMember } from '@/lib/dal/repositories/group'
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
}

export function GroupMembersTab({ 
  group,
  isLeader,
  currentUserId
}: GroupMembersTabProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'remove' | 'promote' | 'demote'
    memberId: string
    memberName: string
  } | null>(null)
  const { toast } = useToast()

  // Sort members by role (leaders first) and then by name
  const sortedMembers = [...group.members].sort((a: GroupMember, b: GroupMember) => {
    if (a.role === 'leader' && b.role !== 'leader') return -1
    if (a.role !== 'leader' && b.role === 'leader') return 1
    return (a.profile.full_name || a.profile.email).localeCompare(
      b.profile.full_name || b.profile.email
    )
  })

  const handleAction = async (type: 'remove' | 'promote' | 'demote', member: GroupMember) => {
    setLoading(member.id)
    try {
      // TODO: Implement the API calls for these actions
      switch (type) {
        case 'remove':
          // await groupRepo.removeMember(group.id, member.user_id)
          toast({
            title: 'Member Removed',
            description: `${member.profile.full_name || member.profile.email} has been removed from the group.`
          })
          break
        case 'promote':
          // await groupRepo.updateMemberRole(group.id, member.user_id, 'leader')
          toast({
            title: 'Member Promoted',
            description: `${member.profile.full_name || member.profile.email} is now a group leader.`
          })
          break
        case 'demote':
          // await groupRepo.updateMemberRole(group.id, member.user_id, 'member')
          toast({
            title: 'Leader Demoted',
            description: `${member.profile.full_name || member.profile.email} is now a regular member.`
          })
          break
      }
    } catch (error) {
      toast({
        title: 'Action Failed',
        description: `Failed to ${type} member. Please try again.`,
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
              {group.members.length} members in total
              {group.max_members != null && group.max_members > 0 && ` (${group.max_members} maximum)`}
            </CardDescription>
          </div>
          {isLeader && (
            <GroupInviteDialog 
              groupId={group.id}
              organizationId={group.organization_id}
              onInviteSent={() => {
                // Optional: Add any refresh logic here
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
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === 'remove' ? 'destructive' : 'default'}
              onClick={() => {
                if (confirmAction) {
                  const member = group.members.find((m: GroupMember) => m.id === confirmAction.memberId)
                  if (member) {
                    handleAction(confirmAction.type, member)
                  }
                }
              }}
            >
              {confirmAction?.type === 'remove' && 'Remove'}
              {confirmAction?.type === 'promote' && 'Promote'}
              {confirmAction?.type === 'demote' && 'Remove Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}