'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontalIcon, PencilIcon, TrashIcon, UsersIcon, SettingsIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useToast } from "@/lib/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Database } from '@/database.types'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']

interface OrganizationTableItem extends Pick<OrganizationRow, 'id' | 'name' | 'slug' | 'status' | 'contact_email' | 'created_at'> {
  memberCount?: number
  settings?: {
    features_enabled?: string[]
    [key: string]: any
  } | null
}

interface OrganizationsTableProps {
  organizations: OrganizationTableItem[]
}

export function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  const { toast } = useToast()
  const router = useRouter()

  const getOrganizationStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFeaturesEnabled = (settings: any) => {
    const features = settings?.features_enabled || []
    return features.length > 0 ? (
      <div className="flex gap-1">
        {features.map((feature: string) => (
          <Badge key={feature} variant="outline">{feature}</Badge>
        ))}
      </div>
    ) : (
      '—'
    )
  }

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                <Link 
                  href={`/superadmin/organizations/${org.id}`}
                  className="hover:underline font-medium"
                >
                  {org.name}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {org.slug}
                </div>
              </TableCell>
              <TableCell>{getOrganizationStatusBadge(org.status)}</TableCell>
              <TableCell>{org.contact_email || '—'}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {org.memberCount || 0} members
                </Badge>
              </TableCell>
              <TableCell>{getFeaturesEnabled(org.settings)}</TableCell>
              <TableCell>{org.created_at ? formatDate(org.created_at) : '—'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/superadmin/organizations/${org.id}`}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/superadmin/organizations/${org.id}/members`}>
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Manage Members
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/superadmin/organizations/${org.id}/settings`}>
                        <SettingsIcon className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        // TODO: Implement delete organization
                        toast({
                          title: "Not implemented",
                          description: "Delete organization functionality coming soon",
                        })
                      }}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 