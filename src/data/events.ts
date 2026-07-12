/* Event catalog powering <EventPicker /> — grouped by category, cohort-filter
   row anatomy (icon, name, description). Swap for the events API later. */
export type EventAttrType = 'string' | 'number' | 'bool' | 'enum'
export interface EventAttr {
  id: string
  name: string
  type: EventAttrType
  values?: string[] // for enum
}
export interface EventDef {
  id: string
  name: string
  description: string
  category: string
  attributes?: EventAttr[]
}

/* a single attribute filter on a selected event: `amount > 1000` */
export interface EventFilter {
  id: string
  attribute: string
  operator: string
  value: string
}

export function attrOperators(type: EventAttrType): string[] {
  if (type === 'number') return ['=', '≠', '>', '<', '≥', '≤']
  if (type === 'bool') return ['is']
  if (type === 'enum') return ['is', 'is not']
  return ['is', 'is not', 'contains', 'starts with']
}

let fseq = 0
export const newEventFilter = (attr: EventAttr): EventFilter => ({
  id: `f${++fseq}`,
  attribute: attr.name,
  operator: attrOperators(attr.type)[0],
  value: attr.type === 'enum' ? attr.values?.[0] ?? '' : attr.type === 'bool' ? 'true' : '',
})

const A = (name: string, type: EventAttrType, values?: string[]): EventAttr => ({ id: name, name, type, values })
const PLATFORM = A('platform', 'enum', ['iOS', 'Android', 'Web'])

export const EVENT_CATEGORY_COLOR: Record<string, string> = {
  Onboarding: '#8B5CF6',
  Investing: '#10B981',
  Engagement: '#3B82F6',
  Monetization: '#FB6514',
  Lifecycle: '#6B7280',
}

export const EVENT_CATALOG: EventDef[] = [
  { id: 'app_opened', name: 'App_Opened', description: 'User launched the app', category: 'Onboarding', attributes: [PLATFORM, A('session_source', 'enum', ['organic', 'push', 'deeplink'])] },
  { id: 'kyc_completed', name: 'KYC_Completed', description: 'Finished KYC verification', category: 'Onboarding', attributes: [A('method', 'enum', ['Aadhaar', 'PAN', 'DigiLocker']), A('attempts', 'number')] },
  { id: 'us_account_opened', name: 'US_Stocks_Account_Opened', description: 'Opened a US stocks account', category: 'Onboarding', attributes: [PLATFORM] },
  { id: 'first_investment', name: 'First_Investment_Complete', description: 'Made their first investment', category: 'Investing', attributes: [A('amount', 'number'), A('asset_type', 'enum', ['Stocks', 'MF', 'Gold', 'ETF']), PLATFORM] },
  { id: 'sip_created', name: 'SIP_Mandate_Created', description: 'Set up a recurring SIP', category: 'Investing', attributes: [A('amount', 'number'), A('frequency', 'enum', ['Daily', 'Weekly', 'Monthly'])] },
  { id: 'watchlist_add', name: 'Watchlist_Stock_Added', description: 'Added a stock to a watchlist', category: 'Investing', attributes: [A('ticker', 'string'), A('exchange', 'enum', ['NSE', 'BSE', 'NASDAQ', 'NYSE'])] },
  { id: 'rfi_submitted', name: 'US_Stocks_RFI_Submitted', description: 'Submitted the RFI form', category: 'Investing', attributes: [A('completed', 'bool')] },
  { id: 'watchlist_viewed', name: 'Watchlist_Viewed', description: 'Opened a watchlist', category: 'Engagement' },
  { id: 'notif_opened', name: 'Notification_Opened', description: 'Tapped a notification', category: 'Engagement', attributes: [A('channel', 'enum', ['push', 'email', 'sms', 'whatsapp']), A('campaign_id', 'string')] },
  { id: 'subscription_purchased', name: 'Subscription_Purchased', description: 'Bought a paid plan', category: 'Monetization', attributes: [A('plan', 'enum', ['Pro', 'Elite']), A('amount', 'number'), A('tenure', 'enum', ['Monthly', 'Annual'])] },
  { id: 'digital_gold_bought', name: 'Digital_Gold_Bought', description: 'Purchased digital gold', category: 'Monetization', attributes: [A('amount', 'number'), A('grams', 'number')] },
  { id: 'account_deleted', name: 'Account_Deleted', description: 'Deleted their account', category: 'Lifecycle', attributes: [A('reason', 'string')] },
  { id: 'uninstall', name: 'Uninstall', description: 'Uninstalled the app', category: 'Lifecycle', attributes: [PLATFORM] },
]

export const EVENT_CATEGORY_ORDER = ['Onboarding', 'Investing', 'Engagement', 'Monetization', 'Lifecycle']
