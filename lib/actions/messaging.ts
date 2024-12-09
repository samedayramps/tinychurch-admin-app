'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { revalidatePath } from 'next/cache'
import { MessageRepository, type MessageQueryResponse } from '@/lib/dal/repositories/message'
import type { Database } from '@/database.types'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Define MessageInput type locally since it's not exported
type MessageInput = Database['public']['Tables']['messages']['Insert']

export async function sendMessage(params: {
  subject: string
  body: string
  recipientType: 'individual' | 'group' | 'organization'
  recipientId: string
  role?: string
  organizationId: string
}): Promise<{ message?: MessageQueryResponse; error?: string }> {
  try {
    console.log('Creating message with data:', {
      ...params,
      body: params.body.substring(0, 100) + '...' // Truncate body for logging
    })

    const currentUser = await getCurrentUser()
    if (!currentUser?.is_superadmin) {
      return { error: 'Unauthorized - Only superadmins can send messages' }
    }
    console.log('Current user:', currentUser);

    const supabase = await createClient()
    const messageRepo = new MessageRepository(supabase)

    // Fetch organization-specific information
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('email_from')
      .eq('id', params.organizationId)
      .single();

    if (orgError) return { error: orgError.message }
    if (!orgData) return { error: 'Organization not found' }

    // Create the message record with correct recipient field
    const messageData: MessageInput = {
      subject: params.subject,
      body: params.body,
      sender_id: currentUser.id,
      status: 'pending',
      created_at: new Date().toISOString(),
      organization_id: params.organizationId,
    }

    // Set the correct recipient field based on type
    if (params.recipientType === 'individual') {
      messageData.recipient_id = params.recipientId
    } else if (params.recipientType === 'group') {
      messageData.group_id = params.recipientId
    } else {
      messageData.organization_id = params.recipientId
    }
    console.log('Message data prepared:', messageData);

    const message = await messageRepo.create(messageData)
    console.log('Created message:', {
      id: message.id,
      organization_id: message.organization_id,
      status: message.status
    })

    const recipients = await messageRepo.getRecipients(
      params.recipientType,
      params.recipientId,
      params.role
    )
    console.log('Recipients fetched:', recipients);

    if (recipients.length > 0) {
      console.log('Sending email via Resend...');
      try {
        const response = await resend.emails.send({
          from: orgData.email_from,
          to: recipients.map((r: { email: string }) => r.email),
          subject: params.subject,
          html: params.body,
        });
        console.log('Email sent successfully:', response);

        // Update message status and sent_at timestamp
        await messageRepo.update(message.id, {
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
        console.log('Message status updated to sent');
      } catch (resendError) {
        console.error('Error sending email via Resend:', resendError);

        // Optionally update the message with an error status or message
        await messageRepo.update(message.id, {
          status: 'failed',
          error_message: (resendError as Error).message,
        });
        return { error: (resendError as Error).message }
      }
    } else {
      console.log('No recipients found to send emails');
    }

    revalidatePath('/superadmin/messaging')
    return { message }
  } catch (error) {
    console.error('Error in sendMessage:', error)
    return { error: error instanceof Error ? error.message : 'Failed to send message' }
  }
}

export async function updateMessagingSettings(organizationId: string, settings: {
  default_from_name: string
  default_reply_to: string
  notifications_enabled: boolean
}) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('messaging_settings')
      .upsert({
        organization_id: organizationId,
        ...settings,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
    
    revalidatePath('/superadmin/messaging')
    return { success: true }
  } catch (error) {
    console.error('Failed to update messaging settings:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update settings' }
  }
}

export type MessageHistoryFilter = {
  organizationId?: string
  senderId?: string
  recipientId?: string
  groupId?: string
  status?: 'sent' | 'failed' | 'pending'
  dateFrom?: string
  dateTo?: string
  searchTerm?: string
}

export async function getMessageHistory(filters: MessageHistoryFilter) {
  try {
    console.log('Fetching message history with filters:', filters)
    const supabase = await createClient()
    const currentUser = await getCurrentUser()
    
    let query = supabase
      .from('messages')
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
      .order('created_at', { ascending: false })

    // Only filter by organization if not a superadmin and organizationId is provided
    if (!currentUser?.is_superadmin && filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId)
    }

    // Debug: Log query parameters instead of SQL
    console.log('Query filters:', filters)

    // Apply other filters
    if (filters.senderId) {
      query = query.eq('sender_id', filters.senderId)
    }
    if (filters.recipientId) {
      query = query.eq('recipient_id', filters.recipientId)
    }
    if (filters.groupId) {
      query = query.eq('group_id', filters.groupId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }
    if (filters.searchTerm) {
      query = query.or(`subject.ilike.%${filters.searchTerm}%,body.ilike.%${filters.searchTerm}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching message history:', error)
      throw error
    }

    console.log(`Found ${data?.length || 0} total messages`)
    return data
  } catch (error) {
    console.error('Failed to fetch message history:', error)
    return []
  }
} 