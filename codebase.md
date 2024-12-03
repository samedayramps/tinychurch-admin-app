# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# .vscode/extensions.json

```json
{
  "recommendations": [
    "denoland.vscode-deno"
  ]
}

```

# .vscode/settings.json

```json
{
  "[typescript]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  },
  "deno.enablePaths": [
    "supabase/functions"
  ],
  "deno.lint": true,
  "deno.unstable": [
    "bare-node-builtins",
    "byonm",
    "sloppy-imports",
    "unsafe-proto",
    "webgpu",
    "broadcast-channel",
    "worker-options",
    "cron",
    "kv",
    "ffi",
    "fs",
    "http",
    "net"
  ]
}

```

# app/(admin)/dashboard/page.tsx

```tsx
import { DashboardMetrics } from '@/components/admin/dashboard/metrics'
import { RecentActivity } from '@/components/admin/dashboard/recent-activity'
import { getOrganizationStats } from '@/lib/dal/organizations'

export default async function DashboardPage() {
  const stats = await getOrganizationStats()
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardMetrics stats={stats} />
      <RecentActivity />
    </div>
  )
} 
```

# app/(admin)/layout.tsx

```tsx
import { AdminSidebar } from '@/components/admin/sidebar'
import { getUserProfile, getOrganizationMembership } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [profile, membership] = await Promise.all([
    getUserProfile(),
    getOrganizationMembership()
  ])

  if (!profile || !membership || !['admin', 'staff'].includes(membership.role)) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar user={profile} organization={membership.organizations} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
} 
```

# app/(auth-pages)/forgot-password/page.tsx

```tsx
import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64 max-w-64 mx-auto">
        <div>
          <h1 className="text-2xl font-medium">Reset Password</h1>
          <p className="text-sm text-secondary-foreground">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            Reset Password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
      <SmtpMessage />
    </>
  );
}

```

# app/(auth-pages)/layout.tsx

```tsx
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { AuthHeader } from "@/components/auth/header"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AuthHeader />
      <div className="container relative min-h-[calc(100vh-4rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-800" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            TinyChurch
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This platform has transformed how we manage our church community, making it easier to connect and serve.&rdquo;
              </p>
              <footer className="text-sm">Pastor Sarah Johnson</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {children}
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}

```

# app/(auth-pages)/reset-password/page.tsx

```tsx
import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <Label htmlFor="password">New password</Label>
      <Input
        type="password"
        name="password"
        placeholder="New password"
        required
      />
      <Label htmlFor="confirmPassword">Confirm password</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        required
      />
      <SubmitButton formAction={resetPasswordAction}>
        Reset password
      </SubmitButton>
      <FormMessage message={searchParams} />
    </form>
  );
}

```

# app/(auth-pages)/sign-in/page.tsx

```tsx
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              name="email" 
              type="email"
              placeholder="name@example.com" 
              required 
            />
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                className="text-sm text-muted-foreground hover:text-primary"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <SubmitButton 
            className="w-full"
            pendingText="Signing In..." 
            formAction={signInAction}
          >
            Sign in
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link 
            className="text-primary underline-offset-4 hover:underline" 
            href="/sign-up"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

```

# app/(auth-pages)/sign-up/page.tsx

```tsx
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex items-center justify-center h-full">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                minLength={6}
                required
              />
            </div>
            <SubmitButton 
              className="w-full"
              formAction={signUpAction} 
              pendingText="Creating account..."
            >
              Create account
            </SubmitButton>
            <FormMessage message={searchParams} />
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link 
              className="text-primary underline-offset-4 hover:underline" 
              href="/sign-in"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
      <SmtpMessage />
    </>
  );
}

```

# app/(auth-pages)/smtp-message.tsx

```tsx
import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="bg-muted/50 px-5 py-3 border rounded-md flex gap-4">
      <InfoIcon size={16} className="mt-0.5" />
      <div className="flex flex-col gap-1">
        <small className="text-sm text-secondary-foreground">
          <strong> Note:</strong> Emails are rate limited. Enable Custom SMTP to
          increase the rate limit.
        </small>
        <div>
          <Link
            href="https://supabase.com/docs/guides/auth/auth-smtp"
            target="_blank"
            className="text-primary/50 hover:text-primary flex items-center text-sm gap-1"
          >
            Learn more <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

```

# app/(default)/layout.tsx

```tsx
import { HeaderAuth } from '@/components/header-auth'
import { ThemeSwitcher } from '@/components/theme-switcher'
import Link from 'next/link'
import { getUserProfile, getOrganizationMembership } from '@/lib/dal'

export default async function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, membership] = await Promise.all([
    getUserProfile(),
    getOrganizationMembership()
  ])

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/">TinyChurch Admin</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <HeaderAuth profile={profile} membership={membership} />
          </div>
        </div>
      </nav>
      <div className="flex-1 container mx-auto py-6">
        {children}
      </div>
      <footer className="w-full border-t border-t-foreground/10 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TinyChurch. All rights reserved.</p>
      </footer>
    </main>
  )
} 
```

# app/(superadmin)/layout.tsx

```tsx
import { SuperAdminSidebar } from '@/components/superadmin/sidebar'
import { getUserProfile } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { HeaderAuth } from '@/components/header-auth'
import { ThemeSwitcher } from '@/components/theme-switcher'
import Link from 'next/link'

export default async function SuperAdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()
  
  if (!profile?.is_superadmin) {
    redirect('/')
  }
  
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-background">
        <SuperAdminSidebar />
      </aside>
      
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center px-6 gap-4 justify-end">
            <ThemeSwitcher />
            <HeaderAuth profile={profile} membership={null} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 
```

# app/(superadmin)/superadmin/dashboard/page.tsx

```tsx
import { createClient } from '@/utils/supabase/server'

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient()
  
  // Get some basic stats
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    
  const { count: orgCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{userCount}</p>
        </div>
        
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Organizations</h3>
          <p className="text-3xl font-bold">{orgCount}</p>
        </div>
      </div>
    </div>
  )
} 
```

# app/(superadmin)/superadmin/users/[id]/page.tsx

```tsx
import { createClient } from '@/utils/supabase/server'
import { UserForm } from '@/components/superadmin/users/user-form'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EditUserPage(props: Props) {
  const supabase = await createClient()
  const params = await props.params
  
  const { data: user } = await supabase
    .from('profiles')
    .select(`
      *,
      organization_members (
        role,
        organizations (id, name)
      )
    `)
    .eq('id', params.id)
    .single()
    
  if (!user) {
    notFound()
  }

  // Fetch all organizations
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit User</h1>
      <UserForm 
        user={user} 
        organizations={organizations || []} 
      />
    </div>
  )
} 
```

# app/(superadmin)/superadmin/users/invite/page.tsx

```tsx
import { UserInviteForm } from '@/components/superadmin/users/user-invite-form'
import { getAllOrganizations } from '@/lib/dal/organizations'

export default async function InviteUserPage() {
  const organizations = await getAllOrganizations()

  if (!organizations) {
    throw new Error('Failed to load organizations')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invite User</h1>
      <UserInviteForm organizations={organizations} />
    </div>
  )
} 
```

# app/(superadmin)/superadmin/users/page.tsx

```tsx
import { createClient } from '@/utils/supabase/server'
import { UsersTable } from '@/components/superadmin/users/users-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'

export default async function SuperAdminUsersPage() {
  const supabase = await createClient()
  
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      organization_members (
        role,
        organizations (name)
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <Button asChild>
          <Link href="/superadmin/users/invite">
            <PlusIcon className="mr-2 h-4 w-4" />
            Invite User
          </Link>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <UsersTable users={users || []} />
      </div>
    </div>
  )
} 
```

# app/actions.ts

```ts
"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

  const { error } = await supabase.auth.signUp({
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
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .single();

  if (profile?.is_superadmin) {
    return redirect("/superadmin/dashboard");
  }

  return redirect("/dashboard");
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

```

# app/api/auth/impersonation-status/route.ts

```ts
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const impersonationData = session?.user?.app_metadata?.impersonation
  
  return Response.json({
    isImpersonating: !!impersonationData,
    impersonatingId: impersonationData?.impersonating || null,
    realUserId: impersonationData?.original_user || null
  })
} 
```

# app/api/auth/redirect/route.ts

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  return NextResponse.redirect(new URL(
    profile?.is_superadmin ? '/superadmin/dashboard' : '/dashboard',
    request.url
  ))
} 
```

# app/api/users/impersonatable/route.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_superadmin')
    .eq('is_superadmin', false)
    .order('full_name')
  
  return NextResponse.json(users || [])
} 
```

# app/auth/callback/route.ts

```ts
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

```

# app/favicon.ico

This is a binary file of the type: Binary

# app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

```

# app/layout.tsx

```tsx
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { ImpersonationBanner } from '@/components/impersonation-banner'
import { getCurrentUser } from '@/lib/dal/auth'

export const metadata = {
  title: 'TinyChurch Admin',
  description: 'Church Management System',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUser()

  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ImpersonationBanner />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

```

# app/opengraph-image.png

This is a binary file of the type: Image

# app/org/[slug]/page.tsx

```tsx
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UsersIcon, CalendarIcon, BookOpenIcon, SettingsIcon } from 'lucide-react'

export default async function OrganizationPage() {
  const headersList = await headers()
  const orgRole = headersList.get('x-organization-role')
  const orgSlug = headersList.get('x-organization-slug')
  
  const supabase = await createClient()
  
  // Fetch organization details
  const { data: org } = await supabase
    .from('organizations')
    .select(`
      *,
      organization_members (
        profiles (id)
      )
    `)
    .eq('slug', orgSlug)
    .single()
    
  if (!org) return null
  
  // Get member count
  const memberCount = org.organization_members?.length || 0
  
  // Fetch recent activity counts
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count: recentEventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id)
    .gte('start_time', thirtyDaysAgo.toISOString())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{org.name}</h1>
        {(orgRole === 'admin' || orgRole === 'staff') && (
          <Button variant="outline" asChild>
            <Link href={`/org/${orgSlug}/settings`}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <Button variant="link" className="mt-2 p-0" asChild>
              <Link href={`/org/${orgSlug}/users`}>View all members</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEventsCount}</div>
            <Button variant="link" className="mt-2 p-0" asChild>
              <Link href={`/org/${orgSlug}/events`}>View calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(orgRole === 'admin' || orgRole === 'staff') && (
              <>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/org/${orgSlug}/users/invite`}>Invite Member</Link>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/org/${orgSlug}/events/new`}>Create Event</Link>
                </Button>
              </>
            )}
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/directory`}>Member Directory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {(orgRole === 'admin' || orgRole === 'staff') && (
        <Card>
          <CardHeader>
            <CardTitle>Administrative Tools</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/ministries`}>
                Manage Ministries
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/groups`}>
                Small Groups
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/communications`}>
                Communications
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
```

# app/org/[slug]/users/page.tsx

```tsx
import { createClient } from '@/utils/supabase/server'
import { OrganizationUsersTable } from '@/components/organization/users/users-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OrganizationUsersPage(props: Props) {
  const supabase = await createClient()
  const params = await props.params
  
  const { data: users } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles (
        id,
        email,
        full_name,
        avatar_url,
        is_active
      )
    `)
    .eq('organizations.slug', params.slug)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button asChild>
          <Link href={`/org/${params.slug}/users/invite`}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Invite User
          </Link>
        </Button>
      </div>
      
      <OrganizationUsersTable users={users || []} organizationSlug={params.slug} />
    </div>
  )
} 
```

