'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PencilIcon, TrashIcon, SearchIcon, EyeIcon } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/database.types'
import { Badge } from '@/components/ui/badge'
import { TemplatePreview } from './template-preview'
import { deleteTemplate } from '@/lib/actions/template'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

type Template = Database['public']['Tables']['message_templates']['Row']

export default function TemplateList({ templates }: { templates: Template[] }) {
  const [search, setSearch] = useState('')
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.category?.toLowerCase().includes(search.toLowerCase()) ||
    (template.variables as string[])?.some(v => 
      v.toLowerCase().includes(search.toLowerCase())
    )
  )

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      const { error } = await deleteTemplate(id)
      
      if (error) throw new Error(error)
      
      toast({
        title: 'Success',
        description: 'Template deleted successfully'
      })
      
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete template',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setTemplateToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Variables</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTemplates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>
                {template.category && (
                  <Badge variant="outline">{template.category}</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {(template.variables as string[])?.map(variable => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{formatDate(template.updated_at)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Template Preview</DialogTitle>
                      </DialogHeader>
                      <TemplatePreview template={template} />
                    </DialogContent>
                  </Dialog>

                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/superadmin/templates/${template.id}/edit`}>
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                  </Button>

                  <AlertDialog open={templateToDelete === template.id}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setTemplateToDelete(template.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{template.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(template.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 