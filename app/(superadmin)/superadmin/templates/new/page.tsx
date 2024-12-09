import { Suspense } from 'react'
import { createClient } from '@/lib/utils/supabase/server'
import { TemplateFormWrapper } from '../template-form-wrapper'
import { createTemplate } from '@/lib/actions/template'
import type { Database } from '@/database.types'

type TemplateInput = Omit<Database['public']['Tables']['message_templates']['Insert'], 'id'>

async function NewTemplatePage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('message_templates')
    .select('category')
    .not('category', 'is', null)

  const uniqueCategories = Array.from(new Set(categories?.map(c => c.category) || []))

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Create Template</h1>
      <div className="max-w-2xl">
        <TemplateFormWrapper 
          categories={uniqueCategories}
          action={createTemplate}
        />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTemplatePage />
    </Suspense>
  )
} 