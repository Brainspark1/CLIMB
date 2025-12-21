import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/leaderboards
export async function GET() {
  try {
    // Get all users with their stats
    const users = await prisma.user.findMany({
      include: {
        workouts: true,
        meals: true,
      },
    });

    // Calculate stats for each user
    const leaderboards = users.map(user => {
      const totalWorkouts = user.workouts.length;
      const totalWeight = user.workouts.reduce((sum, w) => sum + (w.weight * w.sets * w.reps), 0);
      const totalCalories = user.meals.reduce((sum, m) => sum + m.calories, 0);

      // Calculate streak (simplified - consecutive days with workouts)
      const workoutDates = user.workouts.map(w => w.date).sort();
      let streak = 0;
      if (workoutDates.length > 0) {
        let currentStreak = 1;
        for (let i = 1; i < workoutDates.length; i++) {
          const prevDate = new Date(workoutDates[i - 1]);
          const currDate = new Date(workoutDates[i]);
          const diffTime = currDate.getTime() - prevDate.getTime();
          const diffDays = diffTime / (1000 * 3600 * 24);

          if (diffDays === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
          streak = Math.max(streak, currentStreak);
        }
      }

      return {
        id: user.id,
        name: user.name === 'You' ? 'You' : user.name, // Ensure current user shows as "You"
        totalWorkouts,
        totalWeight,
        totalCalories,
        streak,
      };
    });

    return NextResponse.json(leaderboards);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leaderboards' }, { status: 500 });
  }
}
