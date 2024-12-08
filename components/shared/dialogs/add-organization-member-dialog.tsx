'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/hooks/use-toast'
import { createClient } from '@/lib/utils/supabase/client'
import { inviteUserAction } from '@/lib/actions/users'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Database } from '@/database.types'
import { Combobox } from '@/components/ui/combobox'

type UserRole = Database['public']['Enums']['user_role']
type Profile = Database['public']['Tables']['profiles']['Row']

const inviteFormSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum(['admin', 'staff', 'ministry_leader', 'member', 'visitor'] as const)
})

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
  const [selectedUserId, setSelectedUserId] = useState('')
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const { toast } = useToast()
  const supabase = createClient()

  // Initialize the invite form
  const inviteForm = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      role: 'member'
    }
  })

  // Load available users
  useEffect(() => {
    async function loadUsers() {
      if (!organizationId) return

      try {
        const { data: orgMembers, error: membersError } = await supabase
          .from('organization_members')
          .select('user_id')
          .eq('organization_id', organizationId)

        if (membersError) throw membersError

        // Handle case when there are no existing members
        const existingUserIds = orgMembers?.map(m => m.user_id) || []
        const notInClause = existingUserIds.length > 0 
          ? `(${existingUserIds.join(',')})`
          : '(null)' // Use (null) when there are no existing members

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .not('id', 'in', notInClause)
          .eq('status', 'active')
          .order('full_name')

        if (profilesError) throw profilesError

        if (!profiles) {
          setUsers([])
          return
        }

        setUsers(
          profiles.map(profile => ({
            id: profile.id,
            name: profile.full_name || profile.email
          }))
        )
      } catch (error) {
        console.error('Failed to load users:', error)
        toast({
          title: 'Error',
          description: 'Failed to load available users',
          variant: 'destructive'
        })
        // Set empty array on error to prevent undefined state
        setUsers([])
      }
    }

    if (open) {
      loadUsers()
    }
  }, [open, organizationId, supabase, toast])

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!organizationId || !selectedUserId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: selectedUserId,
          role
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Member added successfully'
      })

      onSuccess?.()
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (values: z.infer<typeof inviteFormSchema>) => {
    if (!organizationId) return

    setLoading(true)
    try {
      await inviteUserAction({
        ...values,
        organization_id: organizationId,
        is_active: true,
        is_superadmin: false
      })

      toast({
        title: 'Success',
        description: 'Invitation sent successfully'
      })

      onSuccess?.()
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      // Reset existing user form
      setSelectedUserId('')
      setRole('member')
      
      // Reset invite form
      inviteForm.reset({
        email: '',
        first_name: '',
        last_name: '',
        role: 'member'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Organization Member</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="existing">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Add Existing User</TabsTrigger>
            <TabsTrigger value="invite">Invite New User</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Combobox
                  items={users}
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  placeholder="Search for a user..."
                  emptyText="No users found"
                  className="w-full"
                  // Add these props to match Select styling
                  triggerClassName="h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  contentClassName="w-full border bg-popover text-popover-foreground shadow-md"
                />
              </div>

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
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Member'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="invite">
            <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...inviteForm.register('email')}
                  type="email"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  {...inviteForm.register('first_name')}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  {...inviteForm.register('last_name')}
                  placeholder="Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.watch('role')}
                  onValueChange={(value) => inviteForm.setValue('role', value as UserRole)}
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
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 