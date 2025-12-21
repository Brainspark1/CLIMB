import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a few sample users
  const user1 = await prisma.user.create({
    data: {
      name: 'Demo User 1',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Demo User 2',
    },
  });

  // Add a few sample workouts
  await prisma.workout.createMany({
    data: [
      { userId: user1.id, exercise: 'Bench Press', sets: 3, reps: 10, weight: 185, date: '2024-01-15' },
      { userId: user1.id, exercise: 'Squats', sets: 3, reps: 8, weight: 225, date: '2024-01-15' },
      { userId: user1.id, exercise: 'Bench Press', sets: 3, reps: 10, weight: 190, date: '2024-01-16' },
      { userId: user2.id, exercise: 'Bench Press', sets: 3, reps: 10, weight: 135, date: '2024-01-15' },
      { userId: user2.id, exercise: 'Squats', sets: 3, reps: 8, weight: 155, date: '2024-01-15' },
    ],
  });

  // Add a few sample meals
  await prisma.meal.createMany({
    data: [
      { userId: user1.id, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, date: '2024-01-15' },
      { userId: user1.id, name: 'Brown Rice', calories: 216, protein: 5, carbs: 44, fat: 1.8, date: '2024-01-15' },
      { userId: user2.id, name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13, date: '2024-01-15' },
      { userId: user2.id, name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0.1, date: '2024-01-15' },
    ],
  });

  console.log('Database seeded with minimal sample data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
