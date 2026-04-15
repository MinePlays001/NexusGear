import { Link, createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getProducts } from '@/lib/adminStore'
import type { Product } from '@/lib/types'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'all' | 'steam' | 'roblox' | 'minecraft'>('all')

  useEffect(() => {
    async function load() {
      const p = await getProducts()
      setProducts(p)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory)

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-6 py-2 mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
              Digital Gaming Marketplace
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Level Up Your Gaming
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Premium gaming accounts delivered instantly. Steam, Roblox, Minecraft - all verified and ready to play.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#products"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Browse Products →
            </a>
            <Link
              to="/login"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 border border-gray-700"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {[
              { value: '100+', label: 'Accounts Sold' },
              { value: '24hr', label: 'Delivery Time' },
              { value: '4.9★', label: 'Customer Rating' },
              { value: '100%', label: 'Verified' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section id="products" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {[
            { id: 'all' as const, label: 'All Games', icon: '🎮' },
            { id: 'steam' as const, label: 'Steam', icon: '🎮' },
            { id: 'roblox' as const, label: 'Roblox', icon: '🎲' },
            { id: 'minecraft' as const, label: 'Minecraft', icon: '⛏️' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-gray-400 text-xl">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Start Gaming?
            </h2>
            <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
              Browse our collection of verified gaming accounts and start playing today.
            </p>
            <a
              href="#products"
              className="inline-block bg-white text-purple-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Shop Now →
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '⚡',
              title: 'Instant Delivery',
              desc: 'Get your account details within 24 hours via email',
            },
            {
              icon: '🔒',
              title: 'Secure Payment',
              desc: 'Safe and easy payment through JazzCash',
            },
            {
              icon: '✅',
              title: '100% Verified',
              desc: 'All accounts are verified and guaranteed to work',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const stockStatus = product.stock === 0 ? 'Out of Stock' : product.stock <= 3 ? `Only ${product.stock} left!` : `${product.stock} in stock`
  const stockColor = product.stock === 0 ? 'text-red-500' : product.stock <= 3 ? 'text-yellow-500' : 'text-green-500'

  return (
    <Link
      to="/products/$productId"
      params={{ productId: product.id.toString() }}
      className="group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500 transition-all duration-300 transform hover:scale-105 h-full flex flex-col">
        {/* Image */}
        <div className="aspect-square bg-gray-800 overflow-hidden relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={e => {
              ;(e.target as HTMLImageElement).src = '/placeholder.png'
            }}
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <span className="text-red-500 font-bold text-xl">OUT OF STOCK</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-2">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">
              {product.category}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          <p className="text-gray-400 text-sm mb-4 flex-1">
            {product.shortDescription}
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-400">
                Rs. {product.price.toLocaleString()}
              </span>
            </div>

            <div className={`text-sm font-semibold ${stockColor}`}>
              {stockStatus}
            </div>

            <div className="pt-2">
              <span className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl text-center group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                View Details →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
