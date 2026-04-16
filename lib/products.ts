export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  popular?: boolean
  mode: 'payment' | 'subscription'
  interval?: 'month' | 'year'
}

export const PRODUCTS: Product[] = [
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    description: 'For creators and professionals',
    priceInCents: 900, // $9.00
    features: [
      'Unlimited Bio Pages',
      '500 Short Links/month',
      'Advanced Analytics',
      'Custom Themes',
      'AI Content Generation',
      'Remove Branding',
    ],
    popular: true,
    mode: 'subscription',
    interval: 'month',
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    description: 'For creators and professionals (save 17%)',
    priceInCents: 9000, // $90.00/year
    features: [
      'Unlimited Bio Pages',
      '500 Short Links/month',
      'Advanced Analytics',
      'Custom Themes',
      'AI Content Generation',
      'Remove Branding',
    ],
    mode: 'subscription',
    interval: 'year',
  },
  {
    id: 'business-monthly',
    name: 'Business Monthly',
    description: 'For teams and agencies',
    priceInCents: 2900, // $29.00
    features: [
      'Everything in Pro',
      'Unlimited Short Links',
      'Custom Domains',
      'Team Collaboration',
      'Priority Support',
      'API Access',
    ],
    mode: 'subscription',
    interval: 'month',
  },
  {
    id: 'business-yearly',
    name: 'Business Yearly',
    description: 'For teams and agencies (save 17%)',
    priceInCents: 29000, // $290.00/year
    features: [
      'Everything in Pro',
      'Unlimited Short Links',
      'Custom Domains',
      'Team Collaboration',
      'Priority Support',
      'API Access',
    ],
    mode: 'subscription',
    interval: 'year',
  },
]
