# The Menu - Backend API

Online food ordering system backend built with Express, Prisma, and PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
DATABASE_URL="your-supabase-connection-string"
JWT_SECRET="your-secret-key"
PORT=3000
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Create database tables:
```bash
npm run db:create
```

5. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (requires auth)

### Food Items
- `GET /api/food-items/restaurant/:restaurantId` - List food items by restaurant
- `GET /api/food-items/:id` - Get food item details
- `POST /api/food-items` - Create food item (requires auth, owner only)
- `PATCH /api/food-items/:id` - Update food item (requires auth, owner only)

### Shopping Cart
- `GET /api/carts` - Get user's cart (requires auth)
- `POST /api/carts/items` - Add item to cart (requires auth)
- `PATCH /api/carts/items/:itemId` - Update cart item (requires auth)
- `DELETE /api/carts/items/:itemId` - Remove cart item (requires auth)
- `POST /api/carts/checkout` - Checkout cart (requires auth)

### User
- `GET /api/user/me` - Get current user information (requires auth)

## Database Structure

The database follows 3NF with the following tables:
- `users` - User accounts
- `restaurants` - Restaurant information
- `food_items` - Menu items
- `carts` - Shopping cart headers
- `cart_items` - Individual cart items

