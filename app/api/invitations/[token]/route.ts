import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.pathname.split('/').pop(); // Extract the token from the URL

    // Add token format validation
    if (!token || !/^[A-Za-z0-9_-]+$/.test(token)) {
      return NextResponse.redirect(
        new URL('/error?message=Invalid token format', request.url)
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get the invitation
    const { data: invitation } = await supabase
      .from('group_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!invitation) {
      return NextResponse.redirect(
        new URL('/error?message=Invalid or expired invitation', request.url)
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== invitation.invited_user) {
      return NextResponse.redirect(
        new URL('/error?message=Unauthorized', request.url)
      );
    }

    // Accept invitation and create group membership in a transaction
    const { error } = await supabase.rpc('accept_group_invitation', {
      invitation_id: invitation.id,
      user_id: user.id
    });

    if (error) throw error;

    return NextResponse.redirect(
      new URL(`/org/${invitation.organization_id}/groups/${invitation.group_id}`, request.url)
    );
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.redirect(
      new URL('/error?message=Failed to accept invitation', request.url)
    );
  }
} 