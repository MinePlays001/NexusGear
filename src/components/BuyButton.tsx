import { addToCart } from '@/lib/cart'
import { getProducts } from '@/lib/adminStore'
import { useState } from 'react'

export function BuyButton({ productId, className = '' }: { productId: number; className?: string }) {
  const [added, setAdded] = useState(false)
  const handleClick = async () => {
    const products = await getProducts()
    const product = products.find(p => p.id === productId)
    if (product) { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 2000) }
  }
  return <button onClick={handleClick} className={className}>{added ? '✅ Added!' : '🛒 Add to Cart'}</button>
}
