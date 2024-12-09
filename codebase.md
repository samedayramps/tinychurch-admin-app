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

# app/(admin)/layout.tsx

```tsx
import { Sidebar } from "@/components/ui/sidebar/sidebar"
import { SidebarItem } from "@/components/ui/sidebar/sidebar-item"
import { SidebarSection } from "@/components/ui/sidebar/sidebar-section"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "next/navigation"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { 
  LayoutDashboard,
  Users,
  Building2,
  Settings
} from "lucide-react"
import type { Organization, Profile } from "@/lib/types/auth"

const menuItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: "Management",
    items: [
      {
        title: "Members",
        href: "/members",
        icon: Users
      },
      {
        title: "Organization",
        href: "/organization",
        icon: Building2
      }
    ]
  },
  {
    title: "Settings",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings
      }
    ]
  }
]

interface AdminLayoutProps {
  children: React.ReactNode
  user: Profile
  organization: Organization
}

export default function AdminLayout({ children, user, organization }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <AdminGuard>
      <div className="flex h-screen">
        <Sidebar defaultCollapsed={false}>
          <div className="flex h-full flex-col gap-4">
            <div className="flex h-[60px] items-center px-4">
              <h2 className="text-lg font-semibold">{organization.name}</h2>
            </div>
            <ScrollArea className="flex-1">
              {menuItems.map((section) => (
                <SidebarSection
                  key={section.title}
                  title={section.title}
                  className="mb-4"
                >
                  {section.items.map((item) => (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                      isActive={pathname === item.href}
                    />
                  ))}
                </SidebarSection>
              ))}
            </ScrollArea>
          </div>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <Breadcrumbs />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  )
} 
```

# app/(auth-pages)/accept-invite/page.tsx

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

function AcceptInviteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get('token_hash')
  const type = searchParams.get('type')

  useEffect(() => {
    if (!token || type !== 'invite') {
      router.push('/sign-in')
    }
  }, [token, type, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const supabase = createClient()

    try {
      // First verify the invite token
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token as string,
        type: 'invite',
      })

      if (verifyError) throw verifyError

      // Then set the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) throw updateError

      router.push('/sign-in?message=Please sign in with your new password')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Accept Invitation</CardTitle>
        <CardDescription>
          Set your password to complete your account setup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Set Password & Accept Invite
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInviteForm />
    </Suspense>
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
import { cn } from "@/lib/utils/cn"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: 'url(/testimonials/image1.webp)' }}
          />
          <div className="absolute inset-0 bg-black/50" />
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
            {typeof window !== 'undefined' && window.location.search.includes('status=429') && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Rate Limit Exceeded</AlertTitle>
                <AlertDescription>
                  Too many requests. Please wait a moment before trying again.
                </AlertDescription>
              </Alert>
            )}
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

# app/(default)/org/[slug]/groups/[groupId]/page.tsx

```tsx
// app/(default)/org/[slug]/groups/[groupId]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupRepository } from '@/lib/dal/repositories/group'
import { createClient } from '@/lib/utils/supabase/server'
import { GroupOverviewTab } from '@/components/groups/group-overview-tab'
import { GroupMembersTab } from '@/components/groups/group-members-tab'
import GroupRequestsTab from '@/components/groups/group-requests-tab'
import GroupSettingsTab from '@/components/groups/group-settings-tab'

interface PageProps {
  params: Promise<{ slug: string; groupId: string }>
}

// Helper to check if user is group leader
async function isGroupLeader(groupId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  return data?.role === 'leader'
}

async function GroupDetailsPage({ params }: PageProps) {
  const { slug, groupId } = await params;

  const supabase = await createClient();
  
  // Get current user and check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  // Get organization and group details
  const [{ data: org }, { data: group }] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name')
      .eq('slug', slug)
      .single(),
    supabase
      .from('groups')
      .select(`
        *,
        members:group_members(
          *,
          profile:profiles(
            id,
            email,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', groupId)
      .single()
  ]);

  if (!org || !group) {
    notFound();
  }

  // Check user's role in the group
  const isLeader = await isGroupLeader(group.id, user.id);
  const groupRepo = new GroupRepository(supabase);

  // Get both pending requests and invitations if user is leader
  const [pendingRequests, pendingInvitations] = isLeader 
    ? await Promise.all([
        groupRepo.getPendingRequests(groupId),
        groupRepo.getPendingInvitations(groupId)
      ])
    : [[], []];

  // Add debug logging
  console.log('Is leader:', isLeader)
  console.log('Pending invitations in page:', pendingInvitations)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
        <p className="text-muted-foreground">{group.description}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {isLeader && (
            <>
              <TabsTrigger value="requests">
                Requests
                {pendingRequests.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview">
          <GroupOverviewTab 
            group={group} 
            organizationId={org.id}
            isLeader={isLeader}
          />
        </TabsContent>

        <TabsContent value="members">
          <GroupMembersTab 
            group={group}
            isLeader={isLeader}
            currentUserId={user.id}
          />
        </TabsContent>

        {isLeader && (
          <>
            <TabsContent value="requests">
              <GroupRequestsTab 
                group={group}
                requests={pendingRequests || []}
                invitations={pendingInvitations || []}
              />
            </TabsContent>

            <TabsContent value="settings">
              <GroupSettingsTab 
                group={group}
                organizationId={org.id}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

// Wrap in Suspense for loading state
export default async function GroupDetailsPageWrapper(props: PageProps) {
  const { slug, groupId } = await props.params;

  return (
    <Suspense fallback={<div>Loading group details...</div>}>
      <GroupDetailsPage {...props} />
    </Suspense>
  )
}
```

# app/(default)/org/[slug]/groups/new/page.tsx

```tsx
// app/(default)/org/[slug]/groups/new/page.tsx
import { GroupForm } from '@/components/groups/group-form'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { createClient } from '@/lib/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function NewGroupPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient()
  const orgRepo = new OrganizationRepository(supabase)
  const groupRepo = new GroupRepository(supabase)
  
  const org = await orgRepo.findBySlug(slug)
  if (!org) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupForm 
            organizationId={org.id}
            onSubmit={async (data) => {
              'use server'
              await groupRepo.createGroup({
                organization_id: org.id,
                name: data.name,
                type: data.type,
                visibility: data.visibility,
                description: data.description || null,
                max_members: data.max_members || null
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

# app/(default)/org/[slug]/groups/page.tsx

```tsx
// app/(default)/org/[slug]/groups/page.tsx
import { GroupsList } from '@/components/groups/groups-list'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { createClient } from '@/lib/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function GroupsPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (!org) {
    notFound();
  }

  // Initialize group repository
  const groupRepo = new GroupRepository(supabase);
  const groups = await groupRepo.getOrganizationGroups(org.id);

  return (
    <div className="container mx-auto py-6">
      <GroupsList 
        groups={groups}
        organizationId={org.id}
        onDeleteGroup={async (groupId) => {
          'use server'
          // Handle group deletion here
          // This is a server action that will be called from the client component
        }}
      />
    </div>
  );
}

// Wrap in Suspense for loading state
export default function GroupsPageWrapper(props: PageProps) {
  return (
    <Suspense fallback={<div>Loading groups...</div>}>
      <GroupsPage {...props} />
    </Suspense>
  );
}
```

# app/(superadmin)/layout.tsx

```tsx
import { SuperAdminSidebarNav } from "@/components/superadmin/sidebar-nav"
import { SuperAdminGuard } from "@/components/auth/superadmin-guard"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { getUserProfile } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()
  
  if (!profile?.is_superadmin) {
    redirect('/')
  }

  return (
    <SuperAdminGuard>
      <div className="flex min-h-screen flex-col md:flex-row">
        <SuperAdminSidebarNav profile={profile} />
        <div className="flex flex-1 flex-col min-h-screen md:min-h-0">
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Breadcrumbs />
          </div>
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SuperAdminGuard>
  )
} 

```

# app/(superadmin)/settings/profile/page.tsx

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

# app/(superadmin)/superadmin/audit/error.tsx

```tsx
'use client'

import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuditError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Only log essential error information to avoid circular references
    const errorInfo = {
      message: error?.message || 'Unknown error',
      name: error?.name || 'Error',
      digest: error?.digest,
      // Only include first few lines of stack trace if available
      stack: error?.stack?.split('\n').slice(0, 3).join('\n')
    }
    
    console.error('Audit page error:', errorInfo)
  }, [error])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription>
          {error?.message || 'There was an error loading the audit logs.'}
        </AlertDescription>
      </Alert>
      <div className="flex justify-center">
        <Button onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  )
} 
```

# app/(superadmin)/superadmin/audit/page.tsx

```tsx
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { createClient } from '@/lib/utils/supabase/server'
import { AuditLogsClient } from '@/components/superadmin/audit/audit-logs-client'

export default async function AuditPage() {
  const supabase = await createClient()
  const auditRepo = new AuditLogRepository(supabase)

  try {
    // Fetch initial data
    const [systemLogs, userLogs, securityLogs, { data: organizations }] = await Promise.all([
      auditRepo.findByCategory('system', { limit: 100 }).catch(() => []),
      auditRepo.findByCategory('user_action', { limit: 100 }).catch(() => []),
      auditRepo.findByCategory('security', { limit: 100 }).catch(() => []),
      supabase.from('organizations').select('id, name').order('name')
    ])

    return (
      <AuditLogsClient
        initialSystemLogs={systemLogs}
        initialUserLogs={userLogs}
        initialSecurityLogs={securityLogs}
        organizations={organizations || []}
      />
    )
  } catch (error) {
    throw error // This will be caught by the error boundary
  }
} 
```

# app/(superadmin)/superadmin/dashboard/page.tsx

```tsx
import { createClient } from '@/lib/utils/supabase/server'
import { StatsDashboard } from '@/components/superadmin/stats-dashboard'

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
      
      <StatsDashboard />
    </div>
  )
} 
```

# app/(superadmin)/superadmin/groups/page.tsx

```tsx
import { Suspense } from 'react'
import { SuperadminGroupsList } from '@/components/superadmin/groups/superadmin-groups-list'
import { createClient } from '@/lib/utils/supabase/server'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { getCurrentUser } from '@/lib/dal'
import { redirect } from 'next/navigation'
import type { Database } from '@/database.types'

// Add this type definition
type Organization = Database['public']['Tables']['organizations']['Row']

async function SuperadminGroupsPage() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user?.is_superadmin) {
    redirect('/')
  }

  // Get all organizations for the selector
  const orgRepo = new OrganizationRepository(supabase)
  const organizations = await orgRepo.findAll() as Organization[]

  // Get groups from all organizations initially
  const groupRepo = new GroupRepository(supabase)
  const groups = await groupRepo.getAllGroups()

  return (
    <div className="container mx-auto py-6">
      <SuperadminGroupsList 
        groups={groups}
        organizations={organizations}
      />
    </div>
  )
}

export default function SuperadminGroupsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading groups...</div>}>
      <SuperadminGroupsPage />
    </Suspense>
  )
} 
```

# app/(superadmin)/superadmin/layout.tsx

```tsx
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/dal'

export const metadata = {
  title: {
    default: 'Superadmin Dashboard',
    template: '%s - Superadmin Dashboard'
  },
  description: 'Superadmin dashboard for managing organizations and users'
}

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  if (!profile?.is_superadmin) {
    redirect('/')
  }

  return <>{children}</>
} 
```

# app/(superadmin)/superadmin/onboarding/layout.tsx

```tsx
import { requireSuperAdmin } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireSuperAdmin()
    return <>{children}</>
  } catch (error) {
    redirect('/unauthorized')
  }
} 
```

# app/(superadmin)/superadmin/onboarding/page.tsx

```tsx
import { TenantOnboardingForm } from '@/components/superadmin/onboarding/tenant-onboarding-form'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Tenant Onboarding - Superadmin',
  description: 'Onboard new tenant organizations',
}

export default async function TenantOnboardingPage() {
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  const organizations = await repository.findAll()

  const breadcrumbs = [
    { title: 'Superadmin', href: '/superadmin' },
    { title: 'Tenant Onboarding', href: '/superadmin/onboarding' },
  ]

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Tenant Onboarding</h2>
          <p className="text-muted-foreground">
            Create a new organization and set up its admin user
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TenantOnboardingForm existingOrganizations={organizations} />
        </CardContent>
      </Card>
    </div>
  )
} 
```

# app/(superadmin)/superadmin/organizations/[id]/edit/page.tsx

```tsx
import { notFound } from 'next/navigation'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationEditForm } from '@/components/superadmin/organizations/organization-edit-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditOrganizationPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  
  const organization = await repository.findWithStats(resolvedParams.id)
  
  if (!organization) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Edit {organization.name}</h2>
          <p className="text-sm text-muted-foreground">
            Update organization details and settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Make changes to {organization.name}'s information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationEditForm organization={organization} />
        </CardContent>
      </Card>
    </div>
  )
} 
```

# app/(superadmin)/superadmin/organizations/[id]/groups/[groupId]/page.tsx

```tsx
import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { GroupDetailsTabs } from '@/components/groups/group-details-tabs'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string; groupId: string }>
}

async function GroupDetailsPage({ params }: PageProps) {
  const { id: organizationId, groupId } = await params
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user?.is_superadmin) {
    redirect('/')
  }

  const groupRepo = new GroupRepository(supabase)
  const orgRepo = new OrganizationRepository(supabase)

  // Get organization, group details, and all pending data
  const [organization, group, pendingRequests, pendingInvitations] = await Promise.all([
    orgRepo.findById(organizationId),
    groupRepo.getGroupWithMembers(groupId),
    groupRepo.getPendingRequests(groupId),
    groupRepo.getPendingInvitations(groupId)
  ])

  if (!organization || !group) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/superadmin/organizations/${organizationId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{group.name}</h1>
        </div>
      </div>

      <GroupDetailsTabs
        group={group}
        organizationId={organizationId}
        userId={user.id}
        pendingRequests={pendingRequests}
        pendingInvitations={pendingInvitations}
      />
    </div>
  )
}

export default function GroupDetailsPageWrapper(props: PageProps) {
  return (
    <Suspense fallback={<div>Loading group details...</div>}>
      <GroupDetailsPage {...props} />
    </Suspense>
  )
}
```

# app/(superadmin)/superadmin/organizations/[id]/groups/new/page.tsx

```tsx
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/utils/supabase/server'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { getCurrentUser } from '@/lib/dal'
import { redirect, notFound } from 'next/navigation'
import { GroupForm } from '@/components/groups/group-form'
import { createGroup } from '@/lib/actions/groups'
import type { Json } from '@/database.types'
import { Database } from '@/database.types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function NewGroupPage({ params }: PageProps) {
  const { id: organizationId } = await params
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user?.is_superadmin) {
    redirect('/')
  }

  // Verify organization exists
  const orgRepo = new OrganizationRepository(supabase)
  const organization = await orgRepo.findById(organizationId)

  if (!organization) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupForm 
            organizationId={organizationId}
            redirectPath={`/superadmin/organizations/${organizationId}`}
            onSubmit={async (data) => {
              'use server'
              try {
                console.log('Form submission data:', data)

                const result = await createGroup({
                  organization_id: organizationId,
                  name: data.name,
                  type: data.type as Database['public']['Enums']['group_type'],
                  visibility: data.visibility as Database['public']['Enums']['group_visibility'],
                  description: data.description || null,
                  max_members: data.max_members === undefined ? null : data.max_members,
                  settings: {
                    allow_join_requests: true,
                    require_approval: true
                  }
                })

                if (result.error) {
                  throw new Error(result.error)
                }

                // Instead of using redirect, return a success response
                return { success: true }
              } catch (error) {
                console.error('Error in group creation:', {
                  error,
                  formData: data,
                  organizationId
                })
                throw error
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewGroupPageWrapper(props: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewGroupPage {...props} />
    </Suspense>
  )
} 
```

# app/(superadmin)/superadmin/organizations/[id]/layout.tsx

```tsx
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { notFound } from 'next/navigation'
import { BreadcrumbsProvider } from '@/lib/contexts/breadcrumbs-context'

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  const organization = await repository.findById(resolvedParams.id)

  console.log('Organization Layout Debug:', {
    resolvedParams,
    organizationName: organization?.name
  })

  if (!organization) {
    notFound()
  }

  return (
    <BreadcrumbsProvider 
      organizationName={organization.name}
      groupName={undefined}
    >
      {children}
    </BreadcrumbsProvider>
  )
} 
```

# app/(superadmin)/superadmin/organizations/[id]/page.tsx

```tsx
import { notFound } from 'next/navigation'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { createClient } from '@/lib/utils/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizationProfileTab } from '@/components/superadmin/organizations/organization-profile-tab'
import { OrganizationMembersTab } from '@/components/superadmin/organizations/organization-members-tab'
import { OrganizationSettingsTab } from '@/components/superadmin/organizations/organization-settings-tab'
import { OrganizationGroupsTab } from '@/components/superadmin/organizations/organization-groups-tab'
import { ActivityLog } from '@/components/activity-log'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizationPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  const groupRepo = new GroupRepository(supabase)
  
  const organization = await repository.findWithStats(resolvedParams.id)
  if (!organization) {
    notFound()
  }

  // Get organization's groups
  const groups = await groupRepo.getOrganizationGroups(organization.id)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{organization.name}</h2>
          <p className="text-sm text-muted-foreground">
            Organization Management
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OrganizationProfileTab organization={organization} />
        </TabsContent>

        <TabsContent value="members">
          <OrganizationMembersTab organizationId={organization.id} />
        </TabsContent>

        <TabsContent value="groups">
          <OrganizationGroupsTab 
            organizationId={organization.id}
            groups={groups}
          />
        </TabsContent>

        <TabsContent value="settings">
          <OrganizationSettingsTab organization={organization} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog logs={[]} title="Recent Activity" />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
```

# app/(superadmin)/superadmin/organizations/page.tsx

```tsx
import { OrganizationsTable } from '@/components/superadmin/organizations/organizations-table'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'

export default async function OrganizationsPage() {
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  const organizations = await repository.findAll()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">
            Manage your organizations and their settings
          </p>
        </div>
        {/* Add New Organization button here */}
      </div>
      <OrganizationsTable organizations={organizations} />
    </div>
  )
} 
```

# app/(superadmin)/superadmin/users/[id]/page.tsx

```tsx
import { createServerUtils } from '@/lib/utils/supabase/server-utils'
import { UserDashboard } from '@/components/superadmin/users/user-dashboard'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileTab } from '@/components/superadmin/users/user-profile-tab'
import { UserOrganizationsTab } from '@/components/superadmin/users/user-organizations-tab'
import { ActivityLog } from '@/components/activity-log'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserDashboardPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createServerUtils()
  
  const { data: user } = await supabase
    .from('profiles')
    .select(`
      *,
      organization_members (
        role,
        organizations (id, name)
      )
    `)
    .eq('id', resolvedParams.id)
    .single()
    
  if (!user) {
    notFound()
  }

  const displayName = user.full_name || user.email

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            User Management
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <UserDashboard user={user} />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfileTab user={user} />
        </TabsContent>

        <TabsContent value="organizations">
          <UserOrganizationsTab user={user} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog logs={[]} title="Recent Activity" />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
```

# app/(superadmin)/superadmin/users/invite/page.tsx

```tsx
import { UserInviteForm } from '@/components/superadmin/users/user-invite-form'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function InviteUserPage() {
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  
  try {
    const organizations = await repository.findAll()
    
    if (!organizations) {
      throw new Error('Failed to load organizations')
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Invite User</h2>
            <p className="text-muted-foreground">
              Send an invitation to join the platform
            </p>
          </div>
        </div>
        <UserInviteForm organizations={organizations} />
      </div>
    )
  } catch (error) {
    console.error('Error loading organizations:', error)
    notFound()
  }
} 
```

# app/(superadmin)/superadmin/users/page.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UsersTable } from '@/components/superadmin/users/users-table'
import { createClientUtils } from '@/lib/utils/supabase/client-utils'
import type { Database } from '@/database.types'

type User = {
  id: string
  email: string
  full_name: string
  status: Database['public']['Enums']['auth_status']
  is_active: boolean
  is_superadmin: boolean
  created_at: string
  invitation_sent_at?: string | null
  last_active_at?: string | null
  organization_members: Array<{
    role: string
    organizations: {
      name: string
    }
  }>
}

export default function UsersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientUtils()

  useEffect(() => {
    async function loadUsers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            organization_members (
              role,
              organizations (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [supabase])
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button asChild>
          <Link href="/superadmin/users/invite">Invite User</Link>
        </Button>
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <UsersTable users={users} />
    </div>
  )
} 
```

# app/actions.ts

```ts
"use server";

import { encodedRedirect } from "@/lib/utils/utils";
import { createClient } from "@/lib/utils/supabase/server";
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
import { ImpersonationService } from '@/lib/services/impersonation'
import { createClient } from '@/lib/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({
      isImpersonating: false,
      impersonatingId: null,
      realUserId: null
    })
  }
  
  const service = await ImpersonationService.create()
  const status = await service.getStatus(user.id)
  
  return Response.json(status)
} 
```

# app/api/auth/redirect/route.ts

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { log } from '@/lib/utils/logger'

export async function GET(request: Request) {
  log.info('Received GET request for auth redirect', { url: request.url })

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    log.error('Error fetching user', { error })
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (!user) {
    log.warn('No user found, redirecting to sign-in')
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (profileError) {
    log.error('Error fetching profile', { profileError })
    return NextResponse.redirect(new URL('/error', request.url))
  }

  log.info('User profile fetched', { profile })

  return NextResponse.redirect(new URL(
    profile?.is_superadmin ? '/superadmin/dashboard' : '/dashboard',
    request.url
  ))
} 
```

# app/api/auth/superadmin-status/route.ts

```ts
import { getSuperAdminStatus } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const isSuperAdmin = await getSuperAdminStatus()
    return NextResponse.json({ isSuperAdmin })
  } catch (error) {
    console.error('Error checking superadmin status:', error)
    return NextResponse.json({ isSuperAdmin: false })
  }
} 
```

# app/api/groups/[groupId]/invitable-members/route.ts

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { GroupRepository } from '@/lib/dal/repositories/group'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    const resolvedParams = await params;
    const invitableMembers = await groupRepo.getInvitableMembers(
      resolvedParams.groupId,
      organizationId
    )

    // Add logging
    console.log('API returned invitable members:', invitableMembers?.length)

    return NextResponse.json({ data: invitableMembers })  // Wrap in data property
  } catch (error) {
    console.error('Error fetching invitable members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitable members' },
      { status: 500 }
    )
  }
}
```

# app/api/invitations/[token]/route.ts

```ts
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
```

# app/api/organizations/[id]/activity/route.ts

```ts
import { createClient } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'

interface ActivityLog {
  id: string
  organization_id: string
  action: string
  actor: string
  timestamp: string
  details?: Record<string, any>
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await context.params
    const { data, error } = await supabase
      .from('organization_activity_logs')
      .select('*')
      .eq('organization_id', resolvedParams.id)
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) throw error

    // Ensure the data matches our expected type
    const activities: ActivityLog[] = data?.map(item => ({
      id: item.id,
      organization_id: item.organization_id,
      action: item.action,
      actor: item.actor,
      timestamp: item.timestamp,
      details: item.details
    })) ?? []

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching organization activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization activity' },
      { status: 500 }
    )
  }
} 
```

# app/api/organizations/[id]/members/route.ts

```ts
import { createClient } from '@/lib/utils/supabase/server'
import { OrganizationMemberRepository } from '@/lib/dal/repositories/organization-member'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await context.params
    const repository = new OrganizationMemberRepository(supabase)
    const members = await repository.findByOrganization(resolvedParams.id)

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching organization members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    )
  }
} 
```

# app/api/superadmin/onboarding/route.ts

```ts
import { NextResponse } from 'next/server'
import { TenantOnboardingService } from '@/lib/services/tenant-onboarding'
import { requireSuperAdmin } from '@/lib/auth/permissions'
import { AuthApiError } from '@supabase/supabase-js'
import { createClient } from '@/lib/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient(true)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    await requireSuperAdmin()
    const data = await request.json()
    const service = await TenantOnboardingService.create()
    const result = await service.onboardNewTenant(data, user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Tenant onboarding error:', error)
    
    if (error instanceof AuthApiError) {
      if (error.status === 429) {
        return NextResponse.json(
          { message: 'Rate limit exceeded. Please try again in a few minutes.' },
          { status: 429 }
        )
      }
    }
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 
```

# app/api/superadmin/users/route.ts

```ts
import { getSuperAdminStatus } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/supabase/server'

export async function GET() {
  try {
    const isSuperAdmin = await getSuperAdminStatus()
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = await createClient()
    // Your API logic here
    
    return NextResponse.json({ data: 'your data' })
  } catch (error) {
    console.error('Superadmin API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
} 
```

# app/api/users/[id]/route.ts

```ts
import { createClient } from '@/lib/utils/supabase/server'
import { type NextRequest } from 'next/server'
import type { Database } from '@/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

type ProfileWithOrg = Profile & {
  organization_members?: Array<{
    organizations: {
      id: string
      name: string
    },
    role: string
  }>
}

type UserDetails = Omit<Profile, 'organization_members'> & {
  organization?: {
    id: string
    name: string
  },
  role?: string
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const supabase = await createClient()
    const id = (await context.params).id
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        organization_members!inner (
          role,
          organizations (
            id,
            name
          )
        )
      `)
      .eq('id', id)
      .single()
      
    if (error) {
      console.error('Error fetching user:', error)
      return Response.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }
    
    // Transform the data to a simpler structure
    const profileData = data as unknown as ProfileWithOrg
    const userDetails: UserDetails = {
      ...profileData,
      organization: profileData.organization_members?.[0]?.organizations,
      role: profileData.organization_members?.[0]?.role
    }
    
    return Response.json(userDetails)
  } catch (error) {
    console.error('Error in user route:', error)
    return Response.json(
      { error: 'Failed to fetch user' }, 
      { status: 500 }
    )
  }
} 
```

# app/api/users/impersonatable/route.ts

```ts
import { createClient } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organization_members!inner (
        role,
        organizations (
          id,
          name
        )
      )
    `)
    .order('full_name')
  
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  return NextResponse.json(data)
} 
```

# app/auth/callback/route.ts

```ts
import { createClient } from "@/lib/utils/supabase/server";
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

# app/error/page.tsx

```tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ErrorContent() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get('message') || 'An error occurred'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600">{errorMessage}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-4 text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
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

# app/invitations/[token]/page.tsx

```tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/database.types'

type InvitationWithDetails = Database['public']['Tables']['group_invitations']['Row'] & {
  groups: {
    name: string
  }
  organizations: {
    name: string
  }
}

interface InvitationPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const resolvedParams = await params;
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get the invitation details with proper join syntax
  const { data: invitation } = await supabase
    .from('group_invitations')
    .select(`
      id,
      group_id,
      organization_id,
      groups:groups!inner (
        name
      ),
      organizations:organizations!inner (
        name
      )
    `)
    .eq('token', resolvedParams.token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single<InvitationWithDetails>()

  if (!invitation) {
    redirect('/error?message=Invalid or expired invitation')
  }

  return (
    <div className="max-w-lg mx-auto mt-16 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Group Invitation</h1>
      <p className="mb-4">
        You've been invited to join {invitation.groups.name} at {invitation.organizations.name}.
      </p>
      <form action={`/api/invitations/${resolvedParams.token}`} method="GET">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Accept Invitation
        </button>
      </form>
    </div>
  )
} 
```

# app/layout.tsx

```tsx
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { ImpersonationProvider } from '@/lib/contexts/impersonation-context'
import { ImpersonationBorder } from '@/components/impersonation/border'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tinychurch.app'),
  title: 'TinyChurch Admin',
  description: 'Administrative application for church management',
  openGraph: {
    title: 'TinyChurch Admin',
    description: 'Administrative application for church management',
  },
  twitter: {
    card: 'summary',
    title: 'TinyChurch Admin',
    description: 'Administrative application for church management',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ImpersonationProvider>
            <ImpersonationBorder />
            <main className="min-h-screen">
              {children}
            </main>
          </ImpersonationProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

```

# app/opengraph-image.png

This is a binary file of the type: Image

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

# app/setup/[token]/page.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const setupFormSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default function SetupPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<z.infer<typeof setupFormSchema>>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    const handleInvitation = async () => {
      try {
        const token = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (!token || type !== 'invite') {
          throw new Error('Invalid invitation link')
        }

        // Verify the OTP token
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'invite'
        })

        if (verifyError) throw verifyError

        setLoading(false)
      } catch (error) {
        console.error('Setup error:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Invalid invitation link',
          variant: 'destructive'
        })
        router.push('/sign-in')
      }
    }

    handleInvitation()
  }, [searchParams, router, supabase.auth, toast])

  const onSubmit = async (values: z.infer<typeof setupFormSchema>) => {
    try {
      setLoading(true)

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password
      })

      if (updateError) throw updateError

      // Update profile status
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (profileError) throw profileError
      }

      toast({
        title: 'Success',
        description: 'Your account has been set up successfully'
      })

      router.push('/sign-in?message=Please sign in with your new password')
    } catch (error) {
      console.error('Setup error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to setup account',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Account Setup</CardTitle>
          <CardDescription>
            Please set a password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
```

# app/setup/page.tsx

```tsx
'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/hooks/use-toast'

function SetupContent() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      if (!code) return

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
      } catch (error) {
        console.error('Error setting up auth:', error)
        toast({
          title: "Error",
          description: "Failed to authenticate. Please try again.",
          variant: "destructive"
        })
      }
    }

    handleAuthCallback()
  }, [searchParams, supabase.auth, toast])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const password = formData.get('password') as string

      // Update the user's password
      const { error: passwordError } = await supabase.auth.updateUser({
        password
      })

      if (passwordError) throw passwordError

      toast({
        title: "Success",
        description: "Your account has been set up successfully"
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to setup account",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Input name="password" type="password" placeholder="Enter your password" required />
      <Button type="submit" disabled={loading}>
        {loading ? 'Setting up...' : 'Setup Account'}
      </Button>
    </form>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupContent />
    </Suspense>
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
    "utils": "@/lib/utils/cn"
  }
}

```

# components/activity-log.tsx

```tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLogProps {
  logs: Array<{
    id: string
    details: string
    event_type: string
    created_at: string
  }>
  title?: string
}

export function ActivityLog({ logs, title = 'Recent Activity' }: ActivityLogProps) {
  if (!logs?.length) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{log.details}</p>
                <p className="text-sm text-muted-foreground">
                  {log.event_type}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
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

# components/admin/sidebar-nav.tsx

```tsx
'use client'

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/ui/sidebar/sidebar"
import { SidebarItem } from "@/components/ui/sidebar/sidebar-item"
import { SidebarSection } from "@/components/ui/sidebar/sidebar-section"
import { SidebarFooter } from "@/components/ui/sidebar/sidebar-footer"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Organization, Profile, OrganizationMember } from "@/lib/types/auth"
import { adminNavItems } from "@/lib/config/navigation"

interface AdminSidebarNavProps {
  organization: Organization
  profile: Profile
  membership: OrganizationMember
}

export function AdminSidebarNav({ organization, profile, membership }: AdminSidebarNavProps) {
  const pathname = usePathname()

  return (
    <Sidebar defaultCollapsed={false}>
      <div className="flex h-full flex-col">
        <div className="flex h-[60px] items-center px-4">
          <h2 className="text-lg font-semibold">{organization.name}</h2>
        </div>
        
        <ScrollArea className="flex-1 px-4">
          {adminNavItems.map((section) => (
            <SidebarSection
              key={section.title}
              title={section.title}
              className="mb-4"
            >
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={pathname === item.href}
                />
              ))}
            </SidebarSection>
          ))}
        </ScrollArea>
        
        <SidebarFooter 
          profile={profile} 
          membership={membership} 
        />
      </div>
    </Sidebar>
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

# components/auth/admin-guard.tsx

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { Profile } from '@/lib/types/auth'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  // Add your authentication logic here
  return <>{children}</>
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

# components/auth/superadmin-guard.tsx

```tsx
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/dal'
import type { Profile } from '@/lib/types/auth'

interface SuperAdminGuardProps {
  children: React.ReactNode
}

export async function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const profile = await getUserProfile()
  
  if (!profile?.is_superadmin) {
    redirect('/')
  }
  
  return <>{children}</>
} 
```

# components/avatar-upload.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
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

# components/error-boundary.tsx

```tsx
'use client'

import { useEffect } from 'react'
import { Alert } from '@/components/ui/alert'

export function ImpersonationErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Impersonation error:', error)
  }, [error])

  return (
    <Alert variant="destructive">
      <h2>Something went wrong with impersonation</h2>
      <button onClick={reset}>Try again</button>
    </Alert>
  )
} 
```

# components/ErrorBoundary.tsx

```tsx
'use client'

import { Component, ReactNode } from 'react'
import { Monitor } from '@/lib/monitoring'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Monitor.getInstance().trackError(error, {
      componentStack: errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4">
          <h2 className="text-lg font-bold">Something went wrong</h2>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-2 text-sm text-red-600">
              {this.state.error?.message}
            </pre>
          )}
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
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

# components/groups/group-details-tabs.tsx

```tsx
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupOverviewTab } from '@/components/groups/group-overview-tab'
import { GroupMembersTab } from '@/components/groups/group-members-tab'
import GroupRequestsTab from '@/components/groups/group-requests-tab'
import GroupSettingsTab from '@/components/groups/group-settings-tab'
import type { GroupWithMembers, GroupMember, JoinRequest, GroupInvitation } from '@/lib/dal/repositories/group'

