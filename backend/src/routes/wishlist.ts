import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { WBParser } from '../services/wbParser.js';

const router = Router();
const prisma = new PrismaClient();

// Парсить данные товара WB (для превью)
router.post('/parse-wb', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    console.log('Parsing WB URL:', url);

    // Парсим данные товара
    const productData = await WBParser.parseProduct(url);

    if (!productData || !productData.title) {
      return res.status(404).json({ 
        error: 'Failed to parse product title',
        productData 
      });
    }

    res.json({ productData });
  } catch (error: any) {
    console.error('Error parsing WB product:', error);
    res.status(500).json({ error: 'Failed to parse product', message: error.message });
  }
});

// Получить все желания для пары
router.get('/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { status } = req.query;

    const wishes = await prisma.wish.findMany({
      where: {
        coupleId,
        ...(status && { status: status as string }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ wishes });
  } catch (error) {
    console.error('Error getting wishes:', error);
    res.status(500).json({ error: 'Failed to get wishes' });
  }
});

// Добавить желание через ссылку WB
router.post('/add', async (req, res) => {
  try {
    const { url, coupleId, userId, userName } = req.body;

    if (!url || !coupleId || !userId || !userName) {
      return res.status(400).json({ 
        error: 'url, coupleId, userId and userName are required' 
      });
    }

    // Парсим данные товара
    const productData = await WBParser.parseProduct(url);

    if (!productData) {
      return res.status(400).json({ 
        error: 'Failed to parse product. Please add manually.' 
      });
    }

    // Создаем желание
    const wish = await prisma.wish.create({
      data: {
        title: productData.title,
        imageUrl: productData.imageUrl,
        link: url,
        price: productData.price,
        createdBy: userId,
        createdByName: userName,
        coupleId,
        status: 'wanted',
      },
    });

    res.json({ wish });
  } catch (error) {
    console.error('Error adding wish:', error);
    res.status(500).json({ error: 'Failed to add wish' });
  }
});

// Добавить желание вручную
router.post('/add-manual', async (req, res) => {
  try {
    const { title, imageUrl, link, coupleId, userId, userName } = req.body;

    if (!title || !imageUrl || !link || !coupleId || !userId || !userName) {
      return res.status(400).json({ 
        error: 'title, imageUrl, link, coupleId, userId and userName are required' 
      });
    }

    const wish = await prisma.wish.create({
      data: {
        title,
        imageUrl,
        link,
        createdBy: userId,
        createdByName: userName,
        coupleId,
        status: 'wanted',
      },
    });

    res.json({ wish });
  } catch (error) {
    console.error('Error adding manual wish:', error);
    res.status(500).json({ error: 'Failed to add wish' });
  }
});

// Отметить как купленное
router.patch('/:wishId/bought', async (req, res) => {
  try {
    const { wishId } = req.params;
    const { userId, userName } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ error: 'userId and userName are required' });
    }

    const wish = await prisma.wish.update({
      where: { id: wishId },
      data: {
        status: 'bought',
        boughtBy: userId,
        boughtByName: userName,
        boughtAt: new Date(),
      },
    });

    res.json({ wish });
  } catch (error) {
    console.error('Error marking wish as bought:', error);
    res.status(500).json({ error: 'Failed to mark wish as bought' });
  }
});

// Вернуть в "Хочу"
router.patch('/:wishId/unwant', async (req, res) => {
  try {
    const { wishId } = req.params;

    const wish = await prisma.wish.update({
      where: { id: wishId },
      data: {
        status: 'wanted',
        boughtBy: null,
        boughtByName: null,
        boughtAt: null,
      },
    });

    res.json({ wish });
  } catch (error) {
    console.error('Error unmarking wish:', error);
    res.status(500).json({ error: 'Failed to unmark wish' });
  }
});

// Удалить желание
router.delete('/:wishId', async (req, res) => {
  try {
    const { wishId } = req.params;

    await prisma.wish.delete({
      where: { id: wishId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting wish:', error);
    res.status(500).json({ error: 'Failed to delete wish' });
  }
});

export default router;
