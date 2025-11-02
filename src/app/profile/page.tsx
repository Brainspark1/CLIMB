'use client';

import { useState, useEffect } from 'react';
// import { Head } from 'next/document';
import Header from '../components/Header';
import AchievementBadge from '../components/AchievementBadge';
import AchievementPopup from '../components/AchievementPopup';
import { ACHIEVEMENTS, getEarnedAchievements, checkAchievements, saveAchievements, AchievementData } from '../utils/achievements';
import { useAchievements } from '../components/AchievementProvider';
 
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
  const [newAchievements, setNewAchievements] = useState<{ id: string; earnedDate: string }[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopupAchievement, setCurrentPopupAchievement] = useState<{ id: string; title: string; description: string; icon: string } | null>(null);
  const { triggerAchievementCheck } = useAchievements();

  useEffect(() => {
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Load achievements
    const achievements = getEarnedAchievements();
    setEarnedAchievements(achievements);

    // Check for new achievements
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    const meals = JSON.parse(localStorage.getItem('meals') || '[]');
    const data: AchievementData = { workouts, meals, profile: savedProfile ? JSON.parse(savedProfile) : null };

    const newEarned = checkAchievements(data);
    if (newEarned.length > 0) {
      saveAchievements(newEarned);
      setNewAchievements(newEarned);
      setEarnedAchievements([...achievements, ...newEarned]);

      // Show popup for first new achievement
      if (newEarned.length > 0) {
        const achievement = ACHIEVEMENTS.find(a => a.id === newEarned[0].id);
        if (achievement) {
          setCurrentPopupAchievement(achievement);
          setShowPopup(true);
        }
      }
    }
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

  const handlePopupClose = () => {
    setShowPopup(false);
    setCurrentPopupAchievement(null);

    // Show next achievement if there are more
    const remaining = newAchievements.slice(1);
    if (remaining.length > 0) {
      setNewAchievements(remaining);
      const achievement = ACHIEVEMENTS.find(a => a.id === remaining[0].id);
      if (achievement) {
        setCurrentPopupAchievement(achievement);
        setTimeout(() => setShowPopup(true), 500); // Small delay for better UX
      }
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
              onClick={() => {
                if (confirm('Are you sure you want to clear all workout history? This action cannot be undone.')) {
                  localStorage.removeItem('workouts');
                  alert('Workout history cleared successfully.');
                }
              }}
              className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Clear Workout History
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all diet history? This action cannot be undone.')) {
                  localStorage.removeItem('meals');
                  alert('Diet history cleared successfully.');
                }
              }}
              className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Clear Diet History
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your profile? This will reset all your personal information. This action cannot be undone.')) {
                  localStorage.removeItem('profile');
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
              }}
              className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Clear Profile
            </button>
          </div>
        </div>

        {/* Achievement Popup */}
        {showPopup && currentPopupAchievement && (
          <AchievementPopup
            title={currentPopupAchievement.title}
            description={currentPopupAchievement.description}
            icon={currentPopupAchievement.icon}
            onClose={handlePopupClose}
          />
        )}
      </main>
    </div>
  );
}
