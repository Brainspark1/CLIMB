'use client';

import { useState, useEffect } from 'react';
// import { Head } from 'next/document';
import Header from '../components/Header';
import AchievementBadge from '../components/AchievementBadge';
import AchievementPopup from '../components/AchievementPopup';
import AchievementProvider, { useAchievements } from '../components/AchievementProvider';
import { ACHIEVEMENTS, getEarnedAchievements, checkAchievements, saveAchievements, AchievementData } from '../utils/achievements';
 
interface Profile {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  sex: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: 0,
    height: 0,
    weight: 0,
    goal: '',
    sex: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [earnedAchievements, setEarnedAchievements] = useState<{ id: string; earnedDate: string }[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
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
      const savedProfile = localStorage.getItem('profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      // Load achievements from database
      const userId = await getUserId();
      if (userId) {
        try {
          const response = await fetch(`/api/achievements?userId=${userId}`);
          if (response.ok) {
            const achievements = await response.json();
            setEarnedAchievements(achievements.map((a: any) => ({ id: a.achievementId, earnedDate: a.earnedDate })));
          }
        } catch (error) {
          console.error('Failed to load achievements:', error);
        }
      } else {
        // Fallback to localStorage
        const achievements = getEarnedAchievements();
        setEarnedAchievements(achievements);
      }

      setIsLoadingAchievements(false);
    };

    loadData();
  }, []);

  const saveProfile = (newProfile: Profile) => {
    localStorage.setItem('profile', JSON.stringify(newProfile));
    setProfile(newProfile);

    // Check for achievements after saving profile
    const savedWorkouts = localStorage.getItem('workouts');
    const savedMeals = localStorage.getItem('meals');
    const workouts = savedWorkouts ? JSON.parse(savedWorkouts) : [];
    const meals = savedMeals ? JSON.parse(savedMeals) : [];
    const data = { workouts, meals, profile: newProfile };
    triggerAchievementCheck(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(profile);
    setIsEditing(false);
  };

  const calculateBMI = () => {
    if (profile.height && profile.weight) {
      const heightInMeters = profile.height / 100;
      return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMICategoryColor = (category: string) => {
    switch (category) {
      case 'Underweight':
      case 'Overweight':
        return 'text-yellow-400';
      case 'Obese':
        return 'text-red-400';
      case 'Normal weight':
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">Your Profile</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Personal Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Height (cm)</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Sex</label>
                  <select
                    value={profile.sex}
                    onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
                    className="mt-1 block w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer not to say">Prefer not to say</option>
                  </select>
                  {profile.sex === 'prefer not to say' && (
                    <p className="text-xs text-yellow-400 mt-1">Your recommendations will not be fully accurate because of this.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Fitness Goal</label>
                  <select
                    value={profile.goal}
                    onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                    className="mt-1 block w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select a goal</option>
                    <option value="Lose Weight">Lose Weight</option>
                    <option value="Gain Muscle">Gain Muscle</option>
                    <option value="Maintain Weight">Maintain Weight</option>
                    <option value="Improve Fitness">Improve Fitness</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Save Profile
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-300">Name</p>
                  <p className="text-lg text-white">{profile.name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Age</p>
                  <p className="text-lg text-white">{profile.age || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Height</p>
                  <p className="text-lg text-white">{profile.height ? `${profile.height} cm` : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Weight</p>
                  <p className="text-lg text-white">{profile.weight ? `${profile.weight} kg` : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Sex</p>
                  <p className="text-lg text-white">{profile.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : 'Not set'}</p>
                  {profile.sex === 'prefer not to say' && (
                    <p className="text-xs text-yellow-400 mt-1">Your recommendations will not be fully accurate because of this.</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Fitness Goal</p>
                  <p className="text-lg text-white">{profile.goal || 'Not set'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Health Metrics */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Health Metrics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-300">BMI</p>
                <p className="text-2xl font-bold text-green-400">{calculateBMI()}</p>
                {profile.height && profile.weight && (
                  <p className={`text-sm ${getBMICategoryColor(getBMICategory(parseFloat(calculateBMI())))}`}>
                    Category: {getBMICategory(parseFloat(calculateBMI()))}
                  </p>
                )}
              </div>
              {/* 
              -- Old Daily Caloric intake recommendations before AI implementation --
              <div>
                <p className="text-sm font-medium text-gray-300">Recommended Daily Calories</p>
                <p className="text-2xl font-bold text-green-400">
                  {profile.weight && profile.height && profile.age ? (
                    profile.goal === 'lose-weight' ? Math.round(profile.weight * 24 * 0.8) :
                    profile.goal === 'gain-muscle' ? Math.round(profile.weight * 24 * 1.2) :
                    Math.round(profile.weight * 24)
                  ) : 'Set profile first'}
                </p>
                <p className="text-sm text-gray-300">Based on your profile and goal</p>
              </div> */}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((achievement) => {
              const earned = earnedAchievements.find(ea => ea.id === achievement.id);
              return (
                <AchievementBadge
                  key={achievement.id}
                  title={achievement.title}
                  description={achievement.description}
                  icon={achievement.icon}
                  earned={!!earned}
                  earnedDate={earned?.earnedDate}
                />
              );
            })}
          </div>
        </div>

        {/* Data Management */}
        <div className="mt-12 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Data Management</h3>
          <p className="text-gray-300 mb-6">
            Export your data for backup or import previously exported data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => {
                const data = {
                  profile: localStorage.getItem('profile'),
                  workouts: localStorage.getItem('workouts'),
                  meals: localStorage.getItem('meals'),
                  exportDate: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fitness-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert('Data exported successfully!');
              }}
              className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Export All Data
            </button>

            <div>
              <label htmlFor="import-file" className="block text-sm font-medium text-gray-300 mb-2">Import Data</label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (confirm('This will overwrite your current data. Are you sure you want to proceed?')) {
                          if (data.profile) localStorage.setItem('profile', data.profile);
                          if (data.workouts) localStorage.setItem('workouts', data.workouts);
                          if (data.meals) localStorage.setItem('meals', data.meals);
                          alert('Data imported successfully! Please refresh the page to see changes.');
                          window.location.reload();
                        }
                      } catch {
                        alert('Invalid file format. Please select a valid backup file.');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 bg-red-900/20 border border-red-500/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h3>
          <p className="text-gray-300 mb-6">
            These actions are irreversible. Please be certain before proceeding.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to clear all workout history? This action cannot be undone.')) {
                  const userId = localStorage.getItem('userId');
                  if (userId) {
                    try {
                      const response = await fetch(`/api/workouts?userId=${userId}`, {
                        method: 'DELETE',
                      });
                      if (response.ok) {
                        alert('Workout history cleared successfully.');
                        window.location.reload();
                      } else {
                        alert('Failed to clear workout history.');
                      }
                    } catch (error) {
                      alert('Failed to clear workout history.');
                    }
                  } else {
                    // Fallback to localStorage if no userId
                    localStorage.removeItem('workouts');
                    alert('Workout history cleared successfully.');
                  }
                }
              }}
              className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Clear Workout History
            </button>

            <button
              onClick={async () => {
                if (confirm('Are you sure you want to clear all diet history? This action cannot be undone.')) {
                  const userId = localStorage.getItem('userId');
                  if (userId) {
                    try {
                      const response = await fetch(`/api/meals?userId=${userId}`, {
                        method: 'DELETE',
                      });
                      if (response.ok) {
                        alert('Diet history cleared successfully.');
                        window.location.reload();
                      } else {
                        alert('Failed to clear diet history.');
                      }
                    } catch (error) {
                      alert('Failed to clear diet history.');
                    }
                  } else {
                    // Fallback to localStorage if no userId
                    localStorage.removeItem('meals');
                    alert('Diet history cleared successfully.');
                  }
                }
              }}
              className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Clear Diet History
            </button>

            <button
              onClick={async () => {
                if (confirm('Are you sure you want to clear your profile? This will reset all your personal information. This action cannot be undone.')) {
                  const userId = localStorage.getItem('userId');
                  if (userId) {
                    try {
                      // Clear all user data from database
                      await Promise.all([
                        fetch(`/api/workouts?userId=${userId}`, { method: 'DELETE' }),
                        fetch(`/api/meals?userId=${userId}`, { method: 'DELETE' }),
                        fetch(`/api/achievements?userId=${userId}`, { method: 'DELETE' }),
                      ]);
                      alert('Profile and all data cleared successfully.');
                      window.location.reload();
                    } catch (error) {
                      alert('Failed to clear profile data.');
                    }
                  } else {
                    // Fallback to localStorage if no userId
                    localStorage.removeItem('profile');
                    localStorage.removeItem('workouts');
                    localStorage.removeItem('meals');
                    setProfile({
                      name: '',
                      age: 0,
                      height: 0,
                      weight: 0,
                      goal: '',
                      sex: '',
                    });
                    alert('Profile cleared successfully.');
                  }
                }
              }}
              className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Clear Profile
            </button>
          </div>
        </div>


      </main>
    </div>
  );
}
