'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Check, X, MessageSquare, Mail, Loader2, RefreshCw } from 'lucide-react'
import { formatDistance } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GroupWithMembers, JoinRequest, GroupInvitation } from '@/lib/dal/repositories/group'
import { deleteGroupInvitation, resendGroupInvitation } from '@/lib/actions/groups'

interface GroupRequestsTabProps {
  group: GroupWithMembers
  requests: JoinRequest[]
  invitations: GroupInvitation[]
  onUpdate?: () => void
}

export default function GroupRequestsTab({ 
  group, 
  requests = [], 
  invitations = [],
  onUpdate
}: GroupRequestsTabProps) {
  const [processingCancel, setProcessingCancel] = useState<Record<string, boolean>>({})
  const [processingResend, setProcessingResend] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  console.log('Requests tab invitations:', invitations)

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingCancel(prev => ({ ...prev, [requestId]: true }))
    try {
      // TODO: Call your API to process the request
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
      setProcessingCancel(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const handleInvitation = async (invitationId: string, action: 'cancel' | 'resend') => {
    const setProcessing = action === 'cancel' ? setProcessingCancel : setProcessingResend
    
    setProcessing(prev => ({ ...prev, [invitationId]: true }))
    try {
      const result = action === 'cancel' 
        ? await deleteGroupInvitation(invitationId)
        : await resendGroupInvitation(invitationId)
        
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: action === 'cancel' 
          ? "Invitation cancelled successfully"
          : "Invitation resent successfully"
      })
      
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    } finally {
      setProcessing(prev => ({ ...prev, [invitationId]: false }))
    }
  }

  if (!requests.length && !invitations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>Join requests and invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Pending Requests</h3>
            <p className="text-muted-foreground mt-2">
              When people request to join or are invited to the group, they'll appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Requests & Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">
              Join Requests {requests.length > 0 && `(${requests.length})`}
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Invitations {invitations.length > 0 && `(${invitations.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
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
                    <TableCell className="flex items-center gap-3">
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
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequest(request.id, 'approve')}
                          disabled={processingCancel[request.id]}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequest(request.id, 'reject')}
                          disabled={processingCancel[request.id]}
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
          </TabsContent>

          <TabsContent value="invitations">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={invitation.invited_user_profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(invitation.invited_user_profile?.full_name || invitation.invited_user_profile?.email || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {invitation.invited_user_profile?.full_name || 
                           invitation.invited_user_profile?.email || 
                           'Unknown User'}
                        </div>
                        {invitation.invited_user_profile?.full_name && invitation.invited_user_profile?.email && (
                          <div className="text-sm text-muted-foreground">
                            {invitation.invited_user_profile.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistance(new Date(invitation.created_at), new Date(), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      {formatDistance(new Date(invitation.expires_at), new Date(), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInvitation(invitation.id, 'resend')}
                        disabled={processingResend[invitation.id] || processingCancel[invitation.id]}
                      >
                        {processingResend[invitation.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Resending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Resend
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInvitation(invitation.id, 'cancel')}
                        disabled={processingCancel[invitation.id] || processingResend[invitation.id]}
                      >
                        {processingCancel[invitation.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}