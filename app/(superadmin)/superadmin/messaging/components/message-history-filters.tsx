'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import type { MessageHistoryFilter } from "@/lib/actions/messaging"

interface MessageHistoryFiltersProps {
  filters: MessageHistoryFilter
  onFiltersChange: (filters: MessageHistoryFilter) => void
  senders: Array<{ id: string; name: string }>
  recipients: Array<{ id: string; name: string }>
  groups: Array<{ id: string; name: string }>
}

export function MessageHistoryFilters({
  filters,
  onFiltersChange,
  senders,
  recipients,
  groups
}: MessageHistoryFiltersProps) {
  const handleReset = () => {
    onFiltersChange({})
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => onFiltersChange({
                ...filters,
                status: value === 'all' ? undefined : value as 'sent' | 'failed' | 'pending' | 'scheduled' | 'cancelled'
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sender Filter */}
          <div className="space-y-2">
            <Label>Sender</Label>
            <Select 
              value={filters.senderId || 'all'}
              onValueChange={(value) => onFiltersChange({
                ...filters,
                senderId: value === 'all' ? undefined : value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by sender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Senders</SelectItem>
                {senders.map((sender) => (
                  <SelectItem key={sender.id} value={sender.id}>
                    {sender.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Type & ID Filters */}
          <div className="space-y-2">
            <Label>Recipient</Label>
            <div className="flex gap-2">
              <Select
                value={filters.recipientId || filters.groupId || 'all'}
                onValueChange={(value) => {
                  const [type, id] = value.split(':')
                  onFiltersChange({
                    ...filters,
                    recipientId: type === 'user' ? id : undefined,
                    groupId: type === 'group' ? id : undefined,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipients</SelectItem>
                  <SelectItem value="header-users" disabled>Users</SelectItem>
                  {recipients.map((recipient) => (
                    <SelectItem key={recipient.id} value={`user:${recipient.id}`}>
                      {recipient.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="header-groups" disabled>Groups</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={`group:${group.id}`}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[130px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(new Date(filters.dateFrom), 'PP') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                    onSelect={(date) => onFiltersChange({
                      ...filters,
                      dateFrom: date ? date.toISOString() : undefined
                    })}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[130px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(new Date(filters.dateTo), 'PP') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                    onSelect={(date) => onFiltersChange({
                      ...filters,
                      dateTo: date ? date.toISOString() : undefined
                    })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-8"
                value={filters.searchTerm || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  searchTerm: e.target.value || undefined
                })}
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <Button 
              variant="outline"
              onClick={handleReset}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 