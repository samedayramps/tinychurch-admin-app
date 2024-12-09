'use client'

import { useState, useEffect } from 'react'
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { MessageHistoryFilters } from "./message-history-filters"
import { MessageDetailModal } from "./message-detail-modal"

interface MessagingHistoryTabProps {
  organizationId?: string
}

export function MessagingHistoryTab({ organizationId }: MessagingHistoryTabProps) {
  const [messages, setMessages] = useState<MessageQueryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<MessageHistoryFilter>({})
  const [selectedMessage, setSelectedMessage] = useState<MessageQueryResponse | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  useEffect(() => {
    loadMessages()
  }, [])

  useEffect(() => {
    if (Object.keys(filters).length === 0) return
    loadMessages()
  }, [filters])

  async function loadMessages() {
    try {
      setLoading(true)
      const history = await getMessageHistory(filters)
      console.log('Received message history:', history)
      setMessages(history)
    } catch (error) {
      console.error('Failed to load message history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="success">Sent</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <MessageHistoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        senders={messages.reduce((acc, msg) => {
          if (!acc.some(s => s.id === msg.sender.id)) {
            acc.push({
              id: msg.sender.id,
              name: msg.sender.full_name || msg.sender.email
            })
          }
          return acc
        }, [] as Array<{ id: string; name: string }>)}
        recipients={messages.reduce((acc, msg) => {
          if (msg.recipient && !acc.some(r => r.id === msg.recipient?.id)) {
            acc.push({
              id: msg.recipient.id,
              name: msg.recipient.full_name || msg.recipient.email
            })
          }
          return acc
        }, [] as Array<{ id: string; name: string }>)}
        groups={messages.reduce((acc, msg) => {
          if (msg.group && !acc.some(g => g.id === msg.group?.id)) {
            acc.push({
              id: msg.group.id,
              name: msg.group.name
            })
          }
          return acc
        }, [] as Array<{ id: string; name: string }>)}
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
              {messages.map((message) => (
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
                    {message.recipient?.email || message.group?.name || message.organization?.name}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(message.status)}
                  </TableCell>
                  <TableCell>
                    {message.sender.full_name || message.sender.email}
                  </TableCell>
                </TableRow>
              ))}
              {messages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No messages found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MessageDetailModal
        message={selectedMessage}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  )
} 