# app/page.tsx

```tsx
import { getUserProfile } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function Index() {
  const profile = await getUserProfile()
  
  // Redirect authenticated users based on their role
  if (profile) {
    if (profile.is_superadmin) {
      redirect('/superadmin/dashboard')
    } else {
      redirect('/dashboard')
    }
  }

  // Redirect unauthenticated users to sign in
  redirect('/sign-in')
}

```

# app/settings/profile/page.tsx

```tsx
import { getUserProfile } from '@/lib/dal'
import { ProfileForm } from '@/components/settings/profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect('/auth/signin')
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  )
} 
```

# app/superadmin/layout.tsx

```tsx
import { SuperAdminSidebar } from '@/components/superadmin/sidebar'
import { getCurrentUser } from '@/lib/dal/auth'
import { redirect } from 'next/navigation'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentUser()
  
  if (!profile?.is_superadmin) {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar with impersonation controls */}
      <SuperAdminSidebar profile={profile} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </div>
    </div>
  )
} 
```

# app/twitter-image.png

This is a binary file of the type: Image

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utils/cn"
  }
}

```

# components/admin/dashboard/metrics.tsx

```tsx
import { Card, CardContent } from '@/components/ui/card'
import { UsersIcon, HomeIcon, CalendarIcon, UserCheckIcon } from 'lucide-react'

type Stats = {
  totalMembers: number
  totalMinistries: number
  totalEvents: number
  totalAttendance: number
} | null

interface DashboardMetricsProps {
  stats: Stats
}

export function DashboardMetrics({ stats }: DashboardMetricsProps) {
  if (!stats) return null
  
  const metrics = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: UsersIcon
    },
    {
      title: 'Ministries',
      value: stats.totalMinistries,
      icon: HomeIcon
    },
    {
      title: 'Events',
      value: stats.totalEvents,
      icon: CalendarIcon
    },
    {
      title: 'Total Attendance',
      value: stats.totalAttendance,
      icon: UserCheckIcon
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <metric.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
```

# components/admin/dashboard/recent-activity.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuditLogs } from '@/lib/dal/audit'
import { formatDistanceToNow } from 'date-fns'

export async function RecentActivity() {
  const logs = await getAuditLogs({ limit: 5 })
  
  if (!logs) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{log.description}</p>
                <p className="text-sm text-muted-foreground">
                  {log.category} • {log.action}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(log.created_at!), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 
```

# components/admin/sidebar.tsx

```tsx
'use client'

import { 
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar'
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingIcon,
  SettingsIcon 
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Profile } from '@/lib/types/auth'
import type { Organization } from '@/lib/types/auth'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon
  },
  {
    title: 'Members',
    href: '/members',
    icon: UsersIcon
  },
  {
    title: 'Organization',
    href: '/organization',
    icon: BuildingIcon
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: SettingsIcon
  }
]

interface AdminSidebarProps {
  user: Profile
  organization: Organization
}

export function AdminSidebar({ user, organization }: AdminSidebarProps) {
  const pathname = usePathname()
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-bold">{organization.name}</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
} 
```

# components/auth/header.tsx

```tsx
'use client'

import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AuthHeader() {
  const pathname = usePathname()
  
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center">
          <Link href="/" className="font-semibold">
            TinyChurch Admin
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {pathname !== '/sign-in' && (
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
          {pathname !== '/sign-up' && (
            <Button variant="default" asChild>
              <Link href="/sign-up">Sign up</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
} 
```

# components/avatar-upload.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/hooks/use-toast'

interface AvatarUploadProps {
  uid: string
  url: string | null
  onUpload: (url: string) => void
  size?: number
}

export function AvatarUpload({ uid, url, onUpload, size = 150 }: AvatarUploadProps) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(path)

      setAvatarUrl(data.publicUrl)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${uid}/${Math.random()}.${fileExt}`

      // Delete old avatar if exists
      if (url) {
        const { error: deleteError } = await supabase
          .storage
          .from('avatars')
          .remove([url])

        if (deleteError) {
          console.error('Error deleting old avatar:', deleteError)
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get the public URL before calling onUpload
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName)

      setAvatarUrl(publicUrl)
      
      // Call onUpload with the filename
      await onUpload(fileName)
      
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      })
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error uploading avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar 
        className="h-[150px] w-[150px]"
        style={{ height: size, width: size }}
      >
        <AvatarImage src={avatarUrl || ''} alt="Avatar" />
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center gap-2">
        <Button 
          variant="outline" 
          className="relative"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Avatar'}
          <input
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            type="file"
            id="single"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </Button>
      </div>
    </div>
  )
} 
```

# components/form-message.tsx

```tsx
export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-foreground border-l-2 px-4">{message.message}</div>
      )}
    </div>
  );
}

```

# components/header-auth.tsx

```tsx
'use client'

import { useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User, Building2, Shield } from 'lucide-react'
import type { Profile, OrganizationMember } from '@/lib/types/auth'

interface HeaderAuthProps {
  profile: Profile | null
  membership: OrganizationMember | null
}

export function HeaderAuth({ profile, membership }: HeaderAuthProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.refresh()
  }, [supabase.auth, router])

  if (!profile) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.push('/sign-in')}>
          Sign in
        </Button>
        <Button variant="default" onClick={() => router.push('/sign-up')}>
          Sign up
        </Button>
      </div>
    )
  }

  const initials = profile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || profile.email?.[0].toUpperCase() || '?'

  return (
    <div className="flex items-center gap-4">
      {/* Show impersonation banner if applicable */}
      {profile.impersonated && (
        <div className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
          Impersonating User
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {profile.avatar_url ? (
                <AvatarImage 
                  src={supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl} 
                  alt={profile.full_name || profile.email || ''} 
                />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile.email}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Organization Context */}
          {membership && (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-medium leading-none text-muted-foreground">
                    Organization
                  </p>
                  <p className="text-sm leading-none">
                    {membership.organizations.name}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          
          {membership && (
            <DropdownMenuItem onClick={() => router.push(`/org/${membership.organizations.slug}/settings`)}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Organization Settings</span>
            </DropdownMenuItem>
          )}
          
          {/* Show superadmin link if applicable */}
          {profile.is_superadmin && (
            <DropdownMenuItem onClick={() => router.push('/superadmin')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Console</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

```

# components/hooks/use-toast.ts

```ts
"use client"

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

interface Toast extends Omit<ToasterToast, "id"> {}

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast } 
```

# components/impersonation-banner.tsx

```tsx
'use client'

import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { stopImpersonation } from '@/lib/actions/impersonation'

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUserId } = useImpersonationStatus()
  
  if (!isImpersonating) return null
  
  return (
    <Alert 
      variant="default" 
      className="fixed top-0 left-0 right-0 z-50 border-yellow-500 bg-yellow-50 text-yellow-900"
    >
      <div className="flex items-center justify-between">
        <p>You are currently impersonating another user</p>
        <form action={stopImpersonation}>
          <Button variant="outline" type="submit">
            Stop Impersonating
          </Button>
        </form>
      </div>
    </Alert>
  )
} 
```

# components/impersonation/user-list.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import { ImpersonationUserSelect } from './user-select'
import type { Profile } from '@/lib/types/auth'
import { Skeleton } from '@/components/ui/skeleton'

export function ImpersonationUserList() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const response = await fetch('/api/users/impersonatable')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()
        setUsers(data || [])
      } catch (error) {
        console.error('Failed to fetch users:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch users')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [])
  
  if (loading) {
    return (
      <div className="px-4 py-3">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    )
  }
  
  if (!users.length) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground">
        No users available
      </div>
    )
  }
  
  return <ImpersonationUserSelect users={users} />
} 
```

# components/impersonation/user-select.tsx

```tsx
'use client'

import { useState } from 'react'
import { UserCog } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { startImpersonation } from '@/lib/actions/impersonation'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types/auth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/hooks/use-toast'

interface ImpersonationUserSelectProps {
  users: Profile[]
}

