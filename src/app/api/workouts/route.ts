import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/workouts?userId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(workouts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

// POST /api/workouts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, exercise, sets, reps, weight, date } = body;

    if (!userId || !exercise || !sets || !reps || !weight || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const workout = await prisma.workout.create({
      data: {
        userId,
        exercise,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight),
        date,
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}

// DELETE /api/workouts?id=... or /api/workouts?userId=... (clear all for user)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (id) {
    // Delete single workout
    try {
      await prisma.workout.delete({
        where: { id },
      });
      return NextResponse.json({ message: 'Workout deleted' });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
    }
  } else if (userId) {
    // Clear all workouts for user
    try {
      await prisma.workout.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ message: 'Workouts cleared successfully' });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to clear workouts' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Workout ID or User ID required' }, { status: 400 });
  }
}
