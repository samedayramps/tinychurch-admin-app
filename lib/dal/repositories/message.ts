import { BaseRepositoryBase } from '../base/repository-base'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'

type MessageRow = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type Profile = Database['public']['Tables']['profiles']['Row']
type Group = Database['public']['Tables']['groups']['Row']
type Organization = Database['public']['Tables']['organizations']['Row']

export type MessageQueryResponse = MessageRow & {
  sender: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
  recipient: {
    id: string
    email: string
    full_name: string | null
  } | null
  group: {
    id: string
    name: string
  } | null
  organization: {
    id: string
    name: string
  } | null
  error?: string
}

export type RecipientProfile = Pick<Profile, 'id' | 'email'>

export class MessageRepository extends BaseRepositoryBase<'messages'> {
  protected tableName = 'messages' as const
  protected organizationField?: keyof MessageRow = 'organization_id'

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {
    super(supabase, context)
  }

  async create(data: MessageInsert): Promise<MessageQueryResponse> {
    const initialStatus = data.scheduled_for ? 'scheduled' : 'pending'

    const { data: message, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...data,
        status: initialStatus
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating message:', error)
      throw error
    }
    
    if (!message) throw new Error('Failed to create message')
    return message as MessageQueryResponse
  }

  async getRecipients(type: string, id: string, role?: string): Promise<RecipientProfile[]> {
    switch (type) {
      case 'individual': {
        const { data, error } = await this.supabase
          .from('profiles')
          .select('id, email')
          .eq('id', id)
          .single()
        
        if (error) throw error
        return data ? [data] : []
      }

      case 'group': {
        const { data, error } = await this.supabase
          .from('group_members')
          .select(`
            profiles!inner (
              id,
              email
            )
          `)
          .eq('group_id', id)

        if (error) throw error
        return data?.map(d => d.profiles) || []
      }

      case 'organization': {
        const query = this.supabase
          .from('organization_members')
          .select(`
            profiles!inner (
              id,
              email
            )
          `)
          .eq('organization_id', id)
        
        if (role) {
          query.eq('role', role)
        }

        const { data, error } = await query
        if (error) throw error
        return data?.map(d => d.profiles) || []
      }

      default:
        throw new Error('Invalid recipient type')
    }
  }

  async update(id: string, data: Partial<MessageRow>) {
    const { data: updatedMessage, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedMessage;
  }

  async getById(id: string): Promise<MessageQueryResponse | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        ),
        recipient:profiles!messages_recipient_id_fkey (
          id,
          email,
          full_name
        ),
        group:groups!messages_group_id_fkey (
          id,
          name
        ),
        organization:organizations!messages_organization_id_fkey (
          id,
          name
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    
    if (!data || !data.sender) return null

    return data as MessageQueryResponse
  }
} 