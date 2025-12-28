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

    const savedProfile = localStorage.getItem('profile');
    let userName = 'Anonymous User';

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      userName = profile.name || 'Anonymous User';
    }

    const findResponse = await fetch(
      `/api/users?name=${encodeURIComponent(userName)}`
    );

    if (findResponse.ok) {
      const user = await findResponse.json();
      localStorage.setItem('userId', user.id);
      return user.id;
    }

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

    return null;
  };

  const calculateStreak = (workouts: { date: string }[]) => {
    if (workouts.length === 0) return 0;

    const workoutDates = workouts.map(w => new Date(w.date)).sort((a, b) => a.getTime() - b.getTime());

    const lastDate = workoutDates[workoutDates.length - 1];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastDateMidnight = new Date(lastDate);
    lastDateMidnight.setHours(0, 0, 0, 0);

    if (lastDateMidnight.getTime() !== today.getTime() && lastDateMidnight.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streak = 1;
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
      if (!userId) return;

      const response = await fetch(`/api/workouts?userId=${userId}`);
      if (!response.ok) return;

      const workouts = await response.json();
      const userStreak = calculateStreak(workouts);

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