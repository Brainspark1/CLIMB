import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/achievements?userId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { earnedDate: 'desc' },
    });
    return NextResponse.json(achievements);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

// POST /api/achievements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, achievementId } = body;

    if (!userId || !achievementId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if achievement already exists
    const existing = await prisma.achievement.findFirst({
      where: { userId, achievementId },
    });

    if (existing) {
      return NextResponse.json({ message: 'Achievement already exists' });
    }

    await prisma.achievement.create({
      data: {
        userId,
        achievementId,
        earnedDate: new Date().toISOString(),
      },
    });

    return NextResponse.json({ message: 'Achievement created' });
  } catch {
    return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 });
  }
}

// DELETE /api/achievements?userId=... (clear all achievements for user)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    await prisma.achievement.deleteMany({
      where: { userId },
    });
    return NextResponse.json({ message: 'Achievements cleared successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to clear achievements' }, { status: 500 });
  }
}
