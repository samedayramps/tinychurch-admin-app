import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getRedirectPath } from '@/lib/auth/redirects'
import { getUserProfile } from '@/lib/dal'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      return NextResponse.redirect(`${origin}/sign-in?error=Could not authenticate user`);
    }

    // Get profile and determine redirect
    const profile = await getUserProfile(user?.id);
    const redirectPath = await getRedirectPath(profile, true);
    return NextResponse.redirect(`${origin}${redirectPath}`);
  }

  return NextResponse.redirect(`${origin}/sign-in`);
}
