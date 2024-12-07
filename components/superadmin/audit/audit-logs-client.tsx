'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemAuditLog } from '@/components/superadmin/audit/system-audit-log'
import { UserAuditLog } from '@/components/superadmin/audit/user-audit-log'
import { SecurityAuditLog } from '@/components/superadmin/audit/security-audit-log'
import { AuditLogFilters } from '@/components/superadmin/audit/audit-log-filters'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']
type Organization = Database['public']['Tables']['organizations']['Row']

interface AuditLogsClientProps {
  initialSystemLogs: AuditLog[]
  initialUserLogs: AuditLog[]
  initialSecurityLogs: AuditLog[]
  organizations: Pick<Organization, 'id' | 'name'>[]
}

export function AuditLogsClient({
  initialSystemLogs,
  initialUserLogs,
  initialSecurityLogs,
  organizations
}: AuditLogsClientProps) {
  const [systemLogs, setSystemLogs] = useState(initialSystemLogs)
  const [userLogs, setUserLogs] = useState(initialUserLogs)
  const [securityLogs, setSecurityLogs] = useState(initialSecurityLogs)

  const handleFilterChange = async (filters: {
    search: string
    dateRange: { from?: Date; to?: Date } | null
    severity: string
    organizationId?: string
    correlationId?: string
  }) => {
    try {
      const params = new URLSearchParams({
        ...filters,
        dateRange: filters.dateRange ? JSON.stringify({
          from: filters.dateRange.from?.toISOString(),
          to: filters.dateRange.to?.toISOString()
        }) : '',
        search: filters.search || '',
        severity: filters.severity || '',
        organizationId: filters.organizationId || '',
        correlationId: filters.correlationId || ''
      })

      const response = await fetch('/api/audit/logs?' + params)
      
      if (!response.ok) throw new Error('Failed to fetch filtered logs')
      
      const data = await response.json()
      setSystemLogs(data.systemLogs || [])
      setUserLogs(data.userLogs || [])
      setSecurityLogs(data.securityLogs || [])
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            Monitor system activity and user actions
          </p>
        </div>
      </div>

      <AuditLogFilters 
        organizations={organizations}
        onFilterChange={handleFilterChange}
      />

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System ({systemLogs.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({userLogs.length})</TabsTrigger>
          <TabsTrigger value="security">Security ({securityLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          {systemLogs.length > 0 ? (
            <SystemAuditLog logs={systemLogs} />
          ) : (
            <p className="text-muted-foreground text-center py-4">No system logs found</p>
          )}
        </TabsContent>

        <TabsContent value="users">
          {userLogs.length > 0 ? (
            <UserAuditLog logs={userLogs} />
          ) : (
            <p className="text-muted-foreground text-center py-4">No user logs found</p>
          )}
        </TabsContent>

        <TabsContent value="security">
          {securityLogs.length > 0 ? (
            <SecurityAuditLog logs={securityLogs} />
          ) : (
            <p className="text-muted-foreground text-center py-4">No security logs found</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 