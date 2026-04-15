export interface Product {
  id: number
  name: string
  image: string
  description: string
  shortDescription: string
  price: number
  category: 'steam' | 'roblox' | 'minecraft'
  stock: number
}

// Static fallback products (used when localStorage is empty)
const products: Array<Product> = [
  {
    id: 1,
    name: 'Steam Premium Account',
    image: '/placeholder.png',
    category: 'steam',
    shortDescription: 'Full access Steam account with 50+ games library.',
    description:
      'Get instant access to a premium Steam account loaded with over 50 popular games. Includes AAA titles and indie favorites. Account comes with full ownership transfer and email change capability. Perfect for gamers looking to start with a large library.',
    price: 3500,
    stock: 5,
  },
  {
    id: 2,
    name: 'Roblox Account with Robux',
    image: '/placeholder.png',
    category: 'roblox',
    shortDescription: 'Verified Roblox account with 10,000 Robux included.',
    description:
      'Verified Roblox account with 10,000 Robux already loaded. Account includes exclusive items and premium membership. Perfect for accessing premium games and purchasing in-game items. Full account access provided.',
    price: 2500,
    stock: 8,
  },
  {
    id: 3,
    name: 'Minecraft Java Edition Account',
    image: '/placeholder.png',
    category: 'minecraft',
    shortDescription: 'Full access Minecraft Java account for PC.',
    description:
      'Original Minecraft Java Edition account with full access. Play on any server, mod support included. Account comes with secure email transfer. Perfect for PC gamers who want the full Minecraft experience with mod support.',
    price: 1500,
    stock: 12,
  },
  {
    id: 4,
    name: 'Minecraft Bedrock Edition Account',
    image: '/placeholder.png',
    category: 'minecraft',
    shortDescription: 'Cross-platform Minecraft Bedrock account.',
    description:
      'Minecraft Bedrock Edition account compatible with Windows, Xbox, PlayStation, and mobile devices. Includes access to marketplace and cross-play capability. Full account ownership transfer provided.',
    price: 1200,
    stock: 10,
  },
]

export default products
