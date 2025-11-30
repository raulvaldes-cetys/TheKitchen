import express from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const foodItems = await prisma.foodItem.findMany({
      where: { restaurantId: req.params.restaurantId },
    });
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const foodItem = await prisma.foodItem.findUnique({
      where: { foodId: req.params.id },
      include: { restaurant: true },
    });

    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.json(foodItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch food item' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { restaurantId, name, price, inStock } = req.body;

    if (!restaurantId || !name || price === undefined) {
      return res.status(400).json({ error: 'Restaurant ID, name, and price are required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Only restaurant owner can add food items' });
    }

    const foodItem = await prisma.foodItem.create({
      data: {
        restaurantId,
        name,
        price,
        inStock: inStock !== undefined ? inStock : true,
      },
    });

    res.status(201).json(foodItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create food item' });
  }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, price, inStock } = req.body;

    const foodItem = await prisma.foodItem.findUnique({
      where: { foodId: req.params.id },
      include: { restaurant: true },
    });

    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    if (foodItem.restaurant.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Only restaurant owner can update food items' });
    }

    const updated = await prisma.foodItem.update({
      where: { foodId: req.params.id },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price }),
        ...(inStock !== undefined && { inStock }),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update food item' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const foodItem = await prisma.foodItem.findUnique({
      where: { foodId: req.params.id },
      include: { restaurant: true },
    });

    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    if (foodItem.restaurant.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Only restaurant owner can delete food items' });
    }

    await prisma.foodItem.delete({
      where: { foodId: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

export default router;

