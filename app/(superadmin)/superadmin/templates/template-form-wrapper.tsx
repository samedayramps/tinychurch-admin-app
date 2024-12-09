'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/components/hooks/use-toast'
import { TemplateForm } from './template-form'
import type { Database } from '@/database.types'

type Template = Database['public']['Tables']['message_templates']['Row']
type TemplateInput = Database['public']['Tables']['message_templates']['Insert']

interface TemplateFormWrapperProps {
  template?: Template
  categories: string[]
  action: (data: TemplateInput) => Promise<{ template?: Template; error?: string }>
}

export function TemplateFormWrapper({ template, categories, action }: TemplateFormWrapperProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: TemplateInput) => {
    try {
      const result = await action(data)
      if (result.error) {
        throw new Error(result.error)
      }
      
      toast({
        title: template ? 'Template Updated' : 'Template Created',
        description: `Template has been ${template ? 'updated' : 'created'} successfully.`
      })
      
      router.push('/superadmin/templates')
      router.refresh()
      
      return result
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
      throw error
    }
  }

  return (
    <TemplateForm 
      template={template}
      categories={categories}
      onSubmit={handleSubmit}
    />
  )
} 