export function ImpersonationUserSelect({ users }: ImpersonationUserSelectProps) {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const safeUsers = Array.isArray(users) ? users : []

  const handleSelect = async (userId: string) => {
    try {
      setIsLoading(true)
      setSelectedUser(userId)
      
      const result = await startImpersonation(userId)
      
      if (result?.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Impersonation started",
        description: "You are now impersonating another user",
      })

      router.refresh()
    } catch (error) {
      console.error('Failed to start impersonation:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start impersonation. Please try again.",
      })
      setSelectedUser('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2 px-4 py-3">
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4" />
        <Label>Impersonate User</Label>
      </div>
      
      <Select 
        value={selectedUser} 
        onValueChange={handleSelect}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Starting impersonation..." : "Select user..."} />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[200px]">
            {safeUsers.map((user) => (
              <SelectItem 
                key={user.id} 
                value={user.id}
                className="cursor-pointer"
                disabled={isLoading}
              >
                {user.full_name || user.email}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  )
} 
```

# components/organization/users/users-table.tsx

```tsx
'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontalIcon, UserMinusIcon, ShieldIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/hooks/use-toast'

interface OrganizationUsersTableProps {
  users: Array<{
    id: string
    role: string
    profiles: {
      id: string
      email: string
      full_name: string
      avatar_url: string | null
      is_active: boolean
    }
  }>
  organizationSlug: string
}

export function OrganizationUsersTable({ users, organizationSlug }: OrganizationUsersTableProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User removed from organization",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive",
      })
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.profiles.full_name?.charAt(0) || user.profiles.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{user.profiles.full_name}</span>
              </div>
            </TableCell>
            <TableCell>{user.profiles.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? "secondary" : "default"}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.profiles.is_active ? "default" : "destructive"}>
                {user.profiles.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/org/${organizationSlug}/users/${user.profiles.id}`)}>
                    <ShieldIcon className="w-4 h-4 mr-2" />
                    Manage Role
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRemoveUser(user.profiles.id)}
                    className="text-destructive"
                  >
                    <UserMinusIcon className="w-4 h-4 mr-2" />
                    Remove from Organization
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 
```

# components/settings/profile-form.tsx

```tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Profile } from '@/lib/types/auth'
import { AvatarUpload } from '@/components/avatar-upload'
import { updateProfile } from '@/lib/actions/profile'

const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  alternative_email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
  phone: z.string().optional(),
  language: z.string().default('en'),
  theme: z.string().default('light'),
  notification_preferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(false),
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      alternative_email: profile.alternative_email || "",
      phone: profile.phone || "",
      language: profile.language || "en",
      theme: profile.theme || "light",
      notification_preferences: profile.notification_preferences || {
        email: true,
        sms: false,
        push: false,
      },
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'notification_preferences') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value?.toString() || '')
        }
      })

      const result = await updateProfile(formData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <AvatarUpload
          uid={profile.id}
          url={profile.avatar_url || null}
          onUpload={async (url) => {
            try {
              const formData = new FormData()
              formData.append('avatar_url', url)
              const result = await updateProfile(formData)
              
              if (result.error) {
                console.error('Profile update error:', result.error)
                toast({
                  title: "Error",
                  description: result.error,
                  variant: "destructive",
                })
                return
              }

              toast({
                title: "Success",
                description: "Avatar updated successfully",
              })
            } catch (error) {
              console.error('Avatar update error:', error)
              toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update avatar",
                variant: "destructive",
              })
            }
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alternative_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternative Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormDescription>
                  Optional secondary email address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
} 
```

# components/sidebar.tsx

```tsx
import { ImpersonationUserSelect } from './impersonation/user-select'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'
import type { Profile } from '@/lib/types/auth'
import { ImpersonationUserList } from './impersonation/user-list'

interface SidebarProps {
  profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r bg-background">
      {/* ... existing sidebar content ... */}
      
      {/* Add impersonation selector for superadmins */}
      {profile.is_superadmin && (
        <>
          <div className="h-px bg-border my-4" /> {/* Separator */}
          <ImpersonationUserList />
        </>
      )}
      
      {/* ... rest of sidebar content ... */}
    </aside>
  )
} 
```

# components/submit-button.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}

```

# components/superadmin/impersonation-sidebar.tsx

```tsx
'use client'

import { ImpersonationUserList } from '@/components/impersonation/user-list'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { UserIcon } from 'lucide-react'

export function ImpersonationSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <UserIcon className="mr-2 h-4 w-4" />
          Impersonate User
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>User Impersonation</SheetTitle>
          <SheetDescription>
            Select a user to impersonate. You will be able to view and interact with the application as this user.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8">
          <ImpersonationUserList />
        </div>
      </SheetContent>
    </Sheet>
  )
} 
```

# components/superadmin/sidebar.tsx

```tsx
'use client'

import { 
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from '@/components/ui/sidebar'
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingIcon,
  ShieldIcon,
  ActivityIcon,
  SettingsIcon 
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Profile } from '@/lib/types/auth'
import { ImpersonationUserList } from '@/components/impersonation/user-list'

interface SuperAdminSidebarProps {
  profile: Profile
}

export function SuperAdminSidebar({ profile }: SuperAdminSidebarProps) {
  const pathname = usePathname()
  
  return (
    <SidebarProvider>
      <Sidebar className="border-0">
        <SidebarHeader className="px-6 py-4">
          <Link href="/superadmin/dashboard" className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Admin Console</h2>
          </Link>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="px-6"
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter>
          {/* Impersonation controls in footer */}
          <ImpersonationUserList />
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/superadmin/dashboard',
    icon: HomeIcon
  },
  {
    title: 'Organizations',
    href: '/superadmin/organizations',
    icon: BuildingIcon
  },
  {
    title: 'Users',
    href: '/superadmin/users',
    icon: UsersIcon
  },
  {
    title: 'Access Control',
    href: '/superadmin/access',
    icon: ShieldIcon
  },
  {
    title: 'Audit Logs',
    href: '/superadmin/audit',
    icon: ActivityIcon
  },
  {
    title: 'System Settings',
    href: '/superadmin/settings',
    icon: SettingsIcon
  }
] 
```

# components/superadmin/users/user-form.tsx

```tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/hooks/use-toast'
import { updateUserAction } from '@/lib/actions/users'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Database } from '@/database.types'
import { useRouter } from 'next/navigation'
import { formatPhoneNumber } from '@/lib/utils'

const userFormSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  alternative_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true // Allow empty
      // Basic phone format validation: 123-456-7890 or empty
      return /^\d{3}-\d{3}-\d{4}$/.test(val)
    }, {
      message: "Phone number must be in format: 123-456-7890"
    }),
  is_active: z.boolean(),
  is_superadmin: z.boolean(),
  language: z.string().default('en'),
  theme: z.string().default('light'),
  role: z.enum(['admin', 'staff', 'ministry_leader', 'member', 'visitor'] as const),
  organization_id: z.string().min(1, 'Organization is required'),
  notification_preferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(false),
  }),
})

type FormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    alternative_email: string | null
    phone: string | null
    is_active: boolean | null
    is_superadmin: boolean | null
    language: string | null
    theme: string | null
    notification_preferences: {
      email: boolean
      sms: boolean
      push: boolean
    } | null
    organization_members: Array<{
      role: Database['public']['Enums']['user_role']
      organizations: {
        id: string
        name: string
      }
    }>
  }
  organizations: Array<{
    id: string
    name: string
  }>
}

export function UserForm({ user, organizations }: UserFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<FormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email,
      alternative_email: user.alternative_email || '',
      phone: formatPhoneNumber(user.phone || ''),
      is_active: user.is_active || false,
      is_superadmin: user.is_superadmin || false,
      language: user.language || 'en',
      theme: user.theme || 'light',
      role: user.organization_members?.[0]?.role || 'member',
      organization_id: user.organization_members?.[0]?.organizations.id || '',
      notification_preferences: user.notification_preferences || {
        email: true,
        sms: false,
        push: false,
      },
    },
  })

  async function onSubmit(values: FormData) {
    try {
      await updateUserAction(user.id, values)
      toast({
        title: 'Success',
        description: 'User updated successfully',
      })
      router.push('/superadmin/users')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alternative_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternative Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormDescription>
                  Optional secondary email address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel" 
                    placeholder="123-456-7890"
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value)
                      field.onChange(formatted)
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Format: 123-456-7890
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The organization this user belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                    <SelectItem value="ministry_leader">Ministry Leader</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  User's role within the organization
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="notification_preferences.email"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Email Notifications</FormLabel>
                  <FormDescription>
                    Receive notifications via email
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notification_preferences.sms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>SMS Notifications</FormLabel>
                  <FormDescription>
                    Receive notifications via SMS
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notification_preferences.push"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Push Notifications</FormLabel>
                  <FormDescription>
                    Receive push notifications
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active Status</FormLabel>
                  <FormDescription>
                    User will be able to access their account
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="is_superadmin"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Superadmin Access</FormLabel>
                  <FormDescription>
                    Grant full system access to this user
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/superadmin/users')}
          >
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  )
} 
```

# components/superadmin/users/user-invite-form.tsx

```tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { inviteUserAction } from '@/lib/actions/invite'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllOrganizations } from '@/lib/dal/organizations'
import { type Database } from '@/database.types'

type UserRole = Database['public']['Enums']['user_role']

const userInviteFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  is_active: z.boolean().default(true),
  is_superadmin: z.boolean().default(false),
  organization_id: z.string().min(1, 'Organization is required'),
  role: z.enum(['admin', 'staff', 'ministry_leader', 'member', 'visitor'] as const).default('member'),
})

type FormData = z.infer<typeof userInviteFormSchema>

interface UserInviteFormProps {
  organizations: Array<{
    id: string
    name: string
  }>
}

export function UserInviteForm({ organizations }: UserInviteFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<FormData>({
    resolver: zodResolver(userInviteFormSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      is_active: true,
      is_superadmin: false,
      organization_id: '',
      role: 'member',
    },
  })

  async function onSubmit(values: FormData) {
    try {
      await inviteUserAction(values)
      toast({
        title: 'Success',
        description: 'User invitation sent successfully',
      })
      router.push('/superadmin/users')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to invite user',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="user@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="John" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="organization_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="ministry_leader">Ministry Leader</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Allow user to access the system
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_superadmin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Superadmin</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Grant superadmin privileges
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/superadmin/users')}
          >
            Cancel
          </Button>
          <Button type="submit">Invite User</Button>
        </div>
      </form>
    </Form>
  )
} 
```

# components/superadmin/users/users-table.tsx

```tsx
'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontalIcon, PencilIcon, TrashIcon, ShieldAlertIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { deleteUserAction } from '@/lib/actions/users'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface UsersTableProps {
  users: Array<{
    id: string
    email: string
    full_name: string
    is_active: boolean
    is_superadmin: boolean
    created_at: string
    organization_members: Array<{
      role: string
      organizations: {
        name: string
      }
    }>
  }>
}

