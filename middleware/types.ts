// middleware/types.ts
import { NextResponse, NextRequest } from 'next/server'

export type MiddlewareFactory = (
  request: NextRequest,
  response: NextResponse,
  next: (request: NextRequest, response: NextResponse) => Promise<NextResponse>
) => Promise<NextResponse>

export interface RequestContext {
  organizationId?: string;
  userId?: string;
  userRole?: string;
  features?: string[];
}