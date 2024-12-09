'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { MessageTemplateRepository } from '@/lib/dal/repositories/message-template'
import type { Database } from '@/database.types'

type Template = Database['public']['Tables']['message_templates']['Row']
type TemplateInput = Omit<Database['public']['Tables']['message_templates']['Insert'], 'id'>

export async function createTemplate(data: TemplateInput) {
  try {
    const supabase = await createClient()
    const templateRepo = new MessageTemplateRepository(supabase)
    
    const template = await templateRepo.create(data)

    revalidatePath('/superadmin/templates')
    return { template }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create template' }
  }
}

export async function updateTemplate(id: string, data: Partial<Template>) {
  try {
    const supabase = await createClient()
    const templateRepo = new MessageTemplateRepository(supabase)
    
    const template = await templateRepo.update(id, {
      ...data,
      updated_at: new Date().toISOString(),
    })

    revalidatePath('/superadmin/templates')
    return { template }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update template' }
  }
}

export async function deleteTemplate(id: string) {
  try {
    const supabase = await createClient()
    const templateRepo = new MessageTemplateRepository(supabase)
    
    await templateRepo.delete(id)
    revalidatePath('/superadmin/templates')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete template' }
  }
}

export async function updateTemplateCategory(
  templateId: string | null, 
  data: TemplateInput
) {
  try {
    const supabase = await createClient()
    const templateRepo = new MessageTemplateRepository(supabase)
    
    if (templateId) {
      const template = await templateRepo.update(templateId, {
        category: data.category,
        updated_at: new Date().toISOString(),
      })
      revalidatePath('/superadmin/templates')
      return { template }
    } else {
      const template = await templateRepo.create({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      revalidatePath('/superadmin/templates')
      return { template }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update template category' }
  }
} 