import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { isAdminAuthenticated, adminLogout } from '@/lib/adminAuth'
import {
  getProducts, updateProduct, addProduct, deleteProduct,
  getCategories, addCategory, deleteCategory,
  getSiteContent, saveSiteContent,
  uploadImage, fileToBase64,
  getLogoImageLocal, saveLogoImageLocal,
} from '@/lib/adminStore'
import { getOrders, updateOrderStatus, deleteOrder, getAdminNotifications, markNotificationRead } from '@/lib/orders'
import type { Product, Category } from '@/lib/types'
import type { Order } from '@/lib/orders'

export const Route = createFileRoute('/admin/')({ component: AdminDashboard })

type Tab = 'orders' | 'products' | 'branding' | 'settings' | 'notifications'

function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('orders')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    const [p, o, n, c] = await Promise.all([
      getProducts(),
      getOrders(),
      Promise.resolve(getAdminNotifications()),
      getCategories(),
    ])
    setProducts(p)
    setOrders(o)
    setNotifications(n)
    setCategories(c)
    setLoading(false)
  }

  useEffect(() => {
    if (!isAdminAuthenticated()) { navigate({ to: '/admin/login' }); return }
    loadAll()
    const handler = () => loadAll()
    window.addEventListener('gm_new_order', handler)
    return () => window.removeEventListener('gm_new_order', handler)
  }, [navigate])

  const unreadCount = notifications.filter(n => !n.read).length
  const pendingCount = orders.filter(o => o.status === 'pending').length

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Loading admin panel...</p>
      </div>
    </div>
  )

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'orders', label: '📦 Orders', badge: pendingCount },
    { id: 'products', label: '🎮 Products' },
    { id: 'branding', label: '🎨 Branding' },
    { id: 'settings', label: '⚙️ Settings' },
    { id: 'notifications', label: '🔔 Alerts', badge: unreadCount },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Admin Panel</span>
            <span className="bg-red-500/20 border border-red-500 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">View Site ↗</a>
            <button onClick={() => { adminLogout(); navigate({ to: '/admin/login' }) }}
              className="bg-gray-800 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-800 bg-gray-900/50 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pt-3 min-w-max">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative px-5 py-3 rounded-t-xl font-semibold text-sm transition-all whitespace-nowrap ${
                tab === t.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              {t.label}
              {t.badge ? (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {tab === 'orders' && <OrdersTab orders={orders} onRefresh={loadAll} />}
        {tab === 'products' && <ProductsTab products={products} categories={categories} onRefresh={loadAll} />}
        {tab === 'branding' && <BrandingTab />}
        {tab === 'settings' && <SettingsTab categories={categories} onRefresh={loadAll} />}
        {tab === 'notifications' && <NotificationsTab notifications={notifications} onRefresh={loadAll} />}
      </div>
    </div>
  )
}

function OrdersTab({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all')
  const filtered = orders.filter(o => filter === 'all' || o.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Order Management</h2>
          <p className="text-gray-400 mt-1">{orders.filter(o => o.status === 'pending').length} pending · {orders.length} total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'completed', 'cancelled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize text-sm transition-colors ${
                filter === f ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}>{f}</button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-400 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => <OrderCard key={order.id} order={order} onRefresh={onRefresh} />)}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const statusColor = order.status === 'pending'
    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
    : order.status === 'completed'
    ? 'bg-green-500/20 text-green-400 border-green-500'
    : 'bg-red-500/20 text-red-400 border-red-500'

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold">{order.productName}</h3>
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>{order.status.toUpperCase()}</span>
          </div>
          <p className="text-gray-500 text-xs font-mono">ID: {order.id}</p>
          <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <p className="text-3xl font-bold text-green-400">Rs. {order.price.toLocaleString()}</p>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 bg-black/40 rounded-xl p-4 mb-4">
        {[
          { label: 'Customer', value: order.buyerName },
          { label: 'Email', value: order.buyerEmail },
          { label: 'Payment', value: order.paymentMethod?.toUpperCase() || 'JazzCash' },
          { label: 'Transaction ID', value: order.jazzCashDetails?.transactionId || 'N/A' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className="font-semibold text-sm break-all">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {order.status === 'pending' && (
          <>
            <button onClick={async () => { await updateOrderStatus(order.id, 'completed'); onRefresh() }}
              className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
              ✓ Mark Completed
            </button>
            <button onClick={async () => { await updateOrderStatus(order.id, 'cancelled'); onRefresh() }}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
              ✗ Cancel
            </button>
          </>
        )}
        <a href={`mailto:${order.buyerEmail}?subject=Your Order - ${order.productName}&body=Hi ${order.buyerName},%0D%0A%0D%0AThank you for your order!%0D%0A%0D%0AHere are your account details:%0D%0A[INSERT DETAILS HERE]`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
          📧 Email Customer
        </a>
        <button onClick={async () => { if (confirm('Delete this order?')) { await deleteOrder(order.id); onRefresh() } }}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}

function ProductsTab({ products, categories, onRefresh }: { products: Product[]; categories: Category[]; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Products</h2>
          <p className="text-gray-400 mt-1">{products.length} products listed</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl transition-opacity">
          + Add Product
        </button>
      </div>
      {showAdd && (
        <ProductForm categories={categories}
          onSave={async (data) => { await addProduct(data); setShowAdd(false); onRefresh() }}
          onCancel={() => setShowAdd(false)} />
      )}
      <div className="space-y-4">
        {products.map(product => (
          editingId === product.id ? (
            <ProductForm key={product.id} product={product} categories={categories}
              onSave={async (data) => { await updateProduct(product.id, data); setEditingId(null); onRefresh() }}
              onCancel={() => setEditingId(null)} />
          ) : (
            <ProductRow key={product.id} product={product}
              onEdit={() => setEditingId(product.id)}
              onDelete={async () => { if (confirm('Delete this product?')) { await deleteProduct(product.id); onRefresh() } }}
              onRefresh={onRefresh} />
          )
        ))}
      </div>
    </div>
  )
}

function ProductRow({ product, onEdit, onDelete, onRefresh }: {
  product: Product; onEdit: () => void; onDelete: () => void; onRefresh: () => void
}) {
  const [editingStock, setEditingStock] = useState(false)
  const [newStock, setNewStock] = useState(product.stock)

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-colors">
      <div className="flex items-center gap-4">
        <img src={product.image} alt={product.name}
          className="w-20 h-20 rounded-xl object-cover bg-gray-800 flex-shrink-0"
          onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png' }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg">{product.name}</h3>
          <p className="text-gray-400 text-sm uppercase">{product.category}</p>
          <p className="text-gray-500 text-sm truncate">{product.short_description || product.shortDescription}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-green-400">Rs. {product.price.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <span className="text-gray-400 text-sm">Stock:</span>
            {editingStock ? (
              <>
                <input type="number" min={0} value={newStock} onChange={e => setNewStock(+e.target.value)}
                  className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-white text-sm" autoFocus />
                <button onClick={async () => { await updateProduct(product.id, { stock: newStock }); setEditingStock(false); onRefresh() }}
                  className="text-green-400 hover:text-green-300 text-sm font-bold">✓</button>
                <button onClick={() => setEditingStock(false)} className="text-red-400 hover:text-red-300 text-sm">✗</button>
              </>
            ) : (
              <>
                <span className={`font-bold ${product.stock === 0 ? 'text-red-400' : product.stock <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {product.stock}
                </span>
                <button onClick={() => { setEditingStock(true); setNewStock(product.stock) }}
                  className="text-blue-400 hover:text-blue-300 text-xs underline">edit</button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">✏️ Edit</button>
          <button onClick={onDelete} className="bg-gray-800 hover:bg-red-600 text-gray-300 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">🗑️ Delete</button>
        </div>
      </div>
    </div>
  )
}

function ProductForm({ product, categories, onSave, onCancel }: {
  product?: Product
  categories: Category[]
  onSave: (data: Omit<Product, 'id'>) => Promise<void>
  onCancel: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(product?.image || '')
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    category: product?.category || (categories[0]?.id || 'other'),
    description: product?.description || '',
    shortDescription: product?.shortDescription || product?.short_description || '',
    image: product?.image || '',
    features: product?.features || [],
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const base64 = await fileToBase64(file)
    setImagePreview(base64)
    const path = `products/${Date.now()}-${file.name}`
    const url = await uploadImage(file, path)
    set('image', url)
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price) { alert('Name and price are required'); return }
    if (uploading) { alert('Please wait for image to finish uploading'); return }
    setSaving(true)
    await onSave({ ...form, short_description: form.shortDescription } as Omit<Product, 'id'>)
    setSaving(false)
  }

  return (
    <div className="bg-gray-900 border-2 border-purple-500/50 rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-bold text-purple-400">{product ? '✏️ Edit Product' : '➕ New Product'}</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Product Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Roblox Premium Account"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none">
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Price (Rs.) *</label>
          <input type="number" value={form.price} onChange={e => set('price', +e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Stock</label>
          <input type="number" value={form.stock} onChange={e => set('stock', +e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-gray-400 text-sm mb-1">Short Description</label>
          <input value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
            placeholder="One line summary"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-gray-400 text-sm mb-1">Full Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={3} placeholder="Detailed product description"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none resize-none" />
        </div>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-2">Product Image</label>
        <div className="flex items-center gap-4 flex-wrap">
          {imagePreview && (
            <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-gray-700 flex-shrink-0" />
          )}
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50">
            {uploading ? '⏳ Uploading...' : '📁 Upload Image from PC'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          <span className="text-gray-500 text-xs">or</span>
          <input value={form.image} onChange={e => { set('image', e.target.value); setImagePreview(e.target.value) }}
            placeholder="Paste image URL"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-purple-500 outline-none" />
        </div>
        {uploading && <p className="text-yellow-400 text-xs mt-2">⏳ Uploading image, please wait before saving...</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSubmit} disabled={saving || uploading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-opacity">
          {uploading ? '⏳ Wait for Upload...' : saving ? 'Saving...' : product ? '✅ Save Changes' : '✅ Add Product'}
        </button>
        <button onClick={onCancel} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

function BrandingTab() {
  const logoRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(getLogoImageLocal())
  const [form, setForm] = useState({
    siteName: localStorage.getItem('gm_site_name') || 'Gaming Marketplace',
    siteDescription: '',
    heroTitle: '',
    heroSubtitle: '',
    heroTagline: '',
    ctaBannerTitle: '',
    ctaBannerSubtitle: '',
  })

  useEffect(() => {
    getSiteContent().then(c => {
      setForm(f => ({
        ...f,
        siteDescription: (c as any).siteDescription || '',
        heroTitle: c.heroTitle || '',
        heroSubtitle: c.heroSubtitle || '',
        heroTagline: c.heroTagline || '',
        ctaBannerTitle: c.ctaBannerTitle || '',
        ctaBannerSubtitle: c.ctaBannerSubtitle || '',
      }))
    })
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await fileToBase64(file)
    setLogoPreview(base64)
    saveLogoImageLocal(base64)
    window.dispatchEvent(new CustomEvent('gm_branding_updated'))
  }

  const handleSave = async () => {
    setSaving(true)
    localStorage.setItem('gm_site_name', form.siteName)
    await saveSiteContent({
      heroTitle: form.heroTitle,
      heroSubtitle: form.heroSubtitle,
      heroTagline: form.heroTagline,
      ctaBannerTitle: form.ctaBannerTitle,
      ctaBannerSubtitle: form.ctaBannerSubtitle,
    })
    window.dispatchEvent(new CustomEvent('gm_branding_updated'))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold">Branding</h2>
        <p className="text-gray-400 mt-1">Change site name, logo, and text that appears everywhere</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">🖼️ Site Logo</h3>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-xl border border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoPreview
              ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
              : <span className="text-gray-500 text-xs text-center px-2">No Logo</span>}
          </div>
          <div className="space-y-2">
            <button onClick={() => logoRef.current?.click()}
              className="block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm">
              📁 Upload Logo from PC
            </button>
            {logoPreview && (
              <button onClick={() => { saveLogoImageLocal(''); setLogoPreview(''); window.dispatchEvent(new CustomEvent('gm_branding_updated')) }}
                className="block text-red-400 hover:text-red-300 text-sm transition-colors">
                ✕ Remove Logo
              </button>
            )}
            <p className="text-gray-500 text-xs">PNG, JPG, SVG — recommended 200×60px</p>
          </div>
          <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold mb-2">✏️ Site Text</h3>
        {[
          { label: 'Site Name', key: 'siteName', placeholder: 'Gaming Marketplace' },
          { label: 'Hero Tagline (small badge above title)', key: 'heroTagline', placeholder: 'New Accounts Available' },
          { label: 'Hero Title (big heading)', key: 'heroTitle', placeholder: 'Premium Gaming Accounts' },
          { label: 'Hero Subtitle (below heading)', key: 'heroSubtitle', placeholder: 'Fast delivery, verified accounts...' },
          { label: 'Banner Title', key: 'ctaBannerTitle', placeholder: 'Ready to level up?' },
          { label: 'Banner Subtitle', key: 'ctaBannerSubtitle', placeholder: 'Browse our collection...' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-gray-400 text-sm mb-1">{label}</label>
            <input value={(form as any)[key]} onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none" />
          </div>
        ))}
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-opacity mt-2">
          {saving ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save Branding'}
        </button>
      </div>
    </div>
  )
}

function SettingsTab({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
  const [jazzNum, setJazzNum] = useState(localStorage.getItem('pg_jazzcash_number') || '')
  const [jazzName, setJazzName] = useState(localStorage.getItem('pg_jazzcash_name') || '')
  const [jazzSaved, setJazzSaved] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('🎮')
  const [newCatImage, setNewCatImage] = useState('')
  const [newCatImagePreview, setNewCatImagePreview] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const catImageRef = useRef<HTMLInputElement>(null)

  const saveJazz = () => {
    localStorage.setItem('pg_jazzcash_number', jazzNum)
    localStorage.setItem('pg_jazzcash_name', jazzName)
    window.dispatchEvent(new CustomEvent('pg_jazzcash_updated'))
    setJazzSaved(true)
    setTimeout(() => setJazzSaved(false), 2000)
  }

  const handleCatImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await fileToBase64(file)
    setNewCatImagePreview(base64)
    const path = `categories/${Date.now()}-${file.name}`
    const url = await uploadImage(file, path)
    setNewCatImage(url)
  }

  const handleAddCategory = async () => {
    if (!newCatLabel.trim()) { alert('Enter a category name'); return }
    setAddingCat(true)
    await addCategory({ label: newCatLabel.trim(), icon: newCatIcon, image: newCatImage })
    setNewCatLabel('')
    setNewCatIcon('🎮')
    setNewCatImage('')
    setNewCatImagePreview('')
    onRefresh()
    setAddingCat(false)
  }

  const handleDeleteCategory = async (id: string, label: string) => {
    if (confirm(`Delete category "${label}"? Products in this category will move to "Other".`)) {
      await deleteCategory(id)
      onRefresh()
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-gray-400 mt-1">Payment details and category management</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold">💳 JazzCash Details</h3>
        <p className="text-gray-400 text-sm">These appear on the checkout screen when customers pay.</p>
        <div>
          <label className="block text-gray-400 text-sm mb-1">JazzCash Number</label>
          <input value={jazzNum} onChange={e => setJazzNum(e.target.value)} placeholder="e.g. 03001234567"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Account Holder Name</label>
          <input value={jazzName} onChange={e => setJazzName(e.target.value)} placeholder="e.g. Muhammad Ali"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none" />
        </div>
        <button onClick={saveJazz}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-opacity">
          {jazzSaved ? '✅ Saved!' : '💾 Save JazzCash Details'}
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold">🏷️ Categories</h3>
        <p className="text-gray-400 text-sm">Add game categories like Fortnite, PUBG, FIFA etc.</p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)}
              placeholder="🎮" className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-center focus:border-purple-500 outline-none text-xl" />
            <input value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)}
              placeholder="Category name (e.g. Fortnite)"
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 outline-none" />
          </div>
          <div className="flex items-center gap-3">
            {newCatImagePreview && (
              <img src={newCatImagePreview} alt="preview" className="w-14 h-14 rounded-xl object-cover border border-gray-700 flex-shrink-0" />
            )}
            <button onClick={() => catImageRef.current?.click()}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              🖼️ Upload Category Image
            </button>
            <input ref={catImageRef} type="file" accept="image/*" onChange={handleCatImage} className="hidden" />
            <span className="text-gray-500 text-xs">optional</span>
            {newCatImagePreview && (
              <button onClick={() => { setNewCatImage(''); setNewCatImagePreview('') }}
                className="text-red-400 hover:text-red-300 text-xs">✕ Remove</button>
            )}
          </div>
          <button onClick={handleAddCategory} disabled={addingCat}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg transition-colors">
            {addingCat ? 'Adding...' : '+ Add Category'}
          </button>
        </div>
        <div className="space-y-2 mt-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                {cat.image ? (
                  <img src={cat.image} alt={cat.label} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <span className="text-2xl">{cat.icon}</span>
                )}
                <span className="font-semibold">{cat.label}</span>
              </div>
              <button onClick={() => handleDeleteCategory(cat.id, cat.label)}
                className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors">
                ✕ Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NotificationsTab({ notifications, onRefresh }: { notifications: any[]; onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Notifications</h2>
        <p className="text-gray-400 mt-1">{notifications.filter(n => !n.read).length} unread</p>
      </div>
      {notifications.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-16 text-center">
          <p className="text-5xl mb-4">🔔</p>
          <p className="text-gray-400 text-lg">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div key={notif.id}
              className={`bg-gray-900 border rounded-xl p-4 flex items-start justify-between gap-4 transition-colors ${
                notif.read ? 'border-gray-800' : 'border-blue-500 bg-blue-500/5'
              }`}>
              <div className="flex items-start gap-3">
                {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                <div>
                  <p className={notif.read ? 'text-gray-400' : 'text-white font-semibold'}>{notif.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                </div>
              </div>
              {!notif.read && (
                <button onClick={() => { markNotificationRead(notif.id); onRefresh() }}
                  className="text-blue-400 hover:text-blue-300 text-sm whitespace-nowrap transition-colors">
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
