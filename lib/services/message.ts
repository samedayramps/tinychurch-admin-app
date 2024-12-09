import { createClient } from '@/lib/utils/supabase/server'
import { MessageRepository } from '@/lib/dal/repositories/message'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/database.types'

export class MessageService {
  private supabase: SupabaseClient
  private messageRepo: MessageRepository
  private auditRepo: AuditLogRepository

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.messageRepo = new MessageRepository(supabase)
    this.auditRepo = new AuditLogRepository(supabase)
  }

  static async create(): Promise<MessageService> {
    const supabase = await createClient(true)
    return new MessageService(supabase)
  }

  async sendMessage(data: {
    senderId: string
    subject: string
    body: string
    recipientType: 'individual' | 'group' | 'organization'
    recipientId: string
  }) {
    const message = await this.messageRepo.create({
      sender_id: data.senderId,
      subject: data.subject,
      body: data.body,
      recipient_id: data.recipientType === 'individual' ? data.recipientId : null,
      group_id: data.recipientType === 'group' ? data.recipientId : null,
      organization_id: data.recipientType === 'organization' ? data.recipientId : null,
      status: 'pending',
      created_at: new Date().toISOString()
    })

    await this.auditRepo.create({
      user_id: data.senderId,
      event_type: 'user_action',
      details: `Message sent to ${data.recipientType} ${data.recipientId}`,
      metadata: {
        message_id: message.id,
        recipient_type: data.recipientType,
        recipient_id: data.recipientId
      }
    })

    return message
  }

  async getMessageHistory(options: {
    senderId?: string
    recipientId?: string
    groupId?: string
    organizationId?: string
    limit?: number
    offset?: number
  } = {}) {
    let query = this.supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (options.senderId) {
      query = query.eq('sender_id', options.senderId)
    }
    if (options.recipientId) {
      query = query.eq('recipient_id', options.recipientId)
    }
    if (options.groupId) {
      query = query.eq('group_id', options.groupId)
    }
    if (options.organizationId) {
      query = query.eq('organization_id', options.organizationId)
    }
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }
} 