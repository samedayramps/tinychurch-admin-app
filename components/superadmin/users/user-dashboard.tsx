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