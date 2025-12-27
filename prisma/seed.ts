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

  const user3 = await prisma.user.create({
    data: {
      name: 'Demo User 3',
    },
  });

  // Add a few sample workouts
  await prisma.workout.createMany({
    data: [
      { userId: user1.id, exercise: 'Bench Press', sets: 3, reps: 10, weight: 185, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user1.id, exercise: 'Squats', sets: 3, reps: 8, weight: 225, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user1.id, exercise: 'Bench Press', sets: 3, reps: 10, weight: 190, date: new Date('2024-01-16T00:00:00.000Z') },
      { userId: user1.id, exercise: 'Deadlift', sets: 3, reps: 5, weight: 315, date: new Date('2024-01-16T00:00:00.000Z') },
      { userId: user1.id, exercise: 'Bench Press', sets: 3, reps: 10, weight: 195, date: new Date('2024-01-17T00:00:00.000Z') },
      { userId: user1.id, exercise: 'Squats', sets: 3, reps: 8, weight: 235, date: new Date('2024-01-17T00:00:00.000Z') },
      { userId: user1.id, exercise: 'Deadlift', sets: 3, reps: 5, weight: 325, date: new Date('2024-01-17T00:00:00.000Z') },
      { userId: user2.id, exercise: 'Bench Press', sets: 3, reps: 10, weight: 135, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user2.id, exercise: 'Squats', sets: 3, reps: 8, weight: 155, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user3.id, exercise: 'Bench Press', sets: 3, reps: 10, weight: 165, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user3.id, exercise: 'Squats', sets: 3, reps: 8, weight: 185, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user3.id, exercise: 'Bench Press', sets: 3, reps: 10, weight: 170, date: new Date('2024-01-16T00:00:00.000Z') },
      { userId: user3.id, exercise: 'Squats', sets: 3, reps: 8, weight: 190, date: new Date('2024-01-16T00:00:00.000Z') },
    ],
  });

  // Add a few sample meals
  await prisma.meal.createMany({
    data: [
      { userId: user1.id, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user1.id, name: 'Brown Rice', calories: 216, protein: 5, carbs: 44, fat: 1.8, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user1.id, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, date: new Date('2024-01-16T00:00:00.000Z') },
      { userId: user1.id, name: 'Brown Rice', calories: 216, protein: 5, carbs: 44, fat: 1.8, date: new Date('2024-01-16T00:00:00.000Z') },
      { userId: user1.id, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, date: new Date('2024-01-17T00:00:00.000Z') },
      { userId: user1.id, name: 'Brown Rice', calories: 216, protein: 5, carbs: 44, fat: 1.8, date: new Date('2024-01-17T00:00:00.000Z') },
      { userId: user2.id, name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user2.id, name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0.1, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user3.id, name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fat: 1, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user3.id, name: 'Quinoa', calories: 222, protein: 8, carbs: 39, fat: 4, date: new Date('2024-01-15T00:00:00.000Z') },
      { userId: user3.id, name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fat: 1, date: new Date('2024-01-16T00:00:00.000Z') },
      { userId: user3.id, name: 'Quinoa', calories: 222, protein: 8, carbs: 39, fat: 4, date: new Date('2024-01-16T00:00:00.000Z') },
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
