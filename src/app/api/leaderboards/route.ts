import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/leaderboards
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        workouts: true,
        meals: true,
      },
    });

    const leaderboards = users.map((user: { id: string; name: string; workouts: { date: string; weight: number; sets: number; reps: number; }[]; meals: { calories: number; }[]; }) => {
      const totalWorkouts = user.workouts.length;
      const totalWeight = user.workouts.reduce(
        (sum, w) => sum + w.weight * w.sets * w.reps,
        0
      );
      const totalCalories = user.meals.reduce(
        (sum, m) => sum + m.calories,
        0
      );

      const workoutDates = user.workouts
        .map(w => new Date(w.date))
        .sort((a, b) => a.getTime() - b.getTime());

      let streak = 0;
      let currentStreak = 0;

      for (let i = 0; i < workoutDates.length; i++) {
        if (
          i === 0 ||
          (workoutDates[i].getTime() - workoutDates[i - 1].getTime()) ===
            24 * 60 * 60 * 1000
        ) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        streak = Math.max(streak, currentStreak);
      }

      return {
        id: user.id,
        name: user.name,
        totalWorkouts,
        totalWeight,
        totalCalories,
        streak,
      };
    });

    return NextResponse.json(leaderboards);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboards' },
      { status: 500 }
    );
  }
}