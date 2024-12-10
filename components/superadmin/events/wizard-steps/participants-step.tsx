'use client'

import { useEffect, useState } from 'react'
import { useWizard } from '../wizard-context'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from '@/lib/utils/supabase/client'
import { Loader2 } from 'lucide-react'
import type { Database } from '@/database.types'

type OrganizationMember = Database['public']['Tables']['organization_members']['Row'] & {
  profiles: {
    id: string
    email: string
    full_name: string | null
  }
}

type Group = Database['public']['Tables']['groups']['Row']

interface ParticipantsStepProps {
  organizations: { id: string; name: string }[]
}

export function ParticipantsStep({ organizations }: ParticipantsStepProps) {
  const { form: { control, watch } } = useWizard()
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<OrganizationMember[]>([])
  
  const organizationId = watch('organization_id')
  const participantType = watch('participant_type')

  // Fetch groups and members when organization changes
  useEffect(() => {
    async function fetchParticipants() {
      if (!organizationId) return

      setLoading(true)
      const supabase = createClient()

      try {
        // Fetch groups
        const { data: groupsData } = await supabase
          .from('groups')
          .select('*')
          .eq('organization_id', organizationId)
          .is('deleted_at', null)
          .order('name')

        // Fetch members
        const { data: membersData } = await supabase
          .from('organization_members')
          .select(`
            *,
            profiles (
              id,
              email,
              full_name
            )
          `)
          .eq('organization_id', organizationId)
          .is('deleted_at', null)

        setGroups(groupsData || [])
        setMembers(membersData || [])
      } catch (error) {
        console.error('Error fetching participants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchParticipants()
  }, [organizationId])

  if (!organizationId) {
    return (
      <div className="text-center text-muted-foreground">
        Please select an organization first
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="participant_type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Who can attend?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="all" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    All Organization Members
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="groups" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Specific Groups
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="individuals" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Select Individual Members
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {participantType === 'groups' && (
        <FormField
          control={control}
          name="participant_groups"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Groups</FormLabel>
              <FormDescription>
                Choose which groups can attend this event
              </FormDescription>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-4">
                  {groups.map((group) => (
                    <FormItem
                      key={group.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(group.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || []
                            const updated = checked
                              ? [...current, group.id]
                              : current.filter(id => id !== group.id)
                            field.onChange(updated)
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          {group.name}
                        </FormLabel>
                        {group.description && (
                          <FormDescription>
                            {group.description}
                          </FormDescription>
                        )}
                      </div>
                    </FormItem>
                  ))}
                  {groups.length === 0 && (
                    <div className="text-center text-muted-foreground">
                      No groups found
                    </div>
                  )}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {participantType === 'individuals' && (
        <FormField
          control={control}
          name="participant_users"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Members</FormLabel>
              <FormDescription>
                Choose specific members who can attend this event
              </FormDescription>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-4">
                  {members.map((member) => (
                    <FormItem
                      key={member.user_id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(member.user_id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || []
                            const updated = checked
                              ? [...current, member.user_id]
                              : current.filter(id => id !== member.user_id)
                            field.onChange(updated)
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          {member.profiles.full_name || member.profiles.email}
                        </FormLabel>
                        {member.profiles.full_name && (
                          <FormDescription>
                            {member.profiles.email}
                          </FormDescription>
                        )}
                      </div>
                    </FormItem>
                  ))}
                  {members.length === 0 && (
                    <div className="text-center text-muted-foreground">
                      No members found
                    </div>
                  )}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
} 