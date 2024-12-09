'use client'

import { useState, useMemo } from 'react'
import type { Database } from '@/database.types'
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Users, User, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Organization = Database['public']['Tables']['organizations']['Row']
type Group = Database['public']['Tables']['groups']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface RecipientSelectorProps {
  organizations: Organization[]
  groups: Group[]
  recipients: Profile[]
  recipientId: string
  role: string
  onRecipientChange: (id: string, type: 'individual' | 'group' | 'organization') => void
  onRoleChange: (role: string) => void
}

type RecipientOption = {
  id: string
  name: string
  type: 'individual' | 'group' | 'organization'
  email?: string
}

export function RecipientSelector({
  organizations,
  groups,
  recipients,
  recipientId,
  role,
  onRecipientChange,
  onRoleChange,
}: RecipientSelectorProps) {
  const [open, setOpen] = useState(false)

  // Combine all recipients into a single searchable list
  const allRecipients = useMemo(() => {
    const options: RecipientOption[] = [
      ...recipients.map(r => ({
        id: r.id,
        name: r.full_name || r.email,
        email: r.email,
        type: 'individual' as const
      })),
      ...groups.map(g => ({
        id: g.id,
        name: g.name,
        type: 'group' as const
      })),
      ...organizations.map(o => ({
        id: o.id,
        name: o.name,
        type: 'organization' as const
      }))
    ]
    return options
  }, [recipients, groups, organizations])

  // Find the currently selected recipient
  const selectedRecipient = allRecipients.find(r => r.id === recipientId)

  // Get the display text for the selected recipient
  const getRecipientDisplay = (recipient: RecipientOption) => {
    switch (recipient.type) {
      case 'individual':
        return `${recipient.name} (${recipient.email})`
      case 'group':
        return `${recipient.name} (Group)`
      case 'organization':
        return `${recipient.name} (Organization)`
    }
  }

  // Get icon for recipient type
  const getRecipientIcon = (type: RecipientOption['type']) => {
    switch (type) {
      case 'individual':
        return <User className="mr-2 h-4 w-4" />
      case 'group':
        return <Users className="mr-2 h-4 w-4" />
      case 'organization':
        return <Building2 className="mr-2 h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Recipient</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedRecipient ? (
                <span className="flex items-center">
                  {getRecipientIcon(selectedRecipient.type)}
                  {getRecipientDisplay(selectedRecipient)}
                </span>
              ) : (
                "Select recipient..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Search recipients..." />
              <CommandList>
                <CommandEmpty>No recipients found.</CommandEmpty>
                <CommandGroup heading="Individuals">
                  {allRecipients
                    .filter(r => r.type === 'individual')
                    .map((recipient) => (
                      <CommandItem
                        key={recipient.id}
                        value={`${recipient.name} ${recipient.email}`}
                        onSelect={() => {
                          onRecipientChange(recipient.id, recipient.type)
                          setOpen(false)
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>{recipient.name}</span>
                        {recipient.email && (
                          <span className="ml-2 text-muted-foreground">
                            ({recipient.email})
                          </span>
                        )}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            recipientId === recipient.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Groups">
                  {allRecipients
                    .filter(r => r.type === 'group')
                    .map((recipient) => (
                      <CommandItem
                        key={recipient.id}
                        value={recipient.name}
                        onSelect={() => {
                          onRecipientChange(recipient.id, recipient.type)
                          setOpen(false)
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {recipient.name}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            recipientId === recipient.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Organizations">
                  {allRecipients
                    .filter(r => r.type === 'organization')
                    .map((recipient) => (
                      <CommandItem
                        key={recipient.id}
                        value={recipient.name}
                        onSelect={() => {
                          onRecipientChange(recipient.id, recipient.type)
                          setOpen(false)
                        }}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        {recipient.name}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            recipientId === recipient.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedRecipient?.type === 'organization' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Role Filter (Optional)</label>
          <Select value={role} onValueChange={onRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
} 