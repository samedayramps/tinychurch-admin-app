'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/database.types'

type Template = Database['public']['Tables']['message_templates']['Row']

interface TemplatePreviewProps {
  template: Template
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const [variables, setVariables] = useState<Record<string, string>>(
    (template.variables as string[]).reduce((acc, v) => ({
      ...acc,
      [v]: `[${v}]`
    }), {})
  )

  const replaceVariables = (text: string) => {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Variables</h4>
        <div className="grid grid-cols-2 gap-4">
          {(template.variables as string[]).map(variable => (
            <div key={variable} className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {variable}
              </label>
              <Input
                value={variables[variable]}
                onChange={(e) => setVariables(prev => ({
                  ...prev,
                  [variable]: e.target.value
                }))}
                placeholder={`Enter ${variable}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Subject</h4>
          <p className="text-sm border rounded-md p-2">
            {replaceVariables(template.subject)}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Body</h4>
          <div 
            className="prose prose-sm max-w-none border rounded-md p-4"
            dangerouslySetInnerHTML={{ 
              __html: replaceVariables(template.body) 
            }} 
          />
        </div>
      </div>
    </div>
  )
} 