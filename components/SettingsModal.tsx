import React from 'react';
import { Language } from '../types';
import { GlobeIcon, SunIcon, MoonIcon, PaletteIcon } from './icons';

interface SettingsModalProps {
    appLanguage: 'english' | 'indonesia';
    onAppLanguageChange: (lang: 'english' | 'indonesia') => void;
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    accentColor: string;
    onAccentColorChange: (color: string) => void;
    t: (key: string) => string;
}

const accentColors = [
    { id: 'sky', name: 'Sky', color: 'bg-sky-500' },
    { id: 'indigo', name: 'Indigo', color: 'bg-indigo-500' },
    { id: 'pink', name: 'Pink', color: 'bg-pink-500' },
    { id: 'teal', name: 'Teal', color: 'bg-teal-500' },
    { id: 'green', name: 'Green', color: 'bg-green-500' },
    { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
    appLanguage,
    onAppLanguageChange,
    theme,
    onThemeChange,
    accentColor,
    onAccentColorChange,
    t
}) => {
    return (
        <div className="text-[var(--text-secondary)] space-y-6">
            {/* App Language Section */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--accent-color-400)] flex items-center gap-2">
                    <GlobeIcon className="w-5 h-5" />
                    {t('settingsLanguageLabel')}
                </h3>
                <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] p-1 rounded-lg">
                    <button
                        onClick={() => onAppLanguageChange('english')}
                        className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 ${appLanguage === 'english' ? 'bg-[var(--accent-color-500)] text-white shadow-lg shadow-[var(--accent-color-500)]/20' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => onAppLanguageChange('indonesia')}
                        className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 ${appLanguage === 'indonesia' ? 'bg-[var(--accent-color-500)] text-white shadow-lg shadow-[var(--accent-color-500)]/20' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                    >
                        Indonesia
                    </button>
                </div>
            </div>

             {/* Theme Section */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--accent-color-400)] flex items-center gap-2">
                    {theme === 'dark' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                    {t('settingsThemeLabel')}
                </h3>
                <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] p-1 rounded-lg">
                    <button
                        onClick={() => onThemeChange('light')}
                        className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-[var(--accent-color-500)] text-white shadow-lg shadow-[var(--accent-color-500)]/20' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                    >
                        <SunIcon className="w-4 h-4" /> {t('settingsThemeLight')}
                    </button>
                    <button
                        onClick={() => onThemeChange('dark')}
                        className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-[var(--accent-color-500)] text-white shadow-lg shadow-[var(--accent-color-500)]/20' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                    >
                       <MoonIcon className="w-4 h-4" /> {t('settingsThemeDark')}
                    </button>
                </div>
            </div>

            {/* Accent Color Section */}
             <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--accent-color-400)] flex items-center gap-2">
                    <PaletteIcon className="w-5 h-5" />
                    {t('settingsAccentLabel')}
                </h3>
                <div className="grid grid-cols-6 gap-3">
                    {accentColors.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => onAccentColorChange(color.id)}
                            className={`w-full h-10 rounded-lg ${color.color} transition-transform duration-200 transform hover:scale-110 ${accentColor === color.id ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-[var(--accent-color-400)]' : ''}`}
                            aria-label={`Select ${color.name} accent color`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
