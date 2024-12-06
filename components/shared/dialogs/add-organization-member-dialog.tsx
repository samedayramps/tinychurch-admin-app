'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/hooks/use-toast'
import { createClient } from '@/lib/utils/supabase/client'
import type { Database } from '@/database.types'

type UserRole = Database['public']['Enums']['user_role']

interface AddOrganizationMemberDialogProps {
  organizationId?: string
  userId?: string
  onSuccess?: () => void
}

export function AddOrganizationMemberDialog({ 
  organizationId, 
  userId,
  onSuccess 
}: AddOrganizationMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<UserRole>('member')
  const [email, setEmail] = useState('')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(organizationId || '')
  const { toast } = useToast()
  const supabase = createClient()
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    async function loadOrganizations() {
      const { data } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name')
      
      setOrganizations(data || [])
    }

    if (!organizationId) {
      loadOrganizations()
    }
  }, [organizationId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let targetUserId = userId

      // If no userId provided, lookup by email
      if (!targetUserId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()

        if (!profile) {
          throw new Error('User not found')
        }
        targetUserId = profile.id
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('organization_members')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('organization_id', selectedOrganizationId)
        .single()

      if (existing) {
        throw new Error('User is already a member of this organization')
      }

      // Add member
      const { error } = await supabase
        .from('organization_members')
        .insert({
          user_id: targetUserId,
          organization_id: selectedOrganizationId,
          role,
          joined_date: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Member added successfully',
      })
      
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add member',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {userId ? 'Add to Organization' : 'Add Member'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Organization Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!userId && (
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
          )}
          
          {!organizationId && (
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select
                value={selectedOrganizationId}
                onValueChange={setSelectedOrganizationId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="ministry_leader">Ministry Leader</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="visitor">Visitor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 