export function UsersTable({ users }: UsersTableProps) {
  const { toast } = useToast()
  const router = useRouter()

  async function handleDelete(userId: string, userEmail: string) {
    try {
      await deleteUserAction(userId)
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {user.full_name}
                  {user.is_superadmin && (
                    <ShieldAlertIcon className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.is_superadmin ? (
                  <Badge variant="secondary">Superadmin</Badge>
                ) : (
                  <Badge>{user.organization_members?.[0]?.role || 'Member'}</Badge>
                )}
              </TableCell>
              <TableCell>
                {user.organization_members?.[0]?.organizations.name || '-'}
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? "default" : "destructive"}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/superadmin/users/${user.id}`}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user
                              account and remove their data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id, user.email)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 
```

# components/theme-provider.tsx

```tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 
```

# components/theme-switcher.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"}>
          {theme === "light" ? (
            <Sun
              key="light"
              size={ICON_SIZE}
              className={"text-muted-foreground"}
            />
          ) : theme === "dark" ? (
            <Moon
              key="dark"
              size={ICON_SIZE}
              className={"text-muted-foreground"}
            />
          ) : (
            <Laptop
              key="system"
              size={ICON_SIZE}
              className={"text-muted-foreground"}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
        >
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun size={ICON_SIZE} className="text-muted-foreground" />{" "}
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon size={ICON_SIZE} className="text-muted-foreground" />{" "}
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <Laptop size={ICON_SIZE} className="text-muted-foreground" />{" "}
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };

```

# components/ui/alert-dialog.tsx

```tsx
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/utils/cn"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

```

# components/ui/alert.tsx

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

```

# components/ui/avatar.tsx

```tsx
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/utils/cn"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

```

# components/ui/badge.tsx

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

```

# components/ui/breadcrumb.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/utils/cn"

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

```

# components/ui/button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

# components/ui/calendar.tsx

```tsx
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/utils/cn"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

```

# components/ui/card.tsx

```tsx
import * as React from "react"

import { cn } from "@/utils/cn"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

# components/ui/checkbox.tsx

```tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/utils/cn"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

```

# components/ui/command.tsx

```tsx
"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/utils/cn"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}

```

# components/ui/dialog.tsx

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/utils/cn"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

```

# components/ui/drawer.tsx

```tsx
"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/utils/cn"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

```

# components/ui/dropdown-menu.tsx

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/utils/cn"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}

```

# components/ui/form.tsx

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/utils/cn"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}

```

# components/ui/input.tsx

```tsx
import * as React from "react"

import { cn } from "@/utils/cn"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

# components/ui/label.tsx

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```

# components/ui/navigation-menu.tsx

```tsx
import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/utils/cn"

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
)

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
))
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}

```

# components/ui/pagination.tsx

```tsx
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/utils/cn"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

```

# components/ui/popover.tsx

```tsx
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/utils/cn"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }

```

# components/ui/progress.tsx

```tsx
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/utils/cn"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

```

# components/ui/radio-group.tsx

```tsx
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/utils/cn"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

```

# components/ui/scroll-area.tsx

```tsx
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/utils/cn"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

```

# components/ui/select.tsx

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/utils/cn"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

```

# components/ui/separator.tsx

```tsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/utils/cn"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

```

# components/ui/sheet.tsx

```tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/utils/cn"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

```

# components/ui/sidebar.tsx

```tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

```

# components/ui/skeleton.tsx

```tsx
import { cn } from "@/utils/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }

```

# components/ui/switch.tsx

```tsx
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/utils/cn"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

```

# components/ui/table.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
}

```

# components/ui/tabs.tsx

```tsx
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/utils/cn"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

```

# components/ui/textarea.tsx

```tsx
import * as React from "react"

import { cn } from "@/utils/cn"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

```

# components/ui/toast.tsx

```tsx
"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/utils/cn"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

```

# components/ui/toaster.tsx

```tsx
"use client"

import { useToast } from "@/components/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

```

# components/ui/tooltip.tsx

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/utils/cn"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

```

# database.types.ts

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          category: Database["public"]["Enums"]["audit_category"]
          created_at: string | null
          description: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string | null
          severity: Database["public"]["Enums"]["audit_severity"] | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          category: Database["public"]["Enums"]["audit_category"]
          created_at?: string | null
          description: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"] | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          category?: Database["public"]["Enums"]["audit_category"]
          created_at?: string | null
          description?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"] | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          joined_date: string | null
          membership_number: string | null
          organization_id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          joined_date?: string | null
          membership_number?: string | null
          organization_id: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          joined_date?: string | null
          membership_number?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          timezone: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          timezone?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          timezone?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alternative_email: string | null
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_superadmin: boolean | null
          language: string | null
          last_login: string | null
          last_name: string | null
          notification_preferences: Json | null
          phone: string | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          alternative_email?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          first_name?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_superadmin?: boolean | null
          language?: string | null
          last_login?: string | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          alternative_email?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_superadmin?: boolean | null
          language?: string | null
          last_login?: string | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      akeys: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      avals: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      citext:
        | {
            Args: {
              "": boolean
            }
            Returns: string
          }
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      citext_hash: {
        Args: {
          "": string
        }
        Returns: number
      }
      citextin: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      citextout: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      citextrecv: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      citextsend: {
        Args: {
          "": string
        }
        Returns: string
      }
      each: {
        Args: {
          hs: unknown
        }
        Returns: Record<string, unknown>[]
      }
      ghstore_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ghstore_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ghstore_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ghstore_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      ghstore_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore:
        | {
            Args: {
              "": string[]
            }
            Returns: unknown
          }
        | {
            Args: {
              "": Record<string, unknown>
            }
            Returns: unknown
          }
      hstore_hash: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      hstore_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore_recv: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      hstore_subscript_handler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hstore_to_array: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      hstore_to_json: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      hstore_to_json_loose: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      hstore_to_jsonb: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      hstore_to_jsonb_loose: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      hstore_to_matrix: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      hstore_version_diag: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      log_audit_event:
        | {
            Args: {
              p_category: Database["public"]["Enums"]["audit_category"]
              p_action: string
              p_organization_id: string
              p_actor_id: string
              p_description: string
              p_metadata?: Json
              p_severity?: Database["public"]["Enums"]["audit_severity"]
            }
            Returns: string
          }
        | {
            Args: {
              p_category: string
              p_action: string
              p_actor_id: string
              p_description: string
              p_metadata?: Json
              p_severity?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_category: string
              p_action: string
              p_organization_id: string
              p_actor_id: string
              p_description: string
              p_metadata?: Json
              p_severity?: string
            }
            Returns: string
          }
      manage_impersonation: {
        Args: {
          target_user_id: string
          action: string
        }
        Returns: Json
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      skeys: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
      svals: {
        Args: {
          "": unknown
        }
        Returns: string[]
      }
    }
    Enums: {
      audit_category: "auth" | "organization" | "member" | "security" | "system"
      audit_severity: "info" | "notice" | "warning" | "alert" | "critical"
      user_role: "admin" | "staff" | "ministry_leader" | "member" | "visitor"
      visibility_level: "public" | "members_only" | "staff_only" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

```

# hooks/use-mobile.tsx

```tsx
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

```

# hooks/use-toast.ts

```ts
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

```

# lib/actions/impersonation.ts

```ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logImpersonationEvent } from '@/lib/dal/audit'

export async function startImpersonation(targetUserId: string) {
  try {
    const supabase = await createClient(true) // Use admin client
    
    // Get current user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    // Verify superadmin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_superadmin, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_superadmin) {
      throw new Error('Unauthorized - Superadmin access required')
    }

    // Set impersonation metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        impersonating: targetUserId,
        original_user: user.id,
        impersonation_started: Date.now()
      }
    })

    if (updateError) {
      throw updateError
    }

    // Set cookies for client-side access
    const cookieStore = await cookies()
    cookieStore.set('impersonating_user_id', targetUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    cookieStore.set('impersonation_start_time', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    // Log the impersonation event
    await logImpersonationEvent({
      action: 'impersonation_start',
      actorId: user.id,
      actorEmail: profile.email || user.email || '',
      targetId: targetUserId
    })

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/api/auth/impersonation-status')

    return { success: true }
  } catch (error) {
    console.error('Impersonation error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to start impersonation'
    }
  }
}

export async function stopImpersonation() {
  try {
    const supabase = await createClient(true)
    const cookieStore = await cookies()
    const impersonatingId = cookieStore.get('impersonating_user_id')?.value
    
    if (impersonatingId) {
      // Get current user for logging
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single()

        await logImpersonationEvent({
          action: 'impersonation_end',
          actorId: user.id,
          actorEmail: profile?.email || user.email || '',
          targetId: impersonatingId
        })
      }

      // Clear impersonation cookies
      cookieStore.delete('impersonating_user_id')
      cookieStore.delete('impersonation_start_time')
      
      // Clear user metadata
      await supabase.auth.updateUser({
        data: {
          impersonating: null,
          original_user: null,
          impersonation_started: null
        }
      })
    }
    
    redirect('/superadmin')
  } catch (error) {
    console.error('Failed to stop impersonation:', error)
    redirect('/superadmin')
  }
} 
```

# lib/actions/invite.ts

```ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/dal/audit-extended'
import { getCurrentUser } from '@/lib/dal'
import { type Database } from '@/database.types'

export async function inviteUserAction(data: {
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_superadmin: boolean
  organization_id: string
  role: Database['public']['Enums']['user_role']
}) {
  const supabase = await createClient(true)
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  if (!currentUser.email) {
    throw new Error('User email is required')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', currentUser.id)
    .single()

  if (!profile?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }

  const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        is_active: data.is_active,
        is_superadmin: data.is_superadmin,
        organization_id: data.organization_id,
        role: data.role,
        invited_by: currentUser.email
      }
    }
  )

  if (inviteError) throw inviteError

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      is_active: data.is_active,
      is_superadmin: data.is_superadmin
    })

  if (profileError) throw profileError

  const { error: membershipError } = await supabase
    .from('organization_members')
    .insert({
      user_id: authUser.user.id,
      organization_id: data.organization_id,
      role: data.role,
      joined_date: new Date().toISOString()
    })

  if (membershipError) throw membershipError

  await createAuditLog({
    category: 'security',
    action: 'user.invite',
    organizationId: data.organization_id,
    actorId: currentUser.id,
    targetType: 'user',
    targetId: authUser.user.id,
    description: `User ${data.email} was invited`,
    metadata: {
      ...data,
      invited_by: currentUser.email
    },
    severity: 'notice'
  })

  revalidatePath('/superadmin/users')
} 
```

# lib/actions/organization.ts

```ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'

export async function updateOrganizationSettings(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  
  const supabase = await createClient()
  
  // Verify user has permission
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .single()
    
  if (!membership || membership.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }
  
  // Update organization
  const { error } = await supabase
    .from('organizations')
    .update({
      name: formData.get('name'),
      settings: JSON.parse(formData.get('settings') as string)
    })
    .eq('id', formData.get('id'))
    
  if (error) throw error
  
  revalidatePath('/organization')
} 
```

# lib/actions/profile.ts

```ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import { createAuditLog } from '@/lib/dal/audit-extended'

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: 'Unauthorized' }
    
    const supabase = await createClient()
    
    // Get current organization context for audit log
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()
    
    // Prepare profile updates
    const updates = {
      ...Object.fromEntries(
        Object.entries({
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          email: formData.get('email'),
          alternative_email: formData.get('alternative_email'),
          phone: formData.get('phone'),
          language: formData.get('language'),
          theme: formData.get('theme'),
          avatar_url: formData.get('avatar_url'),
          notification_preferences: formData.get('notification_preferences') 
            ? JSON.parse(formData.get('notification_preferences') as string)
            : undefined
        }).filter(([_, value]) => value !== null)
      ),
      updated_at: new Date().toISOString()
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      
    if (error) return { error: error.message }
    
    // Create audit log
    if (membership) {
      await createAuditLog({
        category: 'member',
        action: 'profile.update',
        organizationId: membership.organization_id,
        actorId: user.id,
        targetType: 'profile',
        targetId: user.id,
        description: 'Updated profile information',
        metadata: {
          updatedFields: Object.keys(updates).filter(key => formData.get(key) !== null)
        }
      })
    }
    
    revalidatePath('/settings/profile')
    return {}
  } catch (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to update profile' }
  }
} 
```

# lib/actions/users.ts

```ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/dal/audit-extended'
import { getCurrentUser } from '@/lib/dal'
import { type Database } from '@/database.types'

export async function updateUserAction(userId: string, data: {
  first_name: string
  last_name: string
  email: string
  alternative_email?: string
  phone?: string
  is_active: boolean
  is_superadmin: boolean
  language: string
  theme: string
  role: Database['public']['Enums']['user_role']
  organization_id: string
  notification_preferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
}) {
  const supabase = await createClient(true)
  const currentUser = await getCurrentUser()
  
  if (!currentUser?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }

  // Validate phone format if provided
  if (data.phone && !/^\d{3}-\d{3}-\d{4}$/.test(data.phone)) {
    throw new Error('Invalid phone number format. Use: 123-456-7890')
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      alternative_email: data.alternative_email,
      phone: data.phone || null,
      is_active: data.is_active,
      is_superadmin: data.is_superadmin,
      language: data.language,
      theme: data.theme,
      notification_preferences: data.notification_preferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    
  if (profileError) throw profileError

  // Check if user is already in the organization
  const { data: existingMembership } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', userId)
    .eq('organization_id', data.organization_id)
    .single()

  if (existingMembership) {
    // Update existing membership
    const { error: membershipError } = await supabase
      .from('organization_members')
      .update({
        role: data.role,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('organization_id', data.organization_id)

    if (membershipError) throw membershipError
  } else {
    // Remove from old organization
    await supabase
      .from('organization_members')
      .delete()
      .eq('user_id', userId)

    // Create new organization membership
    const { error: newMembershipError } = await supabase
      .from('organization_members')
      .insert({
        user_id: userId,
        organization_id: data.organization_id,
        role: data.role,
        joined_date: new Date().toISOString()
      })

    if (newMembershipError) throw newMembershipError
  }

  // Create audit log
  await createAuditLog({
    category: 'security',
    action: 'user.update',
    organizationId: data.organization_id,
    actorId: currentUser.id,
    targetType: 'user',
    targetId: userId,
    description: `User ${data.email} was updated`,
    metadata: data,
    severity: 'notice'
  })

  revalidatePath('/superadmin/users')
  revalidatePath(`/superadmin/users/${userId}`)
}

export async function deleteUserAction(userId: string) {
  const supabase = await createClient(true)
  const currentUser = await getCurrentUser()
  
  if (!currentUser?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }

  // Get user info for audit log
  const { data: user } = await supabase
    .from('profiles')
    .select(`
      email,
      organization_members (
        organization_id
      )
    `)
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date().toISOString()

  // Soft delete in correct order
  // 1. Soft delete organization memberships
  const { error: membershipError } = await supabase
    .from('organization_members')
    .update({ 
      deleted_at: now
    })
    .eq('user_id', userId)
    
  if (membershipError) throw membershipError

  // 2. Soft delete profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      deleted_at: now,
      is_active: false 
    })
    .eq('id', userId)
    
  if (profileError) throw profileError

  // 3. Ban the auth user using a valid duration format (100 years)
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { 
      ban_duration: '876000h' // 100 years in hours
    }
  )
  
  if (authError) throw authError

  // Create audit log
  await createAuditLog({
    category: 'security',
    action: 'user.delete',
    organizationId: user.organization_members?.[0]?.organization_id || 'system',
    actorId: currentUser.id,
    targetType: 'user',
    targetId: userId,
    description: `User ${user.email} was deleted`,
    metadata: {
      deleted_by: currentUser.email,
      deleted_user: user.email,
      deleted_at: now
    },
    severity: 'alert'
  })

  revalidatePath('/superadmin/users')
}

export async function createUserAction(data: {
  email: string
  full_name: string
  is_active: boolean
  is_superadmin: boolean
}) {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()
  
  // First create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name
    }
  })
  
  if (authError) throw authError
  
  // Then create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      full_name: data.full_name,
      email: data.email,
      is_active: data.is_active,
      is_superadmin: data.is_superadmin
    })
    
  if (profileError) throw profileError

  // Create audit log
  await createAuditLog({
    category: 'security',
    action: 'user.create',
    organizationId: 'system',
    actorId: currentUser?.id || 'system',
    targetType: 'user',
    targetId: authUser.user.id,
    description: `New user ${data.email} was created`,
    metadata: data,
    severity: 'notice'
  })

  revalidatePath('/superadmin/users')
}

export async function inviteUserAction(data: {
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_superadmin: boolean
  organization_id: string
  role: Database['public']['Enums']['user_role']
}) {
  const supabase = await createClient(true)
  const currentUser = await getCurrentUser()
  
  if (!currentUser?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-8)
  const full_name = `${data.first_name} ${data.last_name}`.trim()

  // Send invitation using Supabase's built-in invite function
  const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: {
        invited_by: currentUser.email,
        temp_password: tempPassword,
        first_name: data.first_name,
        last_name: data.last_name,
        full_name,
        is_active: data.is_active,
        is_superadmin: data.is_superadmin,
        organization_id: data.organization_id,
        role: data.role
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  )

  if (inviteError) throw inviteError

  // Create profile after successful invite
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name,
      is_active: data.is_active,
      is_superadmin: data.is_superadmin
    })
    
  if (profileError) throw profileError

  // Create organization membership
  const { error: membershipError } = await supabase
    .from('organization_members')
    .insert({
      user_id: authUser.user.id,
      organization_id: data.organization_id,
      role: data.role,
      joined_date: new Date().toISOString()
    })

  if (membershipError) throw membershipError

  // Create audit log
  await createAuditLog({
    category: 'security',
    action: 'user.invite',
    organizationId: data.organization_id,
    actorId: currentUser.id,
    targetType: 'user',
    targetId: authUser.user.id,
    description: `User ${data.email} was invited`,
    metadata: {
      ...data,
      invited_by: currentUser.email
    },
    severity: 'notice'
  })

  revalidatePath('/superadmin/users')
}  
```

# lib/auth/redirects.ts

```ts
export const getRedirectPath = async (profile: any, isAuthenticated: boolean) => {
  if (!isAuthenticated) {
    return '/sign-in'
  }
  
  if (profile?.is_superadmin) {
    return '/superadmin/dashboard'
  }
  
  return '/dashboard'
}

export const getErrorRedirect = (error: string, returnTo?: string) => {
  const base = returnTo ? `/error?returnTo=${returnTo}` : '/error'
  return `${base}?message=${encodeURIComponent(error)}`
} 
```

# lib/dal/attendance.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getAttendanceRecords = cache(async (options: {
  organizationId: string
  eventId?: string
  ministryId?: string
  startDate?: Date
  endDate?: Date
}) => {
  const supabase = await createClient()
  let query = supabase
    .from('attendance_records')
    .select(`
      *,
      event:event_id (*),
      ministry:ministry_id (*),
      attendee:attendee_id (*)
    `)
    .eq('organization_id', options.organizationId)
    
  if (options.eventId) {
    query = query.eq('event_id', options.eventId)
  }
  
  if (options.ministryId) {
    query = query.eq('ministry_id', options.ministryId)
  }
  
  if (options.startDate) {
    query = query.gte('check_in_time', options.startDate.toISOString())
  }
  
  if (options.endDate) {
    query = query.lte('check_in_time', options.endDate.toISOString())
  }
  
  const { data, error } = await query
  if (error) return null
  return data
}) 
```

# lib/dal/audit-extended.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const createAuditLog = async (data: {
  category: 'auth' | 'organization' | 'member' | 'security' | 'system'
  action: string
  organizationId: string
  actorId: string
  targetType?: string
  targetId?: string
  description: string
  metadata?: Record<string, any>
  severity?: 'info' | 'notice' | 'warning' | 'alert' | 'critical'
}) => {
  const supabase = await createClient()
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      ...data,
      severity: data.severity || 'info'
    })
    
  return !error
}

export const getAuditLogsByTarget = cache(async (targetType: string, targetId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false })
    
  if (error) return null
  return data
}) 
```

