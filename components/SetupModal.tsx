import React from 'react';
import { Language, MassType } from '../types';
import { GlobeIcon, CrossIcon } from './icons';

interface SetupModalProps {
    massLanguage: Language;
    onMassLanguageChange: (lang: Language) => void;
    massType: MassType;
    onMassTypeChange: (type: MassType) => void;
    t: (key: string) => string;
}

const massOptions: { id: MassType; label: string; enabled: boolean }[] = [
    { id: 'biasa', label: 'Misa Biasa (Harian/Mingguan)', enabled: true },
    { id: 'dataEntry', label: 'Data Entry (from Excel)', enabled: true },
    { id: 'manten', label: 'Misa Manten', enabled: false },
    { id: 'memule', label: 'Misa Memule', enabled: false },
    { id: 'kamisPutih', label: 'Kamis Putih', enabled: false },
    { id: 'jumatAgung', label: 'Jumat Agung', enabled: false },
    { id: 'paskah', label: 'Hari Paskah', enabled: false },
    { id: 'natal', label: 'Natal', enabled: false },
];


export const SetupModal: React.FC<SetupModalProps> = ({ massLanguage, onMassLanguageChange, massType, onMassTypeChange, t }) => {
    return (
        <div className="text-[var(--text-secondary)] space-y-6">
            {/* Language Section */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--accent-color-400)] flex items-center gap-2">
                    <GlobeIcon className="w-5 h-5" />
                    {t('languageLabel')}
                </h3>
                <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] p-1 rounded-lg">
                    <button 
                        onClick={() => onMassLanguageChange('indonesia')} 
                        className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 ${massLanguage === 'indonesia' ? 'bg-[var(--accent-color-500)] text-white shadow-lg shadow-[var(--accent-color-500)]/20' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                    >
                        Indonesia
                    </button>
                    <button 
                        onClick={() => onMassLanguageChange('jawa')} 
                        className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 ${massLanguage === 'jawa' ? 'bg-[var(--accent-color-500)] text-white shadow-lg shadow-[var(--accent-color-500)]/20' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                    >
                        Jawa
                    </button>
                </div>
            </div>

            {/* Mass Type Section */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--accent-color-400)] flex items-center gap-2">
                    <CrossIcon className="w-5 h-5" />
                    {t('massTypeLabel')}
                </h3>
                <div className="space-y-2">
                    {massOptions.map((option) => (
                        <label 
                            key={option.id}
                            className={`flex items-center p-3 rounded-lg border transition-all duration-200 transform ${
                                !option.enabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer hover:scale-[1.02] hover:border-[var(--accent-color-400)]'
                            } ${
                                massType === option.id 
                                    ? 'bg-[var(--accent-color-500)]/20 border-[var(--accent-color-500)]' 
                                    : 'border-[var(--border-secondary)] hover:bg-[var(--bg-hover)]'
                            }`}
                        >
                            <input
                                type="radio"
                                name="massType"
                                value={option.id}
                                checked={massType === option.id}
                                onChange={() => onMassTypeChange(option.id)}
                                disabled={!option.enabled}
                                className="w-4 h-4 text-[var(--accent-color-500)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] focus:ring-[var(--accent-color-600)] disabled:opacity-50"
                            />
                            <span className="ml-3 text-sm font-medium text-[var(--text-primary)]">{option.label}</span>
                            {!option.enabled && <span className="ml-auto text-xs text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">Coming Soon</span>}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};