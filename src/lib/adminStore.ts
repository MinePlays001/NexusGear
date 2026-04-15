import supabase from './supabase'
import type { Product, Category } from './types'
import { DEFAULT_CATEGORIES } from './types'

export interface SiteContent {
  heroTitle: string
  heroSubtitle: string
  heroTagline: string
  ctaBannerTitle: string
  ctaBannerSubtitle: string
  stats: Array<{ value: string; label: string }>
  heroImage: string
  aboutStory: string[]
  aboutValues: Array<{ icon: string; title: string; desc: string }>
}

const DEFAULT_CONTENT: SiteContent = {
  heroTitle: 'Premium Gaming\nAccounts',
  heroSubtitle: 'Discover top-quality gaming accounts. Fast delivery, verified & secure.',
  heroTagline: 'New Accounts Available',
  ctaBannerTitle: 'Ready to level up?',
  ctaBannerSubtitle: 'Browse our collection and place your order in minutes.',
  stats: [
    { value: '500+', label: 'Happy Customers' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '24hr', label: 'Fast Delivery' },
    { value: 'Fast', label: 'Support' },
  ],
  heroImage: '',
  aboutStory: [
    'NexusGear was created to solve a growing problem: finding trusted gaming accounts online was risky, overpriced, and unreliable. We set out to build a safe and transparent marketplace for gamers.',
    'Founded with a passion for gaming, NexusGear offers verified accounts for platforms like Roblox, Steam, and Minecraft — giving players instant access to premium experiences without the grind.',
    'Every product in our catalog is personally tested by our team before listing.',
  ],
  aboutValues: [
    { icon: '⚡', title: 'Fast Delivery', desc: 'Account details delivered within 24 hours.' },
    { icon: '✅', title: 'Vetted Products', desc: 'Every item tested before it reaches you.' },
    { icon: '💛', title: 'Customer First', desc: 'Your satisfaction is our only metric.' },
  ],
}

function toDbProduct(p: any) {
  return {
    name: p.name,
    image: p.image || '',
    description: p.description || '',
    short_description: p.shortDescription || p.short_description || '',
    price: p.price,
    category: p.category,
    stock: p.stock ?? 0,
    features: p.features || [],
  }
}

export async function getProducts(): Promise<Product[]> {
  try { return (await supabase('/products?order=id.asc')) || [] } catch { return [] }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const data = await supabase('/products', {
    method: 'POST',
    body: JSON.stringify(toDbProduct(product)),
  })
  window.dispatchEvent(new CustomEvent('pg_products_updated'))
  return data[0]
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<void> {
  await supabase(`/products?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toDbProduct(updates)),
  })
  window.dispatchEvent(new CustomEvent('pg_products_updated'))
}

export async function deleteProduct(id: number): Promise<void> {
  await supabase(`/products?id=eq.${id}`, { method: 'DELETE' })
  window.dispatchEvent(new CustomEvent('pg_products_updated'))
}

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await supabase('/categories?order=created_at.asc')
    return data?.length ? data : DEFAULT_CATEGORIES
  } catch { return DEFAULT_CATEGORIES }
}

export async function addCategory(cat: Omit<Category, 'id'>): Promise<Category> {
  const id = cat.label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') + '_' + Date.now()
  const data = await supabase('/categories', { method: 'POST', body: JSON.stringify({ ...cat, id }) })
  window.dispatchEvent(new CustomEvent('pg_categories_updated'))
  return data[0]
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<void> {
  await supabase(`/categories?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
  window.dispatchEvent(new CustomEvent('pg_categories_updated'))
}

export async function deleteCategory(id: string): Promise<void> {
  await supabase(`/categories?id=eq.${id}`, { method: 'DELETE' })
  await supabase(`/products?category=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ category: 'other' }) })
  window.dispatchEvent(new CustomEvent('pg_categories_updated'))
  window.dispatchEvent(new CustomEvent('pg_products_updated'))
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const data = await supabase('/site_content?key=eq.main')
    if (data?.length && data[0]?.value) return { ...DEFAULT_CONTENT, ...JSON.parse(data[0].value) }
    return DEFAULT_CONTENT
  } catch { return DEFAULT_CONTENT }
}

export async function saveSiteContent(content: Partial<SiteContent>): Promise<void> {
  const merged = { ...await getSiteContent(), ...content }
  await supabase('/site_content', {
    method: 'POST',
    body: JSON.stringify({ key: 'main', value: JSON.stringify(merged) }),
    headers: { 'Prefer': 'resolution=merge-duplicates' },
  })
  window.dispatchEvent(new CustomEvent('pg_content_updated'))
}

const LOGO_KEY = 'pg_logo_image'

export function getLogoImageLocal(): string {
  try { return localStorage.getItem(LOGO_KEY) || '' } catch { return '' }
}

export function saveLogoImageLocal(base64: string): void {
  localStorage.setItem(LOGO_KEY, base64)
  window.dispatchEvent(new CustomEvent('pg_logo_updated'))
}

export async function uploadImage(file: File, path: string): Promise<string> {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/pulsegear/${path}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: file,
  })
  if (!res.ok) return fileToBase64(file)
  return `${SUPABASE_URL}/storage/v1/object/public/pulsegear/${path}`
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}