# lib/dal/audit.ts

```ts
import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/database.types'

// System-wide organization ID for events not tied to a specific org
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000'

type AuditEvent = {
  action: 'impersonation_start' | 'impersonation_end'
  actorId: string
  actorEmail: string
  targetId: string
  organizationId?: string
}

export async function logImpersonationEvent(data: AuditEvent) {
  const supabase = await createClient(true)

  const { error } = await supabase.rpc('log_audit_event', {
    p_category: 'auth',
    p_action: data.action,
    p_organization_id: data.organizationId || SYSTEM_ORG_ID,
    p_actor_id: data.actorId,
    p_description: `Superadmin ${data.actorEmail} ${
      data.action === 'impersonation_start' ? 'started' : 'stopped'
    } impersonating user ${data.targetId}`,
    p_severity: 'notice',
    p_metadata: {
      actor_email: data.actorEmail,
      target_id: data.targetId
    }
  } satisfies Database['public']['Functions']['log_audit_event']['Args'])

  if (error) {
    console.error('Failed to log audit event:', error)
  }

  return !error
} 
```

# lib/dal/auth.ts

```ts
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'

export const getProfileById = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error) return null
  return profile as Profile
})

export const getImpersonatedUser = cache(async (userId: string) => {
  const profile = await getProfileById(userId)
  if (!profile) return null
  
  return {
    ...profile,
    impersonated: true
  } as Profile
})

export const verifyImpersonationPermissions = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', userId)
    .single()
    
  if (error || !profile?.is_superadmin) return false
  return true
})

export const getCurrentUser = cache(async () => {
  const headersList = await headers()
  const impersonatingId = headersList.get('x-impersonating-id')
  
  // Handle impersonation
  if (impersonatingId) {
    return getImpersonatedUser(impersonatingId)
  }
  
  // Get authenticated user
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  
  // Get profile data
  const profile = await getProfileById(user.id)
  if (!profile) return null
  
  return {
    ...user,
    ...profile
  } as Profile
})

export const getRealUser = cache(async () => {
  const headersList = await headers()
  const realUserId = headersList.get('x-real-user-id')
  
  if (!realUserId) return null
  return getProfileById(realUserId)
})

export const logImpersonationEvent = async (data: {
  action: 'impersonation_start' | 'impersonation_end'
  actorId: string
  actorEmail: string
  targetId: string
}) => {
  const supabase = await createClient()
  const { error } = await supabase.from('audit_logs').insert({
    category: 'auth',
    action: data.action,
    actor_id: data.actorId,
    target_id: data.targetId,
    description: `Superadmin ${data.actorEmail} ${data.action === 'impersonation_start' ? 'started' : 'stopped'} impersonating user ${data.targetId}`,
    severity: 'notice'
  })
  
  return !error
}

export async function startImpersonation(targetUserId: string) {
  const supabase = await createClient(true) // Use admin client
  
  console.log('Starting impersonation process:', { targetUserId })
  
  // Get current user for logging
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No authenticated user found')
    throw new Error('Authentication required')
  }
  
  // Call RPC function to start impersonation
  console.log('Calling manage_impersonation RPC:', { 
    action: 'start',
    targetUserId,
    currentUser: user.id 
  })
  
  const { data, error } = await supabase.rpc('manage_impersonation', {
    target_user_id: targetUserId,
    action: 'start'
  })
  
  if (error) {
    console.error('Failed to start impersonation:', error)
    throw error
  }
  
  console.log('Impersonation metadata set:', data)
  
  // Refresh session to get new metadata
  console.log('Refreshing session...')
  const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession()
  
  if (sessionError) {
    console.error('Failed to refresh session:', sessionError)
    throw sessionError
  }
  
  console.log('Session refreshed with new metadata:', {
    impersonation: sessionData.session?.user.app_metadata.impersonation
  })
  
  // Log impersonation event
  await logImpersonationEvent({
    action: 'impersonation_start',
    actorId: user.id,
    actorEmail: user.email || '',
    targetId: targetUserId
  })
  
  console.log('Impersonation started successfully')
  
  return data
}

export async function stopImpersonation() {
  const supabase = await createClient(true)
  
  console.log('Stopping impersonation...')
  
  // Get current impersonation state before stopping
  const { data: { session } } = await supabase.auth.getSession()
  const impersonationData = session?.user?.app_metadata?.impersonation
  
  if (!impersonationData) {
    console.log('No active impersonation found')
    return
  }
  
  console.log('Current impersonation state:', impersonationData)
  
  // Call RPC function to stop impersonation
  console.log('Calling manage_impersonation RPC:', { action: 'stop' })
  
  const { error } = await supabase.rpc('manage_impersonation', {
    action: 'stop'
  })
  
  if (error) {
    console.error('Failed to stop impersonation:', error)
    throw error
  }
  
  // Refresh session to clear metadata
  console.log('Refreshing session...')
  const { error: sessionError } = await supabase.auth.refreshSession()
  
  if (sessionError) {
    console.error('Failed to refresh session:', sessionError)
    throw sessionError
  }
  
  // Log end of impersonation
  await logImpersonationEvent({
    action: 'impersonation_end',
    actorId: session.user.id,
    actorEmail: session.user.email || '',
    targetId: impersonationData.impersonating
  })
  
  console.log('Impersonation stopped successfully')
} 
```