interface GroupDetailsTabsProps {
  group: GroupWithMembers
  organizationId: string
  userId: string
  pendingRequests: JoinRequest[]
  pendingInvitations: GroupInvitation[]
}

export function GroupDetailsTabs({ 
  group: initialGroup,
  organizationId,
  userId,
  pendingRequests = [],
  pendingInvitations = []
}: GroupDetailsTabsProps) {
  const [currentMembers, setCurrentMembers] = useState(initialGroup.members)

  const handleMembersUpdate = (updatedMembers: GroupMember[]) => {
    setCurrentMembers(updatedMembers)
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="requests">
          Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
              {pendingRequests.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <GroupOverviewTab 
          group={{
            ...initialGroup,
            members: currentMembers
          }}
          organizationId={organizationId}
          isLeader={true}
        />
      </TabsContent>

      <TabsContent value="members">
        <GroupMembersTab 
          group={{
            ...initialGroup,
            members: currentMembers
          }}
          isLeader={true}
          currentUserId={userId}
          onMembersUpdate={handleMembersUpdate}
        />
      </TabsContent>

      <TabsContent value="requests">
        <GroupRequestsTab 
          group={initialGroup}
          requests={pendingRequests}
          invitations={pendingInvitations}
        />
      </TabsContent>

      <TabsContent value="settings">
        <GroupSettingsTab 
          group={initialGroup}
          organizationId={organizationId}
        />
      </TabsContent>
    </Tabs>
  )
} 
```

# components/groups/group-form.tsx

```tsx
// components/groups/group-form.tsx
'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/hooks/use-toast'
import { useRouter } from 'next/navigation'
import type { Database, Json } from '@/database.types'

type GroupType = Database['public']['Enums']['group_type']
type GroupVisibility = Database['public']['Enums']['group_visibility']

// Form validation schema
const groupFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Group name must be at least 2 characters.',
  }),
  description: z.string().nullable(),
  type: z.enum(['ministry', 'small_group', 'committee', 'service_team', 'other'] as const),
  visibility: z.enum(['public', 'private', 'hidden'] as const),
  max_members: z.number().min(0).nullable(),
  settings: z.record(z.unknown()).nullable()
})

type FormData = z.infer<typeof groupFormSchema>

interface GroupFormProps {
  organizationId: string
  initialData?: Partial<Database['public']['Tables']['groups']['Row']>
  onSubmit: (data: FormData) => Promise<{ success: boolean } | void>
  redirectPath?: string
}

interface GroupFormData {
  name: string
  description?: string | null
  type: Database['public']['Enums']['group_type']
  visibility: Database['public']['Enums']['group_visibility']
  max_members?: number | null
  settings?: Json | null  // Added to match schema
}

