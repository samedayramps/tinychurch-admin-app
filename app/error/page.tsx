'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ErrorContent() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get('message') || 'An error occurred'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600">{errorMessage}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-4 text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
} 