
import React, { useState, useEffect, useRef } from 'react';
import { MoreVerticalIcon, CogIcon, BookOpenIcon, SlidersIcon, ClipboardIcon } from './icons';

interface DropdownMenuProps {
    onTutorialClick: () => void;
    onSettingsClick: () => void;
    onDevlogClick: () => void;
    t: (key: string) => string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ onTutorialClick, onSettingsClick, onDevlogClick, t }) => {
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
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase border-b-2 border-[#000000] last:border-b-0 hover:bg-[#0033FF] hover:text-[#FFFFFF] transition-colors"
        >
            <span className="current-color">{icon}</span>
            {children}
        </button>
    );


    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`p-2 border-4 border-[#000000] transition-all duration-200 ${isOpen ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000] hover:bg-[#F5EAD7] shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Open menu"
            >
                <MoreVerticalIcon className="w-6 h-6" />
            </button>

            <div 
                className={`absolute right-0 mt-2 w-56 bg-[#FFFFFF] border-4 border-[#000000] shadow-brutal-lg z-20 transition-all duration-200 ease-out origin-top-right
                    ${isOpen 
                        ? 'opacity-100 scale-100 pointer-events-auto' 
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`
                }
            >
                <MenuButton onClick={onTutorialClick} icon={<BookOpenIcon className="w-5 h-5" />}>{t('menuTutorial')}</MenuButton>
                <MenuButton onClick={onSettingsClick} icon={<SlidersIcon className="w-5 h-5" />}>{t('menuSettings')}</MenuButton>
                <MenuButton onClick={onDevlogClick} icon={<ClipboardIcon className="w-5 h-5" />}>{t('menuDevlog')}</MenuButton>
            </div>
        </div>
    );
};
