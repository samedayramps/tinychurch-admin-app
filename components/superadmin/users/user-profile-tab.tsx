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