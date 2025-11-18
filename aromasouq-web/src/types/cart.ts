export interface Cart {
  id: string
  userId?: string
  sessionId?: string
  items: CartItem[]
  summary: CartSummary
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  variantId?: string
  quantity: number

  // Product snapshot
  product: {
    id: string
    name: string
    slug: string
    image: string
    price: number
    stockQuantity: number
    coinsToAward: number
  }
  variant?: {
    id: string
    name: string
    price: number
    stock?: number
  }
}

export interface CartSummary {
  subtotal: number
  shipping: number
  tax: number
  coinsEarnable: number
  total: number
  itemCount: number
}
