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
        <h3 className="text-xl font-bold uppercase text-brutal-text flex items-center gap-3 border-b-4 border-brutal-border pb-2">
            {icon}
            {title}
        </h3>
        <div className="text-brutal-text space-y-4 pl-2 text-sm">
            {children}
        </div>
    </div>
);

const VisualBox: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="bg-brutal-surface p-4 border-2 border-brutal-border shadow-brutal-sm my-2 flex flex-col items-center justify-center gap-2">
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
                <ParagraphIcon className="w-4 h-4 inline-block align-middle mx-1 text-brutal-text" />
                {parts[1]}
            </p>
        );
    };

    return (
        <div className="text-sm text-brutal-text space-y-6">
            <p className="text-base text-center pb-2 font-medium">
                {content.welcome}
            </p>

            <Section title={content.step1Title} icon={<CogIcon className="w-5 h-5"/>}>
                <p>{content.step1Desc}</p>
                <div>
                    <h4 className="font-bold text-brutal-text bg-brutal-bg inline-block px-1 border border-brutal-border">{content.step1LangTitle}</h4>
                    <p className="mt-1">{content.step1LangDesc}</p>
                     <VisualBox>
                         <div className="flex items-center gap-1 bg-brutal-bg p-2 border border-brutal-border">
                            <button className="px-3 py-1 text-sm bg-brutal-border text-brutal-bg border border-brutal-border">Indonesia</button>
                            <button className="px-3 py-1 text-sm bg-brutal-surface text-brutal-text border border-brutal-border">Jawa</button>
                        </div>
                    </VisualBox>
                </div>
                 <div>
                    <h4 className="font-bold text-brutal-text bg-brutal-bg inline-block px-1 border border-brutal-border">{content.step1TypeTitle}</h4>
                    <p className="mt-1">{content.step1TypeDesc}</p>
                     <VisualBox>
                         <label className="flex items-center p-3 border-2 border-brutal-border bg-brutal-surface w-full max-w-xs">
                            <input type="radio" checked readOnly className="w-4 h-4 text-brutal-text border-2 border-brutal-border accent-brutal-border"/>
                            <span className="ml-3 text-sm font-bold text-brutal-text">Mingguan</span>
                         </label>
                    </VisualBox>
                </div>
            </Section>

            <Section title={content.step2Title} icon={<DocumentIcon className="w-5 h-5"/>}>
                <p>{content.step2Desc}</p>
                <div>
                    <h4 className="font-bold text-brutal-text bg-brutal-bg inline-block px-1 border border-brutal-border">{content.step2FileNameTitle}</h4>
                    <p className="mt-1">{content.step2FileNameDesc}</p>
                    <VisualBox>
                         <input
                            type="text"
                            disabled
                            className="w-full bg-brutal-bg border-2 border-brutal-border px-3 py-2 text-brutal-text font-mono text-xs"
                            value="[Tahun C] Mingguan - Bahasa Indonesia - Minggu Paskah II (07 04 24)"
                        />
                    </VisualBox>
                </div>
                 <div>
                    <h4 className="font-bold text-brutal-text bg-brutal-bg inline-block px-1 border border-brutal-border">{content.step2UploadTitle}</h4>
                    <p className="mt-1">{content.step2UploadDesc1}</p>
                    <p className="mt-1">{content.step2UploadDesc2}</p>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="inline-block my-2 py-2 px-4 font-bold bg-brutal-accent text-brutal-white border-2 border-brutal-border hover:bg-brutal-border hover:text-brutal-bg transition-colors shadow-brutal-sm">
                        {content.templateLinkText}
                    </a>
                    <p className="mt-1">{content.step2UploadDesc3}</p>
                     <VisualBox>
                         <div className="flex flex-col items-center justify-center w-full h-32 border-4 border-brutal-border bg-brutal-surface">
                            <UploadIcon className="w-8 h-8 mb-3 text-brutal-text" />
                            <p className="mb-2 text-sm text-center text-brutal-text">
                                <span className="font-bold bg-brutal-border text-brutal-bg px-1">Klik untuk mengunggah</span>
                            </p>
                            <p className="text-xs font-mono bg-brutal-bg px-1 border border-brutal-border text-brutal-text">
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
                    <div className="w-full bg-brutal-surface p-4 border-2 border-brutal-border space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black uppercase bg-brutal-accent text-brutal-white px-2 border border-brutal-border">Lagu Pembuka</h3>
                             <div className="flex items-center gap-1">
                                <button className="p-1 border border-brutal-border bg-brutal-border text-brutal-bg"><TextIcon className="w-4 h-4"/></button>
                                <button className="p-1 border border-brutal-border bg-brutal-surface text-brutal-text"><ImageIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <textarea
                            disabled
                            className="w-full h-24 bg-brutal-bg border-2 border-brutal-border px-3 py-2 text-brutal-text font-mono text-xs"
                            placeholder="Isi teks lagu di sini..."
                        />
                    </div>
                </VisualBox>
            </Section>

            <Section title={content.step4Title} icon={<DownloadIcon className="w-5 h-5"/>}>
                <p>{content.step4Desc}</p>
                 <div className="bg-brutal-surface text-brutal-text p-3 border-4 border-brutal-border mt-2 shadow-brutal-sm">
                    <p className="font-black uppercase bg-red-500 text-brutal-white inline-block px-1 border border-brutal-border">Penting!</p>
                    <p className="mt-1">{content.step4Warning}</p>
                </div>
                <VisualBox>
                    <button 
                        disabled
                        className="w-full max-w-xs mx-auto py-3 px-6 text-lg font-bold bg-brutal-accent text-brutal-white border-2 border-brutal-border flex items-center justify-center gap-2 shadow-brutal-sm"
                    >
                        <DownloadIcon className="w-4 h-4"/> Generate & Download
                    </button>
                </VisualBox>
            </Section>
        </div>
    );
};