
import React, { useState, useEffect, useRef } from 'react';
import { MoreVerticalIcon, CogIcon, BookOpenIcon, SlidersIcon, ClipboardIcon } from './icons';

interface DropdownMenuProps {
    onSetupClick: () => void;
    onTutorialClick: () => void;
    onSettingsClick: () => void;
    onDevlogClick: () => void;
    t: (key: string) => string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ onSetupClick, onTutorialClick, onSettingsClick, onDevlogClick, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode; icon: React.ReactNode }> = ({ onClick, children, icon }) => (
        <button
            onClick={() => { onClick(); setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-200 transform hover:translate-x-1"
        >
            <span className="text-[var(--accent-color-400)]">{icon}</span>
            {children}
        </button>
    );


    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-200 transform hover:scale-110 active:scale-100"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Open menu"
            >
                <MoreVerticalIcon className="w-6 h-6" />
            </button>

            <div 
                className={`absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-lg shadow-xl z-10 py-1 overflow-hidden transition-all duration-200 ease-out origin-top-right
                    ${isOpen 
                        ? 'opacity-100 scale-100 pointer-events-auto' 
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`
                }
            >
                <MenuButton onClick={onSetupClick} icon={<CogIcon className="w-4 h-4" />}>{t('menuSetup')}</MenuButton>
                <MenuButton onClick={onTutorialClick} icon={<BookOpenIcon className="w-4 h-4" />}>{t('menuTutorial')}</MenuButton>
                <MenuButton onClick={onSettingsClick} icon={<SlidersIcon className="w-4 h-4" />}>{t('menuSettings')}</MenuButton>
                <MenuButton onClick={onDevlogClick} icon={<ClipboardIcon className="w-4 h-4" />}>{t('menuDevlog')}</MenuButton>
            </div>
        </div>
    );
};
