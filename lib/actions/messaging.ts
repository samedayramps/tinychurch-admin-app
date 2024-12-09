'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { MessageRepository } from '@/lib/dal/repositories/message'
import { getCurrentUser } from '@/lib/dal'
import { Resend } from 'resend'
import type { Database } from '@/database.types'

const resend = new Resend(process.env.RESEND_API_KEY)

type MessageInput = Database['public']['Tables']['messages']['Insert']

export async function sendMessage(data: {
  subject: string
  body: string
  recipientType: 'individual' | 'group' | 'organization'
  recipientId: string
  role?: string
}) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.is_superadmin) {
      throw new Error('Unauthorized - Only superadmins can send messages')
    }

    const supabase = await createClient()
    const messageRepo = new MessageRepository(supabase)

    // Create the message record with correct recipient field
    const messageData: MessageInput = {
      subject: data.subject,
      body: data.body,
      sender_id: currentUser.id,
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    // Set the correct recipient field based on type
    if (data.recipientType === 'individual') {
      messageData.recipient_id = data.recipientId
    } else if (data.recipientType === 'group') {
      messageData.group_id = data.recipientId
    } else {
      messageData.organization_id = data.recipientId
    }

    const message = await messageRepo.create(messageData)
    const recipients = await messageRepo.getRecipients(
      data.recipientType,
      data.recipientId,
      data.role
    )

    if (recipients.length > 0) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: recipients.map((r: { email: string }) => r.email),
        subject: data.subject,
        html: data.body,
      })
    }

    revalidatePath('/superadmin/messaging')
    return { message }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to send message' }
  }
} 