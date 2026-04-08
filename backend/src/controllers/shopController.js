const prisma = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Get all shop items
const getShopItems = async (req, res, next) => {
  try {
    const { type } = req.query;

    const where = { isActive: true };
    if (type) {
      where.type = type;
    }

    const items = await prisma.shopItem.findMany({
      where,
      orderBy: { price: 'asc' }
    });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// Purchase item
const purchaseItem = async (req, res, next) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.id;

    const item = await prisma.shopItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    if (!item.isActive) {
      throw new AppError('Item is no longer available', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.coins < item.price) {
      throw new AppError(`Not enough coins! You need ${item.price} coins. 💰`, 400);
    }

    // Check if already owned
    const existing = await prisma.userInventory.findUnique({
      where: {
        userId_itemId: { userId, itemId }
      }
    });

    if (existing) {
      throw new AppError('You already own this item!', 400);
    }

    // Deduct coins and add to inventory
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: item.price } }
      }),
      prisma.userInventory.create({
        data: {
          userId,
          itemId
        }
      })
    ]);

    res.json({
      success: true,
      message: `Purchased ${item.name}! ${item.icon}`,
      data: {
        item,
        newBalance: user.coins - item.price
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user inventory
const getInventory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const inventory = await prisma.userInventory.findMany({
      where: { userId },
      include: {
        item: true
      },
      orderBy: { purchasedAt: 'desc' }
    });

    res.json({
      success: true,
      data: inventory.map(inv => ({
        ...inv.item,
        purchasedAt: inv.purchasedAt,
        inventoryId: inv.id
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShopItems,
  purchaseItem,
  getInventory
};
