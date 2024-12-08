'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { inviteToGroup, addGroupMember } from '@/lib/actions/groups'
import { UserPlus } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { createClient } from '@/lib/utils/supabase/client'
import type { Database } from '@/database.types'

// Define types based on the database schema
type Profile = Database['public']['Tables']['profiles']['Row']
type InvitableProfile = Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>

// Type for the raw Supabase response
type RawOrgMemberResponse = {
  user_id: string
  profile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

// Type for our processed member data
type OrganizationMemberResponse = {
  user_id: string
  profile: InvitableProfile
}

const inviteFormSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  role: z.enum(['member', 'leader'] as const, {
    required_error: "Please select a role",
  }),
})

interface GroupInviteDialogProps {
  groupId: string
  organizationId: string
  onInviteSent: () => void
}

export function GroupInviteDialog({
  groupId,
  organizationId,
  onInviteSent
}: GroupInviteDialogProps) {
  const [invitableMembers, setInvitableMembers] = useState<InvitableProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadInvitableMembers = async () => {
    try {
      // Get organization members with their profiles
      const { data: orgMembers, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          profile:profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (orgError) throw orgError

      // Get existing group members
      const { data: groupMembers, error: groupError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .is('deleted_at', null)

      if (groupError) throw groupError

      // Filter and transform the data
      const groupMemberIds = groupMembers?.map(m => m.user_id) || []
      
      // Safely cast the raw response
      const rawMembers = ((orgMembers || []) as unknown) as RawOrgMemberResponse[]
      
      // Transform the raw data into our expected format
      const typedOrgMembers: OrganizationMemberResponse[] = rawMembers.map(m => ({
        user_id: m.user_id,
        profile: {
          id: m.profile.id,
          email: m.profile.email,
          full_name: m.profile.full_name,
          avatar_url: m.profile.avatar_url
        }
      }))

      const invitable = typedOrgMembers
        .filter(m => !groupMemberIds.includes(m.user_id))
        .map(m => m.profile)
        .filter((profile): profile is InvitableProfile => 
          profile !== null && 
          typeof profile === 'object' &&
          'id' in profile
        )

      setInvitableMembers(invitable)
      setLoading(false)
    } catch (error) {
      console.error('Error loading invitable members:', error)
      toast({
        title: 'Error',
        description: 'Failed to load invitable members',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  // Load members when dialog opens
  useEffect(() => {
    if (open) {
      loadInvitableMembers()
    }
  }, [open, organizationId, groupId])

  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      memberId: '',
      role: 'member',
    },
  })

  const onSubmit = async (data: z.infer<typeof inviteFormSchema>) => {
    if (isSubmitting) return // Prevent double submission
    
    try {
      setIsSubmitting(true)
      const selectedMember = invitableMembers.find(m => m.id === data.memberId)
      if (!selectedMember) return

      const result = await inviteToGroup(groupId, selectedMember.id, data.role)
      
      if (result.error) {
        if (result.existingInvite) {
          toast({
            title: "Invitation Already Exists",
            description: "This user has already been invited to the group.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive"
          })
        }
        return
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      })
      setOpen(false)
      form.reset()
      onInviteSent?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onDirectAdd(data: z.infer<typeof inviteFormSchema>) {
    try {
      const selectedMember = invitableMembers.find(m => m.id === data.memberId)
      if (!selectedMember) return

      const result = await addGroupMember(groupId, selectedMember.id, data.role)
      
      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: 'Member Added',
        description: `${selectedMember.full_name || selectedMember.email} has been added to the group`,
      })
      
      // Remove the added member from the invitable list
      setInvitableMembers(prev => prev.filter(m => m.id !== selectedMember.id))
      
      setOpen(false)
      form.reset()
      onInviteSent?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add member',
        variant: 'destructive',
      })
    }
  }

  const comboboxItems = invitableMembers.map(member => ({
    id: member.id,
    name: member.full_name || member.email
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Members ({invitableMembers.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Select an organization member and assign their role in this group.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member</FormLabel>
                  <FormControl>
                    <Combobox
                      value={field.value}
                      onChange={field.onChange}
                      items={comboboxItems}
                      placeholder="Select a member..."
                      emptyText="No members found"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="leader">Leader</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between space-x-2">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => form.handleSubmit(onDirectAdd)()}
              >
                Add Directly
              </Button>
              <Button 
                type="submit"
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}