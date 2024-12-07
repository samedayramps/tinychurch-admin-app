'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GroupWithMembers, GroupMember } from '@/lib/dal/repositories/group'
import { formatDistance } from 'date-fns'
import {
  Users,
  Shield,
  Globe,
  Lock,
  EyeOff,
  Calendar,
  Mail,
  UserPlus,
} from 'lucide-react'
import { useToast } from '@/components/hooks/use-toast'
import { useState } from 'react'

interface GroupOverviewTabProps {
  group: GroupWithMembers
  organizationId: string
  isLeader: boolean
}

// Helper function to format group type for display
const formatGroupType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Helper to get visibility icon
const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case 'public':
      return <Globe className="w-4 h-4" />
    case 'private':
      return <Lock className="w-4 h-4" />
    case 'hidden':
      return <EyeOff className="w-4 h-4" />
    default:
      return null
  }
}

export function GroupOverviewTab({ group, organizationId, isLeader }: GroupOverviewTabProps) {
  const { toast } = useToast()
  const [joinRequestLoading, setJoinRequestLoading] = useState(false)

  // Count members by role
  const memberCounts = {
    total: group.members.length,
    leaders: group.members.filter((m: GroupMember) => m.role === 'leader').length,
    members: group.members.filter((m: GroupMember) => m.role === 'member').length
  }

  // Check if group has reached member limit
  const isAtCapacity = group.max_members 
    ? group.members.length >= group.max_members 
    : false

  const handleJoinRequest = async () => {
    setJoinRequestLoading(true)
    try {
      // Implementation for join request
      toast({
        title: 'Request Sent',
        description: 'Your request to join this group has been sent to the leaders.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send join request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setJoinRequestLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCounts.total}</div>
            {group.max_members != null && group.max_members > 0 && (
              <p className="text-xs text-muted-foreground">
                {group.max_members - memberCounts.total} spots remaining
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leaders</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCounts.leaders}</div>
            <p className="text-xs text-muted-foreground">
              Managing group activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCounts.members}</div>
            <p className="text-xs text-muted-foreground">
              Regular participants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Group Details */}
      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {formatGroupType(group.type)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {getVisibilityIcon(group.visibility)}
              {group.visibility.charAt(0).toUpperCase() + group.visibility.slice(1)}
            </Badge>
            {isAtCapacity && (
              <Badge variant="destructive">
                At Capacity
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">
              {group.description || 'No description provided.'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Created</h4>
            {group.created_at && (
              <time dateTime={group.created_at}>
                {formatDistance(new Date(group.created_at), new Date(), { addSuffix: true })}
              </time>
            )}
          </div>

          {!isLeader && group.visibility === 'public' && (
            <div className="pt-4">
              <Button 
                onClick={handleJoinRequest}
                disabled={joinRequestLoading || isAtCapacity}
                className="w-full"
              >
                {isAtCapacity ? 'Group is Full' : 'Request to Join'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity or Communication Options could go here */}
      {isLeader && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full sm:w-auto" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button className="w-full sm:w-auto" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Message Members
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}