export function GroupForm({ 
  organizationId, 
  initialData, 
  onSubmit,
  redirectPath
}: GroupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Initialize form with default values or initial data
  const form = useForm<FormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: (initialData?.type as GroupType) || 'small_group',
      visibility: (initialData?.visibility as GroupVisibility) || 'public',
      max_members: initialData?.max_members || 0,
      settings: typeof initialData?.settings === 'object' ? initialData.settings as Record<string, unknown> : null
    }
  })

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      
      toast({
        title: "Success",
        description: initialData ? "Group updated successfully" : "Group created successfully",
      })
      
      // Handle redirect client-side
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push(`/org/${organizationId}/groups`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message.includes('already exists') 
            ? error.message 
            : "Failed to create group"
          : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Youth Ministry" {...field} />
              </FormControl>
              <FormDescription>
                The name of your group as it will appear to members.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  placeholder="Describe the purpose of this group"
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                A brief description of what this group does and who it's for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ministry">Ministry Team</SelectItem>
                    <SelectItem value="small_group">Small Group</SelectItem>
                    <SelectItem value="committee">Committee</SelectItem>
                    <SelectItem value="service_team">Service Team</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of group helps organize and categorize your groups.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">
                      Public - Anyone can see and request to join
                    </SelectItem>
                    <SelectItem value="private">
                      Private - Only visible to members and invitees
                    </SelectItem>
                    <SelectItem value="hidden">
                      Hidden - Only visible to leaders and admins
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Controls who can see and join this group.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="max_members"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Members (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value ?? ''}
                  onChange={event => field.onChange(event.target.valueAsNumber || null)}
                />
              </FormControl>
              <FormDescription>
                Leave at 0 for no member limit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/org/${organizationId}/groups`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Group" : "Create Group"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

# components/groups/group-invite-dialog.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { inviteToGroup, addGroupMember } from '@/lib/actions/groups'
import { UserPlus } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { createClient } from '@/lib/utils/supabase/client'
import type { Database } from '@/database.types'

// Define types based on the database schema
type Profile = Database['public']['Tables']['profiles']['Row']
type InvitableProfile = Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>

// Type for the raw Supabase response
type RawOrgMemberResponse = {
  user_id: string
  profile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

// Type for our processed member data
type OrganizationMemberResponse = {
  user_id: string
  profile: InvitableProfile
}

const inviteFormSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  role: z.enum(['member', 'leader'] as const, {
    required_error: "Please select a role",
  }),
})

interface GroupInviteDialogProps {
  groupId: string
  organizationId: string
  onInviteSent: () => void
}

export function GroupInviteDialog({
  groupId,
  organizationId,
  onInviteSent
}: GroupInviteDialogProps) {
  const [invitableMembers, setInvitableMembers] = useState<InvitableProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadInvitableMembers = async () => {
    try {
      // Get organization members with their profiles
      const { data: orgMembers, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          profile:profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (orgError) throw orgError

      // Get existing group members
      const { data: groupMembers, error: groupError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .is('deleted_at', null)

      if (groupError) throw groupError

      // Filter and transform the data
      const groupMemberIds = groupMembers?.map(m => m.user_id) || []
      
      // Safely cast the raw response
      const rawMembers = ((orgMembers || []) as unknown) as RawOrgMemberResponse[]
      
      // Transform the raw data into our expected format
      const typedOrgMembers: OrganizationMemberResponse[] = rawMembers.map(m => ({
        user_id: m.user_id,
        profile: {
          id: m.profile.id,
          email: m.profile.email,
          full_name: m.profile.full_name,
          avatar_url: m.profile.avatar_url
        }
      }))

      const invitable = typedOrgMembers
        .filter(m => !groupMemberIds.includes(m.user_id))
        .map(m => m.profile)
        .filter((profile): profile is InvitableProfile => 
          profile !== null && 
          typeof profile === 'object' &&
          'id' in profile
        )

      setInvitableMembers(invitable)
      setLoading(false)
    } catch (error) {
      console.error('Error loading invitable members:', error)
      toast({
        title: 'Error',
        description: 'Failed to load invitable members',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  // Load members when dialog opens
  useEffect(() => {
    if (open) {
      loadInvitableMembers()
    }
  }, [open, organizationId, groupId])

  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      memberId: '',
      role: 'member',
    },
  })

  const onSubmit = async (data: z.infer<typeof inviteFormSchema>) => {
    if (isSubmitting) return // Prevent double submission
    
    try {
      setIsSubmitting(true)
      const selectedMember = invitableMembers.find(m => m.id === data.memberId)
      if (!selectedMember) return

      const result = await inviteToGroup(groupId, selectedMember.id, data.role)
      
      if (result.error) {
        if (result.existingInvite) {
          toast({
            title: "Invitation Already Exists",
            description: "This user has already been invited to the group.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive"
          })
        }
        return
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      })
      setOpen(false)
      form.reset()
      onInviteSent?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onDirectAdd(data: z.infer<typeof inviteFormSchema>) {
    try {
      const selectedMember = invitableMembers.find(m => m.id === data.memberId)
      if (!selectedMember) return

      const result = await addGroupMember(groupId, selectedMember.id, data.role)
      
      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: 'Member Added',
        description: `${selectedMember.full_name || selectedMember.email} has been added to the group`,
      })
      
      // Remove the added member from the invitable list
      setInvitableMembers(prev => prev.filter(m => m.id !== selectedMember.id))
      
      setOpen(false)
      form.reset()
      onInviteSent?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add member',
        variant: 'destructive',
      })
    }
  }

  const comboboxItems = invitableMembers.map(member => ({
    id: member.id,
    name: member.full_name || member.email
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Members ({invitableMembers.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Select an organization member and assign their role in this group.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member</FormLabel>
                  <FormControl>
                    <Combobox
                      value={field.value}
                      onChange={field.onChange}
                      items={comboboxItems}
                      placeholder="Select a member..."
                      emptyText="No members found"
                      className="w-full"
                    />
                  </FormControl>
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
                      <SelectItem value="leader">Leader</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-between space-x-2">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => form.handleSubmit(onDirectAdd)()}
              >
                Add Directly
              </Button>
              <Button 
                type="submit"
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

# components/groups/group-join-requests.tsx

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/hooks/use-toast'
import { Check, X, MessageSquare } from 'lucide-react'
import { formatDistance } from 'date-fns'
import type { GroupWithMembers } from '@/lib/dal/repositories/group'
import type { Database } from '@/database.types'

type JoinRequest = Database['public']['Tables']['group_join_requests']['Row'] & {
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface GroupRequestsTabProps {
  group: GroupWithMembers
  requests: JoinRequest[]
}

export function GroupRequestsTab({ group, requests }: GroupRequestsTabProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setLoading(requestId)
    try {
      // TODO: Implement approve/reject API call
      toast({
        title: action === 'approve' ? 'Request Approved' : 'Request Rejected',
        description: action === 'approve' 
          ? 'The member has been added to the group.'
          : 'The join request has been rejected.'
      })
    } catch (error) {
      toast({
        title: 'Action Failed',
        description: `Failed to ${action} request. Please try again.`,
        variant: 'destructive'
      })
    } finally {
      setLoading(null)
    }
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Pending Requests</h3>
            <p className="text-muted-foreground mt-2">
              When people request to join the group, they'll appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Join Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Request Message</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.user.avatar_url || undefined} />
                      <AvatarFallback>
                        {(request.user.full_name || request.user.email)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {request.user.full_name || request.user.email}
                      </div>
                      {request.user.full_name && (
                        <div className="text-sm text-muted-foreground">
                          {request.user.email}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {request.message || (
                    <span className="text-muted-foreground italic">
                      No message provided
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {request.requested_at && formatDistance(new Date(request.requested_at), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequest(request.id, 'approve')}
                      disabled={loading === request.id}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequest(request.id, 'reject')}
                      disabled={loading === request.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

# components/groups/group-members-tab.tsx

```tsx
// components/groups/group-members-tab.tsx
'use client'

import { useState } from 'react'
import type { GroupMember } from '@/lib/dal/repositories/group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/hooks/use-toast'
import { 
  MoreVertical, 
  Shield,
  UserMinus,
  Crown,
  Mail,
  UserCog 
} from 'lucide-react'
import { formatDistance } from 'date-fns'
import { GroupInviteDialog } from './group-invite-dialog'
import type { Database } from '@/database.types'
import { removeGroupMember, updateMemberRole } from '@/lib/actions/groups'
import { createClient } from '@/lib/utils/supabase/client'

interface GroupMembersTabProps {
  group: {
    id: string
    organization_id: string
    name: string
    max_members: number | null
    members: GroupMember[]
  }
  isLeader: boolean
  currentUserId: string
  onMembersUpdate?: (updatedMembers: GroupMember[]) => void
}

export function GroupMembersTab({ 
  group,
  isLeader,
  currentUserId,
  onMembersUpdate
}: GroupMembersTabProps) {
  const [members, setMembers] = useState<GroupMember[]>(group.members)
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'remove' | 'promote' | 'demote'
    memberId: string
    memberName: string
    userId: string
  } | null>(null)
  const { toast } = useToast()

  // Sort members by role (leaders first) and then by name
  const sortedMembers = [...members].sort((a: GroupMember, b: GroupMember) => {
    if (a.role === 'leader' && b.role !== 'leader') return -1
    if (a.role !== 'leader' && b.role === 'leader') return 1
    return (a.profile.full_name || a.profile.email).localeCompare(
      b.profile.full_name || b.profile.email
    )
  })

  const handleAction = async () => {
    if (!confirmAction) return

    setLoading(confirmAction.memberId)
    try {
      let result;
      switch (confirmAction.type) {
        case 'remove':
          result = await removeGroupMember(group.id, confirmAction.userId)
          if (result.success) {
            const updatedMembers = members.filter(m => m.user_id !== confirmAction.userId)
            setMembers(updatedMembers)
            onMembersUpdate?.(updatedMembers)
          }
          break;
        case 'promote':
          result = await updateMemberRole(group.id, confirmAction.userId, 'leader')
          if (result.success) {
            const updatedMembers = members.map(m => 
              m.user_id === confirmAction.userId ? { ...m, role: 'leader' as const } : m
            )
            setMembers(updatedMembers)
            onMembersUpdate?.(updatedMembers)
          }
          break;
        case 'demote':
          result = await updateMemberRole(group.id, confirmAction.userId, 'member')
          if (result.success) {
            const updatedMembers = members.map(m => 
              m.user_id === confirmAction.userId ? { ...m, role: 'member' as const } : m
            )
            setMembers(updatedMembers)
            onMembersUpdate?.(updatedMembers)
          }
          break;
      }

      if (result?.error) {
        throw new Error(result.error)
      }

      toast({
        title: 'Success',
        description: `Member ${confirmAction.type === 'remove' ? 'removed' : 
          confirmAction.type === 'promote' ? 'promoted to leader' : 
          'changed to regular member'}`
      })
    } catch (error) {
      console.error('Action failed:', error)
      toast({
        title: 'Action Failed',
        description: error instanceof Error ? error.message : 'Failed to perform action',
        variant: 'destructive'
      })
    } finally {
      setLoading(null)
      setConfirmAction(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Group Members</CardTitle>
            <CardDescription>
              {members.length} members in total
              {group.max_members != null && group.max_members > 0 && ` (${group.max_members} maximum)`}
            </CardDescription>
          </div>
          {isLeader && (
            <GroupInviteDialog 
              groupId={group.id}
              organizationId={group.organization_id}
              onInviteSent={async () => {
                // Fetch updated member list
                const supabase = createClient()
                const { data: updatedMembers } = await supabase
                  .from('group_members')
                  .select(`
                    *,
                    profile:profiles (
                      id,
                      email,
                      full_name,
                      avatar_url
                    )
                  `)
                  .eq('group_id', group.id)
                  .is('deleted_at', null)

                if (updatedMembers) {
                  setMembers(updatedMembers)
                  onMembersUpdate?.(updatedMembers)
                }
              }}
            />
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                {isLeader && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {(member.profile.full_name || member.profile.email)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.profile.full_name || member.profile.email}
                      </div>
                      {member.profile.full_name && (
                        <div className="text-sm text-muted-foreground">
                          {member.profile.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.role === 'leader' ? (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Crown className="w-3 h-3" />
                        Leader
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit">Member</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.joined_at && (
                      <time dateTime={member.joined_at}>
                        {formatDistance(new Date(member.joined_at), new Date(), { addSuffix: true })}
                      </time>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={member.status === 'active' ? 'default' : 'secondary'}
                      className="w-fit"
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  {isLeader && member.user_id !== currentUserId && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            disabled={loading === member.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role !== 'leader' ? (
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({
                                type: 'promote',
                                memberId: member.id,
                                userId: member.user_id,
                                memberName: member.profile.full_name || member.profile.email
                              })}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Make Leader
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({
                                type: 'demote',
                                memberId: member.id,
                                userId: member.user_id,
                                memberName: member.profile.full_name || member.profile.email
                              })}
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Remove Leader Role
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setConfirmAction({
                              type: 'remove',
                              memberId: member.id,
                              userId: member.user_id,
                              memberName: member.profile.full_name || member.profile.email
                            })}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove from Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'remove' && 'Remove Member'}
              {confirmAction?.type === 'promote' && 'Promote to Leader'}
              {confirmAction?.type === 'demote' && 'Remove Leader Role'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'remove' && (
                `Are you sure you want to remove ${confirmAction.memberName} from the group?`
              )}
              {confirmAction?.type === 'promote' && (
                `Are you sure you want to make ${confirmAction.memberName} a group leader?
                They will be able to manage members and group settings.`
              )}
              {confirmAction?.type === 'demote' && (
                `Are you sure you want to remove leader role from ${confirmAction.memberName}?
                They will become a regular member.`
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={loading !== null}
            >
              Cancel
            </Button>
            <Button 
              variant={confirmAction?.type === 'remove' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={loading !== null}
            >
              {loading !== null ? (
                <span>Processing...</span>
              ) : (
                <span>Confirm</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

# components/groups/group-overview-tab.tsx

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GroupWithMembers, GroupMember } from '@/lib/dal/repositories/group'
import { formatDistance } from 'date-fns'
import {
  Users,
  Shield,
  Globe,
  Lock,
  EyeOff,
  Calendar,
  Mail,
  UserPlus,
} from 'lucide-react'
import { useToast } from '@/components/hooks/use-toast'
import { useState } from 'react'

interface GroupOverviewTabProps {
  group: GroupWithMembers
  organizationId: string
  isLeader: boolean
}

// Helper function to format group type for display
const formatGroupType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Helper to get visibility icon
const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case 'public':
      return <Globe className="w-4 h-4" />
    case 'private':
      return <Lock className="w-4 h-4" />
    case 'hidden':
      return <EyeOff className="w-4 h-4" />
    default:
      return null
  }
}

export function GroupOverviewTab({ group, organizationId, isLeader }: GroupOverviewTabProps) {
  const { toast } = useToast()
  const [joinRequestLoading, setJoinRequestLoading] = useState(false)

  // Count members by role
  const memberCounts = {
    total: group.members.length,
    leaders: group.members.filter((m: GroupMember) => m.role === 'leader').length,
    members: group.members.filter((m: GroupMember) => m.role === 'member').length
  }

  // Check if group has reached member limit
  const isAtCapacity = group.max_members 
    ? group.members.length >= group.max_members 
    : false

  const handleJoinRequest = async () => {
    setJoinRequestLoading(true)
    try {
      // Implementation for join request
      toast({
        title: 'Request Sent',
        description: 'Your request to join this group has been sent to the leaders.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send join request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setJoinRequestLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCounts.total}</div>
            {group.max_members != null && group.max_members > 0 && (
              <p className="text-xs text-muted-foreground">
                {group.max_members - memberCounts.total} spots remaining
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leaders</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCounts.leaders}</div>
            <p className="text-xs text-muted-foreground">
              Managing group activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCounts.members}</div>
            <p className="text-xs text-muted-foreground">
              Regular participants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Group Details */}
      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {formatGroupType(group.type)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {getVisibilityIcon(group.visibility)}
              {group.visibility.charAt(0).toUpperCase() + group.visibility.slice(1)}
            </Badge>
            {isAtCapacity && (
              <Badge variant="destructive">
                At Capacity
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">
              {group.description || 'No description provided.'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Created</h4>
            {group.created_at && (
              <time dateTime={group.created_at}>
                {formatDistance(new Date(group.created_at), new Date(), { addSuffix: true })}
              </time>
            )}
          </div>

          {!isLeader && group.visibility === 'public' && (
            <div className="pt-4">
              <Button 
                onClick={handleJoinRequest}
                disabled={joinRequestLoading || isAtCapacity}
                className="w-full"
              >
                {isAtCapacity ? 'Group is Full' : 'Request to Join'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity or Communication Options could go here */}
      {isLeader && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full sm:w-auto" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button className="w-full sm:w-auto" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Message Members
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

# components/groups/group-requests-tab.tsx

```tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/hooks/use-toast'
import { Check, X, MessageSquare, Mail, Loader2, RefreshCw } from 'lucide-react'
import { formatDistance } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GroupWithMembers, JoinRequest, GroupInvitation } from '@/lib/dal/repositories/group'
import { deleteGroupInvitation, resendGroupInvitation } from '@/lib/actions/groups'

interface GroupRequestsTabProps {
  group: GroupWithMembers
  requests: JoinRequest[]
  invitations: GroupInvitation[]
  onUpdate?: () => void
}

export default function GroupRequestsTab({ 
  group, 
  requests = [], 
  invitations = [],
  onUpdate
}: GroupRequestsTabProps) {
  const [processingCancel, setProcessingCancel] = useState<Record<string, boolean>>({})
  const [processingResend, setProcessingResend] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  console.log('Requests tab invitations:', invitations)

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingCancel(prev => ({ ...prev, [requestId]: true }))
    try {
      // TODO: Call your API to process the request
      toast({
        title: 'Success',
        description: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process request',
        variant: 'destructive'
      })
    } finally {
      setProcessingCancel(prev => ({ ...prev, [requestId]: false }))
    }
  }

  const handleInvitation = async (invitationId: string, action: 'cancel' | 'resend') => {
    const setProcessing = action === 'cancel' ? setProcessingCancel : setProcessingResend
    
    setProcessing(prev => ({ ...prev, [invitationId]: true }))
    try {
      const result = action === 'cancel' 
        ? await deleteGroupInvitation(invitationId)
        : await resendGroupInvitation(invitationId)
        
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: action === 'cancel' 
          ? "Invitation cancelled successfully"
          : "Invitation resent successfully"
      })
      
      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    } finally {
      setProcessing(prev => ({ ...prev, [invitationId]: false }))
    }
  }

  if (!requests.length && !invitations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>Join requests and invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Pending Requests</h3>
            <p className="text-muted-foreground mt-2">
              When people request to join or are invited to the group, they'll appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Requests & Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">
              Join Requests {requests.length > 0 && `(${requests.length})`}
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Invitations {invitations.length > 0 && `(${invitations.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.user.avatar_url || undefined} />
                        <AvatarFallback>
                          {(request.user.full_name || request.user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {request.user.full_name || request.user.email}
                        </div>
                        {request.user.full_name && (
                          <div className="text-sm text-muted-foreground">
                            {request.user.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.message || (
                        <span className="text-muted-foreground italic">
                          No message provided
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.requested_at && formatDistance(new Date(request.requested_at), new Date(), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequest(request.id, 'approve')}
                          disabled={processingCancel[request.id]}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequest(request.id, 'reject')}
                          disabled={processingCancel[request.id]}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="invitations">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={invitation.invited_user_profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(invitation.invited_user_profile?.full_name || invitation.invited_user_profile?.email || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {invitation.invited_user_profile?.full_name || 
                           invitation.invited_user_profile?.email || 
                           'Unknown User'}
                        </div>
                        {invitation.invited_user_profile?.full_name && invitation.invited_user_profile?.email && (
                          <div className="text-sm text-muted-foreground">
                            {invitation.invited_user_profile.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistance(new Date(invitation.created_at), new Date(), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      {formatDistance(new Date(invitation.expires_at), new Date(), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInvitation(invitation.id, 'resend')}
                        disabled={processingResend[invitation.id] || processingCancel[invitation.id]}
                      >
                        {processingResend[invitation.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Resending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Resend
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInvitation(invitation.id, 'cancel')}
                        disabled={processingCancel[invitation.id] || processingResend[invitation.id]}
                      >
                        {processingCancel[invitation.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
```

# components/groups/group-settings-tab.tsx

```tsx
'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { GroupWithMembers, GroupSettings as GroupSettingsType } from '@/lib/dal/repositories/group'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

const groupSettingsSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  visibility: z.enum(['public', 'private', 'hidden']),
  max_members: z.number().min(0),
  allow_join_requests: z.boolean(),
  require_approval: z.boolean(),
  settings: z.record(z.unknown()).optional()
})

type FormData = z.infer<typeof groupSettingsSchema>

interface GroupSettingsTabProps {
  group: GroupWithMembers
  organizationId: string
}

export default function GroupSettingsTab({ group, organizationId }: GroupSettingsTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      name: group.name,
      description: group.description || '',
      visibility: group.visibility,
      max_members: group.max_members || 0,
      allow_join_requests: (group.settings as GroupSettingsType)?.allow_join_requests ?? true,
      require_approval: (group.settings as GroupSettingsType)?.require_approval ?? true,
      settings: (group.settings as Record<string, unknown>) || {}
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // Merge the boolean flags into the settings object
      const updatedSettings = {
        ...data.settings,
        allow_join_requests: data.allow_join_requests,
        require_approval: data.require_approval
      }
      
      // Prepare the update payload
      const updateData = {
        name: data.name,
        description: data.description,
        visibility: data.visibility,
        max_members: data.max_members,
        settings: updatedSettings
      }

      // TODO: Call your update API here
      // await updateGroupSettings(group.id, updateData)

      toast({
        title: 'Success',
        description: 'Group settings updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Group Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Briefly describe the purpose and activities of this group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Members</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      Set to 0 for no limit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allow_join_requests"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Join Requests</FormLabel>
                      <FormDescription>
                        Allow users to request to join this group
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
                name="require_approval"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Approval</FormLabel>
                      <FormDescription>
                        Leaders must approve join requests
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

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
```

# components/groups/groups-list.tsx

```tsx
// components/groups/groups-list.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Users, Settings, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/database.types'

type Group = Database['public']['Tables']['groups']['Row']
type GroupType = Database['public']['Enums']['group_type']

// Helper function to format group type for display
const formatGroupType = (type: GroupType) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

interface GroupsListProps {
  groups: (Group & { members_count: number })[]
  organizationId: string
  onDeleteGroup?: (groupId: string) => Promise<void>
}

export function GroupsList({ groups, organizationId, onDeleteGroup }: GroupsListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (groupId: string) => {
    if (!onDeleteGroup) return
    
    setLoading(groupId)
    try {
      await onDeleteGroup(groupId)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Groups</h2>
          <p className="text-muted-foreground">
            Manage your ministry teams, small groups, and committees
          </p>
        </div>
        <Link href={`/org/${organizationId}/groups/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {group.name}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/org/${organizationId}/groups/${group.id}`}>
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/org/${organizationId}/groups/${group.id}/settings`}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {onDeleteGroup && (
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={loading === group.id}
                      onClick={() => handleDelete(group.id)}
                    >
                      Delete Group
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                {group.description || 'No description provided'}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {formatGroupType(group.type)}
                  </Badge>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {group.members_count}
                  </Badge>
                </div>
                <Link
                  href={`/org/${organizationId}/groups/${group.id}/members`}
                  className="text-sm text-primary hover:underline"
                >
                  View Members
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full text-center py-12 bg-muted/10 rounded-lg">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Groups Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first group to start organizing your ministry teams and small groups.
            </p>
            <Link href={`/org/${organizationId}/groups/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Group
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
```

# components/header-auth.tsx

```tsx
'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
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

# components/impersonation/border.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'
import { IMPERSONATION_EVENT, type ImpersonationEventDetail } from '@/lib/events/impersonation'

export function ImpersonationBorder() {
  const { isImpersonating } = useImpersonationStatus()
  const [isVisible, setIsVisible] = useState(isImpersonating)

  useEffect(() => {
    setIsVisible(isImpersonating)
  }, [isImpersonating])

  useEffect(() => {
    function handleImpersonationEvent(e: Event) {
      const event = e as CustomEvent<ImpersonationEventDetail>
      setIsVisible(event.detail.type === 'start')
    }

    window.addEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
    return () => window.removeEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none border-4 border-red-600 z-[100]" />
  )
} 
```

# components/impersonation/stop-button.tsx

```tsx
'use client'

import { stopImpersonation } from '@/lib/actions/impersonation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/hooks/use-toast'
import { emitImpersonationEvent } from '@/lib/events/impersonation'

export function StopImpersonationButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleStop = async () => {
    try {
      setIsLoading(true)
      
      // Emit event first for immediate UI feedback
      emitImpersonationEvent({ type: 'stop' })
      
      const result = await stopImpersonation()
      
      if ('error' in result) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to stop impersonation",
        })
        return
      }
      
      if ('success' in result) {
        toast({
          title: "Impersonation stopped",
          description: "You are no longer impersonating another user",
        })
        
        // Force refresh and redirect
        router.refresh()
        router.push('/superadmin/dashboard')
      }
    } catch (error) {
      // If error, emit start event to revert UI
      emitImpersonationEvent({ type: 'start' })
      
      console.error('Error stopping impersonation:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleStop}
      disabled={isLoading}
      variant="outline"
      className="border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
    >
      {isLoading ? 'Stopping...' : 'Stop'}
    </Button>
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

import { useState, useEffect, useMemo } from 'react'
import { UserCog, StopCircle, ExternalLink } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { startImpersonation, stopImpersonation } from '@/lib/actions/impersonation'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types/auth'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/hooks/use-toast'
import { useTransition } from 'react'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'
import { 
  emitImpersonationEvent, 
  IMPERSONATION_EVENT,
  type ImpersonationEventDetail 
} from '@/lib/events/impersonation'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface ImpersonationUserSelectProps {
  users: Profile[]
}

interface UserDetails extends Profile {
  organization?: {
    name: string
    id: string
  }
  role?: string
}

interface UserOption extends Profile {
  organization_members?: Array<{
    organizations: {
      id: string
      name: string
    }
    role: 'admin' | 'staff' | 'ministry_leader' | 'member' | 'visitor'
  }>
}

export function ImpersonationUserSelect({ users }: ImpersonationUserSelectProps) {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const { isImpersonating, impersonatedUserId, refresh } = useImpersonationStatus()
  const [currentUserName, setCurrentUserName] = useState<string>('')
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Listen for impersonation events
  useEffect(() => {
    function handleImpersonationEvent(e: Event) {
      const event = e as CustomEvent<ImpersonationEventDetail>
      if (event.detail.type === 'stop') {
        setUserDetails(null)
        setCurrentUserName('')
        setSelectedUser('')
      }
    }

    window.addEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
    return () => window.removeEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
  }, [])

  // Fetch user details when impersonation changes
  useEffect(() => {
    async function fetchUserDetails() {
      if (!impersonatedUserId) {
        setUserDetails(null)
        setCurrentUserName('')
        return
      }

      try {
        const response = await fetch(`/api/users/${impersonatedUserId}`)
        const data = await response.json()
        setUserDetails(data)
        setCurrentUserName(data.full_name || data.email)
      } catch (error) {
        console.error('Failed to fetch user details:', error)
      }
    }
    
    fetchUserDetails()
  }, [impersonatedUserId])

  const safeUsers = useMemo(() => {
    return Array.isArray(users) ? users : []
  }, [users])

  const filteredUsers = useMemo(() => {
    if (!search) return safeUsers
    
    return safeUsers.filter((user) => {
      const searchTerms = [
        user.full_name || '',
        user.email || '',
        user.organization_members?.[0]?.organizations?.name || '',
        user.organization_members?.[0]?.role || '',
      ].join(' ').toLowerCase()
      
      return searchTerms.includes(search.toLowerCase())
    })
  }, [safeUsers, search])

  const handleSelect = async (userId: string) => {
    try {
      setIsLoading(true)
      setSelectedUser(userId)
      
      // Fetch user details immediately
      const userResponse = await fetch(`/api/users/${userId}`)
      const userData = await userResponse.json()
      
      const result = await startImpersonation(userId)
      
      if ('error' in result) {
        throw new Error(result.error)
      }

      // Update local state first
      setUserDetails(userData)
      setCurrentUserName(userData.full_name || userData.email)
      
      // Emit event
      emitImpersonationEvent({ type: 'start', userId: result.userId })
      
      toast({
        title: "Impersonation started",
        description: "You are now impersonating another user",
      })

      // Force refresh context and routes
      await refresh()
      router.refresh()
    } catch (error) {
      console.error('Failed to start impersonation:', error)
      // Reset state on error
      setUserDetails(null)
      setCurrentUserName('')
      setSelectedUser('')
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start impersonation",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async () => {
    try {
      setIsLoading(true)
      
      // Clear state first
      setUserDetails(null)
      setCurrentUserName('')
      setSelectedUser('')
      
      // Emit event
      emitImpersonationEvent({ type: 'stop' })
      
      const result = await stopImpersonation()
      
      if ('error' in result) {
        throw new Error(result.error)
      }

      toast({
        title: "Impersonation stopped",
        description: "You are no longer impersonating another user",
      })
      
      // Force refresh context and routes
      await refresh()
      router.refresh()
      router.push('/superadmin/dashboard')
    } catch (error) {
      console.error('Error stopping impersonation:', error)
      
      // Revert state on error
      await refresh()
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 px-4 py-3">
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4" />
        <Label>
          {isImpersonating ? "Impersonating" : "Impersonate User"}
        </Label>
      </div>

      {isImpersonating ? (
        <>
          <div className="space-y-2">
            {/* User Info */}
            <div className="space-y-1">
              <a
                href={`/superadmin/users/${impersonatedUserId}`}
                className="font-medium hover:text-foreground inline-flex items-center gap-1 group"
              >
                {currentUserName || <Skeleton className="h-4 w-24" />}
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              {userDetails && (
                <div className="space-y-0.5">
                  <div className="text-xs text-muted-foreground">
                    {userDetails.email}
                  </div>
                  {userDetails.organization && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{userDetails.organization.name}</span>
                      {userDetails.role && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{userDetails.role}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stop Button */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full border-red-200 group",
                "text-red-600 hover:text-red-700 hover:bg-red-50",
                "animate-pulse"
              )}
              onClick={handleStop}
              disabled={isLoading || isPending}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              <span className="font-medium">Stop</span>
            </Button>
          </div>
        </>
      ) : (
        <Select 
          value={selectedUser} 
          onValueChange={handleSelect}
          disabled={isLoading || isPending}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select user..." />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[300px]">
              {users.map((user) => {
                const org = user.organization_members?.[0]?.organizations
                const role = user.organization_members?.[0]?.role
                
                return (
                  <SelectItem 
                    key={user.id} 
                    value={user.id}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {user.full_name || user.email}
                      </span>
                      {(org || role) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {org && <span>{org.name}</span>}
                          {org && role && (
                            <span className="text-muted-foreground/50">•</span>
                          )}
                          {role && <span>{role}</span>}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                )
              })}
            </ScrollArea>
          </SelectContent>
        </Select>
      )}
    </div>
  )
} 
```

# components/layout/breadcrumbs.tsx

```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useBreadcrumbs } from '@/lib/contexts/breadcrumbs-context'

export function Breadcrumbs() {
  const pathname = usePathname()
  const { organizationName, groupName } = useBreadcrumbs()
  const segments = pathname.split('/').filter(segment => segment && segment !== 'superadmin')

  console.log('Breadcrumbs Debug:', {
    pathname,
    organizationName,
    segments,
  })

  const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  const breadcrumbs = segments.map((segment, index) => {
    const isInSuperadmin = pathname.includes('/superadmin/')
    const previousSegments = segments.slice(0, index + 1)
    const href = isInSuperadmin 
      ? `/superadmin/${previousSegments.join('/')}` 
      : `/${previousSegments.join('/')}`

    let label = segment

    // Replace organization ID with name if available
    if (organizationName && segments[index - 1] === 'organizations' && isUUID(segment)) {
      console.log('Attempting to replace org ID:', {
        segment,
        isUUID: isUUID(segment),
        organizationName,
        prevSegment: segments[index - 1]
      })
      label = organizationName
    }

    // Replace group ID with name if available
    if (groupName && segments[index - 1] === 'groups' && isUUID(segment)) {
      label = groupName
    }

    // Format segment labels
    label = label
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      href,
      label,
    }
  })

  if (breadcrumbs.length === 0) return null

  return (
    <nav className="flex items-center space-x-1 px-4 py-3 text-sm md:px-6 lg:px-8">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <Link
            href={crumb.href}
            className={`ml-1 hover:text-foreground ${
              index === breadcrumbs.length - 1
                ? 'font-medium text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {crumb.label}
          </Link>
        </div>
      ))}
    </nav>
  )
} 
```

# components/layout/navbar.tsx

```tsx
import { cn } from '@/lib/utils/cn'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'

export function Navbar() {
  const { isImpersonating } = useImpersonationStatus()
  
  return (
    <nav className={cn(
      "sticky top-0 z-40 border-b bg-background/95 backdrop-blur",
      isImpersonating && "mt-12" // Add space for impersonation banner
    )}>
      {/* Your existing navbar content */}
    </nav>
  )
} 
```

# components/layout/navigation-item.tsx

```tsx
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'

interface NavigationItemProps {
  title: string
  href: string
  description?: string
}

export function NavigationItem({ title, href, description }: NavigationItemProps) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {description && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {description}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  )
} 
```

# components/layout/navigation.tsx

```tsx
'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent
} from '@/components/ui/navigation-menu'
import { Breadcrumbs } from './breadcrumbs'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const { isImpersonating } = useImpersonationStatus()
  
  return (
    <div className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isImpersonating && "mt-12",
      className
    )}>
      <div className="container flex h-14 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[400px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      {/* Dashboard menu items */}
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {/* Add other menu items */}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <Breadcrumbs />
    </div>
  )
} 
```

# components/MiddlewareMetrics.tsx

```tsx
'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

interface MetricsProps {
  data: Array<{
    name: string
    duration: number
    success: boolean
    path: string
    timestamp: string
  }>
}

export function MiddlewareMetrics({ data }: MetricsProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Middleware Performance</h2>
      <LineChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="duration" 
          stroke="#8884d8" 
          name="Duration (ms)" 
        />
      </LineChart>
    </div>
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
import { schemas } from '@/lib/validations/schemas'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const form = useForm<z.infer<typeof schemas.profileForm>>({
    resolver: zodResolver(schemas.profileForm),
    defaultValues: {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      alternative_email: profile.alternative_email || "",
      phone: profile.phone || "",
      notification_preferences: profile.notification_preferences || {
        email: true,
        sms: false,
        push: false,
      },
    },
  })

  async function onSubmit(data: z.infer<typeof schemas.profileForm>) {
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
                  <Input {...field} type="email" value={field.value || ''} />
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
                  <Input {...field} type="tel" value={field.value || ''} />
                </FormControl>
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

# components/shared/dialogs/add-organization-member-dialog.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/hooks/use-toast'
import { createClient } from '@/lib/utils/supabase/client'
import { inviteUserAction } from '@/lib/actions/users'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Database } from '@/database.types'
import { Combobox } from '@/components/ui/combobox'

type UserRole = Database['public']['Enums']['user_role']
type Profile = Database['public']['Tables']['profiles']['Row']

const inviteFormSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum(['admin', 'staff', 'ministry_leader', 'member', 'visitor'] as const)
})

interface AddOrganizationMemberDialogProps {
  organizationId?: string
  userId?: string
  onSuccess?: () => void
}

export function AddOrganizationMemberDialog({ 
  organizationId, 
  userId,
  onSuccess 
}: AddOrganizationMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<UserRole>('member')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const { toast } = useToast()
  const supabase = createClient()

  // Initialize the invite form
  const inviteForm = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      role: 'member'
    }
  })

  // Load available users
  useEffect(() => {
    async function loadUsers() {
      if (!organizationId) return

      try {
        const { data: orgMembers, error: membersError } = await supabase
          .from('organization_members')
          .select('user_id')
          .eq('organization_id', organizationId)

        if (membersError) throw membersError

        // Handle case when there are no existing members
        const existingUserIds = orgMembers?.map(m => m.user_id) || []
        const notInClause = existingUserIds.length > 0 
          ? `(${existingUserIds.join(',')})`
          : '(null)' // Use (null) when there are no existing members

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .not('id', 'in', notInClause)
          .eq('status', 'active')
          .order('full_name')

        if (profilesError) throw profilesError

        if (!profiles) {
          setUsers([])
          return
        }

        setUsers(
          profiles.map(profile => ({
            id: profile.id,
            name: profile.full_name || profile.email
          }))
        )
      } catch (error) {
        console.error('Failed to load users:', error)
        toast({
          title: 'Error',
          description: 'Failed to load available users',
          variant: 'destructive'
        })
        // Set empty array on error to prevent undefined state
        setUsers([])
      }
    }

    if (open) {
      loadUsers()
    }
  }, [open, organizationId, supabase, toast])

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!organizationId || !selectedUserId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: selectedUserId,
          role
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Member added successfully'
      })

      onSuccess?.()
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (values: z.infer<typeof inviteFormSchema>) => {
    if (!organizationId) return

    setLoading(true)
    try {
      await inviteUserAction({
        ...values,
        organization_id: organizationId,
        is_active: true,
        is_superadmin: false
      })

      toast({
        title: 'Success',
        description: 'Invitation sent successfully'
      })

      onSuccess?.()
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      // Reset existing user form
      setSelectedUserId('')
      setRole('member')
      
      // Reset invite form
      inviteForm.reset({
        email: '',
        first_name: '',
        last_name: '',
        role: 'member'
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Organization Member</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="existing">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Add Existing User</TabsTrigger>
            <TabsTrigger value="invite">Invite New User</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Combobox
                  items={users}
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  placeholder="Search for a user..."
                  emptyText="No users found"
                  className="w-full"
                  // Add these props to match Select styling
                  triggerClassName="h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  contentClassName="w-full border bg-popover text-popover-foreground shadow-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="ministry_leader">Ministry Leader</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Member'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="invite">
            <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...inviteForm.register('email')}
                  type="email"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  {...inviteForm.register('first_name')}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  {...inviteForm.register('last_name')}
                  placeholder="Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.watch('role')}
                  onValueChange={(value) => inviteForm.setValue('role', value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="ministry_leader">Ministry Leader</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
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

# components/superadmin/audit/audit-log-filters.tsx

```tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DateRange } from 'react-day-picker'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/components/ui/combobox"

interface Organization {
  id: string
  name: string
}

interface AuditLogFiltersProps {
  onFilterChange: (filters: {
    search: string
    dateRange: DateRange | null
    severity: string
    organizationId?: string
    correlationId?: string
  }) => void
  organizations: Organization[]
}

export function AuditLogFilters({ onFilterChange, organizations }: AuditLogFiltersProps) {
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [severity, setSeverity] = useState('all')
  const [organizationId, setOrganizationId] = useState<string>('')
  const [correlationId, setCorrelationId] = useState('')

  const handleFilterChange = () => {
    onFilterChange({
      search,
      dateRange,
      severity,
      organizationId: organizationId || undefined,
      correlationId: correlationId || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        <Combobox
          value={organizationId}
          onChange={setOrganizationId}
          items={organizations}
          placeholder="Select organization"
          className="w-[250px]"
        />

        <Input
          placeholder="Correlation ID"
          value={correlationId}
          onChange={(e) => setCorrelationId(e.target.value)}
          className="max-w-sm"
        />

        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
        
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleFilterChange}>Apply Filters</Button>
      </div>
    </div>
  )
} 
```

# components/superadmin/audit/audit-logs-client.tsx

```tsx
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemAuditLog } from '@/components/superadmin/audit/system-audit-log'
import { UserAuditLog } from '@/components/superadmin/audit/user-audit-log'
import { SecurityAuditLog } from '@/components/superadmin/audit/security-audit-log'
import { AuditLogFilters } from '@/components/superadmin/audit/audit-log-filters'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']
type Organization = Database['public']['Tables']['organizations']['Row']

interface AuditLogsClientProps {
  initialSystemLogs: AuditLog[]
  initialUserLogs: AuditLog[]
  initialSecurityLogs: AuditLog[]
  organizations: Pick<Organization, 'id' | 'name'>[]
}

export function AuditLogsClient({
  initialSystemLogs,
  initialUserLogs,
  initialSecurityLogs,
  organizations
}: AuditLogsClientProps) {
  const [systemLogs, setSystemLogs] = useState(initialSystemLogs)
  const [userLogs, setUserLogs] = useState(initialUserLogs)
  const [securityLogs, setSecurityLogs] = useState(initialSecurityLogs)

  const handleFilterChange = async (filters: {
    search: string
    dateRange: { from?: Date; to?: Date } | null
    severity: string
    organizationId?: string
    correlationId?: string
  }) => {
    try {
      const params = new URLSearchParams({
        ...filters,
        dateRange: filters.dateRange ? JSON.stringify({
          from: filters.dateRange.from?.toISOString(),
          to: filters.dateRange.to?.toISOString()
        }) : '',
        search: filters.search || '',
        severity: filters.severity || '',
        organizationId: filters.organizationId || '',
        correlationId: filters.correlationId || ''
      })

      const response = await fetch('/api/audit/logs?' + params)
      
      if (!response.ok) throw new Error('Failed to fetch filtered logs')
      
      const data = await response.json()
      setSystemLogs(data.systemLogs || [])
      setUserLogs(data.userLogs || [])
      setSecurityLogs(data.securityLogs || [])
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            Monitor system activity and user actions
          </p>
        </div>
      </div>

      <AuditLogFilters 
        organizations={organizations}
        onFilterChange={handleFilterChange}
      />

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System ({systemLogs.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({userLogs.length})</TabsTrigger>
          <TabsTrigger value="security">Security ({securityLogs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          {systemLogs.length > 0 ? (
            <SystemAuditLog logs={systemLogs} />
          ) : (
            <p className="text-muted-foreground text-center py-4">No system logs found</p>
          )}
        </TabsContent>

        <TabsContent value="users">
          {userLogs.length > 0 ? (
            <UserAuditLog logs={userLogs} />
          ) : (
            <p className="text-muted-foreground text-center py-4">No user logs found</p>
          )}
        </TabsContent>

        <TabsContent value="security">
          {securityLogs.length > 0 ? (
            <SecurityAuditLog logs={securityLogs} />
          ) : (
            <p className="text-muted-foreground text-center py-4">No security logs found</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 
```

# components/superadmin/audit/security-audit-log.tsx

```tsx
'use client'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']
type AuditEventType = Database['public']['Enums']['audit_event_type']

interface SecurityAuditLogProps {
  logs: AuditLog[]
}

// Helper function to determine badge variant
function getBadgeVariant(eventType: AuditEventType, details: string): 'destructive' | 'default' {
  if (eventType === 'error' || eventType === 'security') {
    return 'destructive'
  }
  
  // Check details for auth failures
  if (eventType === 'auth' && details.toLowerCase().includes('failed')) {
    return 'destructive'
  }
  
  return 'default'
}

export function SecurityAuditLog({ logs }: SecurityAuditLogProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>User</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {formatDistanceToNow(new Date(log.created_at!), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(log.event_type, log.details)}>
                  {log.event_type}
                </Badge>
              </TableCell>
              <TableCell>{log.user_id}</TableCell>
              <TableCell>{(log.metadata as any)?.ip_address || '—'}</TableCell>
              <TableCell>{log.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 
```

# components/superadmin/audit/system-audit-log.tsx

```tsx
'use client'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']

interface SystemAuditLogProps {
  logs: AuditLog[]
}

export function SystemAuditLog({ logs }: SystemAuditLogProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Organization</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {formatDistanceToNow(new Date(log.created_at!), { addSuffix: true })}
              </TableCell>
              <TableCell>{log.event_type}</TableCell>
              <TableCell>{log.details}</TableCell>
              <TableCell>{log.user_id}</TableCell>
              <TableCell>{log.organization_id || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 
```

# components/superadmin/audit/user-audit-log.tsx

```tsx
'use client'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']

interface UserAuditLogProps {
  logs: AuditLog[]
}

export function UserAuditLog({ logs }: UserAuditLogProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Organization</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {formatDistanceToNow(new Date(log.created_at!), { addSuffix: true })}
              </TableCell>
              <TableCell>{log.user_id}</TableCell>
              <TableCell>{log.event_type}</TableCell>
              <TableCell>{log.details}</TableCell>
              <TableCell>{log.organization_id || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 
```

# components/superadmin/groups/superadmin-groups-list.tsx

```tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Users, Building2 } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/database.types'

// Define types using Database type
type BaseGroup = Database['public']['Tables']['groups']['Row']
type BaseOrganization = Database['public']['Tables']['organizations']['Row']

type SuperadminGroup = BaseGroup & {
  members_count: number
  organization: {
    name: string
    slug: string
  }
}

interface SuperadminGroupsListProps {
  groups: SuperadminGroup[]
  organizations: BaseOrganization[]
}

// Helper function to format group type for display
const formatGroupType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function SuperadminGroupsList({ groups, organizations }: SuperadminGroupsListProps) {
  const [selectedOrg, setSelectedOrg] = useState<string>('all')
  
  // Filter groups based on selected organization
  const filteredGroups = selectedOrg === 'all' 
    ? groups 
    : groups.filter(group => group.organization_id === selectedOrg)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Groups Management</h2>
          <p className="text-muted-foreground">
            Manage groups across all organizations
          </p>
        </div>
        <Link href="/superadmin/groups/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Groups</CardTitle>
            <div className="w-[200px]">
              <Select
                value={selectedOrg}
                onValueChange={setSelectedOrg}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {group.organization.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatGroupType(group.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {group.members_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {group.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/superadmin/groups/${group.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredGroups.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No groups found
              {selectedOrg !== 'all' && ' for the selected organization'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
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

# components/superadmin/navigation.tsx

```tsx
import { Building2, Users, Plus } from 'lucide-react'

export const superadminNavItems = [
  {
    title: "Organizations",
    href: "/superadmin/organizations",
    icon: Building2
  },
  {
    title: "Users",
    href: "/superadmin/users",
    icon: Users
  },
  {
    title: "Onboard Tenant",
    href: "/superadmin/onboarding",
    icon: Plus
  }
  // ... other navigation items
] 
```

# components/superadmin/onboarding/tenant-onboarding-form.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { formatPhoneNumber } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'
import type { Database } from '@/database.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimezoneField } from "@/components/ui/form/timezone-field"
import { TIMEZONE_OPTIONS } from "@/components/ui/form/timezone-field"
import { AddressField } from "@/components/ui/form/address-field"
import { useToast } from '@/components/hooks/use-toast'

type Organization = Database['public']['Tables']['organizations']['Insert']
type Profile = Database['public']['Tables']['profiles']['Insert']

const onboardingSchema = z.object({
  organization: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    website_url: z.union([
      z.string().url(),
      z.string().length(0),
      z.null()
    ]).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).default('active'),
    timezone: z.string()
      .min(1, 'Please select a timezone')
      .refine(
        (val: string) => TIMEZONE_OPTIONS.some((tz) => tz.value === val),
        'Invalid timezone selection'
      ),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().default('US'),
    }).optional(),
    settings: z.object({
      features_enabled: z.array(z.string()).default([]),
      theme: z.string().default('light'),
      branding: z.object({
        logo_url: z.string().optional(),
        primary_color: z.string().optional(),
      }).optional(),
      email_templates: z.record(z.unknown()).optional(),
    }).default({}),
    limits: z.object({
      max_users: z.number().default(5),
      max_storage_gb: z.number().default(10),
    }).default({ max_users: 5, max_storage_gb: 10 }),
  }),
  admin: z.object({
    email: z.string().email(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    phone: z.string().optional(),
    notification_preferences: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      push: z.boolean().default(true),
    }).default({}),
  }),
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

interface TenantOnboardingFormProps {
  existingOrganizations: Database['public']['Tables']['organizations']['Row'][]
}

const steps = [
  {
    title: 'Organization Details',
    description: 'Basic information about your organization',
    fields: [
      'organization.name',
      'organization.slug',
      'organization.website_url',
      'organization.timezone',
      'organization.address'
    ]
  },
  {
    title: 'Admin User',
    description: 'Set up the organization administrator',
    fields: [
      'admin.first_name',
      'admin.last_name',
      'admin.email',
      'admin.phone'
    ]
  }
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Enforce max length of 50
}

export function TenantOnboardingForm({ existingOrganizations }: TenantOnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      organization: {
        status: 'active',
        timezone: TIMEZONE_OPTIONS[0].value
      }
    }
  })

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'organization.name') {
        const nameValue = value.organization?.name
        if (nameValue) {
          const slug = generateSlug(nameValue)
          form.setValue('organization.slug', slug, { 
            shouldValidate: true,
            shouldDirty: true 
          })
        }
      }
    })
    
    return () => subscription.unsubscribe()
  }, [form])

  const progress = ((currentStep + 1) / steps.length) * 100

  async function onSubmit(data: z.infer<typeof onboardingSchema>) {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/superadmin/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create organization')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Organization created successfully",
      })
      
      router.push('/superadmin/organizations')
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create organization'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    const currentFields = steps[currentStep].fields
    const result = await form.trigger(currentFields as any[])
    
    if (!result) {
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      form.handleSubmit(onSubmit)()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleNext()
      }} className="space-y-6">
        <Progress value={progress} className="h-2" />
        
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentStep === 0 && (
              <>
                <FormField
                  control={form.control}
                  name="organization.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization.slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Slug</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} readOnly />
                      </FormControl>
                      <FormDescription>
                        Automatically generated from organization name. Used in URLs and must be unique.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization.website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL (Optional)</FormLabel>
                      <FormControl>
                        <Input type="url" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AddressField
                  control={form.control}
                  name="organization.address"
                  label="Organization Address"
                  description="Primary business address"
                />
                <TimezoneField 
                  control={form.control}
                  name="organization.timezone"
                />
              </>
            )}

            {currentStep === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="admin.first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin.last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="123-456-7890"
                          onChange={e => field.onChange(formatPhoneNumber(e.target.value))}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : currentStep === steps.length - 1 ? (
                'Create Organization'
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
} 
```

# components/superadmin/organizations/organization-edit-form.tsx

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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/lib/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { OrganizationWithStats } from "@/lib/dal/repositories/organization"
import { updateOrganizationSettings } from "@/lib/actions/organization"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }),
  description: z.string().optional(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']),
  timezone: z.string().optional().nullable(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),
  settings: z.object({
    features_enabled: z.array(z.string()).optional(),
    branding: z.object({
      logo_url: z.string().optional(),
      primary_color: z.string().optional(),
    }).optional(),
    email_templates: z.record(z.unknown()).optional(),
  }).optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface OrganizationEditFormProps {
  organization: OrganizationWithStats
}

export function OrganizationEditForm({ organization }: OrganizationEditFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
      description: organization.description || '',
      contact_email: organization.contact_email,
      contact_phone: organization.contact_phone,
      website_url: organization.website_url,
      status: organization.status as 'active' | 'inactive' | 'suspended',
      timezone: organization.timezone,
      address: organization.address as any || {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      },
      settings: organization.settings,
    },
  })

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'settings') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value?.toString() || '')
        }
      })
      formData.append('id', organization.id)

      await updateOrganizationSettings(formData)
      
      toast({
        title: "Success",
        description: "Organization updated successfully",
      })
      
      router.push(`/superadmin/organizations/${organization.id}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The display name of the organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The URL-friendly name of the organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email"
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel"
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="url"
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  value={field.value || ''} 
                  placeholder="e.g. America/New_York"
                />
              </FormControl>
              <FormDescription>
                Organization's primary timezone
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 
```

# components/superadmin/organizations/organization-groups-tab.tsx

```tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Users } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/database.types'

type BaseGroup = Database['public']['Tables']['groups']['Row']

type GroupWithCount = BaseGroup & {
  members_count: number
}

interface OrganizationGroupsTabProps {
  organizationId: string
  groups: GroupWithCount[]
}

const formatGroupType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function OrganizationGroupsTab({ organizationId, groups }: OrganizationGroupsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <CardTitle>Groups</CardTitle>
        <Link href={`/superadmin/organizations/${organizationId}/groups/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatGroupType(group.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {group.members_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {group.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/superadmin/organizations/${organizationId}/groups/${group.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {groups.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No groups found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
```

# components/superadmin/organizations/organization-members-tab.tsx

```tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import type { MemberWithProfile } from '@/lib/dal/repositories/organization-member'
import { useToast } from '@/lib/hooks/use-toast'
import { AddOrganizationMemberDialog } from '@/components/shared/dialogs/add-organization-member-dialog'

interface OrganizationMembersTabProps {
  organizationId: string
}

export function OrganizationMembersTab({ organizationId }: OrganizationMembersTabProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const handleRemoveMember = async (memberId: string) => {
    try {
      // Implementation here
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive',
      })
    }
  }

  const refreshMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profile:profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organizationId)

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Failed to load members:', error)
      toast({
        title: 'Error',
        description: 'Failed to load organization members',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function loadMembers() {
      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select(`
            *,
            profile:profiles (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('organization_id', organizationId)

        if (error) throw error
        setMembers(data || [])
      } catch (error) {
        console.error('Failed to load members:', error)
        toast({
          title: 'Error',
          description: 'Failed to load organization members',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadMembers()
  }, [organizationId, supabase, toast])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                Manage organization members and their roles
              </CardDescription>
            </div>
            <AddOrganizationMemberDialog 
              organizationId={organizationId}
              onSuccess={refreshMembers}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">
                    {member.profile?.full_name || member.profile?.email || '—'}
                  </TableCell>
                  <TableCell>{member.profile?.email || '—'}</TableCell>
                  <TableCell>
                    <Badge>{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.user_id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 
```

# components/superadmin/organizations/organization-profile-tab.tsx

```tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PencilIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/lib/hooks/use-toast'
import type { OrganizationWithStats } from '@/lib/dal/repositories/organization'
import type { AvailableFeature } from '@/lib/types/organization'
import { AVAILABLE_FEATURES } from '@/lib/types/organization'
import Link from 'next/link'

interface OrganizationProfileTabProps {
  organization: OrganizationWithStats
}

export function OrganizationProfileTab({ organization }: OrganizationProfileTabProps) {
  const { toast } = useToast()

  const handleError = (error: Error) => {
    toast({
      title: 'Error',
      description: error.message || 'An unexpected error occurred',
      variant: 'destructive',
    })
  }

  const getFeatures = (): AvailableFeature[] => {
    if (!organization.settings?.features_enabled) return []
    const features = Array.isArray(organization.settings.features_enabled)
      ? organization.settings.features_enabled
      : typeof organization.settings.features_enabled === 'string'
      ? JSON.parse(organization.settings.features_enabled)
      : []
    
    return features.filter((feature: string): feature is AvailableFeature => 
      AVAILABLE_FEATURES.includes(feature as AvailableFeature)
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                View and manage organization details
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/superadmin/organizations/${organization.id}/edit`}>
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium">Basic Information</h3>
              <dl className="mt-2 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Organization Name</dt>
                  <dd className="font-medium">{organization.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Slug</dt>
                  <dd className="font-medium">{organization.slug}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant={organization.status === 'active' ? 'success' : 'secondary'}>
                      {organization.status || 'Unknown'}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{organization.created_at ? formatDate(organization.created_at) : '—'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-medium">Contact Details</h3>
              <dl className="mt-2 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{organization.contact_email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{organization.contact_phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>{organization.website_url || '—'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {organization.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{organization.description}</p>
            </div>
          )}

          {organization.settings?.features_enabled && (
            <div>
              <h3 className="font-medium mb-2">Features Enabled</h3>
              <div className="flex flex-wrap gap-2">
                {getFeatures().map((feature) => (
                  <Badge key={feature} variant="outline">{feature}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.memberCount}</div>
          </CardContent>
        </Card>
        {/* Add more stat cards here as needed */}
      </div>
    </div>
  )
}
```

# components/superadmin/organizations/organization-settings-tab.tsx

```tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/lib/hooks/use-toast'
import { useState } from 'react'
import type { OrganizationWithStats } from '@/lib/dal/repositories/organization'
import type { AvailableFeature } from '@/lib/types/organization'
import { AVAILABLE_FEATURES } from '@/lib/types/organization'
import { updateOrganizationSettings } from '@/lib/actions/organization'

interface OrganizationSettingsTabProps {
  organization: OrganizationWithStats
}

export function OrganizationSettingsTab({ organization }: OrganizationSettingsTabProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  
  const getInitialFeatures = (): AvailableFeature[] => {
    if (!organization.settings?.features_enabled) return []
    const features = Array.isArray(organization.settings.features_enabled)
      ? organization.settings.features_enabled
      : typeof organization.settings.features_enabled === 'string'
      ? JSON.parse(organization.settings.features_enabled)
      : []
    
    return features.filter((feature: string): feature is AvailableFeature => 
      AVAILABLE_FEATURES.includes(feature as AvailableFeature)
    )
  }
  
  const [features, setFeatures] = useState<AvailableFeature[]>(getInitialFeatures())

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData(event.currentTarget)
      formData.set('settings', JSON.stringify({ 
        ...organization.settings,
        features_enabled: features 
      }))
      
      await updateOrganizationSettings(formData)
      
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure your organization's basic settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={organization.name}
              placeholder="Enter organization name"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Enable or disable features for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {AVAILABLE_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={features.includes(feature)}
                  onCheckedChange={(checked) => {
                    setFeatures(prev => 
                      checked 
                        ? [...prev, feature]
                        : prev.filter(f => f !== feature)
                    )
                  }}
                />
                <Label htmlFor={feature} className="capitalize">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
} 
```

# components/superadmin/organizations/organizations-table.tsx

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
import { MoreHorizontalIcon, PencilIcon, TrashIcon, UsersIcon, SettingsIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useToast } from "@/lib/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Database } from '@/database.types'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']

interface OrganizationTableItem extends Pick<OrganizationRow, 'id' | 'name' | 'slug' | 'status' | 'contact_email' | 'created_at'> {
  memberCount?: number
  settings?: {
    features_enabled?: string[]
    [key: string]: any
  } | null
}

interface OrganizationsTableProps {
  organizations: OrganizationTableItem[]
}

export function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  const { toast } = useToast()
  const router = useRouter()

  const getOrganizationStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFeaturesEnabled = (settings: any) => {
    const features = settings?.features_enabled || []
    return features.length > 0 ? (
      <div className="flex gap-1">
        {features.map((feature: string) => (
          <Badge key={feature} variant="outline">{feature}</Badge>
        ))}
      </div>
    ) : (
      '—'
    )
  }

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                <Link 
                  href={`/superadmin/organizations/${org.id}`}
                  className="hover:underline font-medium"
                >
                  {org.name}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {org.slug}
                </div>
              </TableCell>
              <TableCell>{getOrganizationStatusBadge(org.status)}</TableCell>
              <TableCell>{org.contact_email || '—'}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {org.memberCount || 0} members
                </Badge>
              </TableCell>
              <TableCell>{getFeaturesEnabled(org.settings)}</TableCell>
              <TableCell>{org.created_at ? formatDate(org.created_at) : '—'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/superadmin/organizations/${org.id}`}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/superadmin/organizations/${org.id}/members`}>
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Manage Members
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/superadmin/organizations/${org.id}/settings`}>
                        <SettingsIcon className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        // TODO: Implement delete organization
                        toast({
                          title: "Not implemented",
                          description: "Delete organization functionality coming soon",
                        })
                      }}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
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

# components/superadmin/sidebar-nav.tsx

```tsx
'use client'

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/ui/sidebar/sidebar"
import { SidebarItem } from "@/components/ui/sidebar/sidebar-item"
import { SidebarSection } from "@/components/ui/sidebar/sidebar-section"
import { SidebarFooter } from "@/components/ui/sidebar/sidebar-footer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImpersonationUserList } from "@/components/impersonation/user-list"
import type { Profile } from "@/lib/types/auth"
import { superAdminNavItems } from "@/lib/config/navigation"

interface SuperAdminSidebarNavProps {
  profile: Profile
}

export function SuperAdminSidebarNav({ profile }: SuperAdminSidebarNavProps) {
  const pathname = usePathname()

  return (
    <Sidebar defaultCollapsed={false}>
      <div className="flex h-full flex-col">
        <div className="flex h-[60px] items-center px-4">
          <h2 className="text-lg font-semibold">Admin Console</h2>
        </div>
        
        <ScrollArea className="flex-1 px-4">
          {superAdminNavItems.map((section) => (
            <SidebarSection
              key={section.title}
              title={section.title}
              className="mb-4"
            >
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={pathname === item.href}
                />
              ))}
            </SidebarSection>
          ))}
        </ScrollArea>

        <div className="px-4 py-2">
          <ImpersonationUserList />
        </div>
        
        <SidebarFooter profile={profile} />
      </div>
    </Sidebar>
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

# components/superadmin/stats-dashboard.tsx

```tsx
import { requireSuperAdmin } from '@/lib/auth/permissions'

export async function StatsDashboard() {
  // This will throw an error if not superadmin
  const profile = await requireSuperAdmin()
  
  return (
    <div>
      <h2>Admin Stats</h2>
      {/* Your component content */}
    </div>
  )
} 
```

# components/superadmin/user-management.tsx

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserTable } from './users/user-table'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export function UserManagement() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button 
          onClick={() => router.push('/superadmin/users/invite')}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>
      
      <UserTable setIsLoading={setIsLoading} />
    </div>
  )
} 
```

# components/superadmin/users/user-dashboard.tsx

```tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/utils/supabase/client'
import { toast } from "@/components/hooks/use-toast"
import { 
  MailIcon, 
  KeyIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { formatDate } from "@/lib/utils"
import type { Profile } from "@/lib/types/auth"

interface UserDashboardProps {
  user: Profile
}

export function UserDashboard({ user }: UserDashboardProps) {
  const supabase = createClient()

  // Send magic link
  const sendMagicLink = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
      })
      if (error) throw error
      
      toast({
        title: "Magic link sent",
        description: "Check your email for the login link",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send magic link",
        variant: "destructive",
      })
    }
  }

  // Send password reset email
  const sendResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error

      toast({
        title: "Password reset email sent",
        description: "Check your email to reset your password",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      })
    }
  }

  // Force reauthentication
  const forceReauthentication = async () => {
    try {
      const { error } = await supabase.auth.refreshSession()
      if (error) throw error

      toast({
        title: "Success",
        description: "User will need to reauthenticate on next login",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to force reauthentication",
        variant: "destructive", 
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge variant={user.is_active ? "default" : "destructive"}>
                {user.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.organization_members?.map((member) => (
                <Badge key={member.organizations.id} variant="secondary">
                  {member.organizations.name} ({member.role})
                </Badge>
              )) || <p className="text-sm text-muted-foreground">No organizations</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>Created: {formatDate(user.created_at)}</p>
              {user.last_login && (
                <p>Last Login: {formatDate(user.last_login)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              onClick={sendMagicLink}
              className="flex items-center gap-2"
            >
              <MailIcon className="h-4 w-4" />
              Send Magic Link
            </Button>

            <Button 
              variant="outline"
              onClick={sendResetPassword}
              className="flex items-center gap-2"
            >
              <KeyIcon className="h-4 w-4" />
              Reset Password
            </Button>

            <Button 
              variant="outline"
              onClick={forceReauthentication}
              className="flex items-center gap-2"
            >
              <RefreshCwIcon className="h-4 w-4" />
              Force Reauthentication
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
```

# components/superadmin/users/user-form.tsx

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/utils/supabase/client'
import { toast } from '@/components/hooks/use-toast'
import type { Profile } from '@/lib/types/auth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { schemas } from '@/lib/validations/schemas'

interface UserFormProps {
  user: Profile
  organizations: Array<{ id: string; name: string }>
}

export function UserForm({ user, organizations }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof schemas.userForm>>({
    resolver: zodResolver(schemas.userForm),
    defaultValues: {
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      alternative_email: user.alternative_email ?? '',
      phone: user.phone ?? '',
      is_active: user.is_active ?? true,
      is_superadmin: user.is_superadmin ?? false,
      status: user.status ?? 'active',
      notification_preferences: user.notification_preferences ?? {
        email: true,
        sms: false,
        push: false
      },
      organization_id: user.organization_members?.[0]?.organizations.id ?? '',
      role: user.organization_members?.[0]?.role ?? 'member'
    },
  })

  async function onSubmit(values: z.infer<typeof schemas.userForm>) {
    setIsLoading(true)
    try {
      // Update profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          alternative_email: values.alternative_email || null,
          phone: values.phone || null,
          is_active: values.is_active,
          is_superadmin: values.is_superadmin,
          status: values.status,
          notification_preferences: values.notification_preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw new Error(profileError.message)
      }

      // If organization_id is 'none' or empty, remove from all organizations
      if (!values.organization_id || values.organization_id === 'none') {
        const { error: deleteError } = await supabase
          .from('organization_members')
          .delete()
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('Organization removal error:', deleteError)
          throw new Error(deleteError.message)
        }
      } else {
        // Check if user is already in the organization
        const { data: existingMembership, error: membershipCheckError } = await supabase
          .from('organization_members')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (membershipCheckError && membershipCheckError.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Membership check error:', membershipCheckError)
          throw new Error(membershipCheckError.message)
        }

        if (existingMembership) {
          // Update existing membership
          const { error: updateError } = await supabase
            .from('organization_members')
            .update({
              organization_id: values.organization_id,
              role: values.role,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingMembership.id)

          if (updateError) {
            console.error('Membership update error:', updateError)
            throw new Error(updateError.message)
          }
        } else {
          // Create new membership
          const { error: insertError } = await supabase
            .from('organization_members')
            .insert({
              user_id: user.id,
              organization_id: values.organization_id,
              role: values.role,
              joined_date: new Date().toISOString()
            })

          if (insertError) {
            console.error('Membership insert error:', insertError)
            throw new Error(insertError.message)
          }
        }
      }

      toast({
        title: 'Success',
        description: 'User updated successfully',
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred while updating user',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value ?? undefined}
                value={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
              <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
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

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <FormDescription>
                    Allow user to access the system
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
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
                  <FormDescription>
                    Grant full system access
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
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
import { inviteUserAction } from '@/lib/actions/users'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { type Database } from '@/database.types'
import { schemas } from '@/lib/validations/schemas'

type UserRole = Database['public']['Enums']['user_role']

interface UserInviteFormProps {
  organizations: Array<{ id: string; name: string }>
}

export function UserInviteForm({ organizations }: UserInviteFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<z.infer<typeof schemas.userInviteForm>>({
    resolver: zodResolver(schemas.userInviteForm),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      role: "member",
      is_active: true,
      is_superadmin: false,
      organization_id: "",
    },
  })

  async function onSubmit(values: z.infer<typeof schemas.userInviteForm>) {
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
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization (required)" />
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
                defaultValue={field.value ?? ""}
                value={field.value ?? ""}
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
                  checked={field.value ?? false}
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
                  checked={field.value ?? false}
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

# components/superadmin/users/user-organizations-tab.tsx

```tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Profile } from '@/lib/types/auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AddOrganizationMemberDialog } from '@/components/shared/dialogs/add-organization-member-dialog'
import { useRouter } from 'next/navigation'

interface UserOrganizationsTabProps {
  user: Profile
}

export function UserOrganizationsTab({ user }: UserOrganizationsTabProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                Manage user organization memberships
              </CardDescription>
            </div>
            <AddOrganizationMemberDialog 
              userId={user.id}
              onSuccess={() => router.refresh()}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.organization_members?.map((member) => (
                <TableRow key={member.organizations.id}>
                  <TableCell>{member.organizations.name}</TableCell>
                  <TableCell>
                    <Badge>{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!user.organization_members || user.organization_members.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No organization memberships
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 
```

# components/superadmin/users/user-profile-tab.tsx

```tsx
'use client'

import { UserForm } from './user-form'
import type { Profile } from '@/lib/types/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UserProfileTabProps {
  user: Profile
}

export function UserProfileTab({ user }: UserProfileTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update user profile information and settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserForm user={user} organizations={[]} />
      </CardContent>
    </Card>
  )
} 
```

# components/superadmin/users/user-table.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Edit2 } from 'lucide-react'
import type { Profile } from '@/lib/types/auth'

interface UserTableProps {
  setIsLoading: (loading: boolean) => void
}

export function UserTable({ setIsLoading }: UserTableProps) {
  const router = useRouter()
  const [users, setUsers] = useState<Profile[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            organization_members (
              organizations (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [supabase, setIsLoading])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Organizations</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name || '—'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.organization_members?.map(member => 
                  member.organizations.name
                ).join(', ') || '—'}
              </TableCell>
              <TableCell>
                {user.is_superadmin ? 'Superadmin' : 'User'}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/superadmin/users/${user.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
import { MoreHorizontalIcon, PencilIcon, TrashIcon, ShieldAlertIcon, MailIcon, BanIcon, CheckCircleIcon } from 'lucide-react'
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
import { useToast } from "@/lib/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from '@/lib/utils/supabase/client'
import { resendInvitation, suspendUser, reactivateUser } from '@/lib/actions/user-management'
import type { Database } from '@/database.types'

interface UsersTableProps {
  users: Array<{
    id: string
    email: string
    full_name: string
    status: 'invited' | 'active' | 'inactive' | 'suspended' | 'deleted'
    is_active: boolean
    is_superadmin: boolean
    created_at: string
    invitation_sent_at?: string | null
    last_active_at?: string | null
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

  const getUserStatusBadge = (user: UsersTableProps['users'][0]) => {
    switch (user.status) {
      case 'invited':
        return <Badge variant="warning">Invited</Badge>
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'deleted':
        return <Badge variant="outline">Deleted</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getLastActivity = (user: UsersTableProps['users'][0]) => {
    if (user.status === 'invited' && user.invitation_sent_at) {
      return `Invited ${formatDate(user.invitation_sent_at)}`
    }
    if (user.last_active_at) {
      return `Active ${formatDate(user.last_active_at)}`
    }
    return 'Never'
  }

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link 
                  href={`/superadmin/users/${user.id}`}
                  className="hover:underline"
                >
                  {user.full_name || '—'}
                </Link>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getUserStatusBadge(user)}</TableCell>
              <TableCell>
                {user.organization_members?.[0]?.organizations.name || '—'}
              </TableCell>
              <TableCell>
                {user.is_superadmin ? (
                  <Badge variant="secondary">Superadmin</Badge>
                ) : (
                  <Badge>{user.organization_members?.[0]?.role || 'Member'}</Badge>
                )}
              </TableCell>
              <TableCell>{getLastActivity(user)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href={`/superadmin/users/${user.id}`}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    {user.status === 'invited' && (
                      <DropdownMenuItem onClick={() => resendInvitation(user.id)}>
                        <MailIcon className="w-4 h-4 mr-2" />
                        Resend Invitation
                      </DropdownMenuItem>
                    )}
                    {user.status === 'active' && (
                      <DropdownMenuItem onClick={() => suspendUser(user.id)}>
                        <BanIcon className="w-4 h-4 mr-2" />
                        Suspend User
                      </DropdownMenuItem>
                    )}
                    {user.status === 'suspended' && (
                      <DropdownMenuItem onClick={() => reactivateUser(user.id)}>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Reactivate User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(user.id, user.email)}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
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

import { cn } from "@/lib/utils/cn"
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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white",
        warning: "border-transparent bg-yellow-500 text-white",
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

import { cn } from "@/lib/utils/cn"

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

# components/ui/breadcrumbs.tsx

```tsx
import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface BreadcrumbsProps {
  items: Array<{
    title: string
    href: string
  }>
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {index === items.length - 1 ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
} 
```

# components/ui/button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"
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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

# components/ui/combobox.tsx

```tsx
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  items: Array<{ id: string; name: string }>
  placeholder?: string
  emptyText?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function Combobox({
  value,
  onChange,
  items,
  placeholder = "Select...",
  emptyText = "No items found.",
  className,
  triggerClassName,
  contentClassName,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className, triggerClassName)}
        >
          {value
            ? items.find((item) => item.id === value)?.name
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", className, contentClassName)}>
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const ComboboxTrigger = PopoverTrigger
export const ComboboxContent = PopoverContent
export const ComboboxInput = CommandInput
export const ComboboxItem = CommandItem 
```

# components/ui/command.tsx

```tsx
"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils/cn"
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

# components/ui/date-range-picker.tsx

```tsx
'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { addDays, format } from 'date-fns'
import { DateRange, SelectRangeEventHandler } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateRangePickerProps {
  value?: DateRange | null
  onChange?: (date: DateRange | null) => void
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | null>(value || null)

  React.useEffect(() => {
    if (value) {
      setDate(value)
    }
  }, [value])

  const handleSelect: SelectRangeEventHandler = (newDate) => {
    setDate(newDate || null)
    onChange?.(newDate || null)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date as DateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 
```

# components/ui/dialog.tsx

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"
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

# components/ui/form/address-field.tsx

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { type Control, useFormContext } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Script from 'next/script'

declare global {
  interface Window {
    google: typeof google;
  }
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface AddressFieldProps {
  control: Control<any>
  name: string
  label?: string
  description?: string
}

export function AddressField({ 
  control, 
  name,
  label = "Address",
  description
}: AddressFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const form = useFormContext()

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !inputRef.current || autocompleteRef.current) return

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: ['us'] },
        fields: ['address_components', 'formatted_address'],
        types: ['address']
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (!place?.address_components) return

        const addressData = {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'US'
        }

        place.address_components.forEach((component: AddressComponent) => {
          const type = component.types[0]
          switch (type) {
            case 'street_number':
              addressData.street = component.long_name
              break
            case 'route':
              addressData.street = addressData.street 
                ? `${addressData.street} ${component.long_name}`
                : component.long_name
              break
            case 'locality':
              addressData.city = component.long_name
              break
            case 'administrative_area_level_1':
              addressData.state = component.short_name
              break
            case 'postal_code':
              addressData.postal_code = component.long_name
              break
          }
        })

        form.setValue(`${name}.street`, place.formatted_address || '', {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        form.setValue(`${name}.city`, addressData.city, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        form.setValue(`${name}.state`, addressData.state, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        form.setValue(`${name}.postal_code`, addressData.postal_code, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
        form.setValue(`${name}.country`, addressData.country, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        })
      })
    }

    if (window.google) {
      initAutocomplete()
    } else {
      window.addEventListener('google-maps-ready', initAutocomplete)
      return () => {
        window.removeEventListener('google-maps-ready', initAutocomplete)
      }
    }
  }, [form, name])

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={() => {
          window.dispatchEvent(new Event('google-maps-ready'))
        }}
      />
      <FormField
        control={control}
        name={`${name}.street`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input 
                {...field}
                ref={inputRef}
                placeholder="Enter your address"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
} 
```

# components/ui/form/timezone-field.tsx

```tsx
'use client'

import { type Control } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
] as const

interface TimezoneFieldProps {
  control: Control<any>
  name: string
  label?: string
  description?: string
}

export function TimezoneField({ 
  control, 
  name, 
  label = "Timezone",
  description = "Organization's primary timezone for scheduling and reporting"
}: TimezoneFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((timezone) => (
                <SelectItem key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 
```

# components/ui/input.tsx

```tsx
import * as React from "react"

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"
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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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

import { useIsMobile } from "@/lib/hooks/use-mobile"
import { cn } from "@/lib/utils/utils"
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

# components/ui/sidebar/sidebar-footer.tsx

```tsx
import { ThemeSwitcher } from "@/components/theme-switcher"
import { HeaderAuth } from "@/components/header-auth"
import { Separator } from "@/components/ui/separator"
import type { Profile, OrganizationMember } from "@/lib/types/auth"
import { cn } from "@/lib/utils/cn"

interface SidebarFooterProps {
  profile: Profile
  membership?: OrganizationMember | null
  isCollapsed?: boolean
}

export function SidebarFooter({ 
  profile, 
  membership = null, 
  isCollapsed 
}: SidebarFooterProps) {
  return (
    <div className="mt-auto pt-4 sticky bottom-0 bg-background/60 backdrop-blur-sm">
      <Separator className="mb-4" />
      <div className={cn(
        "px-2 flex gap-2",
        isCollapsed 
          ? "flex-col items-center" 
          : "items-center justify-between flex-wrap"
      )}>
        <ThemeSwitcher />
        <HeaderAuth profile={profile} membership={membership} />
      </div>
    </div>
  )
} 
```

# components/ui/sidebar/sidebar-item.tsx

```tsx
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"

interface SidebarItemProps {
  href: string
  icon: LucideIcon
  title: string
  isActive?: boolean
  isCollapsed?: boolean
  isDisabled?: boolean
  badge?: React.ReactNode
}

export function SidebarItem({
  href,
  icon: Icon,
  title,
  isActive,
  isCollapsed,
  isDisabled,
  badge
}: SidebarItemProps) {
  const MenuItem = (
    <Link
      href={href}
      className={cn(
        "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium",
        "hover:bg-accent/50 hover:text-accent-foreground",
        "transition-colors duration-200 ease-in-out",
        "min-h-[40px]",
        isActive && "bg-accent text-accent-foreground",
        isDisabled && "pointer-events-none opacity-50",
        isCollapsed && "justify-center"
      )}
    >
      <Icon className={cn(
        "h-4 w-4 shrink-0",
        isActive ? "text-current" : "text-muted-foreground group-hover:text-current"
      )} />
      {!isCollapsed && (
        <>
          <span className="ml-3 flex-1 truncate">{title}</span>
          {badge && (
            <span className="ml-2 flex-shrink-0">{badge}</span>
          )}
        </>
      )}
    </Link>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {MenuItem}
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="flex items-center gap-4 bg-background/80 backdrop-blur-lg"
          >
            {title}
            {badge}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return MenuItem
} 
```

# components/ui/sidebar/sidebar-section.tsx

```tsx
import { cn } from "@/lib/utils/cn"

interface SidebarSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  isCollapsed?: boolean
}

export function SidebarSection({
  title,
  children,
  className,
  isCollapsed
}: SidebarSectionProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {title && !isCollapsed && (
        <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
} 
```

# components/ui/sidebar/sidebar.tsx

```tsx
"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { ChevronLeft, Menu } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMounted } from "@/lib/hooks/use-mounted"

interface SidebarProps {
  children: React.ReactNode
  className?: string
  defaultCollapsed?: boolean
}

const sidebarVariants = cva(
  "relative flex flex-col border-r bg-background/60 backdrop-blur-xl transition-all duration-300 ease-in-out",
  {
    variants: {
      collapsed: {
        true: "w-[70px]",
        false: "w-[280px]",
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
)

export function Sidebar({ 
  children, 
  className,
  defaultCollapsed = false 
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [isOpen, setIsOpen] = React.useState(false)
  const mounted = useMounted()
  
  // Create a context value for child components
  const contextValue = React.useMemo(
    () => ({ collapsed, setCollapsed }),
    [collapsed]
  )
  
  // Only show mobile sidebar after mounting to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Mobile Trigger - Moved to right side */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed right-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="w-[280px] p-0 border-r-0"
        >
          <div className="flex justify-end p-4 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)] pb-8">
            <div className="p-4">
              {children}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          sidebarVariants({ collapsed }),
          "hidden h-screen md:flex sticky top-0 shadow-sm",
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "transition-transform duration-200",
            "hidden md:flex",
            collapsed && "rotate-180"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            {children}
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}

// Create a context to share the collapsed state
export const SidebarContext = React.createContext<{
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}>({
  collapsed: false,
  setCollapsed: () => {},
})

// Hook to access the sidebar context
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a Sidebar")
  }
  return context
} 
```

# components/ui/skeleton.tsx

```tsx
import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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
import { cn } from "@/lib/utils/cn"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("w-full caption-bottom text-sm", className)}
    {...props}
  />
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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
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

import { cn } from "@/lib/utils/cn"

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

import { cn } from "@/lib/utils/cn"

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
      group_invitations: {
        Row: {
          created_at: string
          expires_at: string
          group_id: string
          id: string
          invited_by: string
          invited_user: string
          organization_id: string
          role: Database["public"]["Enums"]["group_member_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          group_id: string
          id?: string
          invited_by: string
          invited_user: string
          organization_id: string
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          group_id?: string
          id?: string
          invited_by?: string
          invited_user?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_invited_user_fkey"
            columns: ["invited_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      group_join_requests: {
        Row: {
          group_id: string
          id: string
          message: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          message?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          message?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          deleted_at: string | null
          group_id: string
          id: string
          joined_at: string | null
          notifications_enabled: boolean | null
          role: Database["public"]["Enums"]["group_member_role"]
          status: string
          user_id: string
        }
        Insert: {
          deleted_at?: string | null
          group_id: string
          id?: string
          joined_at?: string | null
          notifications_enabled?: boolean | null
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: string
          user_id: string
        }
        Update: {
          deleted_at?: string | null
          group_id?: string
          id?: string
          joined_at?: string | null
          notifications_enabled?: boolean | null
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          max_members: number | null
          name: string
          organization_id: string
          settings: Json | null
          type: Database["public"]["Enums"]["group_type"]
          updated_at: string | null
          visibility: Database["public"]["Enums"]["group_visibility"]
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name: string
          organization_id: string
          settings?: Json | null
          type?: Database["public"]["Enums"]["group_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["group_visibility"]
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name?: string
          organization_id?: string
          settings?: Json | null
          type?: Database["public"]["Enums"]["group_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["group_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_limits: {
        Row: {
          current_usage: number | null
          max_amount: number
          organization_id: string
          resource_type: string
        }
        Insert: {
          current_usage?: number | null
          max_amount: number
          organization_id: string
          resource_type: string
        }
        Update: {
          current_usage?: number | null
          max_amount?: number
          organization_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_limits_organization_id_fkey"
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
      organization_settings: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          key: string
          organization_id: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          key: string
          organization_id: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          key?: string
          organization_id?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_usage: {
        Row: {
          amount: number
          id: string
          organization_id: string | null
          resource_type: string
          timestamp: string | null
        }
        Insert: {
          amount: number
          id?: string
          organization_id?: string | null
          resource_type: string
          timestamp?: string | null
        }
        Update: {
          amount?: number
          id?: string
          organization_id?: string | null
          resource_type?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          slug: string
          status: string | null
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
          slug: string
          status?: string | null
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
          slug?: string
          status?: string | null
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
          invitation_token: string | null
          invited_at: string | null
          is_active: boolean | null
          is_superadmin: boolean | null
          last_login: string | null
          last_name: string | null
          last_sign_in_at: string | null
          notification_preferences: Json | null
          phone: string | null
          status: Database["public"]["Enums"]["auth_status"] | null
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
          invitation_token?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          is_superadmin?: boolean | null
          last_login?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          status?: Database["public"]["Enums"]["auth_status"] | null
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
          invitation_token?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          is_superadmin?: boolean | null
          last_login?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          status?: Database["public"]["Enums"]["auth_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          details: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          metadata: Json | null
          organization_id: string | null
          severity: Database["public"]["Enums"]["audit_severity"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          details: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          details?: string
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_group_invitation: {
        Args: {
          invitation_id: string
          user_id: string
        }
        Returns: undefined
      }
      add_group_member: {
        Args: {
          p_group_id: string
          p_user_id: string
          p_role?: Database["public"]["Enums"]["group_member_role"]
        }
        Returns: string
      }
      aggregate_audit_metrics: {
        Args: {
          operation_name: string
          time_window?: unknown
        }
        Returns: {
          operation: string
          avg_time: number
          max_time: number
          total_count: number
          error_count: number
        }[]
      }
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
      cleanup_old_audit_logs: {
        Args: {
          days_to_keep: number
        }
        Returns: number
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
      is_invitation_active: {
        Args: {
          used_at: string
          expires_at: string
        }
        Returns: boolean
      }
      manage_impersonation: {
        Args: {
          target_user_id: string
          action: string
        }
        Returns: Json
      }
      process_join_request: {
        Args: {
          p_request_id: string
          p_status: string
          p_processor_id: string
        }
        Returns: boolean
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
      update_resource_usage: {
        Args: {
          org_id: string
          resource: string
          usage_delta: number
        }
        Returns: undefined
      }
    }
    Enums: {
      activity_event_type:
        | "login"
        | "logout"
        | "profile_update"
        | "password_change"
        | "organization_join"
        | "organization_leave"
        | "role_change"
        | "invitation_sent"
        | "invitation_accepted"
        | "account_created"
        | "account_deleted"
        | "account_suspended"
        | "account_reactivated"
      audit_event_type:
        | "auth"
        | "data"
        | "system"
        | "security"
        | "performance"
        | "error"
        | "user_action"
        | "profile_update"
        | "role_change"
      audit_severity: "info" | "warning" | "error" | "critical"
      auth_status: "invited" | "active" | "suspended" | "inactive" | "deleted"
      group_member_role: "leader" | "member"
      group_type:
        | "ministry"
        | "small_group"
        | "committee"
        | "service_team"
        | "other"
      group_visibility: "public" | "private" | "hidden"
      invitation_status: "pending" | "accepted" | "rejected" | "cancelled"
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

# lib/actions/groups.ts

```ts
'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import type { Database } from '@/database.types'
import type { Json } from '@/database.types'
import { DalError } from '@/lib/dal/errors'
import { createServerUtils } from '@/lib/utils/supabase/server-utils'
import { checkPermission } from '@/lib/utils/permissions'
import { sendEmail, getGroupInvitationEmailContent } from '@/lib/utils/email'

type GroupSettings = {
  name: string
  description?: string | null
  visibility: Database['public']['Enums']['group_visibility']
  max_members?: number | null
}

type GroupWithOrganization = Database['public']['Tables']['groups']['Row'] & {
  organization: {
    id: string
    name: string
  }
}

// Update group settings
export async function updateGroupSettings(
  groupId: string,
  data: GroupSettings
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user has permission to update group
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')
    
    const userMember = group.members.find(m => m.user_id === user.id)
    if (!userMember || userMember.role !== 'leader') {
      throw new Error('Unauthorized - Only group leaders can update settings')
    }

    // Update the group
    await groupRepo.updateGroup(groupId, {
      name: data.name,
      description: data.description,
      visibility: data.visibility,
      max_members: data.max_members,
      updated_at: new Date().toISOString()
    })

    // Revalidate the group pages
    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating group settings:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update settings' }
  }
}

// Process a join request
export async function processJoinRequest(
  requestId: string,
  action: 'approved' | 'rejected',
  groupId: string
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user has permission
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    // Check group leadership
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')
    
    const userMember = group.members.find(m => m.user_id === user.id)
    if (!userMember || userMember.role !== 'leader') {
      throw new Error('Unauthorized - Only group leaders can process join requests')
    }

    // Process the request
    await groupRepo.processJoinRequest(requestId, action, user.id)

    // Revalidate relevant pages
    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    return { success: true }
  } catch (error) {
    console.error('Error processing join request:', error)
    return { error: error instanceof Error ? error.message : 'Failed to process request' }
  }
}

// Invite a user to join the group
export async function inviteToGroup(
  groupId: string,
  userId: string,
  role: Database['public']['Enums']['group_member_role'] = 'member'
) {
  try {
    const supabase = await createServerUtils(true)
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')

    // Get the group and organization details with proper typing
    const { data: group } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        organization_id,
        organization:organizations!inner (
          id,
          name
        )
      `)
      .eq('id', groupId)
      .single<GroupWithOrganization>()

    if (!group) throw new Error('Group not found')

    // Get the invited user's profile with proper typing
    const { data: invitedUser } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single()

    if (!invitedUser) throw new Error('Invited user not found')

    // Get the current user's profile for the invitation
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', currentUser.id)
      .single()

    if (!inviterProfile) throw new Error('Inviter profile not found')

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('group_invitations')
      .select('id')
      .eq('group_id', groupId)
      .eq('invited_user', userId)
      .eq('status', 'pending')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvite) {
      return { 
        error: 'User already has a pending invitation',
        existingInvite: true
      }
    }

    // Generate invitation token
    const token = crypto.randomUUID()

    // Create the invitation with proper typing
    const { error: inviteError } = await supabase
      .from('group_invitations')
      .insert({
        group_id: groupId,
        organization_id: group.organization_id,
        invited_by: currentUser.id,
        invited_user: userId,
        role: role,
        status: 'pending' as const,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError) throw inviteError

    // Send invitation email with proper typing
    const acceptUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invitations/${token}`
    
    await sendEmail({
      to: invitedUser.email,
      subject: `Invitation to join ${group.name}`,
      html: getGroupInvitationEmailContent({
        invitedByName: inviterProfile.full_name || inviterProfile.email,
        groupName: group.name,
        organizationName: group.organization.name,
        acceptUrl
      })
    })

    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    return { success: true }

  } catch (error) {
    console.error('Error inviting user to group:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to send invitation'
    }
  }
}

// Update member role
export async function updateMemberRole(
  groupId: string,
  userId: string,
  newRole: Database['public']['Enums']['group_member_role']
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the group and check permissions
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')

    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    // Check if user is org admin/staff
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', group.organization_id)
      .single()

    // Check if user is group leader
    const userMember = group.members.find(m => m.user_id === user.id)
    const isGroupLeader = userMember?.role === 'leader'

    // Verify permissions
    const canUpdateRoles = 
      profile?.is_superadmin || 
      orgMember?.role === 'admin' ||
      orgMember?.role === 'staff' ||
      isGroupLeader

    if (!canUpdateRoles) {
      throw new Error('Unauthorized - Only superadmins, organization admins, staff, or group leaders can update roles')
    }

    // Update the role
    await groupRepo.updateMemberRole(groupId, userId, newRole)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to update role',
      details: error
    }
  }
}

// Remove member from group
export async function removeMember(
  groupId: string,
  memberId: string
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user has permission
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')
    
    const userMember = group.members.find(m => m.user_id === user.id)
    if (!userMember || userMember.role !== 'leader') {
      throw new Error('Unauthorized - Only group leaders can remove members')
    }

    // Get member details before removal
    const { data: memberToRemove } = await supabase
      .from('group_members')
      .select('user_id, role')
      .eq('id', memberId)
      .single()

    if (!memberToRemove) {
      throw new Error('Member not found')
    }

    // Remove the member
    await groupRepo.removeMember(groupId, memberToRemove.user_id)

    // Log the removal
    await supabase.from('group_activity_logs').insert({
      group_id: groupId,
      actor_id: user.id,
      action: 'member_removed',
      details: `Member removed from group`,
      target_user: memberToRemove.user_id
    })

    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    return { success: true }
  } catch (error) {
    console.error('Error removing member:', error)
    return { error: error instanceof Error ? error.message : 'Failed to remove member' }
  }
}

// Add this new action
export async function createGroup(data: GroupSettings & { 
  organization_id: string,
  type: Database['public']['Enums']['group_type'],
  settings?: Json | null
}) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user has permission to create group
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user is superadmin or organization admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', data.organization_id)
      .single()

    if (!profile?.is_superadmin && (!orgMember || orgMember.role !== 'admin')) {
      throw new Error('Unauthorized - Only superadmins and organization admins can create groups')
    }
    
    // Create the group with required fields
    const group = await groupRepo.createGroup({
      organization_id: data.organization_id,
      name: data.name,
      type: data.type,
      visibility: data.visibility,
      description: data.description || null,
      max_members: data.max_members || null,
      settings: data.settings || null
    })

    // Just revalidate paths, don't redirect
    revalidatePath(`/superadmin/organizations/${data.organization_id}`)
    revalidatePath(`/superadmin/organizations/${data.organization_id}/groups`)
    
    return { data: group }
  } catch (error) {
    console.error('Error creating group:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      data
    })

    return { 
      error: error instanceof DalError && error.code === 'VALIDATION_ERROR'
        ? error.message
        : 'Failed to create group'
    }
  }
}

// Add this new action alongside your existing group actions

export async function addGroupMember(
  groupId: string,
  userId: string,
  role: Database['public']['Enums']['group_member_role']
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the group and check permissions
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')
    
    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    // Check if user is org admin/staff
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', group.organization_id)
      .single()

    // Check if user is group leader
    const userMember = group.members.find(m => m.user_id === user.id)
    const isGroupLeader = userMember?.role === 'leader'

    // Verify permissions
    const canAddMembers = 
      profile?.is_superadmin || 
      orgMember?.role === 'admin' ||
      orgMember?.role === 'staff' ||
      isGroupLeader

    if (!canAddMembers) {
      throw new Error('Unauthorized - Only superadmins, organization admins, staff, or group leaders can add members')
    }

    // Add the member
    await groupRepo.addMember(groupId, userId, {
      role,
      joined_at: new Date().toISOString(),
      status: 'active'
    })

    // Revalidate the group pages
    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error adding group member:', error)
    return { 
      error: error instanceof DalError && error.code === 'VALIDATION_ERROR'
        ? error.message
        : 'Failed to add member'
    }
  }
}

// Add these new actions
export async function removeGroupMember(groupId: string, userId: string) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the group and check permissions
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')

    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    // Check if user is org admin/staff
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', group.organization_id)
      .single()

    // Check if user is group leader
    const userMember = group.members.find(m => m.user_id === user.id)
    const isGroupLeader = userMember?.role === 'leader'

    // Verify permissions
    const canRemoveMembers = 
      profile?.is_superadmin || 
      orgMember?.role === 'admin' ||
      orgMember?.role === 'staff' ||
      isGroupLeader

    if (!canRemoveMembers) {
      throw new Error('Unauthorized - Only superadmins, organization admins, staff, or group leaders can remove members')
    }

    // Remove the member
    await groupRepo.removeMember(groupId, userId)

    // Revalidate the group pages
    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error removing group member:', error)
    return { error: error instanceof Error ? error.message : 'Failed to remove member' }
  }
}

// Add this new function to delete an invitation
export async function deleteGroupInvitation(invitationId: string) {
  try {
    const supabase = await createServerUtils(true)
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')

    // Get the invitation to check permissions
    const { data: invitation, error: fetchError } = await supabase
      .from('group_invitations')
      .select('group_id, status')
      .eq('id', invitationId)
      .single()

    if (fetchError) throw fetchError
    if (!invitation) throw new Error('Invitation not found')
    if (invitation.status !== 'pending') throw new Error('Invitation is no longer pending')

    // Use the centralized permission check
    const hasPermission = await checkPermission(
      currentUser.id,
      'delete',
      'group',
      invitation.group_id
    )

    if (!hasPermission) {
      throw new Error('Unauthorized - Insufficient permissions to delete invitations')
    }

    // Update the invitation status to cancelled
    const { error: updateError } = await supabase
      .from('group_invitations')
      .update({ 
        status: 'cancelled',
        used_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    if (updateError) throw updateError

    // Revalidate relevant paths
    revalidatePath(`/org/[slug]/groups/${invitation.group_id}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to cancel invitation'
    }
  }
}

// Add this new function to resend an invitation
export async function resendGroupInvitation(invitationId: string) {
  try {
    const supabase = await createServerUtils(true)
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')

    type InvitationDetails = Database['public']['Tables']['group_invitations']['Row'] & {
      groups: {
        name: string
        organizations: {
          name: string
        }
      }
      invited_user_profile: {
        email: string
        full_name: string | null
      }
      invited_by_profile: {
        email: string
        full_name: string | null
      }
    }

    // Get the invitation with all needed details
    const { data: invitation, error: fetchError } = await supabase
      .from('group_invitations')
      .select(`
        *,
        groups!inner (
          name,
          organizations!inner (
            name
          )
        ),
        invited_user_profile:profiles!group_invitations_invited_user_fkey (
          email,
          full_name
        ),
        invited_by_profile:profiles!group_invitations_invited_by_fkey (
          email,
          full_name
        )
      `)
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single<InvitationDetails>()

    if (fetchError) {
      console.error('Error fetching invitation:', fetchError)
      throw fetchError
    }

    if (!invitation) throw new Error('Invitation not found')
    if (invitation.status !== 'pending') throw new Error('Invitation is no longer pending')

    // Check permissions
    const hasPermission = await checkPermission(
      currentUser.id,
      'update',
      'group',
      invitation.group_id
    )

    if (!hasPermission) {
      throw new Error('Unauthorized - Insufficient permissions to resend invitations')
    }

    // Update the invitation expiration
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { error: updateError } = await supabase
      .from('group_invitations')
      .update({ expires_at: newExpiresAt })
      .eq('id', invitationId)
      .eq('status', 'pending')

    if (updateError) throw updateError

    // Resend the invitation email
    const acceptUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invitations/${invitation.token}`
    await sendEmail({
      to: invitation.invited_user_profile.email,
      subject: `Invitation to join ${invitation.groups.name} (Resent)`,
      html: getGroupInvitationEmailContent({
        invitedByName: invitation.invited_by_profile.full_name || invitation.invited_by_profile.email,
        groupName: invitation.groups.name,
        organizationName: invitation.groups.organizations.name,
        acceptUrl
      })
    })

    // Revalidate relevant paths
    revalidatePath(`/org/[slug]/groups/${invitation.group_id}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error resending invitation:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to resend invitation'
    }
  }
}

```

# lib/actions/impersonation.ts

```ts
'use server'

import { ImpersonationService } from '@/lib/services/impersonation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/utils/supabase/server'
import { handleImpersonationError } from '@/lib/utils/error-handling'

export async function startImpersonation(targetUserId: string) {
  try {
    const supabase = await createClient(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Authentication required')
    }

    const service = await ImpersonationService.create()
    const result = await service.startImpersonation(user.id, targetUserId)

    // Revalidate all affected paths
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
    revalidatePath('/api/auth/impersonation-status')
    revalidatePath('/superadmin/dashboard')

    return result
  } catch (error) {
    return handleImpersonationError(error, 'start-impersonation')
  }
}

export async function stopImpersonation() {
  try {
    const supabase = await createClient(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Authentication required')
    }

    const service = await ImpersonationService.create()
    
    // Get current impersonation status to get the target user ID
    const status = await service.getStatus(user.id)
    if (!status.impersonatingId) {
      throw new Error('No active impersonation session')
    }

    const result = await service.stopImpersonation(user.id, status.impersonatingId)

    // Revalidate all affected paths
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
    revalidatePath('/api/auth/impersonation-status')
    revalidatePath('/superadmin/dashboard')

    return result
  } catch (error) {
    return handleImpersonationError(error, 'stop-impersonation')
  }
} 
```

# lib/actions/organization.ts

```ts
'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import { OrganizationSettingsRepository } from '@/lib/dal/repositories/organization-settings'

export async function updateOrganizationSettings(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  
  const supabase = await createClient()
  const settingsRepo = new OrganizationSettingsRepository(supabase)
  
  // Verify user has permission
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .single()
    
  if (!membership || membership.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }
  
  const organizationId = formData.get('id') as string
  const settings = JSON.parse(formData.get('settings') as string)
  
  await settingsRepo.setSettings(organizationId, settings)
  
  revalidatePath('/organization')
} 
```

# lib/actions/profile.ts

```ts
'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'

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
    
    
    revalidatePath('/settings/profile')
    return {}
  } catch (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to update profile' }
  }
} 
```

# lib/actions/superadmin.ts

```ts
'use server'

import { getSuperAdminStatus } from '@/lib/auth/permissions'
import { createClient } from '@/lib/utils/supabase/server'

export async function updateUserRole(userId: string, role: string) {
  const isSuperAdmin = await getSuperAdminStatus()
  if (!isSuperAdmin) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  // Your action logic here
} 
```

# lib/actions/tenant.ts

```ts
'use server'

import { TenantOnboardingService } from '@/lib/services/tenant-onboarding'
import { requireSuperAdmin } from '@/lib/auth/permissions'
import { sendEmail } from '@/lib/utils/email'

export async function onboardNewTenantAction(formData: FormData) {
  try {
    // Verify superadmin status
    const superadmin = await requireSuperAdmin()
    
    // Parse and validate form data
    const tenantData = {
      organization: {
        name: formData.get('orgName') as string,
        slug: formData.get('orgSlug') as string,
        settings: JSON.parse(formData.get('settings') as string || '{}'),
        limits: JSON.parse(formData.get('limits') as string || '{}')
      },
      admin: {
        email: formData.get('adminEmail') as string,
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        phone: formData.get('phone') as string
      }
    }

    // Create onboarding service and process
    const onboardingService = await TenantOnboardingService.create()
    const result = await onboardingService.onboardNewTenant(tenantData, superadmin.id)

    // Send welcome email to admin with temporary password
    await sendEmail({
      to: result.adminUser.email,
      subject: `Welcome to ${tenantData.organization.name}`,
      html: `
        <p>Welcome to ${tenantData.organization.name}!</p>
        <p>You will receive a separate email with your invitation link to set up your account.</p>
        <p>Once you receive it, please click the link to complete your account setup.</p>
        <p>If you don't receive the invitation email within a few minutes, please check your spam folder.</p>
        <p>Login URL: ${process.env.NEXT_PUBLIC_SITE_URL}/sign-in</p>
      `
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Tenant onboarding error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to onboard tenant'
    }
  }
} 
```

# lib/actions/user-management.ts

```ts
'use server'

import { createServerUtils } from '@/lib/utils/supabase/server-utils'

export async function resendInvitation(userId: string) {
  const supabase = await createServerUtils(true)
  
  // Get user details
  const { data: user } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()
    
  if (!user) throw new Error('User not found')
  
  // Use Supabase's built-in reinvite
  const { error } = await supabase.auth.admin.inviteUserByEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  })
  
  if (error) throw error
  
  // Update invited_at timestamp
  await supabase
    .from('profiles')
    .update({
      invited_at: new Date().toISOString(),
      status: 'invited'
    })
    .eq('id', userId)
}

export async function suspendUser(userId: string) {
  const supabase = await createServerUtils(true)
  
  // First suspend the auth user
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { ban_duration: '87600h' } // 10 years
  )
  
  if (authError) throw authError
  
  // Then update profile status
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      status: 'suspended',
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    
  if (profileError) throw profileError
}

export async function reactivateUser(userId: string) {
  const supabase = await createServerUtils(true)
  
  // First unban the auth user
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { ban_duration: '0' }
  )
  
  if (authError) throw authError
  
  // Then update profile status
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      status: 'active',
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    
  if (profileError) throw profileError
} 
```

# lib/actions/users.ts

```ts
'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import { type Database } from '@/database.types'
import { getOrganizationInvitationEmailContent } from '@/lib/utils/email'

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

  revalidatePath('/superadmin/users')
  revalidatePath(`/superadmin/users/${userId}`)
}

export async function deleteUserAction(userId: string) {
  try {
    // 1. Create admin client and verify superadmin status
    const supabase = await createClient(true) // Using service role key
    const currentUser = await getCurrentUser()
    
    if (!currentUser?.is_superadmin) {
      throw new Error('Unauthorized - Superadmin access required')
    }

    // 2. Get user info for audit log
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

    // 3. Soft delete in correct order
    // First remove organization memberships
    const { error: membershipError } = await supabase
      .from('organization_members')
      .update({ 
        deleted_at: now,
        updated_at: now
      })
      .eq('user_id', userId)
    
    if (membershipError) throw membershipError

    // Then update profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        deleted_at: now,
        is_active: false,
        status: 'deleted',
        updated_at: now
      })
      .eq('id', userId)
    
    if (profileError) throw profileError

    // Finally disable auth user
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        ban_duration: '876000h' // 100 years
      }
    )
    
    if (authError) throw authError

    // 4. Create audit log entry
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      target_user_id: userId,
      event_type: 'user.deleted',
      details: `User ${user.email} deleted by ${currentUser.email}`,
      metadata: {
        deleted_at: now,
        deleted_by: currentUser.id
      }
    })

    revalidatePath('/superadmin/users')
    return { success: true }

  } catch (error) {
    console.error('Delete user error:', error)
    throw error
  }
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

  // Get organization name
  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', data.organization_id)
    .single()

  if (!organization) throw new Error('Organization not found')

  // Get the current user's profile
  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', currentUser.id)
    .single()

  if (!inviterProfile) throw new Error('Inviter profile not found')

  // Send invitation using Supabase's built-in invite function
  const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: {
        organization_id: data.organization_id,
        organization_name: organization.name,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        invited_by: inviterProfile.full_name || inviterProfile.email
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/setup`
    }
  )

  if (inviteError) throw inviteError

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: `${data.first_name} ${data.last_name}`.trim(),
      is_active: data.is_active,
      is_superadmin: data.is_superadmin,
      status: 'invited'
    })

  if (profileError) throw profileError

  // Create organization membership
  const { error: membershipError } = await supabase
    .from('organization_members')
    .insert({
      user_id: authUser.user.id,
      organization_id: data.organization_id,
      role: data.role
    })

  if (membershipError) throw membershipError

  revalidatePath('/superadmin/users')
}  
```

# lib/auth/permissions.ts

```ts
import { createClient } from '@/lib/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'

export const getSuperAdminStatus = cache(async (): Promise<boolean> => {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()
    
  return !!profile?.is_superadmin
})

export const requireSuperAdmin = cache(async (): Promise<Profile> => {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (!profile?.is_superadmin) {
    throw new Error('Not authorized')
  }

  return profile as Profile
}) 
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

# lib/auth/session.ts

```ts
import { createClient } from '@/lib/utils/supabase/server'

export async function getSession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw error
  }
  
  if (!user) {
    throw new Error('No user found')
  }
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('No session found')
  }
  
  return session
} 
```

# lib/config/navigation.ts

```ts
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings,
  Shield,
  Activity,
  Plus
} from "lucide-react"

export const adminNavItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users
      },
      {
        title: "Organizations",
        href: "/admin/organizations",
        icon: Building2
      }
    ]
  },
  {
    title: "System",
    items: [
      {
        title: "Access Control",
        href: "/admin/access",
        icon: Shield
      },
      {
        title: "Audit Logs",
        href: "/admin/audit",
        icon: Activity
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings
      }
    ]
  }
] 

export const superAdminNavItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/superadmin/dashboard",
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: "Management",
    items: [
      {
        title: "Organizations",
        href: "/superadmin/organizations",
        icon: Building2
      },
      {
        title: "Users",
        href: "/superadmin/users",
        icon: Users
      },
      {
        title: "Tenant Onboarding",
        href: "/superadmin/onboarding",
        icon: Plus
      }
    ]
  },
  {
    title: "System",
    items: [
      {
        title: "Access Control",
        href: "/superadmin/access",
        icon: Shield
      },
      {
        title: "Audit Logs",
        href: "/superadmin/audit",
        icon: Activity
      },
      {
        title: "Settings",
        href: "/superadmin/settings",
        icon: Settings
      }
    ]
  }
] 
```

# lib/contexts/breadcrumbs-context.tsx

```tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'

interface BreadcrumbsContextType {
  organizationName?: string
  groupName?: string
}

const BreadcrumbsContext = createContext<BreadcrumbsContextType>({})

export function BreadcrumbsProvider({
  children,
  organizationName,
  groupName,
}: BreadcrumbsContextType & {
  children: ReactNode
}) {
  // Get the parent context values
  const parentContext = useContext(BreadcrumbsContext)
  
  // Merge with parent context, new values take precedence
  const value = {
    organizationName: organizationName ?? parentContext.organizationName,
    groupName: groupName ?? parentContext.groupName,
  }

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}

export function useBreadcrumbs() {
  return useContext(BreadcrumbsContext)
} 
```

# lib/contexts/impersonation-context.tsx

```tsx
'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import { IMPERSONATION_EVENT } from '@/lib/events/impersonation'
import type { 
  ImpersonationState, 
  ImpersonationEventDetail 
} from '@/lib/types/impersonation'

const ImpersonationContext = createContext<ImpersonationState | null>(null)

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null)
  const [realUserId, setRealUserId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = useRef(createClient())
  const lastCheck = useRef<number>(0)
  const MIN_CHECK_INTERVAL = 2000

  const checkImpersonationStatus = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && now - lastCheck.current < MIN_CHECK_INTERVAL) {
      return
    }

    try {
      lastCheck.current = now
      const response = await fetch('/api/auth/impersonation-status', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      setIsImpersonating(data.isImpersonating)
      setImpersonatingId(data.impersonatingId)
      setRealUserId(data.realUserId)
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to check impersonation status:', error)
      setIsImpersonating(false)
      setImpersonatingId(null)
      setRealUserId(null)
    }
  }, [])

  // Initial check
  useEffect(() => {
    checkImpersonationStatus(true)
  }, [checkImpersonationStatus])

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.current.auth.onAuthStateChange(async (event) => {
      console.log('🔑 Auth state changed:', event)
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event)) {
        await checkImpersonationStatus(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkImpersonationStatus])

  // Listen for impersonation events
  useEffect(() => {
    function handleImpersonationEvent(e: Event) {
      const event = e as CustomEvent<ImpersonationEventDetail>
      console.log('🎭 Impersonation event received:', event.detail)
      
      // Force immediate status check
      checkImpersonationStatus(true)
      
      // If stopping, immediately clear state
      if (event.detail.type === 'stop') {
        setIsImpersonating(false)
        setImpersonatingId(null)
        setRealUserId(null)
      }
    }

    // Add event listener with proper typing
    window.addEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)

    return () => {
      window.removeEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
    }
  }, [checkImpersonationStatus])

  // Gentle polling for backup
  useEffect(() => {
    if (!isInitialized) return

    const interval = setInterval(() => {
      checkImpersonationStatus()
    }, 10000)

    return () => clearInterval(interval)
  }, [checkImpersonationStatus, isInitialized])

  return (
    <ImpersonationContext.Provider value={{
      isImpersonating,
      impersonatingId,
      realUserId,
      isInitialized,
      refresh: () => checkImpersonationStatus(true)
    }}>
      {children}
    </ImpersonationContext.Provider>
  )
}

export function useImpersonationStatus() {
  const context = useContext(ImpersonationContext)
  if (!context) {
    throw new Error('useImpersonationStatus must be used within an ImpersonationProvider')
  }
  return context
} 
```

# lib/dal/auth/index.ts

```ts
import { cache } from 'react'
import { createClient } from '@/lib/utils/supabase/server'
import { ProfileDTO } from '../dto'
import type { Database } from '@/database.types'
import { DalError } from '../errors'
import type { ErrorCode } from '../errors/types'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile ? ProfileDTO.fromRow(profile) : null
})

export const requireAuth = cache(async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw DalError.operationFailed('requireAuth', {
      error: 'Authentication required',
      details: 'User must be authenticated to access this resource'
    })
  }
  return user
})

export const requireSuperAdmin = cache(async () => {
  const user = await requireAuth()
  if (!user.isSuperAdmin) {
    throw DalError.operationFailed('requireSuperAdmin', {
      error: 'Permission denied',
      details: 'Superadmin access required'
    })
  }
  return user
}) 
```

# lib/dal/base/repository-base.ts

```ts
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import type { TenantContext } from '../context/TenantContext'

type Tables = Database['public']['Tables'] 
type TableName = keyof Tables
type TableRow<T extends TableName> = Tables[T]['Row']

export abstract class BaseRepositoryBase<T extends TableName> {
  protected abstract tableName: T
  protected abstract organizationField?: keyof TableRow<T>

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {}

  protected validateTenantContext(): void {
    if (this.organizationField && !this.context?.organizationId) {
      throw new Error('Organization ID required for tenant-scoped repository')
    }
  }

  protected baseQuery(): PostgrestFilterBuilder<Database['public'], TableRow<T>, TableRow<T>[]> {
    this.validateTenantContext()

    let query = this.supabase
      .from(this.tableName)
      .select() as PostgrestFilterBuilder<Database['public'], TableRow<T>, TableRow<T>[]>

    if (this.organizationField && this.context?.organizationId) {
      query = query.eq(
        this.organizationField as string,
        this.context.organizationId
      )
    }

    return query
  }
} 
```

# lib/dal/base/repository-interface.ts

```ts
import type { Database } from '@/database.types'

type TableName = keyof Database['public']['Tables']
type Row<T extends TableName> = Database['public']['Tables'][T]['Row']

export interface QueryOptions {
  include?: string[]
  filter?: Record<string, unknown>
  sort?: { field: string; direction: 'asc' | 'desc' }
  limit?: number
  offset?: number
}

export interface IRepository<T extends TableName> {
  findById(id: string, options?: QueryOptions): Promise<Row<T> | null>
  create(data: Partial<Row<T>>, options?: QueryOptions): Promise<Row<T>>
  update(id: string, data: Partial<Row<T>>, options?: QueryOptions): Promise<Row<T>>
  delete(id: string, options?: QueryOptions): Promise<void>
  hardDelete(id: string, options?: QueryOptions): Promise<void>
} 
```

# lib/dal/base/repository.ts

```ts
// lib/dal/base/repository.ts
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { 
  PostgrestFilterBuilder,
  PostgrestBuilder,
  PostgrestResponse,
  PostgrestSingleResponse
} from '@supabase/postgrest-js'
import { TenantContext } from '../context/TenantContext'
import { DalError } from '../errors'

type Tables = Database['public']['Tables']
type TableName = keyof Tables
type TableRow<T extends TableName> = Tables[T]['Row']
type TableInsert<T extends TableName> = Tables[T]['Insert']
type TableUpdate<T extends TableName> = Tables[T]['Update']

type QueryBuilder<T extends TableName> = PostgrestFilterBuilder<
  Database['public'],
  TableRow<T>,
  TableRow<T>[]
>

export abstract class BaseRepository<T extends TableName> {
  protected abstract tableName: T
  protected abstract organizationField?: keyof TableRow<T>

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {}

  protected baseQuery(): QueryBuilder<T> {
    const query = this.supabase
      .from(this.tableName)
      .select() as PostgrestFilterBuilder<Database['public'], TableRow<T>, TableRow<T>[]>

    if (this.organizationField && this.context?.organizationId) {
      return query.eq(
        this.organizationField as string,
        this.context.organizationId
      )
    }

    return query
  }

  async findById(id: string): Promise<TableRow<T> | null> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('id', id)
        .single() as PostgrestSingleResponse<TableRow<T>>

      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error, 'findById')
    }
  }

  async create(data: TableInsert<T>): Promise<TableRow<T>> {
    try {
      const { data: created, error } = await this.supabase
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single() as PostgrestSingleResponse<TableRow<T>>

      if (error) throw error
      if (!created) throw new Error('No data returned from insert')
      
      return created
    } catch (error) {
      throw this.handleError(error, 'create')
    }
  }

  async update(id: string, data: Partial<TableUpdate<T>>): Promise<TableRow<T>> {
    try {
      const { data: updated, error } = await this.supabase
        .from(this.tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single() as PostgrestSingleResponse<TableRow<T>>

      if (error) throw error
      if (!updated) throw DalError.notFound(this.tableName)
      
      return updated
    } catch (error) {
      throw this.handleError(error, 'update')
    }
  }

  async delete(id: string, hardDelete = false): Promise<void> {
    try {
      if (hardDelete) {
        const { error } = await this.supabase
          .from(this.tableName)
          .delete()
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await this.supabase
          .from(this.tableName)
          .update({ deleted_at: new Date().toISOString() } as any)
          .eq('id', id)
        if (error) throw error
      }
    } catch (error) {
      throw this.handleError(error, 'delete')
    }
  }

  protected handleError(error: unknown, operation: string): never {
    throw DalError.operationFailed(operation, error)
  }

  protected async checkPermission(action: string): Promise<void> {
    if (!this.context) {
      throw DalError.unauthorized()
    }

    const hasAccess = await this.context.canAccess(this.tableName, action)
    if (!hasAccess) {
      throw DalError.unauthorized()
    }
  }
}
```

# lib/dal/cache/factory.ts

```ts
import { ICacheManager } from './types'
import { RedisCacheManager } from './redis'
import { MemoryCacheManager } from './memory'

export class CacheFactory {
  private static instance: CacheFactory
  private cacheManager: ICacheManager | null = null

  private constructor() {}

  static getInstance(): CacheFactory {
    if (!this.instance) {
      this.instance = new CacheFactory()
    }
    return this.instance
  }

  getCacheManager(): ICacheManager {
    if (!this.cacheManager) {
      // Initialize Redis cache if REDIS_URL is provided, otherwise use memory cache
      if (process.env.REDIS_URL) {
        this.cacheManager = new RedisCacheManager()
      } else {
        // Fall back to memory cache for development
        this.cacheManager = MemoryCacheManager.getInstance()
      }
    }
    return this.cacheManager
  }
}

// Helper function to get cache manager
export function getCache(): ICacheManager {
  return CacheFactory.getInstance().getCacheManager()
} 
```

# lib/dal/cache/index.ts

```ts
// lib/dal/cache/index.ts
export * from './types'
export * from './factory'
export * from './redis'
export * from './memory'

// Re-export the getCache helper as default cache getter
export { getCache } from './factory'
```

# lib/dal/cache/memory.ts

```ts
import type { ICacheManager, CacheEntry } from './types'

export class MemoryCacheManager implements ICacheManager {
  private static instance: MemoryCacheManager
  private cache: Map<string, CacheEntry>
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): MemoryCacheManager {
    if (!this.instance) {
      this.instance = new MemoryCacheManager()
    }
    return this.instance
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (entry.expires < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  async set<T>(key: string, value: T, ttl = this.defaultTTL): Promise<void> {
    this.cache.set(key, {
      data: value,
      expires: Date.now() + ttl
    })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = Array.from(this.cache.keys())
    for (const key of keys) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys())
  }

  async size(): Promise<number> {
    return this.cache.size
  }
} 
```

# lib/dal/cache/redis.ts

```ts
import { Redis } from 'ioredis'
import type { ICacheManager, CacheConfig, CacheEntry } from './types'

export class RedisCacheManager implements ICacheManager {
  private readonly redis: Redis
  private readonly defaultTTL: number
  private readonly prefix: string

  constructor(config: CacheConfig = {}) {
    this.redis = new Redis(process.env.REDIS_URL!)
    this.defaultTTL = config.ttl || 5 * 60 * 1000 // 5 minutes
    this.prefix = config.prefix || 'app:'
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(this.getKey(key))
    if (!data) return null

    const entry = JSON.parse(data) as CacheEntry<T>
    if (entry.expires < Date.now()) {
      await this.del(key)
      return null
    }

    return entry.data
  }

  async set<T>(key: string, value: T, ttl = this.defaultTTL): Promise<void> {
    const entry: CacheEntry<T> = {
      data: value,
      expires: Date.now() + ttl
    }

    await this.redis.set(
      this.getKey(key),
      JSON.stringify(entry),
      'PX',
      ttl
    )
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.getKey(key))
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(this.getKey(`${pattern}*`))
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async clear(): Promise<void> {
    const keys = await this.redis.keys(`${this.prefix}*`)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async keys(): Promise<string[]> {
    const keys = await this.redis.keys(`${this.prefix}*`)
    return keys.map((key: string) => key.slice(this.prefix.length))
  }

  async size(): Promise<number> {
    const keys = await this.redis.keys(`${this.prefix}*`)
    return keys.length
  }
} 
```

# lib/dal/cache/types.ts

```ts
export interface ICacheManager {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  delPattern(pattern: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
  size(): Promise<number>
}

export interface CacheConfig {
  ttl?: number
  prefix?: string
}

export interface CacheEntry<T = unknown> {
  data: T
  expires: number
} 
```

# lib/dal/context/TenantContext.ts

```ts
import { UserRole } from '@/lib/types/auth'

type RolePermissions = {
  [K in UserRole]: readonly string[]
}

const ROLE_PERMISSIONS: RolePermissions = {
  superadmin: ['read', 'create', 'update', 'delete', 'admin'],
  admin: ['read', 'create', 'update', 'delete'],
  staff: ['read', 'create', 'update'],
  member: ['read'],
  visitor: ['read'],
  ministry_leader: ['read', 'create', 'update']
} as const

export class TenantContext {
  constructor(
    readonly organizationId: string,
    readonly userId: string,
    readonly role: UserRole,
    private readonly features?: string[]
  ) {}

  async canAccess(resource: string, action: string): Promise<boolean> {
    const allowedActions = ROLE_PERMISSIONS[this.role] || []
    return allowedActions.includes(action)
  }

  hasFeature(feature: string): boolean {
    return this.features?.includes(feature) ?? false
  }

  toHeaders(): Record<string, string> {
    return {
      'x-organization-id': this.organizationId,
      'x-user-id': this.userId,
      'x-user-role': this.role,
      'x-organization-features': JSON.stringify(this.features)
    }
  }
} 
```

# lib/dal/dto/index.ts

```ts
import type { Database } from '@/database.types'

type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export abstract class BaseDTO<T extends keyof Database['public']['Tables']> {
  constructor(protected data: TableRow<T>) {}

  abstract toJSON(): Record<string, unknown>

  static fromRow<D extends BaseDTO<any>>(
    this: new (data: any) => D,
    row: TableRow<any>
  ): D {
    return new this(row)
  }
}

export class ProfileDTO extends BaseDTO<'profiles'> {
  get isSuperAdmin(): boolean {
    return !!this.data.is_superadmin
  }

  get isActive(): boolean {
    return !!this.data.is_active
  }

  toJSON() {
    return {
      id: this.data.id,
      email: this.data.email,
      fullName: this.data.full_name,
      isSuperAdmin: this.isSuperAdmin,
      isActive: this.isActive,
      avatarUrl: this.data.avatar_url,
      createdAt: this.data.created_at,
    }
  }
} 
```

# lib/dal/errors/DalError.ts

```ts
import type { PublicError, ErrorCode } from './types'

export class DalError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly organizationId?: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'DalError'
  }

  toPublicError(): PublicError {
    return {
      message: this.getPublicMessage(),
      code: this.code
    }
  }

  private getPublicMessage(): string {
    switch (this.code) {
      case 'RESOURCE_NOT_FOUND':
        return 'The requested resource was not found'
      case 'PERMISSION_DENIED':
        return 'You do not have permission to perform this action'
      case 'INITIALIZATION_ERROR':
        return 'Unable to initialize data access'
      case 'TRANSACTION_ERROR':
        return 'Operation failed, please try again'
      case 'VALIDATION_ERROR':
        return 'Invalid data provided'
      case 'DATABASE_ERROR':
        return 'A database error occurred'
      case 'QUERY_ERROR':
        return 'Failed to execute query'
      case 'INVALID_OPERATION':
        return 'Invalid operation attempted'
      default: {
        const exhaustiveCheck: never = this.code
        return 'An unexpected error occurred'
      }
    }
  }
} 
```

# lib/dal/errors/index.ts

```ts
import type { ErrorCode } from './types'

export class DalError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'DalError'
  }

  static notFound(resource: string) {
    return new DalError(
      `${resource} not found`,
      'RESOURCE_NOT_FOUND',
      { resource }
    )
  }

  static unauthorized() {
    return new DalError(
      'Unauthorized access',
      'PERMISSION_DENIED'
    )
  }

  static operationFailed(operation: string, error: unknown) {
    const context = {
      originalError: error instanceof Error ? error.message : String(error)
    }
    
    return new DalError(
      `Operation ${operation} failed`,
      'QUERY_ERROR',
      context
    )
  }

  static validationError(message: string, context?: Record<string, unknown>) {
    return new DalError(
      message,
      'VALIDATION_ERROR',
      context
    )
  }
}

export { DalError as AppError }
export type { ErrorCode, PublicError } from './types'

// Centralized error handler
export function handleDalError(error: unknown): never {
  if (error instanceof DalError) {
    throw error
  }
  
  throw new DalError(
    'An unexpected error occurred',
    'QUERY_ERROR',
    { cause: error instanceof Error ? error.message : String(error) }
  )
} 
```

# lib/dal/errors/types.ts

```ts
export type ErrorCode = 
  | 'RESOURCE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'QUERY_ERROR'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'INVALID_OPERATION'
  | 'INITIALIZATION_ERROR'
  | 'TRANSACTION_ERROR'

export type PublicError = {
  code: ErrorCode
  message: string
  context?: Record<string, unknown>
} 
```

# lib/dal/factory.ts

```ts
// lib/dal/factory.ts
import { createClient } from '@/lib/utils/supabase/server'
import { TenantContext } from './context/TenantContext'
import { cache } from 'react'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ProfileRepository } from './repositories/profile'
import { OrganizationRepository } from './repositories/organization'
import { AuditLogRepository } from './repositories/audit-log'

export class DALFactory {
  private static instance: Promise<DALFactory>
  private client: SupabaseClient<Database>

  private constructor(client: SupabaseClient<Database>) {
    this.client = client
  }

  static async getInstance(): Promise<DALFactory> {
    if (!this.instance) {
      this.instance = createClient().then(client => new DALFactory(client))
    }
    return this.instance
  }

  getRepository(context?: TenantContext) {
    return {
      profiles: new ProfileRepository(this.client, context),
      organizations: new OrganizationRepository(this.client, context),
      auditLogs: new AuditLogRepository(this.client, context)
    }
  }
}

export const getDAL = cache(async (context?: TenantContext) => {
  const factory = await DALFactory.getInstance()
  return factory.getRepository(context)
})

export type DAL = ReturnType<DALFactory['getRepository']>
```

# lib/dal/index.ts

```ts
import 'server-only'
import { createClient } from '@/lib/utils/supabase/server'
import { cache } from 'react'
import { type Database } from '@/database.types'
import { OrganizationSettingsRepository } from './repositories/organization-settings'

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
export * from './repositories/organization'
export * from './repositories/profile'
export * from './repositories/audit-log'
export { OrganizationSettingsRepository }
```

# lib/dal/monitoring/index.ts

```ts
export interface MetricTags {
  organization_id?: string
  user_id?: string
  operation: string
  status: 'success' | 'error'
}

export class Monitor {
  trackMetric(name: string, value: number, tags: MetricTags): void {
    console.info('Metric:', { name, value, tags })
  }

  trackDuration(name: string, tags: MetricTags): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.trackMetric(name, duration, tags)
    }
  }
} 
```

# lib/dal/monitoring/PerformanceMonitor.ts

```ts
export interface OperationMetrics {
  count: number
  totalTime: number
  averageTime: number
  minTime: number
  maxTime: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, OperationMetrics> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }

  track(operation: string, duration: number): void {
    const current = this.metrics.get(operation) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: -Infinity
    }

    current.count++
    current.totalTime += duration
    current.averageTime = current.totalTime / current.count
    current.minTime = Math.min(current.minTime, duration)
    current.maxTime = Math.max(current.maxTime, duration)

    this.metrics.set(operation, current)
  }

  getMetrics(operation?: string): Map<string, OperationMetrics> | OperationMetrics | undefined {
    if (operation) {
      return this.metrics.get(operation)
    }
    return this.metrics
  }

  reset(): void {
    this.metrics.clear()
  }
} 
```

# lib/dal/profile.ts

```ts
import { createClient } from '@/lib/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile as Profile
})

export const getUserProfile = cache(async (userId?: string) => {
  if (!userId) {
    return getCurrentUser()
  }
  
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  return data as Profile | null
}) 
```

# lib/dal/query/QueryBuilder.ts

```ts
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import type { Database } from '@/database.types'

export interface QueryOptions {
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  search?: {
    field: string
    term: string
  }
  filter?: Record<string, any>
}

export class QueryBuilder<T extends Record<string, any>> {
  constructor(
    private query: PostgrestFilterBuilder<Database['public'], T, T[]>,
    private options: QueryOptions = {}
  ) {}

  withPagination() {
    if (this.options.page && this.options.pageSize) {
      const start = (this.options.page - 1) * this.options.pageSize
      const end = start + this.options.pageSize - 1
      this.query = this.query.range(start, end)
    }
    return this
  }

  withSearch() {
    if (this.options.search) {
      const { field, term } = this.options.search
      this.query = this.query.ilike(field, `%${term}%`)
    }
    return this
  }

  withSort() {
    if (this.options.sortField) {
      this.query = this.query.order(this.options.sortField, {
        ascending: this.options.sortDirection === 'asc'
      })
    }
    return this
  }

  withFilters() {
    if (this.options.filter) {
      Object.entries(this.options.filter).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          this.query = this.query.eq(field, value)
        }
      })
    }
    return this
  }

  build() {
    return this.query
  }
} 
```

# lib/dal/repositories/activity-log.ts

```ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type ActivityLog = Database['public']['Tables']['user_activity_logs']['Row']

export class ActivityLogRepository extends BaseRepository<'user_activity_logs'> {
  protected tableName = 'user_activity_logs' as const
  protected organizationField = 'organization_id' as keyof ActivityLog

  async getRecent(options: {
    organizationId?: string
    userId?: string
    limit?: number
  }): Promise<ActivityLog[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (options.organizationId) {
        query = query.eq('organization_id', options.organizationId)
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      return []
    }
  }
} 
```

# lib/dal/repositories/audit-log.ts

```ts
// lib/dal/repositories/audit-log.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'
import { DalError } from '../errors'
import type { DateRange } from 'react-day-picker'

type ActivityLogRow = Database['public']['Tables']['user_activity_logs']['Row']
type ActivityLogInsert = Database['public']['Tables']['user_activity_logs']['Insert']
type AuditEventType = Database['public']['Enums']['audit_event_type']

// Valid event categories matching the database enum
const VALID_CATEGORIES = [
  'auth',
  'data',
  'system',
  'security',
  'performance',
  'error',
  'user_action'
] as const satisfies readonly AuditEventType[]

type EventCategory = typeof VALID_CATEGORIES[number]

export class AuditLogRepository extends BaseRepository<'user_activity_logs'> {
  protected tableName = 'user_activity_logs' as const
  protected organizationField = 'organization_id' as keyof ActivityLogRow

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {
    super(supabase, context)
  }

  private validateCategory(category: string): asserts category is EventCategory {
    if (!VALID_CATEGORIES.includes(category as EventCategory)) {
      throw DalError.validationError('Invalid category', {
        category,
        validCategories: VALID_CATEGORIES
      })
    }
  }

  async create(data: Omit<ActivityLogInsert, 'id' | 'created_at'>): Promise<ActivityLogRow> {
    try {
      const { data: log, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return log
    } catch (error) {
      throw this.handleError(error, 'create')
    }
  }

  async findByOrganization(organizationId: string): Promise<ActivityLogRow[]> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findByOrganization')
    }
  }

  async findByCategory(
    category: string,
    options: { limit?: number } = {}
  ): Promise<ActivityLogRow[]> {
    try {
      this.validateCategory(category)

      let query = this.baseQuery()
        .eq('event_type', category)
        .order('created_at', { ascending: false })

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      console.log('Executing query:', {
        category,
        limit: options.limit,
        table: this.tableName
      })

      const { data, error } = await query

      if (error) {
        console.error('Database error in findByCategory:', {
          category,
          errorMessage: error.message,
          errorCode: error.code,
          details: error.details,
          hint: error.hint,
          queryParams: {
            category,
            limit: options.limit,
            table: this.tableName
          }
        })

        throw DalError.operationFailed('findByCategory', {
          category,
          error: error.message,
          details: error.details || 'Database query failed'
        })
      }

      console.log('Audit logs query result:', {
        category,
        count: data?.length || 0,
        firstLog: data?.[0]
      })

      return data || []
    } catch (error) {
      const errorDetails = {
        category,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        context: error instanceof DalError ? error.context : undefined
      }
      
      console.error('Error in findByCategory:', errorDetails)

      if (error instanceof DalError) {
        throw error
      }

      throw DalError.operationFailed('findByCategory', {
        category,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Unexpected error occurred while fetching audit logs'
      })
    }
  }

  async findByFilters(filters: {
    category?: string
    search?: string
    dateRange?: DateRange | null
    severity?: string
    organizationId?: string
    correlationId?: string
    limit?: number
  }): Promise<ActivityLogRow[]> {
    try {
      let query = this.baseQuery()
        .order('created_at', { ascending: false })

      if (filters.category) {
        query = query.eq('event_type', filters.category)
      }

      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId)
      }

      if (filters.correlationId) {
        query = query.eq('metadata->correlation_id', filters.correlationId)
      }

      if (filters.search) {
        query = query.ilike('details', `%${filters.search}%`)
      }

      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString())
      }

      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString())
      }

      if (filters.severity && filters.severity !== 'all') {
        query = query.eq('severity', filters.severity)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findByFilters')
    }
  }

  async findRelatedLogs(log: ActivityLogRow): Promise<ActivityLogRow[]> {
    try {
      const correlationId = (log.metadata as any)?.correlation_id
      if (!correlationId) return []

      const { data, error } = await this.baseQuery()
        .eq('metadata->correlation_id', correlationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findRelatedLogs')
    }
  }
}
```

# lib/dal/repositories/group.ts

```ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { Json } from '@/database.types'
import { DalError } from '../errors'
import { PostgrestError } from '@supabase/supabase-js'

// Type definitions
type BaseGroup = Database['public']['Tables']['groups']['Row']
type BaseGroupMember = Database['public']['Tables']['group_members']['Row']
type BaseProfile = Database['public']['Tables']['profiles']['Row']

// Type for Supabase count aggregation
type CountResult = {
  count: number
}

// Update GroupMember type to match what's used in components
export type GroupMember = {
  id: string
  user_id: string
  group_id: string
  role: Database['public']['Enums']['group_member_role']
  status: string
  joined_at: string | null
  deleted_at: string | null
  notifications_enabled: boolean | null
  profile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export type Group = Omit<BaseGroup, 'members'> & {
  members?: CountResult
}

export type GroupWithCount = Omit<Group, 'members'> & {
  members_count: number
}

export type GroupType = Database['public']['Enums']['group_type']
export type GroupVisibility = Database['public']['Enums']['group_visibility']
export type GroupMemberRole = Database['public']['Enums']['group_member_role']

export interface GroupWithMembers extends Omit<BaseGroup, 'members'> {
  organization_id: string
  members: GroupMember[]
}

export interface GroupSettings {
  allow_join_requests?: boolean
  require_approval?: boolean
  notifications_enabled?: boolean
  custom_fields?: Record<string, Json>
  meeting_schedule?: {
    day?: string
    time?: string
    frequency?: string
    location?: string
  }
  contact_info?: {
    email?: string
    phone?: string
  }
  [key: string]: unknown
}

// Add this type at the top of the file
export interface GroupWithStats extends Omit<BaseGroup, 'settings'> {
  memberCount: number
  settings: Record<string, Json> | null
}

export interface GroupWithOrganization extends BaseGroup {
  members_count: number
  organization: {
    name: string
    slug: string
  }
}

export interface GroupJoinRequest {
  id: string
  group_id: string
  user_id: string
  status: string
  requested_at: string
  processed_at: string | null
  processed_by: string | null
  message: string | null
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface GroupWithDetails extends Omit<BaseGroup, 'settings'> {
  settings: GroupSettings | null
  members: GroupMember[]
  stats: {
    total_members: number
    active_members: number
    pending_requests: number
  }
  metadata?: {
    last_meeting?: string
    next_meeting?: string
    created_by?: string
    updated_by?: string
  }
}

// Add Profile type from database types
type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 
  'id' | 'email' | 'full_name' | 'avatar_url'
>

// Define base types from database
type BaseJoinRequest = Database['public']['Tables']['group_join_requests']['Row']
type BaseGroupInvitation = Database['public']['Tables']['group_invitations']['Row']

// Define the extended types with related data
export type JoinRequest = BaseJoinRequest & {
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export type GroupInvitation = BaseGroupInvitation & {
  invited_user_profile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export class GroupRepository extends BaseRepository<'groups'> {
  protected tableName = 'groups' as const
  protected organizationField = 'organization_id' as keyof BaseGroup

  async findWithStats(id: string): Promise<GroupWithStats | null> {
    try {
      const [group, memberCount] = await Promise.all([
        this.findById(id),
        this.getMemberCount(id)
      ])

      if (!group) return null

      // Convert settings to the correct type
      const settings = typeof group.settings === 'object' && group.settings !== null
        ? group.settings as Record<string, Json>
        : null

      return {
        ...group,
        settings,
        memberCount
      }
    } catch (error) {
      throw this.handleError(error, 'findWithStats')
    }
  }

  private async getMemberCount(groupId: string): Promise<number> {
    const { count } = await this.supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', 'active')

    return count || 0
  }

  async createGroup(data: {
    organization_id: string
    name: string
    description?: string | null
    type: GroupType
    visibility: GroupVisibility
    max_members?: number | null
    settings?: Json | null
  }): Promise<Group> {
    try {
      // Check if group name already exists in organization
      const { data: existingGroup } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('organization_id', data.organization_id)
        .eq('name', data.name)
        .maybeSingle()

      if (existingGroup) {
        throw new DalError(
          `A group named "${data.name}" already exists in this organization`,
          'VALIDATION_ERROR'
        )
      }

      const { data: group, error } = await this.supabase
        .from(this.tableName)
        .insert({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new DalError(
            `A group named "${data.name}" already exists in this organization`,
            'VALIDATION_ERROR'
          )
        }
        throw error
      }

      return group
    } catch (error) {
      if (error instanceof DalError) {
        throw error
      }
      throw this.handleError(error, 'createGroup')
    }
  }

  async findByOrganization(organizationId: string): Promise<GroupWithCount[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          group_members(count)
        `)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error

      return (data || []).map(group => ({
        ...group,
        members_count: group.group_members?.[0]?.count || 0
      }))
    } catch (error) {
      throw this.handleError(error, 'findByOrganization')
    }
  }

  // Get all groups for an organization
  async getOrganizationGroups(organizationId: string): Promise<GroupWithCount[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          members:group_members(count)
        `)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error
      
      return (data || []).map(group => ({
        ...group,
        members_count: ((group.members as unknown as CountResult[])[0]?.count) ?? 0
      }))
    } catch (error) {
      throw this.handleError(error, 'getOrganizationGroups')
    }
  }

  // Get a single group with its members
  async getGroupWithMembers(groupId: string): Promise<GroupWithMembers | null> {
    try {
      const { data: group, error: groupError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', groupId)
        .is('deleted_at', null)
        .single()

      if (groupError) throw groupError
      if (!group) return null

      const { data: members, error: membersError } = await this.supabase
        .from('group_members')
        .select(`
          *,
          profile:profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .is('deleted_at', null)

      if (membersError) throw membersError

      const typedMembers: GroupMember[] = (members || []).map(member => ({
        id: member.id,
        user_id: member.user_id,
        group_id: member.group_id,
        role: member.role,
        status: member.status,
        joined_at: member.joined_at,
        deleted_at: member.deleted_at,
        notifications_enabled: member.notifications_enabled,
        profile: member.profile as GroupMember['profile']
      }))

      return {
        ...group,
        organization_id: group.organization_id,
        members: typedMembers
      }
    } catch (error) {
      throw this.handleError(error, 'getGroupWithMembers')
    }
  }

  // Add a member to a group
  async addMember(
    groupId: string, 
    userId: string, 
    data: {
      role: Database['public']['Enums']['group_member_role']
      joined_at: string
      status: string
    }
  ) {
    try {
      // First check if member exists (including soft-deleted)
      const { data: existingMember } = await this.supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        if (existingMember.deleted_at) {
          // If member was soft-deleted, reactivate them
          const { error: updateError } = await this.supabase
            .from('group_members')
            .update({
              role: data.role,
              status: data.status,
              joined_at: data.joined_at,
              deleted_at: null,
              notifications_enabled: true
            })
            .eq('id', existingMember.id)

          if (updateError) throw updateError
        } else {
          // Member already exists and is active
          throw new DalError(
            'User is already a member of this group',
            'VALIDATION_ERROR'
          )
        }
      } else {
        // Add new member
        const { error } = await this.supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: userId,
            role: data.role,
            joined_at: data.joined_at,
            status: data.status,
            notifications_enabled: true
          })

        if (error) throw error
      }
    } catch (error) {
      if (error instanceof DalError) {
        throw error
      }
      throw this.handleError(error, 'addMember')
    }
  }

  // Update a group's details
  async updateGroup(
    groupId: string,
    updates: Partial<Omit<Group, 'id' | 'organization_id' | 'created_at'>>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)

      if (error) throw error
    } catch (error) {
      throw this.handleError(error, 'updateGroup')
    }
  }

  // Remove a member from a group
  async removeMember(groupId: string, userId: string) {
    try {
      const { error } = await this.supabase
        .from('group_members')
        .update({
          deleted_at: new Date().toISOString(),
          status: 'inactive'
        })
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .is('deleted_at', null)

      if (error) throw error
    } catch (error) {
      throw this.handleError(error, 'removeMember')
    }
  }

  // Get pending join requests for a group
  async getPendingRequests(groupId: string): Promise<GroupJoinRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('group_join_requests')
        .select(`
          id,
          group_id,
          user_id,
          status,
          requested_at,
          processed_at,
          processed_by,
          message,
          user:profiles!user_id(
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending requests:', error)
        throw this.handleError(error, 'getPendingRequests')
      }

      return (data || []).map((request: any): GroupJoinRequest => ({
        id: request.id,
        group_id: request.group_id,
        user_id: request.user_id,
        status: request.status,
        requested_at: request.requested_at || new Date().toISOString(),
        processed_at: request.processed_at,
        processed_by: request.processed_by,
        message: request.message,
        user: {
          id: request.user.id,
          email: request.user.email,
          full_name: request.user.full_name,
          avatar_url: request.user.avatar_url
        }
      }))
    } catch (error) {
      if (error instanceof DalError) {
        throw error
      }
      throw this.handleError(error as Error, 'getPendingRequests')
    }
  }

  // Process a join request
  async processJoinRequest(
    requestId: string,
    status: 'approved' | 'rejected',
    processorId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('process_join_request', {
          p_request_id: requestId,
          p_status: status,
          p_processor_id: processorId
        })

      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error, 'processJoinRequest')
    }
  }

  // Update the return type and implementation of getAllGroups
  async getAllGroups(): Promise<GroupWithOrganization[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          members:group_members(count),
          organization:organizations(name, slug)
        `)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error
      
      return (data || []).map(group => {
        const membersCount = (group.members?.[0] as CountResult)?.count ?? 0
        const { members, ...groupWithoutMembers } = group
        
        return {
          ...groupWithoutMembers,
          members_count: membersCount,
          organization: group.organization as { name: string; slug: string }
        }
      })
    } catch (error) {
      throw this.handleError(error, 'getAllGroups')
    }
  }

  // Update getInvitableMembers to use proper types
  async getInvitableMembers(groupId: string, organizationId: string): Promise<Profile[]> {
    try {
      const { data: orgMembers, error: orgError } = await this.supabase
        .from('organization_members')
        .select(`
          user_id,
          profile:profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (orgError) throw orgError

      const { data: groupMembers, error: groupError } = await this.supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .is('deleted_at', null)

      if (groupError) throw groupError

      const groupMemberIds = groupMembers?.map(m => m.user_id) || []
      const invitableMembers = (orgMembers || [])
        .filter(m => !groupMemberIds.includes(m.user_id))
        .map(m => m.profile)
        .filter((profile): profile is NonNullable<Profile> => profile !== null)

      return invitableMembers
    } catch (error) {
      console.error('Error in getInvitableMembers:', error)
      throw this.handleError(error, 'getInvitableMembers')
    }
  }

  // Update error handling to match BaseRepository
  protected handleError(error: unknown, operation: string): never {
    console.error(`Error in ${operation}:`, error)
    
    if (error instanceof Error) {
      throw new DalError(
        `Operation ${operation} failed: ${error.message}`,
        'QUERY_ERROR',
        { error, operation }
      )
    }
    
    throw new DalError(
      `Operation ${operation} failed`,
      'QUERY_ERROR',
      { error, operation }
    )
  }

  // Update the updateMemberRole method in GroupRepository class
  async updateMemberRole(
    groupId: string,
    userId: string,
    newRole: Database['public']['Enums']['group_member_role']
  ) {
    try {
      const { data, error } = await this.supabase
        .from('group_members')
        .update({
          role: newRole
        })
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()

      if (error) {
        console.error('Database error in updateMemberRole:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateMemberRole:', error)
      throw this.handleError(error, 'updateMemberRole')
    }
  }

  async getPendingInvitations(groupId: string): Promise<GroupInvitation[]> {
    try {
      console.log('Fetching pending invitations for group:', groupId)
      
      const { data, error } = await this.supabase
        .from('group_invitations')
        .select(`
          *,
          invited_user_profile:profiles!invited_user(
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching invitations:', error)
        throw error
      }

      console.log('Raw invitations data:', data)

      const invitations = (data || []).map(invitation => ({
        ...invitation,
        invited_user_profile: Array.isArray(invitation.invited_user_profile) 
          ? invitation.invited_user_profile[0] 
          : invitation.invited_user_profile
      }))

      console.log('Processed invitations:', invitations)

      return invitations
    } catch (error) {
      console.error('Error in getPendingInvitations:', error)
      throw this.handleError(error, 'getPendingInvitations')
    }
  }

  async createInvitation(data: {
    groupId: string
    organizationId: string
    invitedBy: string
    invitedUser: string
    role: Database['public']['Enums']['group_member_role']
  }) {
    try {
      // First check for existing pending invitations
      const { data: existingInvite } = await this.supabase
        .from('group_invitations')
        .select('id, status')
        .eq('group_id', data.groupId)
        .eq('invited_user', data.invitedUser)
        .eq('status', 'pending')
        .single()

      if (existingInvite) {
        throw new Error('User already has a pending invitation to this group')
      }

      // Create new invitation
      const { data: invitation, error } = await this.supabase
        .from('group_invitations')
        .insert({
          group_id: data.groupId,
          organization_id: data.organizationId,
          invited_by: data.invitedBy,
          invited_user: data.invitedUser,
          role: data.role,
          status: 'pending',
          token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('User already has a pending invitation to this group')
        }
        throw error
      }

      return invitation
    } catch (error) {
      throw this.handleError(error, 'createInvitation')
    }
  }
}
```

# lib/dal/repositories/impersonation.ts

```ts
import { BaseRepositoryBase } from '../base/repository-base'
import type { Database } from '@/database.types'
import { DalError } from '../errors'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export class ImpersonationRepository extends BaseRepositoryBase<'profiles'> {
  protected tableName = 'profiles' as const
  protected organizationField = 'organization_id' as keyof ProfileRow

  constructor(protected client: SupabaseClient<Database>, context?: TenantContext) {
    super(client, context)
  }

  async verifyImpersonationAccess(actorId: string, targetId: string) {
    // Add check to prevent self-impersonation
    if (actorId === targetId) {
      throw new DalError('Cannot impersonate yourself', 'VALIDATION_ERROR')
    }

    // Get actor's profile and verify superadmin status
    const { data: actor } = await this.client
      .from(this.tableName)
      .select('is_superadmin, email')
      .eq('id', actorId)
      .single()

    if (!actor?.is_superadmin) {
      throw new DalError('Unauthorized - Superadmin access required', 'PERMISSION_DENIED')
    }

    // Verify target exists and get organization context
    const { data: target } = await this.client
      .from(this.tableName)
      .select(`
        *,
        organization_members!inner (
          organization_id
        )
      `)
      .eq('id', targetId)
      .single()

    if (!target) {
      throw new DalError('Target user not found', 'RESOURCE_NOT_FOUND')
    }

    return {
      actor,
      target,
      organizationId: target.organization_members[0]?.organization_id
    }
  }

  async startImpersonation(actorId: string, targetId: string) {
    const { actor, target, organizationId } = await this.verifyImpersonationAccess(actorId, targetId)

    // Set impersonation metadata
    const { error: updateError } = await this.client.auth.admin.updateUserById(
      actorId,
      {
        app_metadata: {
          impersonation: {
            impersonating: targetId,
            original_user: actorId,
            started_at: Date.now()
          }
        }
      }
    )

    if (updateError) {
      throw new DalError(
        `Failed to update user metadata: ${updateError.message}`,
        'DATABASE_ERROR',
        {
          organizationId,
          actorId,
          targetId,
          error: updateError.message
        }
      )
    }

    return { actor, target }
  }

  async stopImpersonation(actorId: string) {
    const { error } = await this.client.auth.admin.updateUserById(
      actorId,
      {
        app_metadata: {
          impersonation: null
        }
      }
    )

    if (error) {
      throw new DalError(
        `Failed to clear impersonation metadata: ${error.message}`,
        'DATABASE_ERROR',
        {
          actorId,
          error: error.message
        }
      )
    }
  }

  async getImpersonationStatus(userId: string) {
    const { data: { user }, error } = await this.client.auth.admin.getUserById(userId)
    
    if (error || !user) {
      return null
    }

    return user.app_metadata?.impersonation
  }

  async logImpersonationEvent(data: {
    action: 'impersonation_start' | 'impersonation_end'
    actorId: string
    targetId: string
    organizationId: string
    metadata?: Record<string, any>
  }) {
    // Implementation here
  }
}

```

# lib/dal/repositories/index.ts

```ts
export * from './group'
export * from './organization'
export * from './organization-member'
export * from './user'
export * from './profile'
export * from './organization-settings'

// Re-export repository types
export type { 
  OrganizationRepository,
  OrganizationMemberRepository,
  UserRepository,
  ProfileRepository,
  SettingsRepository
} from './types' 
```

# lib/dal/repositories/organization-limit.ts

```ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import { DalError } from '../errors'

type OrganizationLimitRow = Database['public']['Tables']['organization_limits']['Row']

export class OrganizationLimitRepository extends BaseRepository<'organization_limits'> {
  protected tableName = 'organization_limits' as const
  protected organizationField = 'organization_id' as keyof OrganizationLimitRow

  async getLimitsByType(resourceType: string): Promise<OrganizationLimitRow | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('resource_type', resourceType)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw DalError.operationFailed('getLimitsByType', error)
    }
  }

  async updateUsage(resourceType: string, currentUsage: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .update({ 
          current_usage: currentUsage,
          updated_at: new Date().toISOString()
        } as any)
        .eq('resource_type', resourceType)

      if (error) throw error
    } catch (error) {
      throw DalError.operationFailed('updateUsage', error)
    }
  }

  async checkLimit(resourceType: string, requestedAmount: number): Promise<boolean> {
    const limit = await this.getLimitsByType(resourceType)
    if (!limit) return true // No limit set

    const currentUsage = limit.current_usage || 0
    return currentUsage + requestedAmount <= limit.max_amount
  }

  async incrementUsage(resourceType: string, amount = 1): Promise<void> {
    const limit = await this.getLimitsByType(resourceType)
    if (!limit) return // No limit to update

    const currentUsage = limit.current_usage || 0
    await this.updateUsage(resourceType, currentUsage + amount)
  }

  async decrementUsage(resourceType: string, amount = 1): Promise<void> {
    const limit = await this.getLimitsByType(resourceType)
    if (!limit) return // No limit to update

    const currentUsage = limit.current_usage || 0
    const newUsage = Math.max(0, currentUsage - amount)
    await this.updateUsage(resourceType, newUsage)
  }
} 
```

# lib/dal/repositories/organization-member.ts

```ts
// lib/dal/repositories/organization-member.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { PostgrestResponse } from '@supabase/postgrest-js'

type OrganizationMemberRow = Database['public']['Tables']['organization_members']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

export interface MemberWithProfile extends OrganizationMemberRow {
  profile: Pick<ProfileRow, 'id' | 'email' | 'full_name' | 'avatar_url'>
}

export class OrganizationMemberRepository extends BaseRepository<'organization_members'> {
  protected tableName = 'organization_members' as const
  protected organizationField = 'organization_id' as const

  async findByRole(role: Database['public']['Enums']['user_role']): Promise<MemberWithProfile[]> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('role', role)
        .select(`
          *,
          profile:profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .throwOnError() as PostgrestResponse<MemberWithProfile>

      return data ?? []
    } catch (error) {
      throw this.handleError(error, 'findByRole')
    }
  }

  async findByOrganization(organizationId: string): Promise<MemberWithProfile[]> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('organization_id', organizationId)
        .select(`
          *,
          profile:profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .throwOnError() as PostgrestResponse<MemberWithProfile>

      return data ?? []
    } catch (error) {
      throw this.handleError(error, 'findByOrganization')
    }
  }
}
```

# lib/dal/repositories/organization-settings.ts

```ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { Json } from '@/database.types'
import { log } from '@/lib/utils/logger'

type OrganizationSetting = Database['public']['Tables']['organization_settings']['Row']

export class OrganizationSettingsRepository extends BaseRepository<'organization_settings'> {
  protected tableName = 'organization_settings' as const
  protected organizationField = 'organization_id' as const

  async getSettings(organizationId: string): Promise<Record<string, Json>> {
    log.info('Fetching settings for organization', { organizationId })

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('key, value')
        .eq('organization_id', organizationId)

      if (error) {
        log.error('Error fetching settings', { error })
        throw error
      }

      log.info('Settings fetched successfully', { data })
      return (data || []).reduce((acc, { key, value }) => ({
        ...acc,
        [key]: value
      }), {})
    } catch (error) {
      log.error('Exception in getSettings', { error })
      throw this.handleError(error, 'getSettings')
    }
  }

  async setSetting(organizationId: string, key: string, value: Json): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .upsert({
          organization_id: organizationId,
          key,
          value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id,key'
        })

      if (error) throw error
    } catch (error) {
      throw this.handleError(error, 'setSetting')
    }
  }

  async setSettings(organizationId: string, settings: Record<string, Json>): Promise<void> {
    try {
      const values = Object.entries(settings).map(([key, value]) => ({
        organization_id: organizationId,
        key,
        value,
        updated_at: new Date().toISOString()
      }))

      const { error } = await this.supabase
        .from(this.tableName)
        .upsert(values, {
          onConflict: 'organization_id,key'
        })

      if (error) throw error
    } catch (error) {
      throw this.handleError(error, 'setSettings')
    }
  }
} 
```

# lib/dal/repositories/organization.ts

```ts
// lib/dal/repositories/organization.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type{ Json } from '@/database.types'
import { DalError } from '../errors'
import { OrganizationSettingsRepository } from './organization-settings'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']
type OrganizationLimitRow = Database['public']['Tables']['organization_limits']['Row']

export interface OrganizationWithStats extends Omit<OrganizationRow, 'settings'> {
  memberCount: number
  settings: Record<string, Json> | null
}

export class OrganizationRepository extends BaseRepository<'organizations'> {
  protected tableName = 'organizations' as const
  protected organizationField = 'id' as keyof OrganizationRow

  async findBySlug(slug: string): Promise<OrganizationRow | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      throw DalError.operationFailed('findBySlug', error)
    }
  }

  async findWithStats(id: string): Promise<OrganizationWithStats | null> {
    try {
      const [org, settings, memberCount] = await Promise.all([
        this.findById(id),
        new OrganizationSettingsRepository(this.supabase).getSettings(id),
        this.getMemberCount(id)
      ])

      if (!org) return null

      return {
        ...org,
        memberCount,
        settings
      }
    } catch (error) {
      throw this.handleError(error, 'findWithStats')
    }
  }

  private async getMemberCount(organizationId: string): Promise<number> {
    const { count } = await this.supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    return count || 0
  }

  async findAll(): Promise<OrganizationWithStats[]> {
    try {
      const { data, error } = await this.baseQuery()
        .select(`
          *,
          organization_members(count)
        `)
        .order('name')

      if (error) throw error

      const orgsWithSettings = await Promise.all(
        (data || []).map(async (org) => {
          const settings = await new OrganizationSettingsRepository(this.supabase)
            .getSettings(org.id)

          return {
            ...org,
            memberCount: org.organization_members?.[0]?.count || 0,
            settings
          }
        })
      )

      return orgsWithSettings
    } catch (error) {
      throw DalError.operationFailed('findAll', error)
    }
  }

  async getStats(): Promise<{
    memberCount: number
    // Add other stats you want to track
  }> {
    try {
      const { data, error } = await this.baseQuery()
        .select(`
          *,
          organization_members(count)
        `)
        .single()

      if (error) throw error

      return {
        memberCount: data.organization_members?.[0]?.count || 0,
        // Add other stats here
      }
    } catch (error) {
      throw DalError.operationFailed('getStats', error)
    }
  }

  async findByLimits(resourceType: string): Promise<OrganizationLimitRow[]> {
    try {
      const { data, error } = await this.supabase
        .from('organization_limits')
        .select('*')
        .filter('resource_type', 'eq', resourceType)

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findByLimits')
    }
  }

  async findById(id: string): Promise<OrganizationRow | null>{
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      throw DalError.operationFailed('findById', error)
    }
  }
}
```

# lib/dal/repositories/profile.ts

```ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import { DalError } from '../errors'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class ProfileRepository extends BaseRepository<'profiles'> {
  protected tableName = 'profiles' as const
  protected organizationField = undefined

  async findWithOrganizations(userId: string) {
    try {
      const { data, error } = await this.baseQuery()
        .eq('id', userId)
        .select(`
          *,
          organization_members!inner (
            role,
            organizations!inner (
              id,
              name,
              slug
            )
          )
        `)
        .single()

      if (error) throw error
      return data as ProfileRow & {
        organization_members: Array<{
          role: Database['public']['Enums']['user_role']
          organizations: {
            id: string
            name: string
            slug: string
          }
        }>
      }
    } catch (error) {
      throw DalError.operationFailed('findWithOrganizations', error)
    }
  }

  async findByEmail(email: string): Promise<ProfileRow | null> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('email', email)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      throw DalError.operationFailed('findByEmail', error)
    }
  }

  async updateLastActivity(userId: string): Promise<void> {
    await this.supabase
      .from(this.tableName)
      .update({
        last_login: new Date().toISOString()
      })
      .eq('id', userId)
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: NonNullable<ProfileRow['notification_preferences']>
  ): Promise<void> {
    await this.update(userId, {
      notification_preferences: preferences
    })
  }

  async updateProfile(userId: string, data: Partial<ProfileRow>) {
    try {
      const { data: profile, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return profile
    } catch (error) {
      throw this.handleError(error, 'updateProfile')
    }
  }
} 
```

# lib/dal/repositories/repository-types.ts

```ts
import type { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'

// Repository type definitions
export type OrganizationRepository = BaseRepository<'organizations'>
export type OrganizationMemberRepository = BaseRepository<'organization_members'>
export type UserRepository = BaseRepository<'profiles'>
export type AuditLogRepository = BaseRepository<'user_activity_logs'>
export type ProfileRepository = BaseRepository<'profiles'>
export type SettingsRepository = BaseRepository<'organization_settings'> 
```

# lib/dal/repositories/types.ts

```ts
import type { Database } from '@/database.types'


// Base entity interface
export interface BaseEntity extends Record<string, unknown> {
  id: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
}

// Entity types
export interface Organization extends Record<string, unknown> {
  id: string
  name: string
  slug: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
  settings?: {
    features?: string[]
    [key: string]: any
  }
}

export interface Profile extends Record<string, unknown> {
  id: string
  email: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
  full_name?: string
  avatar_url?: string
  is_superadmin?: boolean
  theme?: string
  notification_preferences?: Record<string, boolean>
  last_login?: string
  memberships?: Array<{
    role: string
    organizations: {
      id: string
      name: string
      slug: string
    }
  }>
}

export interface OrganizationMember extends Record<string, unknown> {
  id: string
  organization_id: string
  user_id: string
  role: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
}

export interface OrganizationSettings extends Record<string, unknown> {
  id: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
  settings: {
    features_enabled?: string[]
    branding?: {
      logo_url?: string
      primary_color?: string
    }
    email_templates?: Record<string, any>
    [key: string]: any
  }
}

export interface EventAttendee {
  user_id: string
  status: 'pending' | 'approved' | 'declined' | 'waitlisted'
  profile: {
    id: string
    email: string
    full_name: string
    avatar_url?: string
  }
}

export interface Event extends BaseEntity {
  organization_id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  location_id?: string
  organizer_id: string
  status: 'draft' | 'published' | 'cancelled'
  visibility_level: 'public' | 'members_only' | 'staff_only' | 'private'
  max_attendees?: number
  settings?: {
    allow_waitlist?: boolean
    require_approval?: boolean
    [key: string]: any
  }
  organizer?: {
    id: string
    email: string
    full_name: string
  }
  location?: {
    id: string
    name: string
    address: string
    [key: string]: any
  }
  attendees?: EventAttendee[]
}

// Import repository types from separate file
export type { 
  OrganizationRepository,
  OrganizationMemberRepository,
  UserRepository,
  ProfileRepository,
  SettingsRepository
} from './repository-types' 
```

# lib/dal/repositories/user.ts

```ts
// lib/dal/repositories/user.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export class UserRepository extends BaseRepository<'profiles'> {
  protected tableName = 'profiles' as const
  protected organizationField = undefined

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {
    super(supabase, context)
  }

  async findByEmail(email: string): Promise<ProfileRow | null> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('email', email)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error, 'findByEmail')
    }
  }

  async findAll(): Promise<ProfileRow[]> {
    try {
      const { data, error } = await this.baseQuery()
        .select('*')

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findAll')
    }
  }
}
```

# lib/dal/types.ts

```ts
// lib/dal/types.ts
import type { Database } from '@/database.types'

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

export type TableName = keyof Tables
export type TableRow<T extends TableName> = Tables[T]['Row']
export type TableInsert<T extends TableName> = Tables[T]['Insert']
export type TableUpdate<T extends TableName> = Tables[T]['Update']

export type AuditLogRow = Tables['user_activity_logs']['Row']
export type AuditLogInsert = Tables['user_activity_logs']['Insert']
export type AuditLogUpdate = Tables['user_activity_logs']['Update']
```

# lib/dal/types/index.ts

```ts
import type { Database as DatabaseGenerated } from '@/database.types'
import type { SupabaseClient as SupabaseClientOriginal } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'

// Database Types
export type Database = DatabaseGenerated
export type TableName = keyof Database['public']['Tables']
export type Json = Database['public']['Tables']['organization_settings']['Row']['value']

// Supabase Client Type
export type SupabaseClient<T extends Database = Database> = SupabaseClientOriginal<T>

// Re-export TenantContext
export { TenantContext }

// Define and export QueryOptions if needed
export type QueryOptions = {
  // Define the structure of QueryOptions here
}

// Error Types
export interface PublicError {
  message: string
  code: string
}

export type ErrorCode = 
  | 'RESOURCE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'INITIALIZATION_ERROR'
  | 'TRANSACTION_ERROR'
  | 'QUERY_ERROR'
  | 'VALIDATION_ERROR'

// Cache Types
export interface CacheEntry {
  data: any
  expires: number
}

// Monitoring Types
export interface MetricTags {
  organization_id?: string
  user_id?: string
  operation: string
  status: 'success' | 'error'
}

// Re-export all types
export * from '../repositories/types' 

interface GroupWithOrganization {
  id: string
  name: string
  organization_id: string
  organization: {
    id: string
    name: string
  }
}
```

# lib/errors/index.ts

```ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError
  }
}

export class AuthError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, context)
    this.name = 'AuthError'
  }
}

export class PermissionError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'PERMISSION_ERROR', 403, context)
    this.name = 'PermissionError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NOT_FOUND', 404, context)
    this.name = 'NotFoundError'
  }
} 
```

# lib/events/impersonation.ts

```ts
export type ImpersonationEventType = 'start' | 'stop'

export interface ImpersonationEventDetail {
  type: ImpersonationEventType
  userId?: string
}

export const IMPERSONATION_EVENT = 'impersonation-state-change'

export function emitImpersonationEvent(detail: ImpersonationEventDetail) {
  const event = new CustomEvent<ImpersonationEventDetail>(IMPERSONATION_EVENT, {
    detail,
    bubbles: true,
    composed: true
  })
  window.dispatchEvent(event)
}
```

# lib/hooks/use-impersonation.ts

```ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import type { ImpersonationState } from '@/lib/types/impersonation'
import { createClient } from '@/lib/utils/supabase/client'

export function useImpersonationStatus(): ImpersonationState {
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/impersonation-status', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      setState(current => ({
        ...current,
        ...data,
        isInitialized: true
      }))
    } catch (error) {
      console.error('Failed to check impersonation status:', error)
    }
  }, [])

  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    impersonatingId: null,
    realUserId: null,
    isInitialized: false,
    refresh: checkStatus
  })

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  return state
} 
```

# lib/hooks/use-mobile.tsx

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

# lib/hooks/use-mounted.ts

```ts
import * as React from "react"

export function useMounted() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
} 
```

# lib/hooks/use-toast.ts

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

# lib/hooks/usePermissions.ts

```ts
import { useCallback } from 'react'
import { useUser } from '@/lib/hooks/useUser'

export function usePermissions() {
  const { user } = useUser()

  const checkPermission = useCallback(async (
    action: string,
    resourceType: string,
    resourceId: string
  ) => {
    if (!user) return false
    
    // Client-side superadmin check
    if (user.is_superadmin) return true

    // Make API call to check other permissions
    const response = await fetch(`/api/permissions/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, resourceType, resourceId })
    })

    const { hasPermission } = await response.json()
    return hasPermission
  }, [user])

  return { checkPermission }
} 
```

# lib/hooks/useUser.ts

```ts
'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import type { Profile } from '@/lib/types/auth'

interface UserState {
  user: Profile | null
  loading: boolean
  error: Error | null
}

export function useUser() {
  const [state, setState] = useState<UserState>({
    user: null,
    loading: true,
    error: null
  })

  const supabase = createClient()

  const fetchUser = useCallback(async () => {
    try {
      // Get auth user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setState({ user: null, loading: false, error: null })
        return
      }

      // Get profile with superadmin status
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          organization_members(
            role,
            organizations(
              id,
              name
            )
          )
        `)
        .eq('id', authUser.id)
        .single()

      setState({ 
        user: profile as Profile,
        loading: false,
        error: null 
      })
    } catch (error) {
      setState({ 
        user: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Failed to fetch user') 
      })
    }
  }, [supabase])

  useEffect(() => {
    fetchUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUser, supabase.auth])

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }))
    fetchUser()
  }, [fetchUser])

  return {
    ...state,
    refresh
  }
} 
```

# lib/middleware/auth/auth.ts

```ts
// middleware/auth/auth.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'

export const authMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const { supabase, response } = createMiddlewareClient(req)
    
    const { data: { user } } = await supabase.auth.getUser()

    // Define public paths that don't need auth
    const publicPaths = [
      '/sign-in', 
      '/sign-up', 
      '/forgot-password', 
      '/accept-invite', 
      '/auth/callback'
    ]
    
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname === path || // Exact match
      req.nextUrl.pathname.startsWith('/auth/') // All auth routes
    )

    // Allow public paths even without authentication
    if (isPublicPath) {
      return next(req, response)
    }

    // Redirect to sign-in if not authenticated and trying to access protected route
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Add auth context to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', user.id)

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
}
```

# lib/middleware/auth/impersonation.ts

```ts
// middleware/auth/impersonation.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { ImpersonationCookies } from '@/lib/utils/impersonation-cookies'

export const impersonationMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const { supabase, response } = createMiddlewareClient(req)
    const impersonatingId = await ImpersonationCookies.get()
    
    if (impersonatingId) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Clear invalid impersonation
        const response = NextResponse.redirect(new URL('/sign-in', req.url))
        ImpersonationCookies.clear()
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
        const response = NextResponse.redirect(new URL('/', req.url))
        ImpersonationCookies.clear()
        return response
      }

      // Add impersonation context to headers
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-impersonating-id', impersonatingId)
      requestHeaders.set('x-real-user-id', user.id)

      return next(
        new NextRequest(req.url, { headers: requestHeaders }),
        response
      )
    }

    return next(req, res)
  } catch (error) {
    console.error('Impersonation middleware error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}
```

# lib/middleware/auth/rbac.ts

```ts
// middleware/auth/rbac.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { validateRequiredHeaders } from '../utils/headers'

export const rbacMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    // Validate required headers from previous middleware
    if (!validateRequiredHeaders(req, ['x-user-id', 'x-organization-id'], 'RBAC')) {
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const userId = req.headers.get('x-user-id')
    const orgId = req.headers.get('x-organization-id')
    const { supabase, response } = createMiddlewareClient(req)
    
    // Check if user is superadmin first
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', userId)
      .single()

    if (profile?.is_superadmin) {
      // Superadmin has all permissions
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-user-role', 'superadmin')
      requestHeaders.set('x-is-superadmin', 'true')
      
      return next(
        new NextRequest(req.url, { headers: requestHeaders }),
        response
      )
    }

    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single()
      
    if (!membership) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    // Add role context
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-role', membership.role)
    
    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('RBAC middleware error:', error)
    throw error // Let error middleware handle it
  }
}
```

# lib/middleware/auth/session.ts

```ts
// middleware/auth/session.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'

export const sessionMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const { supabase, response } = createMiddlewareClient(req)
    
    // Skip session check for public paths
    const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback']
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname === path ||
      req.nextUrl.pathname.startsWith('/auth/')
    )
    
    if (isPublicPath) {
      return next(req, response)
    }
    
    // Use getUser instead of getSession for security
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user || error) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    
    // Get session only after verifying user
    const { data: { session } } = await supabase.auth.getSession()
    
    // Add session info to request context
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', user.id)
    if (session?.access_token) {
      requestHeaders.set('x-session-token', session.access_token)
    }
    
    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Session middleware error:', error)
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
}
```

# lib/middleware/auth/superadmin.ts

```ts
// middleware/auth/superadmin.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'

export const superadminMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const { supabase, response } = createMiddlewareClient(req)
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_superadmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Add superadmin context to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-is-superadmin', '1')
    requestHeaders.set('x-user-role', 'superadmin')

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Superadmin middleware error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}
```

# lib/middleware/auth/tenant.ts

```ts
import type { MiddlewareFactory } from '../types'
import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { validateRequiredHeaders } from '../utils/headers'

interface OrganizationResponse {
  role: string
  organizations: {
    id: string
    slug: string
    settings: Record<string, any>
  }
}

export const tenantMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    if (!validateRequiredHeaders(req, ['x-user-id'], 'Tenant')) {
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const userId = req.headers.get('x-user-id')
    const orgSlug = req.nextUrl.pathname.split('/')[2]
    const { supabase, response } = createMiddlewareClient(req)
    
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        organizations!inner (
          id,
          slug,
          settings
        )
      `)
      .eq('user_id', userId)
      .eq('organizations.slug', orgSlug)
      .single()

    if (error || !membership) {
      console.error('Tenant access error:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }

    const typedMembership = membership as unknown as OrganizationResponse
    const { role, organizations } = typedMembership

    // Set all context headers at once
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-role', role)
    requestHeaders.set('x-organization-id', organizations.id)
    requestHeaders.set('x-organization-slug', organizations.slug)
    requestHeaders.set('x-organization-settings', JSON.stringify(organizations.settings))

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Tenant middleware error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}

```

# lib/middleware/core/error.ts

```ts
import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { Monitor } from '@/lib/monitoring'
import { AppError, AuthError, PermissionError } from '@/lib/errors'

export const errorMiddleware: MiddlewareFactory = async (req, res, next) => {
  const monitor = Monitor.getInstance()
  const startTime = Date.now()

  try {
    const response = await next(req, res)
    monitor.trackMetric('middleware.duration', Date.now() - startTime, {
      path: req.nextUrl.pathname,
      success: 'true'
    })
    return response
  } catch (error) {
    monitor.trackMetric('middleware.duration', Date.now() - startTime, {
      path: req.nextUrl.pathname,
      success: 'false'
    })

    if (AppError.isAppError(error)) {
      monitor.trackError(error, { path: req.nextUrl.pathname })

      if (error instanceof AuthError) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
      }
      if (error instanceof PermissionError) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Unhandled errors
    monitor.trackError(error as Error, { 
      path: req.nextUrl.pathname,
      unhandled: true 
    })
    return NextResponse.redirect(new URL('/error', req.url))
  }
}

```

# lib/middleware/core/logging.ts

```ts
// middleware/core/logging.ts
import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '../types'

export const loggingMiddleware: MiddlewareFactory = async (req, res, next) => {
  const start = Date.now()
  const requestId = crypto.randomUUID()
  
  try {
    const response = await next(req, res)
    const duration = Date.now() - start
    
    // Structured logging
    console.log(JSON.stringify({
      requestId,
      method: req.method,
      path: req.nextUrl.pathname,
      duration,
      status: response.status,
      timestamp: new Date().toISOString()
    }))
    
    return response
  } catch (error) {
    console.error('Request error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.nextUrl.pathname
    })
    throw error
  }
}
```

# lib/middleware/core/rateLimit.ts

```ts
// middleware/core/rateLimit.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'

const rateLimit = new Map<string, { count: number; reset: number }>()

const RATE_LIMITS = {
  authenticated: {
    limit: 200,      // 200 requests
    window: 60000,   // per 1 minute
  },
  unauthenticated: {
    limit: 50,       // 50 requests
    window: 60000,   // per 1 minute
  }
}

// Paths that bypass rate limiting completely
const BYPASS_PATHS = [
  '/_next',
  '/static',
  '/images',
  '/api/health',
  '/favicon.ico',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/accept-invite',
  '/auth/'  // All auth routes
]

async function isRateLimited(key: string | null, config: typeof RATE_LIMITS.authenticated) {
  if (!key) return false
  
  const now = Date.now()
  const record = rateLimit.get(key)
  
  if (!record || record.reset < now) {
    rateLimit.set(key, { 
      count: 1, 
      reset: now + config.window 
    })
    return false
  }
  
  if (record.count >= config.limit) {
    const remainingTime = Math.ceil((record.reset - now) / 1000)
    return { limited: true, remainingTime }
  }
  
  record.count++
  return false
}

export const rateLimitMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const path = req.nextUrl.pathname
    
    // Skip rate limiting for bypassed paths
    if (BYPASS_PATHS.some(prefix => path.startsWith(prefix))) {
      console.log(`Skipping rate limit for path: ${path}`)
      return next(req, res)
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
    const sessionToken = req.cookies.get('session')?.value
    const isAuthenticated = !!sessionToken

    // Use different keys based on auth status
    const rateLimitKey = isAuthenticated 
      ? `auth:${sessionToken}:${clientIp}`
      : `unauth:${clientIp}`

    const config = isAuthenticated 
      ? RATE_LIMITS.authenticated 
      : RATE_LIMITS.unauthenticated

    const limitResult = await isRateLimited(rateLimitKey, config)

    if (limitResult && typeof limitResult === 'object' && limitResult.limited) {
      const response = NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Too many attempts. Please try again in ${limitResult.remainingTime} seconds.`,
          retryAfter: limitResult.remainingTime
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(limitResult.remainingTime),
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + limitResult.remainingTime)
          }
        }
      )

      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Expose-Headers', 'Retry-After, X-RateLimit-Reset')

      return response
    }
    
    return next(req, res)
  } catch (error) {
    console.error('Rate limit middleware error:', error)
    return next(req, res)
  }
}
```

# lib/middleware/stack.ts

```ts
// middleware/stack.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '@/lib/middleware/types'

