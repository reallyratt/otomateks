import React from 'react';
import { CogIcon, DocumentIcon, ImageIcon, ParagraphIcon, PresentationIcon, TextIcon, DownloadIcon, MoreVerticalIcon } from './icons';
import { MassType } from '../types';
import { tutorialContent } from '../i18n';

interface TutorialGuideProps {
    massType: MassType;
    appLanguage: 'english' | 'indonesia';
}

const templateMap: { [key in MassType]: { name: string; url: string; enabled: boolean } } = {
    biasa: { name: 'Template Misa Biasa', url: 'https://komsosnas.parokipugeran.org/Template%20Teks%20Misa/Template%20Misa%20Biasa.pptx', enabled: true },
    manten: { name: 'Template Misa Manten', url: '#', enabled: false },
    memule: { name: 'Template Misa Memule', url: '#', enabled: false },
    kamisPutih: { name: 'Template Kamis Putih', url: '#', enabled: false },
    jumatAgung: { name: 'Template Jumat Agung', url: '#', enabled: false },
    paskah: { name: 'Template Hari Paskah', url: '#', enabled: false },
    natal: { name: 'Template Natal', url: '#', enabled: false },
};

const Code: React.FC<{children: React.ReactNode}> = ({ children }) => <code className="bg-[var(--bg-tertiary)] px-1 py-0.5 rounded text-[var(--accent-color-300)] font-mono text-xs">{children}</code>;
const Highlight: React.FC<{children: React.ReactNode}> = ({ children }) => <span className="text-[var(--accent-color-400)] font-semibold">{children}</span>;
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="space-y-3">
        <h3 className="text-xl font-semibold text-[var(--accent-color-400)] flex items-center gap-3 border-b border-[var(--border-primary)] pb-2">
            {icon}
            {title}
        </h3>
        <div className="text-[var(--text-secondary)] space-y-4 pl-2 text-sm">
            {children}
        </div>
    </div>
);

const VisualBox: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-primary)] my-2 flex flex-col items-center justify-center gap-2">
        {children}
    </div>
);


export const TutorialGuide: React.FC<TutorialGuideProps> = ({ massType, appLanguage }) => {
    const currentTemplate = templateMap[massType];
    const content = tutorialContent[appLanguage];

    return (
        <div className="text-sm text-[var(--text-secondary)] space-y-6 max-h-[70vh] overflow-y-auto pr-4 hide-scrollbar">
            <p className="text-base text-center pb-2">
                {content.welcome}
            </p>

            <Section title={content.step1Title} icon={<CogIcon className="w-6 h-6"/>}>
                <p>{content.step1Desc}</p>
                <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{content.step1TitleLabel}</h4>
                    <p className="mt-1">{content.step1TitleDesc}</p>
                    <VisualBox>
                         <input
                            type="text"
                            disabled
                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md px-3 py-2 text-gray-500 transition"
                            placeholder="[Tahun C] Mingguan - Bahasa Indonesia - Minggu Biasa I (27 04 2007)"
                        />
                    </VisualBox>
                </div>
                 <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{content.step1SetupLabel}</h4>
                    <p className="mt-1">{content.step1SetupDesc}</p>
                     <VisualBox>
                         <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="font-semibold mb-2 text-[var(--text-primary)]">Language</p>
                                <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-lg">
                                    <button className="px-3 py-1 text-sm rounded-md bg-[var(--accent-color-500)] text-white">Indonesia</button>
                                    <button className="px-3 py-1 text-sm rounded-md text-[var(--text-secondary)]">Jawa</button>
                                </div>
                            </div>
                             <div className="text-center">
                                <p className="font-semibold mb-2 text-[var(--text-primary)]">Mass Type</p>
                                <div className="p-2 rounded-lg border border-[var(--accent-color-500)] bg-[var(--accent-color-500)]/20 text-[var(--accent-color-300)] text-xs">
                                    Misa Biasa
                                </div>
                            </div>
                         </div>
                    </VisualBox>
                </div>
            </Section>

            <Section title={content.step2Title} icon={<DocumentIcon className="w-6 h-6"/>}>
                <p>{content.step2Desc}</p>
                
                <h4 className="font-bold text-[var(--text-primary)] pt-2">{content.step2Features}</h4>
                <div className="pl-2 space-y-3">
                     <div>
                        <h5 className="font-semibold text-[var(--text-primary)]">{content.step2SwitchLabel}</h5>
                        <p className="mt-1">{content.step2SwitchDesc}</p>
                        <VisualBox>
                             <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-md">
                                <button className="px-2 py-1 rounded bg-[var(--bg-hover)] text-[var(--text-secondary)]"><TextIcon className="w-4 h-4"/></button>
                                <button className="px-2 py-1 rounded bg-[var(--accent-color-500)] text-white"><ImageIcon className="w-4 h-4"/></button>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">{content.step2SwitchNote}</p>
                        </VisualBox>
                    </div>

                     <div>
                        <h5 className="font-semibold text-[var(--text-primary)]">{content.step2ParaLabel}</h5>
                        <p className="mt-1">{content.step2ParaDesc}</p>
                         <VisualBox>
                            <button className="text-xs text-[var(--accent-color-400)] hover:text-[var(--accent-color-300)] font-semibold transition flex items-center gap-1">
                                <ParagraphIcon className="w-3 h-3" />
                                Paragraphify
                            </button>
                             <div className="grid grid-cols-2 gap-2 w-full text-xs mt-2">
                                 <div className="bg-[var(--bg-secondary)] p-2 rounded">
                                     <p className="font-bold mb-1 text-[var(--text-primary)]">{content.before}</p>
                                     <p>In the beginning, God</p>
                                     <p>created the heavens</p>
                                     <p>and the earth.</p>
                                 </div>
                                  <div className="bg-[var(--bg-secondary)] p-2 rounded">
                                     <p className="font-bold mb-1 text-[var(--text-primary)]">{content.after}</p>
                                     <p>In the beginning, God created the heavens and the earth.</p>
                                 </div>
                             </div>
                        </VisualBox>
                    </div>
                </div>
            </Section>

             <Section title={content.step3Title} icon={<PresentationIcon className="w-6 h-6"/>}>
                <p>{content.step3Desc1}</p>
                <p>{content.step3Desc2}</p>
                 <VisualBox>
                     <p className="text-sm text-[var(--text-secondary)] mb-2">
                        {content.currentSelection} <span className="font-bold text-[var(--accent-color-400)]">{currentTemplate.name}</span>
                    </p>
                    <a
                        href={currentTemplate.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all transform hover:scale-105
                            ${currentTemplate.enabled
                                ? 'bg-[var(--accent-color-500)] text-white hover:bg-[var(--accent-color-600)]'
                                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            }`
                        }
                    >
                        <DownloadIcon className="w-4 h-4" />
                        {content.downloadTemplate}
                    </a>
                    <p className="text-xs text-gray-500 mt-2">
                        {content.downloadSource}
                    </p>
                </VisualBox>
            </Section>

            <Section title={content.step4Title} icon={<DownloadIcon className="w-6 h-6"/>}>
                <p>{content.step4Desc1}</p>
                <p>{content.step4Desc2}</p>
            </Section>
        </div>
    );
};