export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'owner'
  stripe_account_id?: string
  stripe_onboarding_completed?: boolean
  wise_account_id?: string
  wise_onboarding_completed?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: number
  user_id: number
  name: string
  description?: string
  instagram_url?: string
  hero_image_url?: string
  language: string
  currency: string
  access_token: string
  tags?: string[]
  payment_processor: 'stripe' | 'wise'
  payout_schedule: 'manual' | 'weekly' | 'monthly'
  wise_account_details?: {
    bank_name?: string
    account_number?: string
    routing_number?: string
    swift_code?: string
    account_holder_name?: string
    instructions?: string
  }
  created_at: string
  updated_at: string
  owner?: User
  upsells?: Upsell[]
  orders?: Order[]
}

export interface Vendor {
  id: number
  name: string
  email: string
  whatsapp_number?: string
  phone?: string
  description?: string
  service_type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Upsell {
  id: number
  property_id: number
  primary_vendor_id: number
  secondary_vendor_id?: number
  title: string
  description?: string
  price: number
  category: string
  image_url?: string
  availability_rules?: any
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  property?: Property
  primary_vendor?: Vendor
  secondary_vendor?: Vendor
  orders?: Order[]
}

export interface Order {
  id: number
  property_id: number
  upsell_id: number
  vendor_id: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  guest_passport?: string
  amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  order_details?: any
  fulfilled_at?: string
  created_at: string
  updated_at: string
  property?: Property
  upsell?: Upsell
  vendor?: Vendor
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}