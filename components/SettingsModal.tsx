
import React from 'react';
import { GlobeIcon, SunIcon, MoonIcon, PaletteIcon } from './icons';

interface SettingsModalProps {
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    accentColor: string;
    onAccentColorChange: (color: string) => void;
    t: (key: string) => string;
}

const BRUTALIST_COLORS = [
    { label: 'Blue', value: '#0033FF' },
    { label: 'Red', value: '#FF2A00' },
    { label: 'Green', value: '#00A859' },
    { label: 'Purple', value: '#6B2CF5' },
    { label: 'Pink', value: '#FF0099' },
    { label: 'Orange', value: '#FF5500' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
    theme,
    onThemeChange,
    accentColor,
    onAccentColorChange,
    t
}) => {
    return (
        <div className="text-brutal-text space-y-8">
             {/* Accent Color Section */}
             <div className="space-y-3">
                <h3 className="text-lg font-black uppercase text-brutal-text flex items-center gap-2 border-b-2 border-brutal-border pb-1 inline-block">
                    <PaletteIcon className="w-5 h-5"/>
                    {t('settingsAccentLabel')}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {BRUTALIST_COLORS.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => onAccentColorChange(color.value)}
                            className={`flex items-center justify-between p-2 border-4 font-bold text-sm uppercase transition-all
                                ${accentColor === color.value 
                                    ? 'border-brutal-border bg-brutal-bg shadow-brutal-sm' 
                                    : 'border-transparent hover:border-brutal-border hover:bg-brutal-bg/10'
                                }`}
                        >
                            <span>{color.label}</span>
                            <span 
                                className="w-6 h-6 border-2 border-brutal-border" 
                                style={{ backgroundColor: color.value }}
                            />
                        </button>
                    ))}
                </div>
            </div>
             
             {/* Theme Section */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-brutal-text flex items-center gap-2 border-b-2 border-brutal-border pb-1 inline-block">
                    {theme === 'dark' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                    {t('settingsThemeLabel')}
                </h3>
                <div className="flex items-center gap-2 bg-brutal-surface p-1 border-2 border-brutal-border">
                    <button
                        onClick={() => onThemeChange('light')}
                        className={`w-full px-3 py-2 text-sm font-semibold border-2 transition-all duration-200
                            ${theme === 'light' 
                                ? 'border-brutal-border bg-brutal-border text-brutal-bg' 
                                : 'border-transparent text-brutal-text hover:bg-brutal-bg/20'}`}
                    >
                        <SunIcon className="w-4 h-4 inline-block mr-2" /> {t('settingsThemeLight')}
                    </button>
                    <button
                        onClick={() => onThemeChange('dark')}
                         className={`w-full px-3 py-2 text-sm font-semibold border-2 transition-all duration-200
                            ${theme === 'dark' 
                                ? 'border-brutal-border bg-brutal-border text-brutal-bg' 
                                : 'border-transparent text-brutal-text hover:bg-brutal-bg/20'}`}
                    >
                       <MoonIcon className="w-4 h-4 inline-block mr-2" /> {t('settingsThemeDark')}
                    </button>
                </div>
            </div>
            
             <div className="p-4 bg-brutal-bg border-2 border-brutal-border">
                <p className="font-bold text-sm text-brutal-text">
                    Note: Changes apply instantly across the application.
                </p>
             </div>

        </div>
    );
};