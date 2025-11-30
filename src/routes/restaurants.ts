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

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: req.userId },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
        foodItems: true,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found for this user' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
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

router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, address } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { restaurantId: req.params.id },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Only restaurant owner can update restaurant details' });
    }

    const updated = await prisma.restaurant.update({
      where: { restaurantId: req.params.id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
      },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
        foodItems: true,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

export default router;

