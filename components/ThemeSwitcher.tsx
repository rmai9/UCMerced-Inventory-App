import React from 'react';
import { themes, Theme } from '../utils/themes';

interface ThemeSwitcherProps {
  activeTheme: string;
  setTheme: (themeKey: string) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ activeTheme, setTheme }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Color Themes</h2>
        <div className="flex flex-col gap-2">
            {Object.entries(themes).map(([key, theme]) => (
                <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`
                        w-full p-2 rounded-lg border-2 transition-all duration-200 text-left
                        ${activeTheme === key ? 'border-secondary shadow-md bg-light' : 'border-transparent hover:border-gray-300'}
                    `}
                    aria-label={`Switch to ${theme.name} theme`}
                >
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-8 h-8 rounded-full flex overflow-hidden border-2 border-white/50 shadow-inner flex-shrink-0"
                            style={{ background: `linear-gradient(to bottom right, ${theme.swatch.primary}, ${theme.swatch.secondary})` }}
                        />
                        <span className={`text-sm font-medium ${activeTheme === key ? 'text-dark' : 'text-gray-600'}`}>
                            {theme.name}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    </div>
  );
};

export default ThemeSwitcher;