export function stackMiddlewares(
  functions: MiddlewareFactory[] = [],
  index = 0
): MiddlewareFactory {
  const current = functions[index]
  
  if (current) {
    const next = stackMiddlewares(functions, index + 1)
    return async (request: NextRequest, response: NextResponse) => {
      try {
        const nextFn = async (req: NextRequest, res: NextResponse) => {
          return next(req, res, nextFn)
        }
        return await current(request, response, nextFn)
      } catch (error) {
        console.error(`Error in middleware[${index}]:`, error)
        throw error
      }
    }
  }
  
  return async (_request: NextRequest, response: NextResponse) => response
}
```

# lib/middleware/tenant/features.ts

```ts
// middleware/tenant/features.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import type { FeatureSettings } from './types'
import { getRequestedFeature } from './types'
import { validateRequiredHeaders } from '../utils/headers'

export const featureMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    // Validate required headers from previous middleware
    const requiredHeaders = [
      'x-organization-id',
      'x-organization-settings'
    ]
    
    if (!validateRequiredHeaders(req, requiredHeaders, 'Features')) {
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const orgId = req.headers.get('x-organization-id')
    const settingsJson = req.headers.get('x-organization-settings')
    
    // Parse and validate settings
    let settings: FeatureSettings
    try {
      settings = JSON.parse(settingsJson!) as FeatureSettings
    } catch (error) {
      console.error('Invalid settings JSON:', error)
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const features = settings.features_enabled || []
    const requestedFeature = getRequestedFeature(req.nextUrl.pathname)
    
    if (requestedFeature && !features.includes(requestedFeature)) {
      console.warn(`Access denied to feature: ${requestedFeature}`)
      return NextResponse.redirect(new URL(`/org/${orgId}/upgrade`, req.url))
    }
    
    // Add features to headers for downstream use
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-organization-features', JSON.stringify(features))
    
    const newReq = new NextRequest(req.url, {
      headers: requestHeaders,
    })

    return next(newReq, res)
  } catch (error) {
    console.error('Feature middleware error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}
```

# lib/middleware/tenant/organization.ts

```ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import type { OrganizationMembership } from './types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { validateRequiredHeaders } from '../utils/headers'

export const organizationMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    // Validate required headers from previous middleware
    if (!validateRequiredHeaders(req, ['x-user-id'], 'Organization')) {
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const userId = req.headers.get('x-user-id')
    const { supabase, response } = createMiddlewareClient(req)
    
    // Get organization slug from URL (/org/[slug]/...)
    const orgSlug = req.nextUrl.pathname.split('/')[2]

    // Check if user has access to this organization
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        organizations!inner (
          id,
          slug,
          settings
        )
      `)
      .eq('user_id', userId)
      .eq('organizations.slug', orgSlug)
      .single()

    if (error || !membership) {
      console.error('Organization access error:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }

    const typedMembership = membership as unknown as OrganizationMembership

    // Add organization context to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-organization-role', typedMembership.role)
    requestHeaders.set('x-organization-slug', typedMembership.organizations.slug)
    requestHeaders.set('x-organization-id', typedMembership.organizations.id)
    requestHeaders.set(
      'x-organization-settings', 
      JSON.stringify(typedMembership.organizations.settings)
    )

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Organization middleware error:', error)
    return NextResponse.redirect(new URL('/', req.url))
  }
} 
```

# lib/middleware/tenant/types.ts

```ts
import type { Database } from '@/database.types'

export interface OrganizationData {
  id: string
  slug: string
  settings: Record<string, any>
}

export interface OrganizationMembership {
  role: string
  organizations: OrganizationData
}

export interface FeatureSettings {
  features_enabled: string[]
  [key: string]: any
}

export function getRequestedFeature(pathname: string): string | null {
  const featureMap: Record<string, string> = {
    '/events': 'events',
    '/members': 'members',
    '/communications': 'communications',
    // Add other feature mappings
  }
  
  const path = pathname.split('/')[3] // Get feature path after /org/[slug]/
  return featureMap[path] || null
} 
```

# lib/middleware/types.ts

```ts
// middleware/types.ts
import { NextResponse, NextRequest } from 'next/server'

export type MiddlewareFactory = (
  request: NextRequest,
  response: NextResponse,
  next: (request: NextRequest, response: NextResponse) => Promise<NextResponse>
) => Promise<NextResponse>

export interface RequestContext {
  organizationId?: string;
  userId?: string;
  userRole?: string;
  features?: string[];
}
```

# lib/middleware/utils/headers.ts

```ts
import { NextRequest } from 'next/server'

export function validateRequiredHeaders(
  req: NextRequest,
  headers: string[],
  middlewareName: string
): boolean {
  const missing = headers.filter(header => !req.headers.get(header))
  
  if (missing.length > 0) {
    console.error(`${middlewareName}: Missing required headers`, missing)
    return false
  }
  
  return true
} 
```

# lib/monitoring/index.ts

```ts
interface Metric {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp: number
}

export class Monitor {
  private static instance: Monitor
  private metrics: Metric[] = []

  private constructor() {}

  static getInstance(): Monitor {
    if (!this.instance) {
      this.instance = new Monitor()
    }
    return this.instance
  }

  trackMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now()
    }
    
    this.metrics.push(metric)
    
    // Log metric for development/debugging
    if (process.env.NODE_ENV !== 'production') {
      console.info('Metric:', metric)
    }
  }

  trackError(error: Error, context?: Record<string, any>): void {
    console.error('Application error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context
    })
  }
} 
```

# lib/services/auth.ts

```ts
// lib/services/auth.ts
import { createClient } from '@/lib/utils/supabase/server'
import { type AuthError } from '@supabase/supabase-js'
import { ProfileRepository } from '@/lib/dal/repositories/profile'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { type SupabaseClient } from '@supabase/supabase-js'
import { type JsonValue } from '@/lib/types/audit'

export class AuthService {
  private supabase: SupabaseClient
  private profileRepo: ProfileRepository
  private auditRepo: AuditLogRepository

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.profileRepo = new ProfileRepository(supabase)
    this.auditRepo = new AuditLogRepository(supabase)
  }

  static async create(): Promise<AuthService> {
    const supabase = await createClient()
    return new AuthService(supabase)
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Update profile
    await this.profileRepo.updateLastActivity(data.user.id)

    // Log the sign in
    await this.logUserLogin(data.user.id)

    return data
  }

  async signOut(userId: string) {
    await this.supabase.auth.signOut()

    // Log the sign out
    await this.logUserLogout(userId)
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  async updatePassword(userId: string, newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    await this.logPasswordChange(userId)
  }

  async logUserLogin(userId: string, metadata?: JsonValue) {
    await this.auditRepo.create({
      user_id: userId,
      event_type: 'auth',
      details: `User ${userId} logged in`,
      metadata: metadata ?? null
    })
  }

  async logUserLogout(userId: string) {
    await this.auditRepo.create({
      user_id: userId,
      event_type: 'auth',
      details: `User ${userId} logged out`
    })
  }

  async logPasswordChange(userId: string) {
    await this.auditRepo.create({
      user_id: userId,
      event_type: 'auth',
      details: `User ${userId} changed their password`
    })
  }
}
```

# lib/services/impersonation.ts

```ts
// lib/services/impersonation.ts
import { ImpersonationRepository } from '@/lib/dal/repositories/impersonation'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { createClient } from '@/lib/utils/supabase/server'
import { ImpersonationCookies } from '@/lib/utils/impersonation-cookies'
import { ImpersonationStartResult, ImpersonationStopResult } from '@/lib/types/impersonation'
import { getEventCategory } from '@/lib/types/audit'

export class ImpersonationService {
  private impersonationRepo: ImpersonationRepository
  private auditRepo: AuditLogRepository

  private constructor(
    impersonationRepo: ImpersonationRepository,
    auditRepo: AuditLogRepository
  ) {
    this.impersonationRepo = impersonationRepo
    this.auditRepo = auditRepo
  }

  static async create() {
    const supabase = await createClient(true)
    return new ImpersonationService(
      new ImpersonationRepository(supabase),
      new AuditLogRepository(supabase)
    )
  }

  async startImpersonation(adminId: string, targetUserId: string): Promise<ImpersonationStartResult> {
    try {
      const result = await this.impersonationRepo.startImpersonation(adminId, targetUserId)

      // Get organization context from target's memberships
      const organizationId = result.target.organization_members?.[0]?.organization_id

      // Log the event
      await this.auditRepo.create({
        user_id: adminId,
        event_type: 'auth',
        details: `Admin ${adminId} started impersonating user ${targetUserId}`,
        organization_id: organizationId,
        metadata: { impersonated_user_id: targetUserId }
      })

      // Use cookie utility instead of direct manipulation
      ImpersonationCookies.set(targetUserId)

      return { success: true, userId: targetUserId }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to start impersonation' }
    }
  }

  async stopImpersonation(adminId: string, targetUserId: string): Promise<ImpersonationStopResult> {
    try {
      await this.impersonationRepo.stopImpersonation(adminId)

      const impersonatingId = await ImpersonationCookies.get()

      if (impersonatingId) {
        // Log the event
        await this.auditRepo.create({
          user_id: adminId,
          event_type: 'auth',
          details: `Admin ${adminId} stopped impersonating user ${targetUserId}`,
          organization_id: null
        })

        // Use cookie utility
        await ImpersonationCookies.clear()
      }

      return { success: true }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to stop impersonation' }
    }
  }

  async getStatus(userId: string) {
    const status = await this.impersonationRepo.getImpersonationStatus(userId)
    const impersonatingId = ImpersonationCookies.get()

    // Only consider impersonation active if both metadata and cookie exist
    const isActive = !!status && !!impersonatingId

    return {
      isImpersonating: isActive,
      impersonatingId: isActive ? status?.impersonating : null,
      realUserId: isActive ? status?.original_user : null
    }
  }
}
```

# lib/services/invite.ts

```ts
import { type SupabaseClient } from '@supabase/supabase-js'
import { logActivity } from '@/lib/utils/audit-logger'
import type { Database } from '@/database.types'

type AuditSeverity = Database['public']['Enums']['audit_severity']

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
  await logActivity({
    userId: currentUser.id,
    eventType: 'user_action',
    details: `User ${data.email} was invited`,
    organizationId: data.organization_id,
    metadata: {
      ...data,
      invited_by: currentUser.email || 'unknown',
      target_id: targetUserId,
      target_type: 'user',
      action: 'invitation_sent'
    }
  })
}
```

# lib/services/superadmin.ts

```ts
// lib/services/superadmin.ts
import { createClient } from '@/lib/utils/supabase/server'
import { ProfileRepository } from '@/lib/dal/repositories/profile'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { AuditLogRepository } from '@/lib/dal/repositories/audit-log'
import { OrganizationSettingsRepository } from '@/lib/dal/repositories/organization-settings'
import { type SupabaseClient } from '@supabase/supabase-js'
import { TenantContext } from '@/lib/dal/context/TenantContext'
import { type UserRole } from '@/lib/types/auth'
import { getEventCategory } from '@/lib/types/audit'
import type { Database } from '@/database.types'
import type { CreateAuditLogParams } from '@/lib/types/audit'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export class SuperadminService {
  private supabase: SupabaseClient
  private profileRepo: ProfileRepository
  private orgRepo: OrganizationRepository
  private auditRepo: AuditLogRepository

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.profileRepo = new ProfileRepository(supabase)
    this.orgRepo = new OrganizationRepository(supabase)
    this.auditRepo = new AuditLogRepository(supabase)
  }

  static async create(): Promise<SuperadminService> {
    const supabase = await createClient(true)
    return new SuperadminService(supabase)
  }

  async getSystemStats() {
    const [
      { count: totalUsers },
      { count: totalOrgs },
      { count: activeUsers }
    ] = await Promise.all([
      this.supabase.from('profiles').select('*', { count: 'exact', head: true }),
      this.supabase.from('organizations').select('*', { count: 'exact', head: true }),
      this.supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('last_login', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    return {
      totalUsers,
      totalOrgs,
      activeUsers
    }
  }

  async updateOrganizationLimits(
    orgId: string, 
    limits: Record<string, number>,
    actorId: string
  ) {
    const tenantContext = new TenantContext(
      orgId,
      actorId,
      'superadmin' as UserRole
    )
    
    const settingsRepo = new OrganizationSettingsRepository(this.supabase, tenantContext)
    
    await settingsRepo.setSettings(orgId, {
      limits: limits
    })

    await this.auditRepo.create({
      user_id: actorId,
      event_type: 'system',
      details: `Updated organization limits: ${JSON.stringify(limits)}`,
      organization_id: orgId,
      metadata: limits
    })
  }

  async assignSuperadminRole(userId: string, actorId: string) {
    await this.profileRepo.update(userId, {
      is_superadmin: true
    })

    await this.auditRepo.create({
      user_id: actorId,
      event_type: 'system',
      details: `Granted superadmin role to user ${userId}`,
      organization_id: null
    })
  }

  async getSystemAuditLog(options: {
    startDate?: string
    endDate?: string
    category?: string
    limit?: number
  } = {}) {
    return this.auditRepo.findByCategory('role_change', {
      limit: options.limit
    })
  }

  async auditAction(userId: string, action: string) {
    await this.auditRepo.create({
      user_id: userId,
      event_type: 'user_action',
      details: action,
      organization_id: null
    })
  }

  async getAuditLogs(options: { limit?: number } = {}) {
    try {
      return await this.auditRepo.findByCategory('profile_update', { 
        limit: options.limit 
      })
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }
  }

  async updateUserProfile(userId: string, data: Partial<ProfileRow>) {
    await this.profileRepo.update(userId, data)

    await this.auditRepo.create({
      user_id: userId,
      event_type: 'user_action',
      details: `Profile updated for user ${userId}`,
      metadata: { changes: data }
    })
  }

  async updateUserRole(userId: string, role: UserRole) {
    const { data: member } = await this.supabase
      .from('organization_members')
      .select('id, role')
      .eq('user_id', userId)
      .single()

    if (member) {
      await this.supabase
        .from('organization_members')
        .update({ role })
        .eq('id', member.id)
    }

    await this.auditRepo.create({
      user_id: userId,
      event_type: 'system',
      details: `Role changed to ${role} for user ${userId}`,
      metadata: {
        new_role: role,
        previous_role: member?.role ?? null,
        updated_at: new Date().toISOString()
      }
    })
  }
}
```

# lib/services/tenant-onboarding.ts

```ts
import { createClient } from '@/lib/utils/supabase/server'
import { SuperadminService } from './superadmin'
import type { Database } from '@/database.types'
import { type SupabaseClient, AuthApiError } from '@supabase/supabase-js'
import { Monitor } from '@/lib/dal/monitoring'

interface TenantOnboardingData {
  organization: {
    name: string
    slug: string
    limits?: Record<string, number>
  }
  admin: {
    email: string
    first_name: string
    last_name: string
    phone?: string
  }
}

export class TenantOnboardingService {
  private monitor: Monitor

  constructor(
    private supabase: SupabaseClient,
    private superadminService: SuperadminService
  ) {
    this.monitor = new Monitor()
  }

  static async create(): Promise<TenantOnboardingService> {
    const supabase = await createClient(true)
    const superadminService = await SuperadminService.create()
    return new TenantOnboardingService(supabase, superadminService)
  }

  async onboardNewTenant(data: TenantOnboardingData, actorId: string) {
    const endTimer = this.monitor.trackDuration('tenant.onboarding', {
      operation: 'create_tenant',
      status: 'success'
    })

    try {
      // 1. Create the organization first
      const { data: org, error: orgError } = await this.supabase
        .from('organizations')
        .insert({
          name: data.organization.name,
          slug: data.organization.slug,
          created_at: new Date().toISOString(),
          status: 'active'
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 2. Send admin invitation
      const { data: authUser, error: inviteError } = await this.supabase.auth.admin.inviteUserByEmail(
        data.admin.email,
        {
          data: {
            organization_id: org.id,
            organization_name: org.name,
            role: 'admin',
            first_name: data.admin.first_name,
            last_name: data.admin.last_name,
            is_admin: true
          },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/setup/${org.slug}`
        }
      )

      if (inviteError) {
        // Clean up organization if invitation fails
        await this.supabase
          .from('organizations')
          .delete()
          .eq('id', org.id)
        throw inviteError
      }

      // 3. Create profile
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: data.admin.email,
          first_name: data.admin.first_name,
          last_name: data.admin.last_name,
          phone: data.admin.phone,
          is_active: true,
          is_superadmin: false,
          status: 'invited'
        })

      if (profileError) {
        // Clean up auth user and organization if profile creation fails
        await this.supabase.auth.admin.deleteUser(authUser.user.id)
        await this.supabase
          .from('organizations')
          .delete()
          .eq('id', org.id)
        throw profileError
      }

      // 4. Create organization membership
      const { error: memberError } = await this.supabase
        .from('organization_members')
        .insert({
          user_id: authUser.user.id,
          organization_id: org.id,
          role: 'admin',
          joined_date: new Date().toISOString()
        })

      if (memberError) {
        // Clean up profile, auth user, and organization if membership creation fails
        await this.supabase
          .from('profiles')
          .delete()
          .eq('id', authUser.user.id)
        await this.supabase.auth.admin.deleteUser(authUser.user.id)
        await this.supabase
          .from('organizations')
          .delete()
          .eq('id', org.id)
        throw memberError
      }

      // 5. Create audit log entry
      await this.superadminService.auditAction(
        actorId,
        `Created new tenant organization: ${data.organization.name} (${org.id})`
      )

      endTimer()
      this.monitor.trackMetric('tenant.onboarding.success', 1, {
        operation: 'create_tenant',
        status: 'success'
      })

      return {
        organization: org,
        adminUser: {
          id: authUser.user.id,
          email: data.admin.email
        }
      }
    } catch (error) {
      endTimer()
      this.monitor.trackMetric('tenant.onboarding.error', 1, {
        operation: 'create_tenant',
        status: 'error'
      })

      if (error instanceof AuthApiError && error.status === 429) {
        throw new Error('Email sending rate limit exceeded. Please try again in a few minutes.')
      }
      throw error
    }
  }
} 
```

# lib/types/audit.ts

```ts
import type { Database } from '@/database.types'

