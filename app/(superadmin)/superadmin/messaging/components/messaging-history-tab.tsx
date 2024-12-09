'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"
import { getMessageHistory, type MessageHistoryFilter } from "@/lib/actions/messaging"
import type { MessageQueryResponse } from "@/lib/dal/repositories/message"
import { MessageHistoryFilters } from "./message-history-filters"
import { MessageDetailModal } from "./message-detail-modal"

interface MessagingHistoryTabProps {
  organizationId?: string
}

export function MessagingHistoryTab({ organizationId }: MessagingHistoryTabProps) {
  const [allMessages, setAllMessages] = useState<MessageQueryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<MessageHistoryFilter>({})
  const [selectedMessage, setSelectedMessage] = useState<MessageQueryResponse | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true)
      const history = await getMessageHistory({})
      setAllMessages(history)
    } catch (error) {
      console.error('Failed to load message history:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const filteredMessages = useMemo(() => {
    return allMessages.filter(message => {
      if (filters.status && message.status !== filters.status) {
        return false
      }

      if (filters.senderId && message.sender.id !== filters.senderId) {
        return false
      }

      if (filters.recipientId && message.recipient?.id !== filters.recipientId) {
        return false
      }

      if (filters.groupId && message.group?.id !== filters.groupId) {
        return false
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        const messageDate = new Date(message.created_at)
        if (messageDate < fromDate) return false
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        const messageDate = new Date(message.created_at)
        if (messageDate > toDate) return false
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const searchableFields = [
          message.subject,
          message.body,
          message.sender.full_name || '',
          message.sender.email,
          message.recipient?.full_name || '',
          message.recipient?.email || '',
          message.group?.name || '',
          message.organization?.name || ''
        ].filter((field): field is string => 
          typeof field === 'string' && field.length > 0
        )

        return searchableFields.some(field => 
          field.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [allMessages, filters])

  const handleFiltersChange = (newFilters: MessageHistoryFilter) => {
    setFilters(newFilters)
  }

  const handleMessageUpdate = useCallback(() => {
    loadMessages()
  }, [loadMessages])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="success">Sent</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'scheduled':
        return <Badge variant="warning">Scheduled</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const formatMessageInfo = (message: MessageQueryResponse) => {
    let info = message.recipient?.email || message.group?.name || message.organization?.name
    if (message.status === 'scheduled' && message.scheduled_for) {
      info += ` (Scheduled for ${formatDate(message.scheduled_for, 'full')})`
    }
    return info
  }

  const sendersList = useMemo(() => {
    return allMessages.reduce((acc, msg) => {
      if (!acc.some(s => s.id === msg.sender.id)) {
        acc.push({
          id: msg.sender.id,
          name: msg.sender.full_name || msg.sender.email
        })
      }
      return acc
    }, [] as Array<{ id: string; name: string }>)
  }, [allMessages])

  const recipientsList = useMemo(() => {
    return allMessages.reduce((acc, msg) => {
      if (msg.recipient && !acc.some(r => r.id === msg.recipient?.id)) {
        acc.push({
          id: msg.recipient.id,
          name: msg.recipient.full_name || msg.recipient.email
        })
      }
      return acc
    }, [] as Array<{ id: string; name: string }>)
  }, [allMessages])

  const groupsList = useMemo(() => {
    return allMessages.reduce((acc, msg) => {
      if (msg.group && !acc.some(g => g.id === msg.group?.id)) {
        acc.push({
          id: msg.group.id,
          name: msg.group.name
        })
      }
      return acc
    }, [] as Array<{ id: string; name: string }>)
  }, [allMessages])

  return (
    <div className="space-y-4">
      <MessageHistoryFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        senders={sendersList}
        recipients={recipientsList}
        groups={groupsList}
      />

      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map((message) => (
                  <TableRow 
                    key={message.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedMessage(message)
                      setDetailModalOpen(true)
                    }}
                  >
                    <TableCell>
                      {formatDate(message.created_at)}
                    </TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>
                      {formatMessageInfo(message)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(message.status)}
                    </TableCell>
                    <TableCell>
                      {message.sender.full_name || message.sender.email}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MessageDetailModal
        message={selectedMessage}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onMessageUpdate={handleMessageUpdate}
      />
    </div>
  )
} 