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