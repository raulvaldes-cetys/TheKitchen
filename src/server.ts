import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import restaurantRoutes from './routes/restaurants';
import foodItemRoutes from './routes/foodItems';
import cartRoutes from './routes/carts';
import userRoutes from './routes/user';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/food-items', foodItemRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

