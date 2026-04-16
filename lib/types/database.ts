export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  plan: 'free' | 'pro' | 'business'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface BioPage {
  id: string
  user_id: string
  slug: string
  title: string | null
  description: string | null
  theme: BioPageTheme
  is_published: boolean
  custom_domain: string | null
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface BioPageTheme {
  background: string
  text: string
  accent: string
  style: 'minimal' | 'bold' | 'elegant' | 'playful'
}

export type BlockType = 'link' | 'header' | 'text' | 'image' | 'social' | 'embed' | 'divider' | 'email-capture'

export interface BioBlock {
  id: string
  page_id: string
  type: BlockType
  content: BlockContent
  position: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type BlockContent = 
  | LinkBlockContent
  | HeaderBlockContent
  | TextBlockContent
  | ImageBlockContent
  | SocialBlockContent
  | EmbedBlockContent
  | DividerBlockContent
  | EmailCaptureBlockContent

export interface LinkBlockContent {
  url: string
  title: string
  icon?: string
  thumbnail?: string
}

export interface HeaderBlockContent {
  text: string
  size: 'small' | 'medium' | 'large'
}

export interface TextBlockContent {
  text: string
}

export interface ImageBlockContent {
  url: string
  alt?: string
  link?: string
}

export interface SocialBlockContent {
  platform: string
  url: string
  username?: string
}

export interface EmbedBlockContent {
  url: string
  type: 'youtube' | 'spotify' | 'soundcloud' | 'tiktok' | 'instagram'
}

export interface DividerBlockContent {
  style: 'line' | 'dots' | 'space'
}

export interface EmailCaptureBlockContent {
  title: string
  placeholder?: string
  button_text?: string
}

export interface ShortLink {
  id: string
  user_id: string
  original_url: string
  short_code: string
  title: string | null
  custom_slug: string | null
  password: string | null
  expires_at: string | null
  is_active: boolean
  click_count: number
  created_at: string
  updated_at: string
}

export interface LinkAnalytics {
  id: string
  link_id: string | null
  bio_block_id: string | null
  clicked_at: string
  referrer: string | null
  country: string | null
  city: string | null
  device: string | null
  browser: string | null
  os: string | null
  ip_hash: string | null
}

export interface PageView {
  id: string
  page_id: string
  viewed_at: string
  referrer: string | null
  country: string | null
  city: string | null
  device: string | null
  browser: string | null
  os: string | null
  ip_hash: string | null
}

export interface EmailSubscriber {
  id: string
  page_id: string
  email: string
  subscribed_at: string
}

export interface AIGeneration {
  id: string
  user_id: string
  type: 'bio' | 'link_title' | 'seo' | 'content'
  input: string | null
  output: string | null
  created_at: string
}
