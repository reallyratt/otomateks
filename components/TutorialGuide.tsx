
import React from 'react';
import { CogIcon, DocumentIcon, ImageIcon, ParagraphIcon, PresentationIcon, TextIcon, DownloadIcon, UploadIcon } from './icons';
import { MassType } from '../types';
import { tutorialContent } from '../i18n';

interface TutorialGuideProps {
    massType: MassType;
    appLanguage: 'english' | 'indonesia';
}

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
    const content = tutorialContent[appLanguage] || tutorialContent.indonesia;

    const renderFeatureText = (text: string) => {
        const parts = text.split('{{icon}}');
        return (
            <p>
                {parts[0]}
                <ParagraphIcon className="w-4 h-4 inline-block align-middle mx-1 text-[var(--accent-color-400)]" />
                {parts[1]}
            </p>
        );
    };

    return (
        <div className="text-sm text-[var(--text-secondary)] space-y-6 max-h-[70vh] overflow-y-auto pr-4 hide-scrollbar">
            <p className="text-base text-center pb-2">
                {content.welcome}
            </p>

            <Section title={content.step1Title} icon={<CogIcon className="w-5 h-5"/>}>
                <p>{content.step1Desc}</p>
                <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{content.step1LangTitle}</h4>
                    <p className="mt-1">{content.step1LangDesc}</p>
                     <VisualBox>
                         <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-lg">
                            <button className="px-3 py-1 text-sm rounded-md bg-[var(--accent-color-500)] text-white">Indonesia</button>
                            <button className="px-3 py-1 text-sm rounded-md text-[var(--text-secondary)]">Jawa</button>
                        </div>
                    </VisualBox>
                </div>
                 <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{content.step1TypeTitle}</h4>
                    <p className="mt-1">{content.step1TypeDesc}</p>
                     <VisualBox>
                         <label className="flex items-center p-3 rounded-lg border bg-[var(--accent-color-500)]/20 border-[var(--accent-color-500)] w-full max-w-xs">
                            <input type="radio" checked readOnly className="w-4 h-4 text-[var(--accent-color-500)] bg-[var(--bg-tertiary)] border-[var(--border-primary)]"/>
                            <span className="ml-3 text-sm font-medium text-[var(--text-primary)]">Mingguan</span>
                         </label>
                    </VisualBox>
                </div>
            </Section>

            <Section title={content.step2Title} icon={<DocumentIcon className="w-5 h-5"/>}>
                <p>{content.step2Desc}</p>
                <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{content.step2FileNameTitle}</h4>
                    <p className="mt-1">{content.step2FileNameDesc}</p>
                    <VisualBox>
                         <input
                            type="text"
                            disabled
                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md px-3 py-2 text-gray-500 transition"
                            value="[Tahun C] Mingguan - Bahasa Indonesia - Minggu Paskah II (07 04 24)"
                        />
                    </VisualBox>
                </div>
                 <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{content.step2UploadTitle}</h4>
                    <p className="mt-1">{content.step2UploadDesc1}</p>
                    <p className="mt-1">{content.step2UploadDesc2}</p>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="inline-block my-2 py-2 px-4 rounded-lg font-semibold bg-[var(--accent-color-500)] text-white hover:bg-[var(--accent-color-600)] transition-all transform hover:scale-105">
                        {content.templateLinkText}
                    </a>
                    <p className="mt-1">{content.step2UploadDesc3}</p>
                     <VisualBox>
                         <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg border-[var(--border-secondary)] bg-[var(--bg-tertiary)]">
                            <UploadIcon className="w-8 h-8 mb-3 text-[var(--text-secondary)]" />
                            <p className="mb-2 text-sm text-center text-[var(--text-secondary)]">
                                <span className="font-semibold text-[var(--accent-color-400)]">Klik untuk mengunggah</span> atau seret dan lepas
                            </p>
                            <p className="text-xs text-gray-500">
                                PPTX file
                            </p>
                        </div>
                    </VisualBox>
                </div>
            </Section>

            <Section title={content.step3Title} icon={<PresentationIcon className="w-5 h-5"/>}>
                <p>{content.step3Desc1}</p>
                {renderFeatureText(content.step3Desc2)}
                <VisualBox>
                    <div className="w-full bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-primary)] space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[var(--accent-color-400)]">Lagu Pembuka</h3>
                             <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-md">
                                <button className="p-1.5 rounded bg-[var(--accent-color-500)] text-white"><TextIcon className="w-4 h-4"/></button>
                                <button className="p-1.5 rounded text-[var(--text-secondary)]"><ImageIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <textarea
                            disabled
                            className="w-full h-24 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md px-3 py-2 text-gray-500"
                            placeholder="Isi teks lagu di sini..."
                        />
                    </div>
                </VisualBox>
            </Section>

            <Section title={content.step4Title} icon={<DownloadIcon className="w-5 h-5"/>}>
                <p>{content.step4Desc}</p>
                 <div className="bg-yellow-900/50 text-yellow-300 p-3 rounded-lg border border-yellow-700 mt-2">
                    <p className="font-bold">Penting!</p>
                    <p>{content.step4Warning}</p>
                </div>
                <VisualBox>
                    <button 
                        disabled
                        className="w-full max-w-xs mx-auto py-3 px-6 rounded-lg text-lg font-semibold bg-[var(--accent-color-500)] text-white flex items-center justify-center gap-2"
                    >
                        <DownloadIcon className="w-4 h-4"/> Generate & Download
                    </button>
                </VisualBox>
            </Section>
        </div>
    );
};