'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();

  // ✅ Safe default — no localStorage here
  const [streak, setStreak] = useState<number>(0);

  const linkClass = (path: string) =>
    `text-green-400 hover:text-green-300 ${
      pathname === path ? 'font-bold text-green-300' : ''
    }`;

  const getStreakColor = (days: number) => {
    if (days === 0) return 'text-gray-400';
    if (days === 1) return 'text-blue-400';
    if (days === 2) return 'text-green-400';
    if (days === 3) return 'text-purple-400';
    if (days === 4) return 'text-yellow-400';
    if (days === 5) return 'text-orange-400';
    return 'text-red-400'; // 6+ days
  };

  const getUserId = async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    let userId = localStorage.getItem('userId');
    if (userId) {
      // Verify user exists in database
      const findResponse = await fetch(`/api/users?userId=${encodeURIComponent(userId)}`);
      if (findResponse.ok) {
        return userId;
      }
    }

    // Generate new unique user ID if not found or doesn't exist
    userId = crypto.randomUUID();
    localStorage.setItem('userId', userId);

    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      // Create new user with the unique ID and name
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: profile.name || 'You' }),
      });
      if (createResponse.ok) {
        return userId;
      }
    }

    return null;
  };

  const calculateStreak = (workouts: { date: string }[], meals: { date: string }[]) => {
    // Combine workout and meal dates
    const workoutDates = workouts.map(w => w.date.split('T')[0]);
    const mealDates = meals.map(m => m.date.split('T')[0]);
    const allActivityDates = [...new Set([...workoutDates, ...mealDates])].sort();

    if (allActivityDates.length === 0) return 0;

    // Convert to Date objects for easier comparison
    const activityDates = allActivityDates.map(date => new Date(date));

    const lastDate = activityDates[activityDates.length - 1];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastDateMidnight = new Date(lastDate);
    lastDateMidnight.setHours(0, 0, 0, 0);

    // Check if last activity was today or yesterday
    if (lastDateMidnight.getTime() !== today.getTime() && lastDateMidnight.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streak = 1;
    for (let i = activityDates.length - 2; i >= 0; i--) {
      const curr = activityDates[i + 1];
      const prev = activityDates[i];
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  useEffect(() => {
    // ✅ Load streak from localStorage AFTER mount
    const savedStreak = localStorage.getItem('userStreak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }

    const loadStreak = async () => {
      const userId = await getUserId();
      if (!userId) {
        console.log('No userId found');
        return;
      }

      // Fetch both workouts and meals
      const [workoutsResponse, mealsResponse] = await Promise.all([
        fetch(`/api/workouts?userId=${userId}`),
        fetch(`/api/meals?userId=${userId}`)
      ]);

      if (!workoutsResponse.ok || !mealsResponse.ok) {
        console.log('Failed to fetch workouts or meals');
        return;
      }

      const workouts = await workoutsResponse.json();
      const meals = await mealsResponse.json();
      console.log('Workouts:', workouts);
      console.log('Meals:', meals);

      const userStreak = calculateStreak(workouts, meals);
      console.log('Calculated streak:', userStreak);

      setStreak(userStreak);
      localStorage.setItem('userStreak', userStreak.toString());
    };

    loadStreak();
  }, []);

  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex justify-between items-center h-[120px]">
          <Link href="/">
            <Image
              src="/climbLogo.png"
              alt="Fitness Tracker Logo"
              width={220}
              height={220}
              className="h-[240px] w-auto object-contain"
              draggable={false}
            />
          </Link>

          <nav className="flex items-center space-x-6 text-lg">
            <Link href="/workouts" className={linkClass('/workouts')}>
              Workouts
            </Link>
            <Link href="/diet" className={linkClass('/diet')}>
              Diet
            </Link>
            <Link href="/leaderboards" className={linkClass('/leaderboards')}>
              Leaderboards
            </Link>
            <Link
              href="/recommendations"
              className={linkClass('/recommendations')}
            >
              Recommendations
            </Link>
            <Link href="/profile" className={linkClass('/profile')}>
              Profile
            </Link>

            {streak > 0 && (
              <div className="flex flex-col items-center ml-4">
                <span className={`text-2xl ${getStreakColor(streak)}`}>
                  🔥
                </span>
                <span className="text-xs text-gray-300">{streak}d</span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}