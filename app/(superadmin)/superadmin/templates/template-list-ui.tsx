'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryManager } from './category-manager'
import { useRouter } from 'next/navigation'
import TemplateList from './template-list'
import type { Database } from '@/database.types'

type Template = Database['public']['Tables']['message_templates']['Row']

interface TemplateListUIProps {
  templates: Template[]
  categories: string[]
}

export function TemplateListUI({ templates, categories }: TemplateListUIProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Message Templates</h1>
          <p className="text-muted-foreground">Manage and organize your message templates</p>
        </div>
        <div className="flex gap-2">
          <CategoryManager 
            categories={categories} 
            onCategoriesChange={() => {
              router.refresh()
            }} 
          />
          <Button asChild>
            <Link href="/superadmin/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Link>
          </Button>
        </div>
      </div>
      <Separator />
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all">
          <TemplateList templates={templates} />
        </TabsContent>
        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <TemplateList 
              templates={templates.filter(t => t.category === category)} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 