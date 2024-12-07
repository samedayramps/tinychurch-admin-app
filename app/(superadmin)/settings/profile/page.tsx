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