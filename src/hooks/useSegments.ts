/* Segments/cohorts are created in the Cohorts flow, never in the Journey
   Builder. This hook is the read-only source; swap the constant for the API.
   Only ACTIVE cohorts are selectable — the mock deliberately includes
   non-active ones to prove the filter. */
export type SegmentStatus = 'active' | 'archived' | 'draft'

export interface Segment {
  id: string
  name: string
  count: string
  status: SegmentStatus
}

const ALL_SEGMENTS: Segment[] = [
  { id: 's-rfi', name: 'US Stocks — RFI pending', count: '41.2K', status: 'active' },
  { id: 's-kyc', name: 'KYC complete', count: '2.1M', status: 'active' },
  { id: 's-sip', name: 'SIP investors', count: '684K', status: 'active' },
  { id: 's-dormant', name: 'Dormant 30d', count: '1.3M', status: 'active' },
  { id: 's-pro', name: 'Pro subscribers', count: '96K', status: 'active' },
  { id: 's-watch', name: 'Watchlist power users', count: '212K', status: 'active' },
  { id: 's-internal', name: 'Internal test accounts', count: '1.8K', status: 'active' },
  { id: 's-churned', name: 'Churned — uninstalled', count: '420K', status: 'active' },
  { id: 's-q1', name: 'Q1 launch cohort', count: '58K', status: 'archived' },
  { id: 's-draft', name: 'High-value (draft)', count: '—', status: 'draft' },
]

export function useSegments(): { segments: Segment[]; loading: boolean } {
  /* mock: synchronous, active-only. Real impl fetches + filters server-side. */
  return { segments: ALL_SEGMENTS.filter(s => s.status === 'active'), loading: false }
}
