'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/hooks/use-toast'
import { sendMessage } from '@/lib/actions/messaging'
import type { Database } from '@/database.types'
import { Button } from '@/components/ui/button'
import { RecipientSelector } from './components/recipient-selector'
import { MessageForm } from './components/message-form'
import { OrganizationFilter } from './components/organization-filter'

type Organization = Database['public']['Tables']['organizations']['Row']
type Group = Database['public']['Tables']['groups']['Row']
type Template = Database['public']['Tables']['message_templates']['Row']
type Profile = Database['public']['Tables']['profiles']['Row'] & {
  organization_id?: string
}

interface ComposeMessageProps {
  organizations: Organization[]
  groups: Group[]
  templates: Template[]
  recipients: Profile[]
}

export function ComposeMessage({ 
  organizations = [], 
  groups = [], 
  templates = [], 
  recipients = []
}: ComposeMessageProps) {
  const { toast } = useToast()
  const [selectedOrg, setSelectedOrg] = useState<string>('all')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipientType, setRecipientType] = useState<'individual' | 'group' | 'organization'>('individual')
  const [recipientId, setRecipientId] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')

  // Filter data based on selected organization
  const filteredGroups = selectedOrg === 'all' 
    ? groups 
    : groups.filter(group => group.organization_id === selectedOrg)

  const filteredRecipients = selectedOrg === 'all'
    ? recipients
    : recipients.filter(recipient => recipient.organization_id === selectedOrg)

  const filteredOrganizations = selectedOrg === 'all'
    ? organizations
    : organizations.filter(org => org.id === selectedOrg)

  // Reset recipient when organization changes
  useEffect(() => {
    setRecipientId('')
    setRole('')
  }, [selectedOrg])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const result = await sendMessage({
        subject,
        body,
        recipientType,
        recipientId,
        role: recipientType === 'organization' ? role : undefined
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      })

      // Reset form
      setSubject('')
      setBody('')
      setRecipientId('')
      setRole('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        setSubject(template.subject)
        setBody(template.body)
      }
    }
  }, [selectedTemplate, templates])

  const handleRecipientChange = (id: string, type: 'individual' | 'group' | 'organization') => {
    setRecipientId(id)
    setRecipientType(type)
    if (type !== 'organization') {
      setRole('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Compose Message</h2>
        <OrganizationFilter
          organizations={organizations}
          selectedOrg={selectedOrg}
          onOrganizationChange={setSelectedOrg}
        />
      </div>

      <RecipientSelector
        organizations={filteredOrganizations}
        groups={filteredGroups}
        recipients={filteredRecipients}
        recipientId={recipientId}
        role={role}
        onRecipientChange={handleRecipientChange}
        onRoleChange={setRole}
      />

      <MessageForm
        subject={subject}
        body={body}
        onSubjectChange={setSubject}
        onBodyChange={setBody}
      />

      <Button 
        onClick={handleSubmit}
        disabled={loading || !recipientId || !subject || !body}
      >
        Send Message
      </Button>
    </div>
  )
} 