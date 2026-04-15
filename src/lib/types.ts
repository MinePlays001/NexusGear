export interface Category {
  id: string
  label: string
  icon: string
  image: string
}

export interface Product {
  id: number
  name: string
  image: string
  description: string
  short_description: string
  shortDescription: string
  price: number
  category: string
  stock: number
  features: string[]
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'steam',     label: 'Steam',     icon: '🎮', image: '' },
  { id: 'roblox',    label: 'Roblox',    icon: '🕹️', image: '' },
  { id: 'minecraft', label: 'Minecraft', icon: '⛏️', image: '' },
]
