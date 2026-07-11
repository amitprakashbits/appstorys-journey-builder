/* Event catalog powering <EventPicker /> — grouped by category, cohort-filter
   row anatomy (icon, name, description). Swap for the events API later. */
export interface EventDef {
  id: string
  name: string
  description: string
  category: string
}

export const EVENT_CATEGORY_COLOR: Record<string, string> = {
  Onboarding: '#8B5CF6',
  Investing: '#10B981',
  Engagement: '#3B82F6',
  Monetization: '#FB6514',
  Lifecycle: '#6B7280',
}

export const EVENT_CATALOG: EventDef[] = [
  { id: 'app_opened', name: 'App_Opened', description: 'User launched the app', category: 'Onboarding' },
  { id: 'kyc_completed', name: 'KYC_Completed', description: 'Finished KYC verification', category: 'Onboarding' },
  { id: 'us_account_opened', name: 'US_Stocks_Account_Opened', description: 'Opened a US stocks account', category: 'Onboarding' },
  { id: 'first_investment', name: 'First_Investment_Complete', description: 'Made their first investment', category: 'Investing' },
  { id: 'sip_created', name: 'SIP_Mandate_Created', description: 'Set up a recurring SIP', category: 'Investing' },
  { id: 'watchlist_add', name: 'Watchlist_Stock_Added', description: 'Added a stock to a watchlist', category: 'Investing' },
  { id: 'rfi_submitted', name: 'US_Stocks_RFI_Submitted', description: 'Submitted the RFI form', category: 'Investing' },
  { id: 'watchlist_viewed', name: 'Watchlist_Viewed', description: 'Opened a watchlist', category: 'Engagement' },
  { id: 'notif_opened', name: 'Notification_Opened', description: 'Tapped a notification', category: 'Engagement' },
  { id: 'subscription_purchased', name: 'Subscription_Purchased', description: 'Bought a paid plan', category: 'Monetization' },
  { id: 'digital_gold_bought', name: 'Digital_Gold_Bought', description: 'Purchased digital gold', category: 'Monetization' },
  { id: 'account_deleted', name: 'Account_Deleted', description: 'Deleted their account', category: 'Lifecycle' },
  { id: 'uninstall', name: 'Uninstall', description: 'Uninstalled the app', category: 'Lifecycle' },
]

export const EVENT_CATEGORY_ORDER = ['Onboarding', 'Investing', 'Engagement', 'Monetization', 'Lifecycle']
