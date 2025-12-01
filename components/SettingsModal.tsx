
import React from 'react';
import { Language } from '../types';
import { GlobeIcon, SunIcon, MoonIcon, PaletteIcon } from './icons';

interface SettingsModalProps {
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    accentColor: string;
    onAccentColorChange: (color: string) => void;
    t: (key: string) => string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    theme,
    onThemeChange,
    accentColor,
    onAccentColorChange,
    t
}) => {
    return (
        <div className="text-[#000000] space-y-6">
             {/* Theme Section - Reduced importance as palette is strict */}
             <div className="p-4 bg-[#F5EAD7] border-2 border-[#000000]">
                <p className="font-bold text-sm text-[#000000]">
                    Note: Strict Brutalist Theme is currently enforced. Some settings may be overridden by the preset palette.
                </p>
             </div>
             
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#000000] flex items-center gap-2">
                    {theme === 'dark' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                    {t('settingsThemeLabel')}
                </h3>
                <div className="flex items-center gap-2 bg-[#FFFFFF] p-1 border-2 border-[#000000]">
                    <button
                        onClick={() => onThemeChange('light')}
                        className={`w-full px-3 py-2 text-sm font-semibold border-2 border-transparent transition-all duration-200 ${theme === 'light' ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]' : 'text-[#000000] hover:bg-[#F5EAD7]'}`}
                    >
                        <SunIcon className="w-4 h-4 inline-block mr-2" /> {t('settingsThemeLight')}
                    </button>
                    <button
                        onClick={() => onThemeChange('dark')}
                        className={`w-full px-3 py-2 text-sm font-semibold border-2 border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]' : 'text-[#000000] hover:bg-[#F5EAD7]'}`}
                    >
                       <MoonIcon className="w-4 h-4 inline-block mr-2" /> {t('settingsThemeDark')}
                    </button>
                </div>
            </div>
        </div>
    );
};
