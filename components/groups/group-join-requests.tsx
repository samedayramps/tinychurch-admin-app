'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/hooks/use-toast'
import { Check, X, MessageSquare } from 'lucide-react'
import { formatDistance } from 'date-fns'
import type { GroupWithMembers } from '@/lib/dal/repositories/group'
import type { Database } from '@/database.types'

type JoinRequest = Database['public']['Tables']['group_join_requests']['Row'] & {
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface GroupRequestsTabProps {
  group: GroupWithMembers
  requests: JoinRequest[]
}

export function GroupRequestsTab({ group, requests }: GroupRequestsTabProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setLoading(requestId)
    try {
      // TODO: Implement approve/reject API call
      toast({
        title: action === 'approve' ? 'Request Approved' : 'Request Rejected',
        description: action === 'approve' 
          ? 'The member has been added to the group.'
          : 'The join request has been rejected.'
      })
    } catch (error) {
      toast({
        title: 'Action Failed',
        description: `Failed to ${action} request. Please try again.`,
        variant: 'destructive'
      })
    } finally {
      setLoading(null)
    }
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Pending Requests</h3>
            <p className="text-muted-foreground mt-2">
              When people request to join the group, they'll appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Join Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Request Message</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.user.avatar_url || undefined} />
                      <AvatarFallback>
                        {(request.user.full_name || request.user.email)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {request.user.full_name || request.user.email}
                      </div>
                      {request.user.full_name && (
                        <div className="text-sm text-muted-foreground">
                          {request.user.email}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {request.message || (
                    <span className="text-muted-foreground italic">
                      No message provided
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {request.requested_at && formatDistance(new Date(request.requested_at), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequest(request.id, 'approve')}
                      disabled={loading === request.id}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequest(request.id, 'reject')}
                      disabled={loading === request.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}