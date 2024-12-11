"use server";

import { encodedRedirect } from "@/lib/utils/utils";
import { createClient } from "@/lib/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { log } from "@/lib/utils/logger";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }

    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const requestId = crypto.randomUUID()
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  log.info('Sign in attempt started', {
    requestId,
    email,
    hasPassword: !!password
  })

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      log.error('Sign in failed', {
        requestId,
        email,
        error: error.message,
        code: error.status
      })
      return encodedRedirect("error", "/sign-in", error.message);
    }

    log.info('Sign in successful, fetching profile', {
      requestId,
      userId: data.user.id,
      email: data.user.email
    })

    // Get profile info for the logged-in user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      log.error('Profile fetch error', {
        requestId,
        userId: data.user.id,
        error: profileError.message,
        code: profileError.code
      })
      throw profileError;
    }

    // Ensure session is set in the client
    const { error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      log.error('Session verification failed', {
        requestId,
        userId: data.user.id,
        error: sessionError.message
      })
      throw sessionError;
    }

    const redirectPath = profile?.is_superadmin ? '/superadmin/dashboard' : '/dashboard';

    log.info('Authentication complete', {
      requestId,
      userId: data.user.id,
      email: data.user.email,
      isSuperAdmin: !!profile?.is_superadmin,
      redirectTo: redirectPath
    })

    // Redirect to the appropriate dashboard
    return redirect(redirectPath);

  } catch (error) {
    // Only handle non-redirect errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Let Next.js handle the redirect
    }
    
    log.error('Unhandled error during sign in', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return encodedRedirect("error", "/sign-in", "An error occurred during sign in");
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/(auth-pages)/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