export type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']
export type AuditEventType = Database['public']['Enums']['audit_event_type']
export type AuditSeverity = Database['public']['Enums']['audit_severity']

// JSON value type for metadata
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

// Audit log creation parameters
export interface CreateAuditLogParams {
  userId: string
  eventType: AuditEventType
  details: string
  severity?: AuditSeverity
  metadata?: Record<string, JsonValue>
  organizationId?: string
  correlationId?: string
  sessionId?: string
}

// Audit log filters
export interface AuditLogFilters {
  search: string
  dateRange: { from?: Date; to?: Date } | null
  severity: string
  organizationId?: string
  correlationId?: string
}

// Audit log response structure
export interface AuditLogResponse {
  systemLogs: AuditLog[]
  userLogs: AuditLog[]
  securityLogs: AuditLog[]
}

// Event category helper function
export function getEventCategory(eventType: AuditEventType): 'system' | 'user_action' | 'security' {
  if (eventType.startsWith('system.') || eventType === 'system') {
    return 'system'
  }
  if (eventType.startsWith('security.') || eventType === 'security' || eventType === 'auth') {
    return 'security'
  }
  return 'user_action'
}

// Constants for event types
export const SYSTEM_EVENTS = [
  'system.startup',
  'system.shutdown',
  'system.config_change',
  'system.maintenance',
] as const

