import { Suspense } from 'react'
import { createClient } from '@/lib/utils/supabase/server'
import { TemplateFormWrapper } from '../../template-form-wrapper'
import { updateTemplate } from '@/lib/actions/template'
import { notFound } from 'next/navigation'

async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const [{ data: template }, { data: categories }] = await Promise.all([
    supabase
      .from('message_templates')
      .select('*')
      .eq('id', resolvedParams.id)
      .single(),
    supabase
      .from('message_templates')
      .select('category')
      .not('category', 'is', null)
  ])

  if (!template) {
    notFound()
  }

  const uniqueCategories = Array.from(new Set(categories?.map(c => c.category) || []))

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Template</h1>
      <div className="max-w-2xl">
        <TemplateFormWrapper 
          template={template}
          categories={uniqueCategories}
          action={(data) => updateTemplate(resolvedParams.id, data)}
        />
      </div>
    </div>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditTemplatePage params={params} />
    </Suspense>
  )
} 