# lib/dal/communications.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getMessages = cache(async (options: {
  organizationId: string
  type?: 'email' | 'sms' | 'notification'
  status?: 'draft' | 'scheduled' | 'sent' | 'failed'
  limit?: number
  offset?: number
}) => {
  const supabase = await createClient()
  let query = supabase
    .from('communications')
    .select(`
      *,
      sender:sender_id (*),
      recipients:communication_recipients (
        *,
        recipient:recipient_id (*)
      )
    `)
    .eq('organization_id', options.organizationId)
    .order('created_at', { ascending: false })
    
  if (options.type) {
    query = query.eq('type', options.type)
  }
  
  if (options.status) {
    query = query.eq('status', options.status)
  }
  
  if (options.limit) {
    query = query.limit(options.limit)
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  if (error) return null
  return data
}) 
```

# lib/dal/events.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getEvents = cache(async (options: {
  organizationId: string
  startDate?: Date
  endDate?: Date
  visibility?: 'public' | 'members_only' | 'staff_only' | 'private'
}) => {
  const supabase = await createClient()
  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:organizer_id (id, email, full_name),
      location:location_id (*)
    `)
    .eq('organization_id', options.organizationId)
    
  if (options.startDate) {
    query = query.gte('start_date', options.startDate.toISOString())
  }
  
  if (options.endDate) {
    query = query.lte('end_date', options.endDate.toISOString())
  }
  
  if (options.visibility) {
    query = query.eq('visibility_level', options.visibility)
  }
  
  const { data, error } = await query
  if (error) return null
  return data
}) 
```

# lib/dal/families.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getFamilyMembers = cache(async (familyId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      *,
      profiles (*),
      relationships (*)
    `)
    .eq('family_id', familyId)
    
  if (error) return null
  return data
})

export const getUserFamilies = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      *,
      families (*)
    `)
    .eq('user_id', user.id)
    
  if (error) return null
  return data
}) 
```

# lib/dal/impersonation.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'

export const getImpersonatedUser = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    .then(result => ({
      ...result,
      next: { 
        tags: [
          `profile-${userId}`, 
          'profile',
          'impersonation'
        ] 
      }
    }))
    
  if (error) return null
  return {
    ...data,
    impersonated: true
  } as Profile
})

export const verifyImpersonationPermissions = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', userId)
    .single()
    
  if (error || !profile?.is_superadmin) return false
  return true
})

export const logImpersonationEvent = async (data: {
  action: 'impersonation_start' | 'impersonation_end'
  actorId: string
  actorEmail: string
  targetId: string
}) => {
  const supabase = await createClient()
  const { error } = await supabase.from('audit_logs').insert({
    category: 'auth',
    action: data.action,
    actor_id: data.actorId,
    target_id: data.targetId,
    description: `Superadmin ${data.actorEmail} ${data.action === 'impersonation_start' ? 'started' : 'stopped'} impersonating user ${data.targetId}`,
    severity: 'notice'
  })
  
  return !error
} 
```

# lib/dal/index.ts

```ts
import 'server-only'
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { type Database } from '@/database.types'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, is_superadmin')
    .eq('id', user.id)
    .single()
    .then(result => ({
      ...result,
      next: { tags: [`user-${user.id}`, 'user'] }
    }))
    
  if (!profile) return null
  
  return {
    ...user,
    email: profile.email,
    is_superadmin: profile.is_superadmin
  }
})

export const getUserProfile = cache(async (userId?: string) => {
  if (!userId) {
    // If no userId provided, fall back to current user
    const user = await getCurrentUser()
    if (!user) return null
    userId = user.id
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    .then(result => ({
      ...result,
      next: { tags: [`profile-${userId}`, 'profile'] }
    }))
    
  if (error) return null
  return data
})

export const getOrganizationMembership = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      organizations (*)
    `)
    .eq('user_id', user.id)
    .single()
    .then(result => ({
      ...result,
      next: { 
        tags: [
          `org-member-${user.id}`, 
          'organization-member',
          `organization-${result.data?.organizations?.id}`
        ] 
      }
    }))
    
  if (error) return null
  return data
})

// Re-export all DAL functions for convenient imports
export * from './auth'
export * from './organizations'
export * from './profiles'
export * from './audit'
export * from './events'
export * from './ministries'
export * from './attendance'
export * from './communications' 
```

# lib/dal/ministries.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getMinistries = cache(async (organizationId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ministries')
    .select(`
      *,
      leader:leader_id (id, email, full_name),
      ministry_members (
        *,
        profiles (*)
      )
    `)
    .eq('organization_id', organizationId)
    
  if (error) return null
  return data
})

export const getUserMinistries = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ministry_members')
    .select(`
      *,
      ministries (
        *,
        leader:leader_id (*)
      )
    `)
    .eq('user_id', user.id)
    
  if (error) return null
  return data
}) 
```

# lib/dal/organizations.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { OrganizationMember } from '@/lib/types/auth'
import { getCurrentUser } from './auth'

export const getOrganizationMembership = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      organizations (*)
    `)
    .eq('user_id', user.id)
    .single()
    
  if (error) return null
  return data as OrganizationMember
})

export const getAllOrganizations = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name')
    
  if (error) return null
  return data
})

export const getOrganizationMembers = cache(async (organizationId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles (*)
    `)
    .eq('organization_id', organizationId)
    
  if (error) return null
  return data
})

export const getOrganizationStats = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  
  // Get organization membership first
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
    
  if (!membership) return null
  
  // Get various stats in parallel
  const [members, ministries, events, attendance] = await Promise.all([
    supabase
      .from('organization_members')
      .select('count', { count: 'exact' })
      .eq('organization_id', membership.organization_id),
      
    supabase
      .from('ministries')
      .select('count', { count: 'exact' })
      .eq('organization_id', membership.organization_id),
      
    supabase
      .from('events')
      .select('count', { count: 'exact' })
      .eq('organization_id', membership.organization_id),
      
    supabase
      .from('attendance_records')
      .select('count', { count: 'exact' })
      .eq('organization_id', membership.organization_id)
  ])
  
  return {
    totalMembers: members.count || 0,
    totalMinistries: ministries.count || 0,
    totalEvents: events.count || 0,
    totalAttendance: attendance.count || 0
  }
}) 
```

# lib/dal/prayer-requests.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getPrayerRequests = cache(async (options: {
  organizationId: string
  visibility?: 'public' | 'members_only' | 'staff_only' | 'private'
  limit?: number
  offset?: number
}) => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  let query = supabase
    .from('prayer_requests')
    .select(`
      *,
      profiles:author_id (*)
    `)
    .eq('organization_id', options.organizationId)
    .order('created_at', { ascending: false })
    
  if (options.visibility) {
    query = query.eq('visibility_level', options.visibility)
  }
  
  if (options.limit) {
    query = query.limit(options.limit)
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  if (error) return null
  return data
}) 
```

# lib/dal/profiles.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'
import { getCurrentUser } from './auth'

export const getUserProfile = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (error) return null
  return data as Profile
})

export const getProfilesByRole = cache(async (role: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    
  if (error) return null
  return data as Profile[]
}) 
```

