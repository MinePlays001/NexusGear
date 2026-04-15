import supabase from './supabase'

export interface Order {
  id: string
  productId: number
  productName: string
  price: number
  buyerEmail: string
  buyerName: string
  status: 'pending' | 'completed' | 'cancelled'
  paymentMethod: 'jazzcash'
  createdAt: number
  jazzCashDetails?: {
    accountNumber: string
    accountName: string
    transactionId?: string
  }
}

const ORDERS_KEY = 'gm_orders'
const PENDING_ORDERS_KEY = 'gm_pending_orders'

// JAZZCASH PAYMENT DETAILS
export const JAZZCASH_NUMBER = localStorage.getItem('pg_jazzcash_number') || '03126905303'
export const JAZZCASH_NAME = localStorage.getItem('pg_jazzcash_name') || 'Shamim Akhtar'

// Get all orders
export async function getOrders(): Promise<Order[]> {
  try {
    const data = await supabase('/orders?order=created_at.desc')
    return data || []
  } catch (e) {
    console.error('getOrders error:', e)
    // Fallback to localStorage
    try {
      const local = localStorage.getItem(ORDERS_KEY)
      return local ? JSON.parse(local) : []
    } catch {
      return []
    }
  }
}

// Get pending orders (localStorage for quick access)
export function getPendingOrders(): Order[] {
  try {
    const data = localStorage.getItem(PENDING_ORDERS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Save pending order locally
function savePendingOrder(order: Order): void {
  const pending = getPendingOrders()
  pending.push(order)
  localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(pending))
}

// Create new order
export async function createOrder(
  productId: number,
  productName: string,
  price: number,
  buyerEmail: string,
  buyerName: string,
  transactionId: string
): Promise<Order> {
  const order: Order = {
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId,
    productName,
    price,
    buyerEmail,
    buyerName,
    status: 'pending',
    paymentMethod: 'jazzcash',
    createdAt: Date.now(),
    jazzCashDetails: {
      accountNumber: JAZZCASH_NUMBER,
      accountName: JAZZCASH_NAME,
      transactionId
    }
  }

  try {
    // Save to Supabase
    await supabase('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  } catch (e) {
    console.error('Failed to save order to Supabase:', e)
  }

  // Always save locally as backup
  savePendingOrder(order)
  
  // Notify admin
  notifyAdmin(order)
  
  return order
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    await supabase(`/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    window.dispatchEvent(new CustomEvent('gm_orders_updated'))
  } catch (e) {
    console.error('updateOrderStatus error:', e)
  }
}

// Delete order
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await supabase(`/orders?id=eq.${orderId}`, { method: 'DELETE' })
    window.dispatchEvent(new CustomEvent('gm_orders_updated'))
  } catch (e) {
    console.error('deleteOrder error:', e)
  }
}

// Notify admin of new order (console log for now, can be extended)
function notifyAdmin(order: Order): void {
  console.log('🔔 NEW ORDER NOTIFICATION')
  console.log('========================')
  console.log(`Order ID: ${order.id}`)
  console.log(`Product: ${order.productName}`)
  console.log(`Price: Rs. ${order.price}`)
  console.log(`Buyer Email: ${order.buyerEmail}`)
  console.log(`Buyer Name: ${order.buyerName}`)
  console.log(`Transaction ID: ${order.jazzCashDetails?.transactionId || 'N/A'}`)
  console.log('========================')
  console.log('⚠️ ADMIN: Please send account details to buyer email!')
  
  // Store notification for admin panel
  const notifications = getAdminNotifications()
  notifications.unshift({
    id: order.id,
    message: `New order from ${order.buyerName} (${order.buyerEmail}) for ${order.productName}`,
    timestamp: Date.now(),
    read: false
  })
  localStorage.setItem('gm_admin_notifications', JSON.stringify(notifications))
  window.dispatchEvent(new CustomEvent('gm_new_order'))
}

// Get admin notifications
export function getAdminNotifications(): Array<{
  id: string
  message: string
  timestamp: number
  read: boolean
}> {
  try {
    const data = localStorage.getItem('gm_admin_notifications')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Mark notification as read
export function markNotificationRead(id: string): void {
  const notifications = getAdminNotifications()
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
  localStorage.setItem('gm_admin_notifications', JSON.stringify(updated))
}
