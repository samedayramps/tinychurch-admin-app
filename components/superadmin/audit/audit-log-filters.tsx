'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DateRange } from 'react-day-picker'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/components/ui/combobox"

interface Organization {
  id: string
  name: string
}

interface AuditLogFiltersProps {
  onFilterChange: (filters: {
    search: string
    dateRange: DateRange | null
    severity: string
    organizationId?: string
    correlationId?: string
  }) => void
  organizations: Organization[]
}

export function AuditLogFilters({ onFilterChange, organizations }: AuditLogFiltersProps) {
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [severity, setSeverity] = useState('all')
  const [organizationId, setOrganizationId] = useState<string>('')
  const [correlationId, setCorrelationId] = useState('')

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range || null)
  }

  const handleFilterChange = () => {
    onFilterChange({
      search,
      dateRange,
      severity,
      organizationId: organizationId || undefined,
      correlationId: correlationId || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        <Combobox
          value={organizationId}
          onChange={setOrganizationId}
          items={organizations}
          placeholder="Select organization"
          className="w-[250px]"
        />

        <Input
          placeholder="Correlation ID"
          value={correlationId}
          onChange={(e) => setCorrelationId(e.target.value)}
          className="max-w-sm"
        />

        <DateRangePicker
          onChange={handleDateRangeChange}
        />
        
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleFilterChange}>Apply Filters</Button>
      </div>
    </div>
  )
} 