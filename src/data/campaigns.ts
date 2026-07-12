/* Existing campaigns available to import into a journey node. Swap for the
   campaigns API. */
export type CampaignStatus = 'Active' | 'Paused' | 'Draft'

export interface CampaignRef {
  id: string
  name: string
  date: string
  status: CampaignStatus
}

export const CAMPAIGNS: CampaignRef[] = [
  { id: 'c-summer', name: 'Summer Sale Banner', date: 'Jan 15, 2026', status: 'Active' },
  { id: 'c-holiday-rewards', name: 'Holiday Rewards', date: 'Dec 20, 2025', status: 'Active' },
  { id: 'c-welcome', name: 'Welcome Campaign', date: 'Nov 10, 2025', status: 'Active' },
  { id: 'c-holiday-sale', name: 'Holiday Sale', date: 'Dec 15, 2025', status: 'Active' },
  { id: 'c-rfi', name: 'US Stocks RFI Reminder', date: 'Oct 2, 2025', status: 'Active' },
  { id: 'c-kyc', name: 'KYC Nudge v2', date: 'Sep 18, 2025', status: 'Paused' },
  { id: 'c-sip', name: 'SIP Winback', date: 'Aug 24, 2025', status: 'Active' },
]
