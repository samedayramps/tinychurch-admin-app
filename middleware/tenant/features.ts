// middleware/tenant/features.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import type { FeatureSettings } from './types'
import { getRequestedFeature } from './types'
import { validateRequiredHeaders } from '../utils/headers'

export const featureMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    // Validate required headers from previous middleware
    const requiredHeaders = [
      'x-organization-id',
      'x-organization-settings'
    ]
    
    if (!validateRequiredHeaders(req, requiredHeaders, 'Features')) {
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const orgId = req.headers.get('x-organization-id')
    const settingsJson = req.headers.get('x-organization-settings')
    
    // Parse and validate settings
    let settings: FeatureSettings
    try {
      settings = JSON.parse(settingsJson!) as FeatureSettings
    } catch (error) {
      console.error('Invalid settings JSON:', error)
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const features = settings.features_enabled || []
    const requestedFeature = getRequestedFeature(req.nextUrl.pathname)
    
    if (requestedFeature && !features.includes(requestedFeature)) {
      console.warn(`Access denied to feature: ${requestedFeature}`)
      return NextResponse.redirect(new URL(`/org/${orgId}/upgrade`, req.url))
    }
    
    // Add features to headers for downstream use
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-organization-features', JSON.stringify(features))
    
    const newReq = new NextRequest(req.url, {
      headers: requestHeaders,
    })

    return next(newReq, res)
  } catch (error) {
    console.error('Feature middleware error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}