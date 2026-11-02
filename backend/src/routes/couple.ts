import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Создать пару (первый пользователь)
router.post('/create', async (req, res) => {
  try {
    const { userId, userName } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ error: 'userId and userName are required' });
    }

    // Проверяем, не состоит ли пользователь уже в паре
    const existingCouple = await prisma.couple.findFirst({
      where: {
        OR: [
          { user1Id: BigInt(userId) },
          { user2Id: BigInt(userId) },
        ],
      },
    });

    if (existingCouple) {
      // Если уже в паре - возвращаем существующую
      return res.json({ couple: existingCouple, inviteCode: existingCouple.inviteCode });
    }

    // Генерируем уникальный invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const couple = await prisma.couple.create({
      data: {
        inviteCode,
        user1Id: BigInt(userId),
        user1Name: userName,
      },
    });

    res.json({ couple, inviteCode });
  } catch (error) {
    console.error('Error creating couple:', error);
    res.status(500).json({ error: 'Failed to create couple' });
  }
});

// Присоединиться к паре по invite code
router.post('/join', async (req, res) => {
  try {
    const { inviteCode, userId, userName } = req.body;

    if (!inviteCode || !userId || !userName) {
      return res.status(400).json({ error: 'inviteCode, userId and userName are required' });
    }

    // Сначала проверяем, не состоит ли пользователь уже в какой-то паре
    const existingCouple = await prisma.couple.findFirst({
      where: {
        OR: [
          { user1Id: BigInt(userId) },
          { user2Id: BigInt(userId) },
        ],
      },
    });

    if (existingCouple) {
      // Если это та же пара по invite code - возвращаем её
      if (existingCouple.inviteCode === inviteCode) {
        return res.json({ couple: existingCouple });
      }
      // Если другая пара - ошибка
      return res.status(400).json({ error: 'You are already in another couple' });
    }

    const couple = await prisma.couple.findUnique({
      where: { inviteCode },
    });

    if (!couple) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    if (couple.user2Id) {
      return res.status(400).json({ error: 'Couple is already full' });
    }

    const updatedCouple = await prisma.couple.update({
      where: { inviteCode },
      data: {
        user2Id: BigInt(userId),
        user2Name: userName,
      },
    });

    res.json({ couple: updatedCouple });
  } catch (error) {
    console.error('Error joining couple:', error);
    res.status(500).json({ error: 'Failed to join couple' });
  }
});

// Получить информацию о паре по userId
router.get('/me/:userId', async (req, res) => {
  try {
    const userId = BigInt(req.params.userId);

    const couple = await prisma.couple.findFirst({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        wishes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!couple) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    res.json({ couple });
  } catch (error) {
    console.error('Error getting couple:', error);
    res.status(500).json({ error: 'Failed to get couple' });
  }
});

export default router;
