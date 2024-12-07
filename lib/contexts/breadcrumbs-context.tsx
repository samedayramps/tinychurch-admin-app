'use client'

import { createContext, useContext, ReactNode } from 'react'

interface BreadcrumbsContextType {
  organizationName?: string
  groupName?: string
}

const BreadcrumbsContext = createContext<BreadcrumbsContextType>({})

export function BreadcrumbsProvider({
  children,
  organizationName,
  groupName,
}: BreadcrumbsContextType & {
  children: ReactNode
}) {
  // Get the parent context values
  const parentContext = useContext(BreadcrumbsContext)
  
  // Merge with parent context, new values take precedence
  const value = {
    organizationName: organizationName ?? parentContext.organizationName,
    groupName: groupName ?? parentContext.groupName,
  }

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}

export function useBreadcrumbs() {
  return useContext(BreadcrumbsContext)
} 