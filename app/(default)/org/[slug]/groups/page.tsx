// app/(default)/org/[slug]/groups/page.tsx
import { GroupsList } from '@/components/groups/groups-list'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { createClient } from '@/lib/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function GroupsPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (!org) {
    notFound();
  }

  // Initialize group repository
  const groupRepo = new GroupRepository(supabase);
  const groups = await groupRepo.getOrganizationGroups(org.id);

  return (
    <div className="container mx-auto py-6">
      <GroupsList 
        groups={groups}
        organizationId={org.id}
        onDeleteGroup={async (groupId) => {
          'use server'
          // Handle group deletion here
          // This is a server action that will be called from the client component
        }}
      />
    </div>
  );
}

// Wrap in Suspense for loading state
export default function GroupsPageWrapper(props: PageProps) {
  return (
    <Suspense fallback={<div>Loading groups...</div>}>
      <GroupsPage {...props} />
    </Suspense>
  );
}