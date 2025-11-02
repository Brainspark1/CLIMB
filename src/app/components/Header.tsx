'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';


export default function Header() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `text-green-400 hover:text-green-300 ${
      pathname === path ? 'font-bold text-green-300' : ''
    }`;

  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-[90px]">
          <img
            src="/logo.png"
            alt="Fitness Tracker Logo"
            className="h-[220px] w-auto object-contain"
            draggable="false"
          />
          <div className="flex items-center space-x-6">
            <nav className="space-x-6 text-lg">
              <Link href="/" className={linkClass('/')}>Dashboard</Link>
              <Link href="/workouts" className={linkClass('/workouts')}>Workouts</Link>
              <Link href="/diet" className={linkClass('/diet')}>Diet</Link>
              <Link href="/progress" className={linkClass('/progress')}>Progress</Link>
              <Link href="/leaderboards" className={linkClass('/leaderboards')}>Leaderboards</Link>
              <Link href="/recommendations" className={linkClass('/recommendations')}>Recommendations</Link>
              <Link href="/profile" className={linkClass('/profile')}>Profile</Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
