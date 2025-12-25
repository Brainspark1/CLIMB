'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAchievements } from '../components/AchievementProvider';

interface Workout {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
}

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const { triggerAchievementCheck } = useAchievements();

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
      await new Promise(resolve => setTimeout(resolve, 1000));

      const id = await getUserId();
      setUserId(id);

      if (id) {
        const response = await fetch(`/api/workouts?userId=${id}`);
        if (response.ok) {
          const data = await response.json();
          setWorkouts(data);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  const addWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise || !sets || !reps || !weight || !userId) return;

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          exercise,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: parseFloat(weight),
          date,
        }),
      });

      if (response.ok) {
        const newWorkout = await response.json();
        const newWorkouts = [...workouts, newWorkout];
        setWorkouts(newWorkouts);

        // Check for achievements
        const savedProfile = localStorage.getItem('profile');
        const mealsResponse = await fetch(`/api/meals?userId=${userId}`);
        const meals = mealsResponse.ok ? await mealsResponse.json() : [];

        triggerAchievementCheck({
          workouts: newWorkouts,
          meals,
          profile: savedProfile ? JSON.parse(savedProfile) : null,
        });

        setExercise('');
        setSets('');
        setReps('');
        setWeight('');
      }
    } catch (error) {
      console.error('Failed to add workout:', error);
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      const response = await fetch(`/api/workouts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWorkouts(workouts.filter(w => w.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
  };

  const filteredWorkouts = workouts.filter(workout =>
    workout.exercise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <h2 className="text-3xl font-bold text-white mb-8">
              Log Your Workouts
            </h2>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search workouts by exercise name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md border border-gray-600 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-800 text-white"
              />
            </div>

            <form
              onSubmit={addWorkout}
              className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="Exercise"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  className="border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Sets"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white"
                  required
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Weight (lbs)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white"
                  required
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="white-calendar-icon border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Add Workout
                </button>
              </div>
            </form>

            <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Exercise</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Sets</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Reps</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-600">
                  {filteredWorkouts.map((workout) => (
                    <tr key={workout.id}>
                      <td className="px-6 py-4 text-white">{workout.exercise}</td>
                      <td className="px-6 py-4 text-gray-300">{workout.sets}</td>
                      <td className="px-6 py-4 text-gray-300">{workout.reps}</td>
                      <td className="px-6 py-4 text-gray-300">{workout.weight} lbs</td>
                      <td className="px-6 py-4 text-gray-300">{workout.date.split('T')[0]}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}