# lib/dal/relationships.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getFamilyRelationships = cache(async (familyId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('family_relationships')
    .select(`
      *,
      person_one:person_one_id (*),
      person_two:person_two_id (*),
      relationship_type (*)
    `)
    .eq('family_id', familyId)
    
  if (error) return null
  return data
})

export const getPersonRelationships = cache(async (personId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('family_relationships')
    .select(`
      *,
      person_one:person_one_id (*),
      person_two:person_two_id (*),
      relationship_type (*)
    `)
    .or(`person_one_id.eq.${personId},person_two_id.eq.${personId}`)
    
  if (error) return null
  return data
}) 
```

# lib/dal/settings.ts

```ts
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getOrganizationSettings = cache(async (organizationId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', organizationId)
    .single()
    
  if (error) return null
  return data?.settings
})

export const getFeatureFlags = cache(async (organizationId: string) => {
  const settings = await getOrganizationSettings(organizationId)
  return settings?.features_enabled || {}
}) 
```

# lib/hooks/use-impersonation.ts

```ts
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useImpersonationStatus() {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null)
  const supabase = useRef(createClient())

  const checkImpersonationStatus = useCallback(async () => {
    try {
      // Use a server action or API route to check impersonation status
      const response = await fetch('/api/auth/impersonation-status')
      const { isImpersonating, userId } = await response.json()
      
      setIsImpersonating(isImpersonating)
      setImpersonatedUserId(userId)
    } catch (error) {
      console.error('Failed to check impersonation status:', error)
      setIsImpersonating(false)
      setImpersonatedUserId(null)
    }
  }, [])

  useEffect(() => {
    // Check initial status
    checkImpersonationStatus()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.current.auth.onAuthStateChange(() => {
      checkImpersonationStatus()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkImpersonationStatus])

  return {
    isImpersonating,
    impersonatedUserId,
    refresh: checkImpersonationStatus
  }
} 
```

# lib/services/invite.ts

```ts
import { type SupabaseClient } from '@supabase/supabase-js'
import { createAuditLog } from '@/lib/dal/audit-extended'

export async function verifyInviterPermissions(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', userId)
    .single()

  if (!profile?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }
}

export async function createAuthUser(supabase: SupabaseClient, data: {
  email: string
  full_name: string
  first_name: string
  last_name: string
  tempPassword: string
}) {
  const { data: authUser, error } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      first_name: data.first_name,
      last_name: data.last_name
    }
  })
  
  if (error) throw error
  return authUser
}

export async function createUserProfile(supabase: SupabaseClient, data: {
  userId: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  is_active: boolean
  is_superadmin: boolean
}) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: data.userId,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.full_name,
      is_active: data.is_active,
      is_superadmin: data.is_superadmin
    })
    
  if (error) throw error
}

export async function createOrganizationMembership(supabase: SupabaseClient, data: {
  userId: string
  organizationId: string
  role: string
}) {
  const { error } = await supabase
    .from('organization_members')
    .insert({
      user_id: data.userId,
      organization_id: data.organizationId,
      role: data.role,
      joined_date: new Date().toISOString()
    })

  if (error) throw error
}

export async function sendInviteEmail(supabase: SupabaseClient, data: {
  email: string
  invitedBy: string
  tempPassword: string
}) {
  const { error } = await supabase.auth.admin.inviteUserByEmail(data.email, {
    data: {
      invited_by: data.invitedBy,
      temp_password: data.tempPassword
    }
  })

  if (error) throw error
}

export async function createInviteAuditLog(
  currentUser: { id: string, email?: string },
  targetUserId: string,
  data: {
    email: string
    first_name: string
    last_name: string
    organization_id: string
    role: string
  }
) {
  await createAuditLog({
    category: 'security',
    action: 'user.invite',
    organizationId: data.organization_id,
    actorId: currentUser.id,
    targetType: 'user',
    targetId: targetUserId,
    description: `User ${data.email} was invited`,
    metadata: {
      ...data,
      invited_by: currentUser.email || 'unknown'
    },
    severity: 'notice'
  })
}
```

# lib/types/auth.ts

```ts
export type UserRole = 'superadmin' | 'admin' | 'staff' | 'ministry_leader' | 'member' | 'visitor'

export interface Profile {
  id: string
  email?: string
  full_name?: string
  first_name?: string
  last_name?: string
  avatar_url?: string | null
  is_superadmin?: boolean
  impersonated?: boolean
  alternative_email?: string | null
  phone?: string | null
  language?: string
  theme?: string
  notification_preferences?: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

export interface OrganizationMember {
  id: string
  user_id: string
  role: 'admin' | 'staff' | 'member'
  organizations: {
    id: string
    name: string
    slug: string
  }
}

export interface Organization {
  id: string
  name: string
  slug: string
  settings: Record<string, any>
}

export interface ImpersonationStatus {
  isImpersonating: boolean
  impersonatedUserId: string | null
}

export interface ImpersonationError {
  error: string
} 
```

# lib/utils.ts

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Return empty string if no numbers
  if (!cleaned) return ''
  
  // Format the number
  if (cleaned.length >= 10) {
    const areaCode = cleaned.slice(-10, -7)
    const firstPart = cleaned.slice(-7, -4)
    const lastPart = cleaned.slice(-4)
    
    return `${areaCode}-${firstPart}-${lastPart}`
  }
  
  return phone // Return original if not enough digits
}

// Add any other utility functions you need here 
```

# lib/utils/user.ts

```ts
export function generateTempPassword() {
  return Math.random().toString(36).slice(-8)
}

export function generateFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim()
}
```

# middleware/auth.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getRedirectPath } from '@/lib/auth/redirects'
import { getUserProfile } from '@/lib/dal'

export async function authMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // Define public paths
  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback']
  const isPublicPath = publicPaths.some(path => url.pathname.startsWith(path))

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (user && isPublicPath) {
    const profile = await getUserProfile(user.id)
    const redirectPath = await getRedirectPath(profile, true)
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return NextResponse.next()
} 
```

# middleware/event.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function eventAccessMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get event ID from URL (/events/[id]/...)
  const eventId = request.nextUrl.pathname.split('/')[2]

  // Get event visibility and organization
  const { data: event } = await supabase
    .from('events')
    .select(`
      visibility_level,
      organization_id,
      organizer_id
    `)
    .eq('id', eventId)
    .single()

  if (!event) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Public events are accessible to all
  if (event.visibility_level === 'public') {
    return NextResponse.next()
  }

  // All other visibility levels require authentication
  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Check user's role in the organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', event.organization_id)
    .single()

  // Handle different visibility levels
  switch (event.visibility_level) {
    case 'members_only':
      if (!membership) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      break
    case 'staff_only':
      if (!membership || !['admin', 'staff'].includes(membership.role)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      break
    case 'private':
      if (membership?.role !== 'admin' && event.organizer_id !== user.id) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      break
  }

  return NextResponse.next()
} 
```

# middleware/family.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function familyMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Get family ID from URL (/families/[id]/...)
  const familyId = request.nextUrl.pathname.split('/')[2]

  // Check if user is a member of this family or has admin/staff access
  const { data: membership } = await supabase
    .from('family_members')
    .select(`
      *,
      families!inner (*),
      organization_members!inner (role)
    `)
    .eq('user_id', user.id)
    .eq('families.id', familyId)
    .single()

  if (!membership && !['admin', 'staff'].includes(membership?.organization_members?.role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
} 
```

# middleware/feature-flags.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function featureFlagMiddleware(
  request: NextRequest,
  supabase: SupabaseClient,
  requiredFeature: string
) {
  const orgSlug = request.nextUrl.pathname.split('/')[2]

  // Get organization settings
  const { data: org } = await supabase
    .from('organizations')
    .select('settings')
    .eq('slug', orgSlug)
    .single()

  if (!org?.settings?.features_enabled?.[requiredFeature]) {
    return NextResponse.redirect(new URL(`/org/${orgSlug}`, request.url))
  }

  return NextResponse.next()
} 
```

# middleware/impersonation.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function impersonationMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  // Get impersonation cookie
  const impersonatingId = request.cookies.get('impersonating_user_id')?.value
  
  if (impersonatingId) {
    // Verify the actual user is a superadmin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Clear invalid impersonation
      const response = NextResponse.redirect(new URL('/auth/signin', request.url))
      response.cookies.delete('impersonating_user_id')
      return response
    }

    // Verify superadmin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_superadmin) {
      // Clear unauthorized impersonation
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('impersonating_user_id')
      return response
    }

    // Add impersonation context to headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-impersonating-id', impersonatingId)
    requestHeaders.set('x-real-user-id', user.id)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
} 
```

# middleware/index.ts

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserProfile } from '@/lib/dal'
import { impersonationMiddleware } from './impersonation'
import { superadminMiddleware } from './superadmin'
import { startImpersonation, stopImpersonation } from '@/lib/dal/auth'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Create supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // Define public paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password']
  const isPublicPath = publicPaths.includes(url.pathname)

  if (!user && !isPublicPath) {
    // Redirect unauthenticated users to sign-in
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (user && isPublicPath) {
    // Redirect authenticated users away from auth pages
    const profile = await getUserProfile(user.id)
    const redirectUrl = profile?.is_superadmin ? '/superadmin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Run impersonation middleware first
  const impersonationResponse = await impersonationMiddleware(request, supabase)
  if (impersonationResponse.status !== 200) {
    return impersonationResponse
  }

  // Handle superadmin routes
  if (request.nextUrl.pathname.startsWith('/superadmin')) {
    return superadminMiddleware(request, supabase)
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    const impersonationData = session.user.app_metadata?.impersonation
    
    if (impersonationData) {
      console.log('Found impersonation metadata:', impersonationData)
      
      // Verify impersonation hasn't expired
      const startedAt = impersonationData.started_at * 1000
      const MAX_DURATION = 60 * 60 * 1000 // 1 hour
      
      console.log('Checking impersonation expiration:', {
        startedAt: new Date(startedAt),
        now: new Date(),
        timeRemaining: MAX_DURATION - (Date.now() - startedAt)
      })
      
      if (Date.now() - startedAt > MAX_DURATION) {
        console.log('Impersonation expired, stopping...')
        await stopImpersonation()
        return response
      }
      
      // Add context to request
      request.headers.set('x-real-user-id', impersonationData.original_user)
      request.headers.set('x-impersonating-id', impersonationData.impersonating)
      
      console.log('Added impersonation headers:', {
        realUserId: impersonationData.original_user,
        impersonatingId: impersonationData.impersonating
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Add all paths that need protection
    '/superadmin/:path*',
    '/dashboard/:path*',
    '/org/:path*',
    '/families/:path*',
    '/ministries/:path*',
    '/account/:path*',
    '/auth/:path*',
    '/',
    // Exclude static files and API routes
    '/((?!api|_next/static|_next/image|favicon|.*\\.).*)'
  ]
} 
```