export const SECURITY_EVENTS = [
  'security.login',
  'security.logout',
  'security.password_change',
  'security.access_denied',
  'auth.success',
  'auth.failure',
] as const

export const USER_ACTION_EVENTS = [
  'user.create',
  'user.update',
  'user.delete',
  'user.login',
  'user.logout',
] as const 
```

# lib/types/auth.ts

```ts
import type { Database } from '@/database.types'

export type UserRole = 'superadmin' | 'admin' | 'staff' | 'ministry_leader' | 'member' | 'visitor'

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  alternative_email?: string | null
  phone?: string | null
  avatar_url?: string | null
  is_active: boolean
  is_superadmin: boolean
  status: Database['public']['Enums']['auth_status']
  notification_preferences?: {
    email: boolean
    sms: boolean
    push: boolean
  }
  created_at: string
  updated_at: string
  last_login?: string | null
  invited_at?: string | null
  organization_members?: Array<{
    role: Database['public']['Enums']['user_role']
    organizations: {
      id: string
      name: string
    }
  }>
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

export interface UserActivityLog {
  id: string
  user_id: string
  event_type: Database['public']['Enums']['activity_event_type']
  details: string
  metadata: Record<string, any>
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
  organization_id?: string | null
} 
```

# lib/types/entities.ts

```ts
import type { Database } from '@/database.types'

