import express from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId: req.userId },
      include: {
        restaurant: true,
        items: {
          include: { foodItem: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!cart) {
      return res.json(null);
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/items', authenticate, async (req: AuthRequest, res) => {
  try {
    const { restaurantId, foodId, quantity, userNote } = req.body;

    if (!restaurantId || !foodId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Restaurant ID, food ID, and valid quantity are required' });
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { foodId },
    });

    if (!foodItem || !foodItem.inStock) {
      return res.status(400).json({ error: 'Food item not available' });
    }

    if (foodItem.restaurantId !== restaurantId) {
      return res.status(400).json({ error: 'Food item does not belong to this restaurant' });
    }

    let cart = await prisma.cart.findFirst({
      where: { userId: req.userId, restaurantId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId!, restaurantId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.cartId, foodId },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { cartItemId: existingItem.cartItemId },
        data: { quantity: existingItem.quantity + quantity, userNote: userNote || existingItem.userNote },
      });
      return res.json(updated);
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.cartId,
        foodId,
        quantity,
        userNote,
      },
    });

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

router.patch('/items/:itemId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { quantity, userNote } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { cartItemId: req.params.itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.cartItem.update({
      where: { cartItemId: req.params.itemId },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(userNote !== undefined && { userNote }),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

router.delete('/items/:itemId', authenticate, async (req: AuthRequest, res) => {
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { cartItemId: req.params.itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.cartItem.delete({
      where: { cartItemId: req.params.itemId },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

router.post('/checkout', authenticate, async (req: AuthRequest, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId: req.userId },
      include: { items: { include: { foodItem: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    for (const item of cart.items) {
      if (!item.foodItem.inStock) {
        return res.status(400).json({ error: `Item ${item.foodItem.name} is out of stock` });
      }
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.cartId },
    });

    await prisma.cart.delete({
      where: { cartId: cart.cartId },
    });

    res.json({ message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Checkout failed' });
  }
});

export default router;

