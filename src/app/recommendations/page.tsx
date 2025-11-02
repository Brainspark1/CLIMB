'use client';

import { useState } from 'react';
import Header from '../components/Header';

interface Profile {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  sex: string;
}

interface Recommendations {
  calories: number;
  exercises: string[];
}

export default function Recommendations() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = () => {
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      alert('Please set up your profile first.');
    }
  };

  const generateRecommendations = () => {
    if (!profile) {
      fetchProfile();
      return;
    }

    setLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const { height, weight, age, goal, sex } = profile;

      // Calculate BMR (Mifflin-St Jeor)
      let bmr = 10 * weight + 6.25 * height - 5 * age;
      if (sex === 'female') {
        bmr -= 161;
      } else {
        bmr += 5; // male or prefer not to say
      }

      // Adjust for goal
      let calories = bmr * 1.2; // Sedentary activity level
      if (goal === 'Lose Weight') {
        calories *= 0.8;
      } else if (goal === 'Gain Muscle') {
        calories *= 1.2;
      } else if (goal === 'Improve Fitness') {
        calories *= 1.1;
      }

      // Suggest exercises based on goal
      let exercises: string[] = [];
      if (goal === 'Lose Weight') {
        exercises = ['Cardio: 30 min brisk walking daily', 'Strength: Squats, lunges, push-ups', 'HIIT: 20 min sessions 3x/week'];
      } else if (goal === 'Gain Muscle') {
        exercises = ['Weight training: Bench press, deadlifts, rows', 'Compound lifts: 3-4 days/week', 'Progressive overload: Increase weight gradually'];
      } else if (goal === 'Maintain Weight') {
        exercises = ['Balanced cardio and strength', 'Yoga or pilates for flexibility', 'Moderate workouts 4-5 days/week'];
      } else if (goal === 'Improve Fitness') {
        exercises = ['Mixed cardio and strength', 'Sports or activities you enjoy', 'Aim for 150 min moderate activity/week'];
      }

      setRecommendations({
        calories: Math.round(calories),
        exercises,
      });
      setLoading(false);
    }, 2500); // Simulate delay
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">AI Recommendations</h2>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 mb-8">
          <p className="text-gray-300 mb-4">
            Get personalized recommendations for your daily calorie intake and exercise routine based on your profile.
          </p>
          <button
            onClick={generateRecommendations}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Get Recommendations'}
          </button>
        </div>

        {profile && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Your Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <p>Name: {profile.name}</p>
              <p>Age: {profile.age}</p>
              <p>Height: {profile.height} cm</p>
              <p>Weight: {profile.weight} kg</p>
              <p>Sex: {profile.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : 'Not set'}</p>
              <p>Goal: {profile.goal}</p>
            </div>
          </div>
        )}

        {recommendations && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Your Recommendations</h3>
            <div className="space-y-4">
              <div>
                <p className="text-lg font-medium text-green-400">Recommended Daily Calories: {recommendations.calories} kcal</p>
                <p className="text-sm text-gray-300">This is an estimate based on your BMR and goal. Consult a professional for precise advice.</p>
                {profile?.sex === 'prefer not to say' && (
                  <p className="text-sm text-yellow-400 mt-1">Note: Recommendations may not be fully accurate due to unspecified sex.</p>
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-2">Suggested Exercises:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {recommendations.exercises.map((exercise, index) => (
                    <li key={index}>{exercise}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
