export type ImpersonationEventType = 'start' | 'stop'

export interface ImpersonationEventDetail {
  type: ImpersonationEventType
  userId?: string
}

export const IMPERSONATION_EVENT = 'impersonation-state-change'

export function emitImpersonationEvent(detail: ImpersonationEventDetail) {
  const event = new CustomEvent<ImpersonationEventDetail>(IMPERSONATION_EVENT, {
    detail,
    bubbles: true,
    composed: true
  })
  window.dispatchEvent(event)
}