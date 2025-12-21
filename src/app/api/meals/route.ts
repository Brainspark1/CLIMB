import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/meals?userId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const meals = await prisma.meal.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(meals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
  }
}

// POST /api/meals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, calories, protein, carbs, fat, date } = body;

    if (!userId || !name || !calories || !protein || !carbs || !fat || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const meal = await prisma.meal.create({
      data: {
        userId,
        name,
        calories: parseInt(calories),
        protein: parseInt(protein),
        carbs: parseInt(carbs),
        fat: parseInt(fat),
        date,
      },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 });
  }
}

// DELETE /api/meals?id=... or /api/meals?userId=... (clear all for user)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (id) {
    // Delete single meal
    try {
      await prisma.meal.delete({
        where: { id },
      });
      return NextResponse.json({ message: 'Meal deleted' });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
    }
  } else if (userId) {
    // Clear all meals for user
    try {
      await prisma.meal.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ message: 'Meals cleared successfully' });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to clear meals' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Meal ID or User ID required' }, { status: 400 });
  }
}
