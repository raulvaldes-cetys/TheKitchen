import express from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: { owner: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { restaurantId: req.params.id },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
        foodItems: true,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        address,
        ownerId: req.userId!,
      },
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

export default router;

