'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/hooks/use-toast'
import { CheckCircle, XCircle } from 'lucide-react'
import { formatDistance } from 'date-fns'
import { GroupWithMembers } from '@/lib/dal/repositories/group'

interface JoinRequest {
  id: string
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
  message?: string | null
  requested_at: string
}

interface GroupRequestsTabProps {
  group: GroupWithMembers
  requests: JoinRequest[]
}

export default function GroupRequestsTab({ group, requests }: GroupRequestsTabProps) {
  const [processing, setProcessing] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessing(prev => ({ ...prev, [requestId]: true }))
    try {
      // TODO: Call your API to process the request
      // await processJoinRequest(requestId, action)

      toast({
        title: 'Success',
        description: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process request',
        variant: 'destructive'
      })
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }))
    }
  }

  if (!requests.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No pending join requests
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={request.user.avatar_url || undefined} />
                    <AvatarFallback>
                      {(request.user.full_name || request.user.email).charAt(0).toUpperCase()}
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
                </TableCell>
                <TableCell>
                  {request.message || 'No message provided'}
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(request.requested_at), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequest(request.id, 'approve')}
                      disabled={processing[request.id]}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequest(request.id, 'reject')}
                      disabled={processing[request.id]}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
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