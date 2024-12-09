'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TagIcon, PlusIcon, XIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { createTemplate } from '@/lib/actions/template'
import { useAuth } from '@/hooks/use-auth'
import type { Database } from '@/database.types'

type TemplateInput = Database['public']['Tables']['message_templates']['Insert']

interface CategoryManagerProps {
  categories: string[]
  onCategoriesChange: () => void
}

export function CategoryManager({ categories, onCategoriesChange }: CategoryManagerProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim() || !user?.id) return

    try {
      setLoading(true)
      const templateData: TemplateInput = {
        name: newCategory.trim(),
        category: newCategory.trim(),
        subject: '',
        body: '',
        variables: {},
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await createTemplate(templateData)
      if (error) throw new Error(error)

      toast({
        title: 'Category Added',
        description: `Category "${newCategory}" has been added successfully.`
      })

      setNewCategory('')
      onCategoriesChange()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add category',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (category: string) => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const templateData: TemplateInput = {
        name: category,
        category: null,
        subject: '',
        body: '',
        variables: {},
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await createTemplate(templateData)
      if (error) throw new Error(error)

      toast({
        title: 'Category Deleted',
        description: `Category "${category}" has been deleted successfully.`
      })

      onCategoriesChange()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete category',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TagIcon className="h-4 w-4 mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Template Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={loading}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleDeleteCategory(category)}
                    disabled={loading}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 