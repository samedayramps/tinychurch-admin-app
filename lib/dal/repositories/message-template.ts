import { BaseRepositoryBase } from '../base/repository-base'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'

type TemplateRow = Database['public']['Tables']['message_templates']['Row']
type TemplateInsert = Database['public']['Tables']['message_templates']['Insert']

export class MessageTemplateRepository extends BaseRepositoryBase<'message_templates'> {
  protected tableName = 'message_templates' as const
  protected organizationField?: keyof TemplateRow = 'organization_id'

  async create(data: TemplateInsert) {
    const { data: template, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return template
  }

  async update(id: string, data: Partial<TemplateRow>) {
    const { data: template, error } = await this.supabase
      .from(this.tableName)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return template
  }

  async getByCategory(category: string) {
    const { data, error } = await this.baseQuery()
      .eq('category', category)
      .order('name')
    
    if (error) throw error
    return data
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
} 