'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateEventWizard } from './create-event-wizard'

interface Organization {
  id: string
  name: string
}

interface CreateEventButtonProps {
  organizations: Organization[]
}

export function CreateEventButton({ organizations }: CreateEventButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <CreateEventWizard 
          organizations={organizations} 
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
} 