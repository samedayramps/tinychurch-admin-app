import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/sign-in?error=Could not authenticate user`);
    }
  }

  // Handle hash fragment for invite flow
  const hash = requestUrl.hash;
  if (hash && hash.includes("access_token")) {
    const supabase = await createClient();
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      
      if (error) {
        console.error("Error setting session:", error);
        return NextResponse.redirect(`${origin}/sign-in?error=Could not set user session`);
      }
    }
  }

  // After successful authentication, redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
