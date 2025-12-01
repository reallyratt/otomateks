
import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div 
            className={`fixed inset-0 bg-[#000000]/50 z-50 flex justify-center items-center p-4 transition-opacity duration-200
                ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
            }
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`bg-[#FFFFFF] border-4 border-[#000000] shadow-brutal-lg w-full ${maxWidth} flex flex-col transition-transform duration-200 max-h-[90vh]
                    ${isOpen ? 'scale-100' : 'scale-95'}`
                }
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b-4 border-[#000000] bg-[#F5EAD7] flex-shrink-0">
                    <h2 id="modal-title" className="text-xl font-black uppercase tracking-tight text-[#000000]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-[#000000] hover:bg-red-500 hover:text-[#FFFFFF] border-2 border-[#000000] p-1 transition-colors shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </header>
                <main className="p-0 overflow-hidden flex flex-col flex-grow bg-[#FFFFFF]">
                    {children}
                </main>
            </div>
        </div>
    );
};