# middleware/ministry-leader.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function ministryLeaderMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Get ministry ID from URL (/ministries/[id]/...)
  const ministryId = request.nextUrl.pathname.split('/')[2]

  // Check if user is a leader of this ministry or has admin access
  const { data: ministry } = await supabase
    .from('ministries')
    .select(`
      *,
      organization_members!inner (role)
    `)
    .eq('leader_id', user.id)
    .eq('id', ministryId)
    .single()

  if (!ministry && ministry?.organization_members?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
} 
```

# middleware/organization.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function organizationMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Get organization slug from URL (/org/[slug]/...)
  const orgSlug = request.nextUrl.pathname.split('/')[2]

  // Check if user has access to this organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations!inner (slug)
    `)
    .eq('user_id', user.id)
    .eq('organizations.slug', orgSlug)
    .single()

  if (!membership) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Add organization context to headers for downstream use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-organization-role', membership.role)
  requestHeaders.set('x-organization-slug', orgSlug)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
} 
```

# middleware/staff.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function staffMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Get organization context
  const orgSlug = request.nextUrl.pathname.split('/')[2]

  // Check if user is staff or admin in this organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organizations.slug', orgSlug)
    .in('role', ['admin', 'staff'])
    .single()

  if (!membership) {
    return NextResponse.redirect(new URL(`/org/${orgSlug}`, request.url))
  }

  return NextResponse.next()
} 
```

# middleware/superadmin.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function superadminMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Check if user is superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
} 
```

# middleware/visibility.ts

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function visibilityMiddleware(
  request: NextRequest,
  supabase: SupabaseClient,
  requiredLevel: 'public' | 'members_only' | 'staff_only' | 'private'
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public content is always accessible
  if (requiredLevel === 'public') {
    return NextResponse.next()
  }

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  const orgSlug = request.nextUrl.pathname.split('/')[2]

  // Check user's role in the organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organizations.slug', orgSlug)
    .single()

  if (!membership) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Handle different visibility levels
  switch (requiredLevel) {
    case 'members_only':
      return NextResponse.next()
    case 'staff_only':
      if (!['admin', 'staff'].includes(membership.role)) {
        return NextResponse.redirect(new URL(`/org/${orgSlug}`, request.url))
      }
      break
    case 'private':
      if (membership.role !== 'admin') {
        return NextResponse.redirect(new URL(`/org/${orgSlug}`, request.url))
      }
      break
  }

  return NextResponse.next()
} 
```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.

```

# next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/superadmin/dashboard',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
      {
        source: '/signout',
        destination: '/sign-in',
        permanent: true,
      },
      // Add any other static redirects
    ]
  }
}

module.exports = nextConfig;

```

# package.json

```json
{
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:types": "npx supabase gen types typescript --project-id 'dqgpxvpvlggvzxryoozc' --schema public > database.types.ts"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-navigation-menu": "^1.2.1",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.1",
    "@radix-ui/react-scroll-area": "^1.2.1",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "autoprefixer": "10.4.20",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "geist": "^1.2.1",
    "lucide-react": "^0.456.0",
    "next": "latest",
    "next-themes": "^0.4.3",
    "prettier": "^3.3.3",
    "rate-limit": "^0.1.1",
    "react": "18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "18.3.1",
    "react-hook-form": "^7.53.2",
    "vaul": "^1.1.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "18.3.1",
    "postcss": "8.4.49",
    "supabase": "^1.226.3",
    "tailwind-merge": "^2.5.2",
    "tailwindcss": "3.4.14",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "5.6.3"
  }
}

```

# postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```

# README.md

```md
<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>

## Features

- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   \`\`\`bash
   npx create-next-app -e with-supabase
   \`\`\`

3. Use `cd` to change into the app's directory

   \`\`\`bash
   cd name-of-new-app
   \`\`\`

4. Rename `.env.example` to `.env.local` and update the following:

   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   \`\`\`

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://app.supabase.com/project/_/settings/api)

5. You can now run the Next.js local development server:

   \`\`\`bash
   npm run dev
   \`\`\`

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
# tinychurch-admin-app

```

# supabase/.branches/_current_branch

```
main
```

# supabase/.gitignore

```
# Supabase
.branches
.temp
.env

```

# supabase/.temp/cli-latest

```
v1.226.3
```

# supabase/.temp/gotrue-version

```
v2.164.0
```

# supabase/.temp/pooler-url

```
postgresql://postgres.dqgpxvpvlggvzxryoozc:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

# supabase/.temp/postgres-version

```
15.6.1.143
```

# supabase/.temp/project-ref

```
dqgpxvpvlggvzxryoozc
```

# supabase/.temp/rest-version

```
v12.2.3
```

# supabase/.temp/storage-version

```
v1.13.0
```

# supabase/config.toml

```toml
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "tinychurch-admin-app"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` is always included.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request. `public` is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
enabled = false

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 15

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory. For example:
# sql_paths = ['./seeds/*.sql', '../project-src/seeds/*-load-testing.sql']
sql_paths = ['./seed.sql']

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[storage.image_transformation]
enabled = true

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://localhost:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["http://localhost:3000/auth/callback"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
[auth.email.template.invite]
subject = "You've Been Invited to Join"
content_path = "./templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control use of MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = true
verify_enabled = true

# Configure Multi-factor-authentication via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Configure Multi-factor-authentication via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

[edge_runtime]
enabled = true
# Configure one of the supported request policies: `oneshot`, `per_worker`.
# Use `oneshot` for hot reload, or `per_worker` for load testing.
policy = "oneshot"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083

# Use these configurations to customize your Edge Function.
# [functions.MY_FUNCTION_NAME]
# enabled = true
# verify_jwt = true
# import_map = "./functions/MY_FUNCTION_NAME/deno.json"
# Uncomment to specify a custom file path to the entrypoint.
# Supported file extensions are: .ts, .js, .mjs, .jsx, .tsx
# entrypoint = "./functions/MY_FUNCTION_NAME/index.ts"

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"

```

# supabase/migrations/20240312000000_impersonation.sql

```sql
-- Function to manage impersonation state
create or replace function manage_impersonation(
  target_user_id uuid,
  action text
) returns json as $$
declare
  current_user_id uuid;
  result json;
begin
  -- Get current user ID
  current_user_id := auth.uid();
  
  raise notice 'Managing impersonation: action=%, user=%, target=%', 
    action, current_user_id, target_user_id;
  
  -- Verify superadmin status
  if not exists (
    select 1 from profiles 
    where id = current_user_id 
    and is_superadmin = true
  ) then
    raise notice 'Unauthorized impersonation attempt by user %', current_user_id;
    raise exception 'Unauthorized: Superadmin required';
  end if;

  if action = 'start' then
    raise notice 'Starting impersonation: user % impersonating %',
      current_user_id, target_user_id;
      
    -- Start impersonation
    update auth.users
    set raw_app_meta_data = jsonb_set(
      coalesce(raw_app_meta_data, '{}'::jsonb),
      '{impersonation}',
      jsonb_build_object(
        'impersonating', target_user_id,
        'original_user', current_user_id,
        'started_at', extract(epoch from now())
      )::jsonb
    )
    where id = current_user_id
    returning raw_app_meta_data into result;
    
    raise notice 'Impersonation started: %', result;
  elsif action = 'stop' then
    raise notice 'Stopping impersonation for user %', current_user_id;
    
    -- Stop impersonation
    update auth.users
    set raw_app_meta_data = raw_app_meta_data - 'impersonation'
    where id = current_user_id
    returning raw_app_meta_data into result;
    
    raise notice 'Impersonation stopped: %', result;
  end if;

  return result;
end;
$$ language plpgsql security definer; 
```

# supabase/migrations/20240312000001_audit_logging.sql

```sql
-- Create audit_logs table if it doesn't exist
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  category text not null,
  action text not null,
  organization_id uuid references organizations(id),
  actor_id uuid references auth.users(id),
  description text,
  metadata jsonb default '{}'::jsonb,
  severity text default 'info'
);

-- Create function to log audit events
create or replace function log_audit_event(
  p_category text,
  p_action text,
  p_organization_id uuid,
  p_actor_id uuid,
  p_description text,
  p_metadata jsonb default null,
  p_severity text default 'info'
) returns uuid as $$
declare
  v_log_id uuid;
begin
  -- For system-wide events (like impersonation), use the system org ID
  if p_organization_id is null then
    p_organization_id := '00000000-0000-0000-0000-000000000000'::uuid;
  end if;

  insert into audit_logs (
    category,
    action,
    organization_id,
    actor_id,
    description,
    metadata,
    severity
  ) values (
    p_category,
    p_action,
    p_organization_id,
    p_actor_id,
    p_description,
    coalesce(p_metadata, '{}'::jsonb),
    p_severity
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$ language plpgsql security definer;

-- Create indexes for faster queries
create index if not exists audit_logs_category_action_idx 
  on audit_logs(category, action);

create index if not exists audit_logs_actor_id_idx 
  on audit_logs(actor_id);

create index if not exists audit_logs_organization_id_idx 
  on audit_logs(organization_id); 
```

# supabase/templates/invite.html

```html
<h2>Welcome to {{ .SiteURL }}</h2>

<p>You have been invited by {{ .Data.invited_by }} to join the organization.</p>

<p>Your temporary password is: {{ .Data.temp_password }}</p>

<p>Click the button below to accept the invitation:</p>

<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite&redirect_to=/dashboard" 
   style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
  Accept Invitation
</a>

<p style="color: #666; font-size: 14px;">
  For security reasons, please change your password after your first login.
  If you did not expect this invitation, please ignore this email.
</p>

<hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;">

<p style="color: #666; font-size: 12px;">
  This invitation will expire in 24 hours.
  If you have any questions, please contact {{ .Data.invited_by }}.
</p> 
```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

# utils/cn.ts

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

# utils/supabase/client.ts

```ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

```

# utils/supabase/middleware.ts

```ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const user = await supabase.auth.getUser();

  // protected routes
  if (request.nextUrl.pathname === "/" && !user.error) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
};

```

# utils/supabase/server.ts

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(useAdmin = false) {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = useAdmin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

# utils/utils.ts

```ts
import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

```

