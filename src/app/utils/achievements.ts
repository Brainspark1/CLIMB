export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  checkCondition: (data: AchievementData) => boolean;
}

export interface Workout {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export interface Profile {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
}

export interface AchievementData {
  workouts: Workout[];
  meals: Meal[];
  profile: Profile | null;
}

export interface EarnedAchievement {
  id: string;
  earnedDate: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-workout',
    title: 'Getting Started',
    description: 'Log your first workout',
    icon: '🏋️',
    checkCondition: (data) => data.workouts.length >= 1,
  },
  {
    id: 'workout-warrior',
    title: 'Workout Warrior',
    description: 'Complete 10 workouts',
    icon: '💪',
    checkCondition: (data) => data.workouts.length >= 10,
  },
  {
    id: 'dedicated-athlete',
    title: 'Dedicated Athlete',
    description: 'Complete 50 workouts',
    icon: '🏆',
    checkCondition: (data) => data.workouts.length >= 50,
  },
  {
    id: 'first-meal',
    title: 'Food Tracker',
    description: 'Log your first meal',
    icon: '🍎',
    checkCondition: (data) => data.meals.length >= 1,
  },
  {
    id: 'nutrition-expert',
    title: 'Nutrition Expert',
    description: 'Log 25 meals',
    icon: '🥗',
    checkCondition: (data) => data.meals.length >= 25,
  },
  {
    id: 'calorie-crusher',
    title: 'Calorie Crusher',
    description: 'Log 1000+ calories in a day',
    icon: '🔥',
    checkCondition: (data) => {
      const today = new Date().toISOString().split('T')[0];
      const todayMeals = data.meals.filter(meal => meal.date === today);
      const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      return totalCalories >= 1000;
    },
  },
  {
    id: 'profile-complete',
    title: 'Profile Master',
    description: 'Complete your profile setup',
    icon: '👤',
    checkCondition: (data) => data.profile !== null && Boolean(data.profile.name) && data.profile.age > 0,
  },
  {
    id: 'consistency-king',
    title: 'Consistency King',
    description: 'Work out for 7 consecutive days',
    icon: '👑',
    checkCondition: (data) => {
      const workoutDates = [...new Set(data.workouts.map(w => w.date))].sort();
      if (workoutDates.length < 7) return false;

      // Check for 7 consecutive days
      for (let i = workoutDates.length - 7; i < workoutDates.length; i++) {
        const current = new Date(workoutDates[i]);
        const next = new Date(workoutDates[i + 1]);
        const diffTime = Math.abs(next.getTime() - current.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays !== 1) return false;
      }
      return true;
    },
  },
];

export async function checkAchievements(data: AchievementData): Promise<EarnedAchievement[]> {
  const earnedAchievements: EarnedAchievement[] = [];

  // Check database for already earned achievements
  const userId = localStorage.getItem('userId');
  let savedAchievements: EarnedAchievement[] = [];

  if (userId) {
    try {
      const response = await fetch(`/api/achievements?userId=${userId}`);
      if (response.ok) {
        const dbAchievements = await response.json();
        savedAchievements = dbAchievements.map((a: { achievementId: string; earnedDate: string }) => ({ id: a.achievementId, earnedDate: a.earnedDate }));
      }
    } catch (error) {
      console.error('Failed to fetch achievements from database:', error);
      // Fallback to localStorage
      savedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    }
  } else {
    // Fallback to localStorage
    savedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
  }

  ACHIEVEMENTS.forEach(achievement => {
    const alreadyEarned = savedAchievements.find((a: EarnedAchievement) => a.id === achievement.id);
    if (!alreadyEarned && achievement.checkCondition(data)) {
      earnedAchievements.push({
        id: achievement.id,
        earnedDate: new Date().toISOString(),
      });
    }
  });

  return earnedAchievements;
}

export function saveAchievements(achievements: EarnedAchievement[]) {
  const existing = JSON.parse(localStorage.getItem('achievements') || '[]');
  const updated = [...existing, ...achievements];
  localStorage.setItem('achievements', JSON.stringify(updated));
}

export function getEarnedAchievements(): EarnedAchievement[] {
  return JSON.parse(localStorage.getItem('achievements') || '[]');
}