export type DBTables = Database['public']['Tables']

// Base entity type
export interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

// Entity types
export interface Organization extends BaseEntity {
  name: string
  slug: string
  settings?: OrganizationSettings
}

export interface Profile extends BaseEntity {
  email: string
  full_name?: string
  avatar_url?: string
  is_superadmin?: boolean
  theme?: string
  notification_preferences?: Record<string, boolean>
  last_login?: string
}

export interface OrganizationMember extends BaseEntity {
  organization_id: string
  user_id: string
  role: string
}

export interface AuditLog extends BaseEntity {
  organization_id: string
  user_id: string
  action: string
  category: string
  details?: Record<string, any>
}

export interface OrganizationSettings {
  features_enabled?: string[]
  branding?: {
    logo_url?: string
    primary_color?: string
  }
  email_templates?: Record<string, any>
} 
```

# lib/types/impersonation.ts

```ts
import type { Database } from '@/database.types'

export type ImpersonationMetadata = {
  impersonating: string
  original_user: string
  impersonation_started: number
}

export type ImpersonationState = {
  isImpersonating: boolean
  impersonatingId: string | null
  impersonatedUserId?: string | null
  realUserId: string | null
  isInitialized?: boolean
  refresh: () => Promise<void>
}

export type ImpersonationEventType = 'start' | 'stop'

