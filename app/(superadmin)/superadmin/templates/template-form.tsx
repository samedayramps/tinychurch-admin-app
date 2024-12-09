'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MessageEditor } from '@/components/message-editor'
import { useToast } from '@/components/hooks/use-toast'
import { useRouter } from 'next/navigation'
import type { Database } from '@/database.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Template = Database['public']['Tables']['message_templates']['Row']
type TemplateInput = Database['public']['Tables']['message_templates']['Insert']

interface TemplateFormProps {
  template?: Template
  categories: string[]
  onSubmit: (data: TemplateInput) => Promise<{ template?: Template; error?: string }>
}

interface MessageEditorProps {
  content: string
  onChange: (content: string) => void
}

export function TemplateForm({ template, categories, onSubmit }: TemplateFormProps) {
  const [formData, setFormData] = useState<TemplateInput>(() => ({
    name: template?.name ?? '',
    description: template?.description ?? null,
    category: template?.category ?? null,
    subject: template?.subject ?? '',
    body: template?.body ?? '',
    variables: template?.variables ?? {},
    created_by: template?.created_by ?? '',
    organization_id: template?.organization_id ?? null,
    created_at: template?.created_at ?? new Date().toISOString(),
    updated_at: template?.updated_at ?? new Date().toISOString()
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Template Name"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Select
            value={formData.category || undefined}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {/* Add other categories here */}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            placeholder="Subject"
            value={formData.subject}
            onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            required
          />
        </div>
        <div>
          <MessageEditor
            content={formData.body}
            onChange={content => setFormData(prev => ({ ...prev, body: content }))}
          />
        </div>
      </div>
      <Button type="submit">
        {template ? 'Update Template' : 'Create Template'}
      </Button>
    </form>
  )
} 