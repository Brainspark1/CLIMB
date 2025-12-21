'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AchievementPopup from './AchievementPopup';
import { ACHIEVEMENTS, checkAchievements, saveAchievements, AchievementData } from '../utils/achievements';

interface AchievementContextType {
  triggerAchievementCheck: (data: AchievementData) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}

interface AchievementProviderProps {
  children: ReactNode;
}

export default function AchievementProvider({ children }: AchievementProviderProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<{ id: string; title: string; description: string; icon: string } | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<{ id: string; earnedDate: string }[]>([]);

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
        setCurrentAchievement(null);
        showNextAchievement();
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const triggerAchievementCheck = async (data: AchievementData) => {
    const newAchievements = await checkAchievements(data);
    if (newAchievements.length > 0) {
      // Save to database
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          for (const achievement of newAchievements) {
            await fetch('/api/achievements', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                achievementId: achievement.id,
              }),
            });
          }
        } catch (error) {
          console.error('Failed to save achievements to database:', error);
        }
      } else {
        // Fallback to localStorage
        saveAchievements(newAchievements);
      }

      setPendingAchievements(newAchievements);
      showNextAchievement();
    }
  };

  const showNextAchievement = () => {
    if (pendingAchievements.length > 0) {
      const achievement = ACHIEVEMENTS.find(a => a.id === pendingAchievements[0].id);
      if (achievement) {
        setCurrentAchievement(achievement);
        setShowPopup(true);
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setCurrentAchievement(null);
    setPendingAchievements(prev => {
      const remaining = prev.slice(1);
      // Show next achievement after a delay if there are more
      if (remaining.length > 0) {
        setTimeout(() => {
          showNextAchievement();
        }, 500);
      }
      return remaining;
    });
  };

  return (
    <AchievementContext.Provider value={{ triggerAchievementCheck }}>
      {children}
      {showPopup && currentAchievement && (
        <AchievementPopup
          title={currentAchievement.title}
          description={currentAchievement.description}
          icon={currentAchievement.icon}
          onClose={handleClosePopup}
        />
      )}
    </AchievementContext.Provider>
  );
}
