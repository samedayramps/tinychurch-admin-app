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