import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/workouts?userId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(workouts);
  } catch {
    return NextResponse.json({ error: 'Failed to get workouts' }, { status: 500 });
  }
}

// POST /api/workouts
export async function POST(request: NextRequest) {
  try {
    const { userId, exercise, sets, reps, weight, date } = await request.json();

    const workout = await prisma.workout.create({
      data: {
        userId,
        exercise,
        sets,
        reps,
        weight,
        date,
      },
    });

    return NextResponse.json(workout);
  } catch {
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}

// DELETE /api/workouts?id=...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 });
    }

    await prisma.workout.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Workout deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
