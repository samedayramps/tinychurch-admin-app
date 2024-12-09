'use client'

import { Input } from '@/components/ui/input'
import { MessageEditor } from '@/components/message-editor'
import type { Database } from '@/database.types'

type Template = Database['public']['Tables']['message_templates']['Row']

interface MessageFormProps {
  subject: string
  body: string
  onSubjectChange: (subject: string) => void
  onBodyChange: (body: string) => void
}

export function MessageForm({
  subject,
  body,
  onSubjectChange,
  onBodyChange,
}: MessageFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <Input 
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Enter message subject"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <MessageEditor
          content={body}
          onChange={onBodyChange}
        />
      </div>
    </div>
  )
} 