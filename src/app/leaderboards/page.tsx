'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface UserStats {
  id: string;
  name: string;
  totalWorkouts: number;
  totalWeight: number;
  totalCalories: number;
  streak: number;
}

// interface Workout {
//   weight: number;
//   sets: number;
//   reps: number;
//   date: string;
// }

export default function Leaderboards() {
  const [leaderboards, setLeaderboards] = useState<UserStats[]>([]);
  const [currentUser, setCurrentUser] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserId = async (): Promise<string | null> => {
    const savedProfile = localStorage.getItem('profile');
    let userName = 'Anonymous User';
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      userName = profile.name || 'Anonymous User';
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

      try {
        // Fetch real leaderboard data from API
        const response = await fetch('/api/leaderboards');
        if (response.ok) {
          const allUsers = await response.json();

          // Get current user's ID and stats
          const userId = await getUserId();
          let currentUserStats = null;
          let updatedLeaderboards = allUsers;

          if (userId) {
            currentUserStats = allUsers.find((user: UserStats) => user.id === userId);
            // Update the current user in the leaderboards list to show their name with (You)
            if (currentUserStats) {
              const savedProfile = localStorage.getItem('profile');
              let displayName = 'Anonymous User';
              if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                displayName = profile.name || 'Anonymous User';
              }
              displayName = displayName === 'Anonymous User' ? 'You' : `${displayName} (You)`;

              updatedLeaderboards = allUsers.map((user: UserStats) =>
                user.id === userId ? { ...user, name: displayName } : user
              );
              currentUserStats = { ...currentUserStats, name: displayName };
            }
          }

          setCurrentUser(currentUserStats); 
          setLeaderboards(updatedLeaderboards);
        } else {
          // Fallback to empty leaderboards if API fails
          setLeaderboards([]);
        }
      } catch (error) {
        console.error('Failed to load leaderboards:', error);
        setLeaderboards([]);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // const getCurrentUserId = async (): Promise<string | null> => {
  //   return await getUserId();
  // };

  // const calculateStreak = (workouts: Workout[]) => {
  //   // Simple streak calculation - consecutive days with workouts
  //   if (workouts.length === 0) return 0;

  //   const dates = workouts.map(w => w.date).sort();
  //   let streak = 1;
  //   let currentStreak = 1;

  //   for (let i = 1; i < dates.length; i++) {
  //     const prevDate = new Date(dates[i - 1]);
  //     const currDate = new Date(dates[i]);
  //     const diffTime = currDate.getTime() - prevDate.getTime();
  //     const diffDays = diffTime / (1000 * 3600 * 24);

  //     if (diffDays === 1) {
  //       currentStreak++;
  //       streak = Math.max(streak, currentStreak);
  //     } else {
  //       currentStreak = 1;
  //     }
  //   }

  //   return streak;
  // };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <h2 className="text-3xl font-bold text-white mb-8">Leaderboards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Overall Leaderboard */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">🏆 Overall Leaderboard</h3>
            <div className="space-y-3">
              {(() => {
                const sortedUsers = [...leaderboards].sort((a, b) => b.totalWeight - a.totalWeight);
                const currentUserIndex = sortedUsers.findIndex(user => user.name.includes('(You)'));
                const top5 = sortedUsers.slice(0, 5);
                const showCurrentUser = currentUserIndex >= 5;

                return (
                  <>
                    {top5.map((user, index) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          user.name.includes('(You)') ? 'bg-green-900 border-2 border-green-500' : 'bg-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-bold">{getRankIcon(index)}</span>
                          <div>
                            <p className={`font-medium ${user.name.includes('(You)') ? 'text-green-300' : 'text-white'}`}>
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-300">{user.totalWorkouts} workouts</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{user.totalWeight.toFixed(0)} lbs</p>
                          <p className="text-xs text-gray-300">total lifted</p>
                        </div>
                      </div>
                    ))}

                    {showCurrentUser && (
                      <>
                        <div className="flex justify-center py-2">
                          <span className="text-gray-500 text-xl">⋯</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-900 border-2 border-green-500">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-bold">#{currentUserIndex + 1}</span>
                            <div>
                              <p className="font-medium text-green-300">
                                {sortedUsers[currentUserIndex].name}
                              </p>
                              <p className="text-sm text-gray-300">{sortedUsers[currentUserIndex].totalWorkouts} workouts</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{sortedUsers[currentUserIndex].totalWeight.toFixed(0)} lbs</p>
                            <p className="text-xs text-gray-300">total lifted</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Streaks Leaderboard */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">🔥 Streak Leaderboard</h3>
            <div className="space-y-3">
              {(() => {
                const sortedUsers = [...leaderboards].sort((a, b) => b.streak - a.streak);
                const currentUserIndex = sortedUsers.findIndex(user => user.name.includes('(You)'));
                const top5 = sortedUsers.slice(0, 5);
                const showCurrentUser = currentUserIndex >= 5;

                return (
                  <>
                    {top5.map((user, index) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          user.name.includes('(You)') ? 'bg-green-900 border-2 border-green-500' : 'bg-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-bold">{getRankIcon(index)}</span>
                          <div>
                            <p className={`font-medium ${user.name.includes('(You)') ? 'text-green-300' : 'text-white'}`}>
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-300">{user.streak} day streak</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{user.totalWorkouts}</p>
                          <p className="text-xs text-gray-300">workouts</p>
                        </div>
                      </div>
                    ))}

                    {showCurrentUser && (
                      <>
                        <div className="flex justify-center py-2">
                          <span className="text-gray-500 text-xl">⋯</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-900 border-2 border-green-500">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-bold">#{currentUserIndex + 1}</span>
                            <div>
                              <p className="font-medium text-green-300">
                                {sortedUsers[currentUserIndex].name}
                              </p>
                              <p className="text-sm text-gray-300">{sortedUsers[currentUserIndex].streak} day streak</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{sortedUsers[currentUserIndex].totalWorkouts}</p>
                            <p className="text-xs text-gray-300">workouts</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Nutrition Leaderboard */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">🥗 Nutrition Leaderboard</h3>
            <div className="space-y-3">
              {(() => {
                const sortedUsers = [...leaderboards].sort((a, b) => b.totalCalories - a.totalCalories);
                const currentUserIndex = sortedUsers.findIndex(user => user.name.includes('(You)'));
                const top5 = sortedUsers.slice(0, 5);
                const showCurrentUser = currentUserIndex >= 5;

                return (
                  <>
                    {top5.map((user, index) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          user.name.includes('(You)') ? 'bg-green-900 border-2 border-green-500' : 'bg-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-white font-bold">{getRankIcon(index)}</span>
                          <div>
                            <p className={`font-medium ${user.name.includes('(You)') ? 'text-green-300' : 'text-white'}`}>
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-300">{user.totalCalories} calories tracked</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{user.totalWorkouts}</p>
                          <p className="text-xs text-gray-300">meals logged</p>
                        </div>
                      </div>
                    ))}

                    {showCurrentUser && (
                      <>
                        <div className="flex justify-center py-2">
                          <span className="text-gray-500 text-xl">⋯</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-900 border-2 border-green-500">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-bold">#{currentUserIndex + 1}</span>
                            <div>
                              <p className="font-medium text-green-300">
                                {sortedUsers[currentUserIndex].name}
                              </p>
                              <p className="text-sm text-gray-300">{sortedUsers[currentUserIndex].totalCalories} calories tracked</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{sortedUsers[currentUserIndex].totalWorkouts}</p>
                            <p className="text-xs text-gray-300">meals logged</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Your Stats */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📊 Your Stats</h3>
            {currentUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="text-center p-3 bg-green-900 rounded-lg border border-green-700">
                    <p className="text-2xl font-bold text-green-400">{currentUser.totalWorkouts}</p>
                    <p className="text-sm text-gray-300">Workouts</p>
                  </div>
                  <div className="text-center p-3 bg-green-900 rounded-lg border border-green-700">
                    <p className="text-2xl font-bold text-green-300">{currentUser.streak}</p>
                    <p className="text-sm text-gray-300">Day Streak</p>
                  </div>
                  <div className="text-center p-3 bg-green-900 rounded-lg border border-green-700">
                    <p className="text-2xl font-bold text-green-300">{currentUser.totalWeight.toFixed(0)}</p>
                    <p className="text-sm text-gray-300">lbs Lifted</p>
                  </div>
                  <div className="text-center p-3 bg-green-900 rounded-lg border border-green-700">
                    <p className="text-2xl font-bold text-green-300">{currentUser.totalCalories}</p>
                    <p className="text-sm text-gray-300">Calories</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-300 text-center">
                    Keep logging workouts and meals to climb the leaderboards!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
