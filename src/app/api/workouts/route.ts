import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

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
    const body = await request.json();
    const { userId, exercise, sets, reps, weight, date } = body;

    if (!userId || !exercise || sets === undefined || reps === undefined || weight === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedSets = parseInt(sets);
    const parsedReps = parseInt(reps);
    const parsedWeight = parseFloat(weight);

    if (isNaN(parsedSets) || isNaN(parsedReps) || isNaN(parsedWeight)) {
      return NextResponse.json({ error: 'Invalid number values' }, { status: 400 });
    }

    let parsedDate;
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
    }

    const workout = await prisma.workout.create({
      data: {
        userId,
        exercise,
        sets: parsedSets,
        reps: parsedReps,
        weight: parsedWeight,
        date: parsedDate,
      },
    });

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
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
