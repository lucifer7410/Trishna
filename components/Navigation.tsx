import React from 'react';
import { Home, Sprout, Stethoscope, Video, Settings } from 'lucide-react';
import { AppSection } from '../types';

interface NavigationProps {
  currentSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentSection, onSectionChange }) => {
  const navItems = [
    { id: AppSection.HOME, label: 'Home', icon: Home },
    { id: AppSection.CROPS, label: 'Plan', icon: Sprout },
    { id: AppSection.DOCTOR, label: 'Doctor', icon: Stethoscope },
    { id: AppSection.LEARN, label: 'Learn', icon: Video },
    { id: AppSection.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg pb-safe z-50 transition-colors">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
              currentSection === item.id
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-300'
            }`}
          >
            <item.icon className={`h-6 w-6 ${currentSection === item.id ? 'fill-current transform scale-110' : ''} transition-transform`} strokeWidth={2} />
            <span className={`text-[10px] mt-1 font-medium ${currentSection === item.id ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;