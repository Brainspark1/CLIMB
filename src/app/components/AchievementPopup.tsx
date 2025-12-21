interface AchievementPopupProps {
  title: string;
  description: string;
  icon: string;
  onClose: () => void;
}

export default function AchievementPopup({ title, description, icon, onClose }: AchievementPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-green-500 rounded-lg p-6 max-w-sm mx-4 shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h3 className="text-xl font-bold text-white mb-2">Achievement Unlocked!</h3>
          <h4 className="text-lg font-semibold text-green-400 mb-2">{title}</h4>
          <p className="text-gray-300 mb-4">{description}</p>
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}
