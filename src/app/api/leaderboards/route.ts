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

    const leaderboards = users.map((user: { id: string; name: string | null; workouts: { date: Date; weight: number; sets: number; reps: number; }[]; meals: { calories: number; }[]; }) => {
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
      if (workoutDates.length > 0) {
        const lastDate = workoutDates[workoutDates.length - 1];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastDateMidnight = new Date(lastDate);
        lastDateMidnight.setHours(0, 0, 0, 0);

        if (lastDateMidnight.getTime() === today.getTime() || lastDateMidnight.getTime() === yesterday.getTime()) {
          streak = 1;
          for (let i = workoutDates.length - 2; i >= 0; i--) {
            const curr = workoutDates[i + 1];
            const prev = workoutDates[i];
            const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
      }

      return {
        id: user.id,
        name: user.name || 'Anonymous',
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