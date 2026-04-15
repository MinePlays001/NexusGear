import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getProducts } from '@/lib/adminStore'
import type { Product } from '@/lib/types'
import { isUserAuthenticated } from '@/lib/userAuth'
import JazzCashCheckout from '@/components/JazzCashCheckout'

export const Route = createFileRoute('/products/$productId')({ component: RouteComponent })

function RouteComponent() {
  const { productId } = Route.useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    async function load() {
      const products = await getProducts()
      const found = products.find(p => p.id === parseInt(productId))
      if (found) { 
        setProduct(found) 
      } else { 
        setNotFound(true) 
      }
    }
    load()
  }, [productId])

  const handleBuyNow = () => {
    if (!isUserAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    if (product && product.stock > 0) {
      setShowCheckout(true)
    }
  }

  if (notFound) return (
    <main className="max-w-6xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">😕</p>
      <h1 className="text-3xl font-bold text-white mb-4">Product Not Found</h1>
      <Link to="/" className="text-blue-400 hover:text-blue-300">← Back to marketplace</Link>
    </main>
  )

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  const stockStatus = product.stock === 0 ? 'Out of Stock' : product.stock <= 3 ? `Only ${product.stock} left!` : `${product.stock} in stock`
  const stockColor = product.stock === 0 ? 'text-red-500' : product.stock <= 3 ? 'text-yellow-500' : 'text-green-500'

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        ← Back to marketplace
      </Link>
      
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800 aspect-square">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover" 
            onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png' }} 
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Price</span>
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Rs. {product.price.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Availability</span>
              <span className={`font-semibold ${stockColor}`}>
                {stockStatus}
              </span>
            </div>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold text-lg py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            {product.stock === 0 ? (
              <>🚫 Out of Stock</>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Buy Now - Pay with JazzCash
              </>
            )}
          </button>

          {!isUserAuthenticated() && (
            <p className="text-yellow-400 text-sm text-center">
              ⚠️ You need to <Link to="/login" className="underline">login</Link> to make a purchase
            </p>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">📦 Delivery Information</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>✅ Digital delivery within 24 hours</li>
              <li>✅ Account details sent to your email</li>
              <li>✅ Full ownership transfer guaranteed</li>
              <li>✅ Secure payment via JazzCash</li>
            </ul>
          </div>
        </div>
      </div>

      {showCheckout && product && (
        <JazzCashCheckout 
          product={product} 
          onClose={() => setShowCheckout(false)} 
        />
      )}
    </main>
  )
}
