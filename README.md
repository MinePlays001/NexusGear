# Gaming Marketplace - Digital Gaming Accounts Store

A modern marketplace for selling digital gaming accounts (Steam, Roblox, Minecraft) with JazzCash payment integration, user authentication, and admin panel.

## 🎮 Features

### User Features
- **User Authentication**: Secure login/register system with password validation
- **Browse Products**: View Steam, Roblox, and Minecraft accounts
- **Stock Visibility**: Real-time stock availability
- **JazzCash Payment**: Easy payment via JazzCash mobile wallet
- **Order Tracking**: Users receive confirmation and account details via email
- **Responsive Design**: Works perfectly on mobile and desktop

### Admin Features
- **Order Management**: View, process, and manage customer orders
- **Stock Management**: Update product inventory in real-time
- **Email Integration**: Quick email button to send account details to customers
- **Notifications**: Get notified when new orders come in
- **Secure Access**: Admin panel at `/admin/login` with credentials

## 🔐 Credentials

### Admin Access
- **URL**: `yoursite.com/admin/login`
- **Username**: `Furqan`
- **Password**: `Muggy122%%`

### JazzCash Details
- **Number**: 03238581603
- **Name**: Shamim Akhtar

## 🚀 Setup Instructions

### 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings** > **API** and copy:
   - Project URL
   - Anon/Public Key

### 2. Set Up Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  description TEXT,
  short_description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  product_id INTEGER,
  product_name TEXT,
  price INTEGER,
  buyer_email TEXT,
  buyer_name TEXT,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'jazzcash',
  created_at BIGINT,
  jazz_cash_details JSONB
);

-- Categories table (optional)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Site content table (optional)
CREATE TABLE site_content (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Enable Row Level Security (make tables public for now)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert to products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to products" ON products FOR UPDATE USING (true);

-- Allow public access to orders (for admin panel)
CREATE POLICY "Allow public access to orders" ON orders FOR ALL USING (true);

-- Insert default products
INSERT INTO products (name, image, description, short_description, price, category, stock) VALUES
('Steam Premium Account', '/placeholder.png', 'Full access Steam account loaded with over 50 popular games. Includes AAA titles and indie favorites. Account comes with full ownership transfer and email change capability.', 'Full access Steam account with 50+ games library.', 3500, 'steam', 5),
('Roblox Account with Robux', '/placeholder.png', 'Verified Roblox account with 10,000 Robux already loaded. Account includes exclusive items and premium membership. Perfect for accessing premium games and purchasing in-game items.', 'Verified Roblox account with 10,000 Robux included.', 2500, 'roblox', 8),
('Minecraft Java Edition Account', '/placeholder.png', 'Original Minecraft Java Edition account with full access. Play on any server, mod support included. Account comes with secure email transfer.', 'Full access Minecraft Java account for PC.', 1500, 'minecraft', 12),
('Minecraft Bedrock Edition Account', '/placeholder.png', 'Minecraft Bedrock Edition account compatible with Windows, Xbox, PlayStation, and mobile devices. Includes access to marketplace and cross-play capability.', 'Cross-platform Minecraft Bedrock account.', 1200, 'minecraft', 10);
```

### 3. Update Environment Variables

Edit the `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:3000`

## 📦 Deployment to Cloudflare Pages

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Gaming Marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. Deploy on Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** > **Create a project**
3. Connect your GitHub account and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
6. Click **Save and Deploy**

Your site will be live at `your-project.pages.dev`

## 🛠️ How It Works

### User Flow
1. User registers/logs in
2. Browses products and sees stock availability
3. Clicks "Buy Now" on a product (must be logged in)
4. Follows JazzCash payment instructions
5. Enters transaction ID
6. Order is created and admin is notified
7. User receives confirmation and waits for account details via email

### Admin Flow
1. Admin logs in at `/admin/login`
2. Sees new orders in the **Orders** tab
3. Verifies JazzCash payment
4. Updates stock if needed in **Products** tab
5. Sends account details to customer email
6. Marks order as completed

## 📧 Sending Account Details to Customers

When an order comes in:
1. Go to **Orders** tab in admin panel
2. Click the **📧 Send Email** button on the order
3. Your email client will open with a pre-filled template
4. Add the actual account credentials
5. Send the email
6. Mark the order as **Completed**

## 🔄 Stock Management

When you sell an account:
1. Go to **Products & Stock** tab
2. Click **Edit Stock** next to the product
3. Decrease the stock count
4. Click ✓ to save

The stock will automatically update for customers browsing the site.

## ❓ FAQ

**Q: Will changes to the new site affect my old Pulse Gear site?**
A: No! This is a completely separate project with its own:
- GitHub repository
- Supabase database
- Cloudflare deployment
- Domain name

**Q: How do customers pay?**
A: Customers send money via JazzCash to 03238581603 (Shamim Akhtar), then enter their transaction ID to complete the order.

**Q: How do I change admin credentials?**
A: Edit `/src/lib/adminAuth.ts` and update the `ADMIN_USERNAME` and `ADMIN_PASSWORD` constants.

**Q: Can I add more products?**
A: Yes! Insert new products into your Supabase `products` table, or create an "Add Product" feature in the admin panel.

**Q: How secure is the user authentication?**
A: Currently, passwords are stored in localStorage (not hashed). For production, consider using Supabase Auth for proper user management.

## 📝 License

This is a custom project for personal use. Modify as needed!

## 🤝 Support

For issues or questions, check the code comments or the Supabase documentation.

---

**Built with:** React + TanStack Router + Tailwind CSS + Supabase
