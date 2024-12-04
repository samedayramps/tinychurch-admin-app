// middleware/stack.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '@/middleware/types'

export function stackMiddlewares(
  functions: MiddlewareFactory[] = [],
  index = 0
): MiddlewareFactory {
  const current = functions[index]
  
  if (current) {
    const next = stackMiddlewares(functions, index + 1)
    return async (request: NextRequest, response: NextResponse) => {
      try {
        const nextFn = async (req: NextRequest, res: NextResponse) => {
          return next(req, res, nextFn)
        }
        return await current(request, response, nextFn)
      } catch (error) {
        console.error(`Error in middleware[${index}]:`, error)
        throw error
      }
    }
  }
  
  return async (_request: NextRequest, response: NextResponse) => response
}