import { Suspense } from 'react'
import { createClient } from '@/lib/utils/supabase/server'
import { TemplateListUI } from './template-list-ui'

async function TemplatesPage() {
  const supabase = await createClient()
  
  const [{ data: templates }, { data: categories }] = await Promise.all([
    supabase.from('message_templates').select('*').order('name'),
    supabase.from('message_templates').select('category').not('category', 'is', null)
  ])

  const uniqueCategories = Array.from(new Set(categories?.map(c => c.category) || []))

  return (
    <div className="p-6">
      <TemplateListUI 
        templates={templates || []}
        categories={uniqueCategories}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemplatesPage />
    </Suspense>
  )
} 