export interface ImpersonationEventDetail {
  type: ImpersonationEventType
  userId?: string
}

export type AuditLogEntry = Database['public']['Tables']['user_activity_logs']['Row']

export type ImpersonationError = {
  code: 'UNAUTHORIZED' | 'INVALID_TARGET' | 'SELF_IMPERSONATION' | 'SYSTEM_ERROR'
  message: string
}

export type ImpersonationStatus = {
  isActive: boolean
  targetUser: {
    id: string
    email: string
  } | null
  originalUser: {
    id: string
    email: string
  } | null
}

export type ImpersonationStartResult = 
  | { success: true; userId: string }
  | { error: string }

export type ImpersonationStopResult = 
  | { success: true }
  | { error: string } 
```

# lib/types/organization.ts

```ts
import type { Database } from '@/database.types'

export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']

export type AvailableFeature = 'events' | 'groups' | 'donations' | 'messaging' | 'attendance'

export const AVAILABLE_FEATURES: readonly AvailableFeature[] = [
  'events',
  'groups',
  'donations',
  'messaging',
  'attendance',
] as const

export interface OrganizationWithMembers extends Organization {
  members?: OrganizationMember[]
} 
```

# lib/types/tenant.ts

```ts
export interface TenantContext {
  organizationId: string
  userId: string
  role: string
  canAccess: (resource: string) => boolean
  hasFeature: (feature: string) => boolean
  toHeaders: () => Record<string, string>
} 
```

# lib/utils.ts

```ts
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date))
} 
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

# lib/utils/audit-logger.ts

```ts
import { createClient } from '@/lib/utils/supabase/server'
import type { Database } from '@/database.types'
import { v4 as uuidv4 } from 'uuid'

type AuditEventType = Database['public']['Enums']['audit_event_type']
type AuditSeverity = Database['public']['Enums']['audit_severity']

interface LogActivityOptions {
  userId: string
  eventType: AuditEventType
  details: string
  severity?: AuditSeverity
  metadata?: Record<string, any>
  organizationId?: string
  correlationId?: string
  sessionId?: string
}

export async function logActivity({
  userId,
  eventType,
  details,
  severity = 'info',
  metadata = {},
  organizationId,
  correlationId = uuidv4(),
  sessionId,
}: LogActivityOptions) {
  const supabase = await createClient()

  const enrichedMetadata = {
    ...metadata,
    correlation_id: correlationId,
    session_id: sessionId,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
  }

  const { error } = await supabase
    .from('user_activity_logs')
    .insert({
      user_id: userId,
      event_type: eventType,
      details,
      severity,
      metadata: enrichedMetadata,
      organization_id: organizationId,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error logging activity:', error)
  }
} 
```

# lib/utils/auth.ts

```ts
export function generateTempPassword(): string {
  const length = 16
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
} 
```

# lib/utils/cn.ts

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

# lib/utils/email.ts

```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TinyChurch <noreply@tinychurch.app>',
      to,
      subject,
      html,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export function getGroupInvitationEmailContent(params: {
  invitedByName: string
  groupName: string
  organizationName: string
  acceptUrl: string
}) {
  const { invitedByName, groupName, organizationName, acceptUrl } = params
  
  return `
    <div>
      <h2>You've been invited to join a group!</h2>
      <p>${invitedByName} has invited you to join the ${groupName} group at ${organizationName}.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${acceptUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Accept Invitation
      </a>
      <p>This invitation will expire in 7 days.</p>
    </div>
  `
}

export function getOrganizationInvitationEmailContent(params: {
  invitedByName: string
  organizationName: string
  setupUrl: string
}) {
  const { invitedByName, organizationName, setupUrl } = params
  
  return `
    <div>
      <h2>You've been invited to join an organization!</h2>
      <p>${invitedByName} has invited you to join ${organizationName}.</p>
      <p>Click the link below to set up your account:</p>
      <a href="${setupUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Set Up Account
      </a>
      <p>This invitation will expire in 7 days.</p>
    </div>
  `
} 
```

# lib/utils/error-handling.ts

```ts
export function handleImpersonationError(error: unknown, context: string) {
  console.error(`Impersonation error (${context}):`, error)
  const message = error instanceof Error ? error.message : 'An error occurred'
  return { error: message }
} 
```

# lib/utils/export-audit-logs.ts

```ts
import { saveAs } from 'file-saver'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']

export function exportAuditLogs(logs: AuditLog[], format: 'csv' | 'json') {
  if (format === 'csv') {
    const headers = ['Timestamp', 'Event Type', 'Details', 'User ID', 'Organization ID']
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.created_at,
        log.event_type,
        `"${log.details.replace(/"/g, '""')}"`,
        log.user_id,
        log.organization_id || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `audit-logs-${new Date().toISOString()}.csv`)
  } else {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
    saveAs(blob, `audit-logs-${new Date().toISOString()}.json`)
  }
} 
```

# lib/utils/format.ts

```ts
/**
 * Utility functions for formatting data
 */

/**
 * Formats a phone number to XXX-XXX-XXXX format
 * @param value - The input phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Format as XXX-XXX-XXXX
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }
}

/**
 * Formats a currency amount
 * @param amount - Number to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Formats a date string
 * @param date - Date to format
 * @param format - Optional format style
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, format: 'short' | 'long' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  return dateObj.toLocaleDateString('en-US')
} 
```

# lib/utils/impersonation-cookies.ts

```ts
import { cookies } from 'next/headers'

const COOKIE_NAME = 'impersonating_user_id'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
}

export const ImpersonationCookies = {
  async set(userId: string) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, userId, COOKIE_OPTIONS)
  },

  async clear() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
  },

  async get(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(COOKIE_NAME)?.value ?? null
  }
} 
```

# lib/utils/index.ts

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 
```

# lib/utils/logger.ts

```ts
export const log = {
  info: (message: string, data?: Record<string, any>) => {
    console.log(`INFO: ${message}`, data || '');
  },
  warn: (message: string, data?: Record<string, any>) => {
    console.warn(`WARN: ${message}`, data || '');
  },
  error: (message: string, data?: Record<string, any>) => {
    console.error(`ERROR: ${message}`, data || '');
  },
}; 
```

# lib/utils/permissions.ts

```ts
import { createClient } from './supabase/server'

export async function checkPermission(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
) {
  const supabase = await createClient()

  // First check if user is superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', userId)
    .single()

  // Superadmins always have permission
  if (profile?.is_superadmin) {
    return true
  }

  // Add your regular permission checks here
  // For example, checking if user is group leader:
  if (resourceType === 'group') {
    const { data: membership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', resourceId)
      .eq('user_id', userId)
      .eq('role', 'leader')
      .single()

    return !!membership
  }

  return false
} 
```

# lib/utils/supabase/client-utils.ts

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClientUtils() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(supabaseUrl, supabaseKey)
} 
```

# lib/utils/supabase/client.ts

```ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

```

# lib/utils/supabase/middleware.ts

```ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createMiddlewareClient(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  return { supabase, response };
}

```

# lib/utils/supabase/server-utils.ts

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerUtils(useAdmin = false) {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = useAdmin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY! 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set(name, value, options)
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )
} 
```

# lib/utils/supabase/server.ts

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

# lib/utils/user.ts

```ts
export function generateTempPassword() {
  return Math.random().toString(36).slice(-8)
}

export function generateFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim()
}

```

# lib/utils/utils.ts

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

// Add any other utility functions you need here ` 
```

# lib/validations/schemas.ts

```ts
import * as z from 'zod'
import type { Database } from '@/database.types'

export const userValidation = {
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(['admin', 'staff', 'ministry_leader', 'member', 'visitor']),
  is_active: z.boolean().default(true),
  is_superadmin: z.boolean().default(false),
  organization_id: z.string().optional().or(z.literal('')),
  alternative_email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['invited', 'active', 'suspended', 'inactive', 'deleted'] as const).optional().default('active'),
  notification_preferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(false),
  }).optional(),
}

export const schemas = {
  userForm: z.object({
    first_name: userValidation.first_name,
    last_name: userValidation.last_name,
    email: userValidation.email,
    role: userValidation.role,
    is_active: userValidation.is_active,
    alternative_email: userValidation.alternative_email,
    phone: userValidation.phone,
    is_superadmin: userValidation.is_superadmin,
    status: userValidation.status,
    notification_preferences: userValidation.notification_preferences,
    organization_id: userValidation.organization_id,
  }),
  
  userInviteForm: z.object({
    first_name: userValidation.first_name,
    last_name: userValidation.last_name,
    email: userValidation.email,
    role: userValidation.role,
    is_active: userValidation.is_active,
    is_superadmin: userValidation.is_superadmin,
    organization_id: z.string().min(1, "Organization is required"),
  }),

  profileForm: z.object({
    first_name: userValidation.first_name,
    last_name: userValidation.last_name,
    email: userValidation.email,
    alternative_email: userValidation.alternative_email,
    phone: userValidation.phone,
    notification_preferences: userValidation.notification_preferences,
  })
} 
```

# middleware.ts

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { stackMiddlewares } from '@/lib/middleware/stack'
import { loggingMiddleware } from '@/lib/middleware/core/logging'
import { rateLimitMiddleware } from '@/lib/middleware/core/rateLimit'
import { authMiddleware } from '@/lib/middleware/auth/auth'
import { sessionMiddleware } from '@/lib/middleware/auth/session'
import { impersonationMiddleware } from '@/lib/middleware/auth/impersonation'
import { superadminMiddleware } from '@/lib/middleware/auth/superadmin'
import { organizationMiddleware } from '@/lib/middleware/tenant/organization'
import { featureMiddleware } from '@/lib/middleware/tenant/features'
import { rbacMiddleware } from '@/lib/middleware/auth/rbac'
import { errorMiddleware } from '@/lib/middleware/core/error'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Define public paths that should only use core middleware
  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/accept-invite', '/auth/callback']
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith('/auth/')
  )

  // Core stack - always runs
  const coreStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
  ])

  // Create a next function for the final middleware
  const finalNext = async (req: NextRequest, res: NextResponse) => res

  // Auth stack - authentication and session management
  const authStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    authMiddleware,
    sessionMiddleware,
    impersonationMiddleware,
  ])

  // Organization stack - full context for org routes
  const orgStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    authMiddleware,
    sessionMiddleware,
    organizationMiddleware,
    rbacMiddleware,
    featureMiddleware,
  ])

  // Superadmin stack - special privileges
  const superadminStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    authMiddleware,
    sessionMiddleware,
    impersonationMiddleware,
    superadminMiddleware,  // Sets x-is-superadmin
  ])

  try {
    // For public paths, only use core middleware
    if (isPublicPath) {
      return await coreStack(request, response, finalNext)
    }

    // Route-specific middleware selection
    if (request.nextUrl.pathname.startsWith('/superadmin')) {
      return await superadminStack(request, response, finalNext)
    }

    if (request.nextUrl.pathname.startsWith('/org/')) {
      return await orgStack(request, response, finalNext)
    }

    // Default auth stack for protected routes
    return await authStack(request, response, finalNext)
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
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
  },
  images: {
    domains: [
      'maps.googleapis.com',
      'maps.gstatic.com'
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
    "@radix-ui/react-icons": "^1.3.2",
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
    "@react-email/components": "^0.0.30",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "@types/file-saver": "^2.0.7",
    "autoprefixer": "10.4.20",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "file-saver": "^2.0.5",
    "geist": "^1.2.1",
    "ioredis": "^5.3.2",
    "lucide-react": "^0.456.0",
    "next": "latest",
    "next-themes": "^0.4.3",
    "prettier": "^3.3.3",
    "rate-limit": "^0.1.1",
    "react": "18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "18.3.1",
    "react-hook-form": "^7.53.2",
    "recharts": "^2.14.1",
    "resend": "^4.0.1",
    "uuid": "^11.0.3",
    "vaul": "^1.1.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/google.maps": "^3.58.1",
    "@types/node": "22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "18.3.1",
    "@types/uuid": "^10.0.0",
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

# public/logo.svg

This is a file of the type: SVG Image

# public/testimonials/image1.webp

This is a binary file of the type: Image

# README.md

```md
# TinyChurch Admin

A comprehensive church management system built with Next.js and Supabase, designed to help churches manage their congregations, staff, and organizational operations efficiently.

## Core Features

### Multi-Organization Support
- Complete organization management
- Organization-specific settings and configurations
- Resource usage tracking and limits
- Custom organization roles and permissions

### Advanced Authentication & Authorization
- Role-based access control (Admin, Staff, Ministry Leader, Member, Visitor)
- Super admin capabilities for platform management
- User impersonation for support and debugging
- Secure invitation system for new members

### Comprehensive Audit System
- Detailed activity logging
  - Authentication events
  - User actions
  - System events
  - Security events
- Audit severity tracking (Info, Warning, Error, Critical)
- Organization-specific audit trails

### Member Management
- Member profiles and directory
- Membership status tracking
- Role and permission management
- Custom membership numbers
- Contact information management

## Technical Stack

- **Frontend Framework**: [Next.js 14](https://nextjs.org) with App Router
- **Backend & Database**: [Supabase](https://supabase.com)
  - PostgreSQL database
  - Row Level Security
  - Real-time subscriptions
- **Authentication**: Supabase Auth with SSR support
- **UI & Styling**:
  - [Tailwind CSS](https://tailwindcss.com)
  - [shadcn/ui](https://ui.shadcn.com)
  - [Geist Sans](https://vercel.com/font) font
- **Type Safety**: TypeScript with complete database type generation

## Getting Started

1. **Create Supabase Project**:   \`\`\`bash
   # Create a new Supabase project at
   https://database.new   \`\`\`

2. **Clone & Install**:   \`\`\`bash
   git clone https://github.com/your-username/tinychurch-admin-app.git
   cd tinychurch-admin-app
   npm install   \`\`\`

3. **Environment Setup**:   \`\`\`bash
   cp .env.example .env.local   \`\`\`
   Update the following variables:   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]   \`\`\`

4. **Generate Database Types**:   \`\`\`bash
   npm run db:types   \`\`\`

5. **Development Server**:   \`\`\`bash
   npm run dev   \`\`\`
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/app` - Next.js 14 App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and business logic
  - `/dal` - Data Access Layer for Supabase
  - `/contexts` - React Context providers
  - `/utils` - Helper functions
- `/public` - Static assets

## Database Schema

The application uses a sophisticated database schema including:

- `organizations` - Church/organization details
- `organization_members` - Member relationships and roles
- `organization_settings` - Configurable settings
- `organization_limits` - Resource usage limits
- `activity_logs` - Audit and activity tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[Your License] - See LICENSE file for details

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
v2.0.0
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
site_url = "https://tinychurch.app"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://tinychurch.app/auth/callback"]
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

# supabase/templates/invite.html

```html
<h2>Welcome to {{ .SiteURL }}</h2>

<p>You have been invited by {{ .Data.invited_by }} to join {{ .Data.organization_name }}.</p>

<p>Click the button below to accept the invitation and set up your account:</p>

<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite" 
   style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
  Accept Invitation
</a>

<p style="color: #666; font-size: 14px;">
  You'll be able to set your password when you accept the invitation.
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
    },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

