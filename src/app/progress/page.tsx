'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Workout {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
}

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export default function Progress() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUserId = async (): Promise<string | null> => {
    const savedProfile = localStorage.getItem('profile');
    let userName = 'You';
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      userName = profile.name || 'You';
    }

    // First, try to find user by name
    const findResponse = await fetch(`/api/users?name=${encodeURIComponent(userName)}`);
    if (findResponse.ok) {
      const user = await findResponse.json();
      localStorage.setItem('userId', user.id);
      return user.id;
    } else {
      // Create new user
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName }),
      });
      if (createResponse.ok) {
        const user = await createResponse.json();
        localStorage.setItem('userId', user.id);
        return user.id;
      }
    }
    return null;
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userId = await getUserId();
      if (userId) {
        const workoutsResponse = await fetch(`/api/workouts?userId=${userId}`);
        if (workoutsResponse.ok) {
          const workoutsData = await workoutsResponse.json();
          setWorkouts(workoutsData);
        }

        const mealsResponse = await fetch(`/api/meals?userId=${userId}`);
        if (mealsResponse.ok) {
          const mealsData = await mealsResponse.json();
          setMeals(mealsData);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Calculate workout progress
  const workoutProgress = workouts.reduce((acc, workout) => {
    const date = workout.date;
    if (!acc[date]) {
      acc[date] = { totalWeight: 0, exercises: new Set() };
    }
    acc[date].totalWeight += workout.weight * workout.sets * workout.reps;
    acc[date].exercises.add(workout.exercise);
    return acc;
  }, {} as Record<string, { totalWeight: number; exercises: Set<string> }>);

  const workoutDates = Object.keys(workoutProgress).sort();

  // Calculate diet progress
  const dietProgress = meals.reduce((acc, meal) => {
    const date = meal.date;
    if (!acc[date]) {
      acc[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    acc[date].calories += meal.calories;
    acc[date].protein += meal.protein;
    acc[date].carbs += meal.carbs;
    acc[date].fat += meal.fat;
    return acc;
  }, {} as Record<string, { calories: number; protein: number; carbs: number; fat: number }>);

  const dietDates = Object.keys(dietProgress).sort();

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <h2 className="text-3xl font-bold text-white mb-8">Your Progress</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workout Progress */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Workout Progress</h3>
            <div className="space-y-4">
              {workoutDates.length === 0 ? (
                <p className="text-gray-300">No workout data available. Start logging workouts to see progress!</p>
              ) : (
                workoutDates.map((date) => (
                  <div key={date} className="border-b border-gray-600 pb-4">
                    <h4 className="font-medium text-white">{date}</h4>
                    <p className="text-sm text-gray-300">
                      Total Weight Lifted: {workoutProgress[date].totalWeight.toFixed(1)} lbs
                    </p>
                    <p className="text-sm text-gray-300">
                      Exercises: {workoutProgress[date].exercises.size}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Diet Progress */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Diet Progress</h3>
            <div className="space-y-4">
              {dietDates.length === 0 ? (
                <p className="text-gray-300">No diet data available. Start logging meals to see progress!</p>
              ) : (
                dietDates.map((date) => (
                  <div key={date} className="border-b border-gray-600 pb-4">
                    <h4 className="font-medium text-white">{date}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-300">Calories: {dietProgress[date].calories}</p>
                      <p className="text-gray-300">Protein: {dietProgress[date].protein}g</p>
                      <p className="text-gray-300">Carbs: {dietProgress[date].carbs}g</p>
                      <p className="text-gray-300">Fat: {dietProgress[date].fat}g</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

            {/* Summary Stats */}
            <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{workouts.length}</p>
                  <p className="text-sm text-gray-300">Total Workouts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{meals.length}</p>
                  <p className="text-sm text-gray-300">Meals Logged</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {workouts.reduce((sum, w) => sum + w.weight * w.sets * w.reps, 0).toFixed(1)} lbs
                  </p>
                  <p className="text-sm text-gray-300">Total Weight Lifted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">
                    {meals.reduce((sum, m) => sum + m.calories, 0)}
                  </p>
                  <p className="text-sm text-gray-300">Total Calories</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
