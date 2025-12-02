
import React from 'react';
import { 
    CogIcon, DocumentIcon, ImageIcon, ParagraphIcon, PresentationIcon, TextIcon, 
    DownloadIcon, UploadIcon, PencilIcon, ContrastIcon, TrashIcon, CropIcon, PlusIcon, ScanIcon, ArrowUpIcon, ArrowDownIcon
} from './icons';
import { MassType } from '../types';
import { tutorialContent } from '../i18n';

interface TutorialGuideProps {
    massType: MassType;
    appLanguage: 'english' | 'indonesia';
}

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="space-y-4 pt-4">
        <h3 className="text-xl font-black uppercase text-brutal-text flex items-center gap-3 border-b-4 border-brutal-border pb-2 text-justify">
            {icon}
            {title}
        </h3>
        <div className="text-brutal-text space-y-6 pl-2 text-sm text-justify">
            {children}
        </div>
    </div>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-2">
        <h4 className="font-bold text-base text-brutal-text bg-brutal-bg inline-block px-2 border-2 border-brutal-border shadow-brutal-sm">
            {title}
        </h4>
        <div className="text-brutal-text space-y-2 leading-relaxed text-justify">
            {children}
        </div>
    </div>
);

const VisualBox: React.FC<{children: React.ReactNode; label?: string}> = ({ children, label }) => (
    <div className="my-3">
        {label && <p className="text-xs font-bold uppercase text-brutal-text/60 mb-1">{label}</p>}
        <div className="bg-brutal-surface p-4 border-2 border-brutal-border shadow-brutal-sm flex flex-col items-center justify-center gap-2 relative overflow-hidden">
            {children}
        </div>
    </div>
);

const renderEnrichedText = (text: string) => {
    const parts = text.split(/(Paragraphify|Image-to-Text)/g);
    
    return (
        <p>
            {parts.map((part, index) => {
                if (part === 'Paragraphify') {
                    return (
                        <span key={index}>
                            Paragraphify
                            <span className="inline-flex items-center justify-center mx-1 align-text-bottom">
                                <ParagraphIcon className="w-4 h-4 border border-brutal-border p-[1px] bg-brutal-bg"/>
                            </span>
                        </span>
                    );
                }
                if (part === 'Image-to-Text') {
                    return (
                        <span key={index}>
                            Image-to-Text
                            <span className="inline-flex items-center justify-center mx-1 align-text-bottom">
                                <ScanIcon className="w-4 h-4 border border-brutal-border p-[1px] bg-brutal-bg"/>
                            </span>
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </p>
    );
};

export const TutorialGuide: React.FC<TutorialGuideProps> = ({ appLanguage }) => {
    const content = tutorialContent[appLanguage] || tutorialContent.indonesia;

    return (
        <div className="text-sm text-brutal-text space-y-8 pb-8">
            <p className="text-base text-center pb-2 font-medium border-b-2 border-brutal-border border-dashed">
                {content.welcome}
            </p>

            {/* Step 1: Configuration */}
            <Section title={content.step1Title} icon={<CogIcon className="w-6 h-6"/>}>
                
                <SubSection title={content.step1SubATitle}>
                    <p>{content.step1SubADesc}</p>
                    <VisualBox label="Setelan Bahasa">
                        <div className="flex gap-4 w-full max-w-xs">
                            <button className="flex-1 px-3 py-2 text-sm font-bold bg-brutal-border text-brutal-bg border-2 border-brutal-border shadow-none translate-x-[2px] translate-y-[2px]">INDONESIA</button>
                            <button className="flex-1 px-3 py-2 text-sm font-bold bg-brutal-surface text-brutal-text border-2 border-brutal-border shadow-brutal">JAWA</button>
                        </div>
                    </VisualBox>
                    <VisualBox label="Default Text Field">
                        <table className="w-full text-xs font-mono border-2 border-brutal-border">
                            <thead>
                                <tr className="bg-brutal-accent text-brutal-white">
                                    <th className="p-2 border border-brutal-border">Indonesia</th>
                                    <th className="p-2 border border-brutal-border">Jawa</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-brutal-surface text-brutal-text">
                                    <td className="p-2 border border-brutal-border">Demikianlah sabda Tuhan...</td>
                                    <td className="p-2 border border-brutal-border">Makaten sabda Dalem Gusti...</td>
                                </tr>
                                <tr className="bg-brutal-bg text-brutal-text">
                                    <td className="p-2 border border-brutal-border">Syukur kepada Allah</td>
                                    <td className="p-2 border border-brutal-border">Sembah nyuwun konjuk ing Gusti</td>
                                </tr>
                            </tbody>
                        </table>
                    </VisualBox>
                </SubSection>

                <SubSection title={content.step1SubBTitle}>
                    <p>{content.step1SubBDesc}</p>
                    <VisualBox label="Tipe Misa">
                         <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                            <div className="flex items-center p-2 border-2 border-brutal-border bg-brutal-surface shadow-brutal">
                                <div className="w-4 h-4 border-2 border-brutal-border rounded-full bg-brutal-border"></div>
                                <span className="ml-2 font-bold text-xs uppercase">Harian</span>
                            </div>
                            <div className="flex items-center p-2 border-2 border-brutal-border bg-brutal-border text-brutal-bg">
                                <div className="w-4 h-4 border-2 border-brutal-bg rounded-full bg-brutal-bg"></div>
                                <span className="ml-2 font-bold text-xs uppercase">Mingguan</span>
                            </div>
                        </div>
                    </VisualBox>
                </SubSection>
            </Section>

            {/* Step 2: Setup */}
            <Section title={content.step2Title} icon={<DocumentIcon className="w-6 h-6"/>}>
                <p className="font-bold">{content.step2Intro}</p>

                <SubSection title={content.step2SubATitle}>
                    <p>{content.step2SubADesc}</p>
                    <VisualBox label="Nama File">
                        <div className="w-full">
                            <label className="text-xs font-bold uppercase mb-1 block">Nama File</label>
                            <input 
                                type="text" 
                                disabled 
                                value="[Tahun C] Mingguan - Bahasa Indonesia - Minggu Biasa I (27 04 24)"
                                className="w-full bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-xs text-brutal-text"
                            />
                        </div>
                    </VisualBox>
                </SubSection>

                <SubSection title={content.step2SubBTitle}>
                    <p>{content.step2SubBDesc}</p>
                    <VisualBox label="Upload Template">
                        <div className="flex flex-col items-center justify-center w-full h-24 border-4 border-brutal-border border-dashed bg-brutal-surface/50">
                            <UploadIcon className="w-6 h-6 mb-2 text-brutal-text" />
                            <p className="text-xs font-bold uppercase bg-brutal-border text-brutal-bg px-1">PPTX ONLY</p>
                        </div>
                    </VisualBox>
                    <div className="flex justify-center mt-2">
                         <a href="https://gofile.me/7hwA8/XNJr9xEgj" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2 px-4 font-bold bg-brutal-accent text-brutal-white border-2 border-brutal-border hover:bg-brutal-border hover:text-brutal-bg transition-colors shadow-brutal">
                            <DownloadIcon className="w-4 h-4"/>
                            {content.downloadTemplateBtn}
                        </a>
                    </div>
                </SubSection>
            </Section>

            {/* Step 3: Start Working */}
            <Section title={content.step3Title} icon={<PresentationIcon className="w-6 h-6"/>}>
                <p className="font-bold">{content.step3Intro}</p>

                <SubSection title={content.step3SubATitle}>
                    <p>{content.step3SubADesc}</p>
                    <VisualBox label="Text Field">
                         <div className="w-full bg-brutal-surface p-2 border-2 border-brutal-border space-y-2">
                            <div className="flex justify-between items-center border-b-2 border-brutal-border pb-1">
                                <span className="font-bold uppercase text-xs">Bacaan I</span>
                                <div className="flex gap-1">
                                    <div className="w-4 h-4 border border-brutal-border bg-brutal-border"></div>
                                    <div className="w-4 h-4 border border-brutal-border"></div>
                                </div>
                            </div>
                            <div className="h-16 w-full bg-brutal-bg border border-brutal-border p-1 font-mono text-[10px]">
                                Pembacaan dari Kitab...
                            </div>
                        </div>
                    </VisualBox>

                    <h5 className="font-bold border-b border-brutal-border inline-block mt-2 mb-1">{content.step3ParaTitle}</h5>
                    {renderEnrichedText(content.step3ParaDesc)}
                    <VisualBox label="Before / After">
                        <div className="grid grid-cols-2 gap-4 w-full text-[10px] font-mono">
                            <div className="border border-brutal-border p-2 bg-brutal-bg">
                                <div className="font-bold mb-1 border-b border-brutal-border">Before</div>
                                Line 1 text<br/>
                                Line 2 text<br/>
                                Line 3 text
                            </div>
                            <div className="border border-brutal-border p-2 bg-brutal-bg">
                                <div className="font-bold mb-1 border-b border-brutal-border">After</div>
                                Line 1 text Line 2 text Line 3 text
                            </div>
                        </div>
                    </VisualBox>
                    
                    <h5 className="font-bold border-b border-brutal-border inline-block mt-4 mb-1">{content.step3OcrTitle}</h5>
                    {renderEnrichedText(content.step3OcrDesc)}
                    <VisualBox label="Image-to-Text">
                         <div className="w-full max-w-xs bg-brutal-surface border-2 border-brutal-border p-2 space-y-2 pointer-events-none select-none">
                            <div className="border-b-2 border-brutal-border pb-1">
                                <span className="text-[10px] font-bold uppercase bg-brutal-accent text-brutal-white px-1 border border-brutal-border">UPLOAD IMAGE. BOOM! TEXT.</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between border border-brutal-border p-1 text-[10px] bg-brutal-bg">
                                    <span>image_1.png</span>
                                    <div className="flex gap-0.5">
                                        <div className="w-3 h-3 border border-brutal-border flex items-center justify-center"><ArrowUpIcon className="w-2 h-2"/></div>
                                        <div className="w-3 h-3 border border-brutal-border flex items-center justify-center"><ArrowDownIcon className="w-2 h-2"/></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border border-brutal-border p-1 text-[10px] bg-brutal-bg">
                                    <span>image_2.png</span>
                                    <div className="flex gap-0.5">
                                        <div className="w-3 h-3 border border-brutal-border flex items-center justify-center"><ArrowUpIcon className="w-2 h-2"/></div>
                                        <div className="w-3 h-3 border border-brutal-border flex items-center justify-center"><ArrowDownIcon className="w-2 h-2"/></div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full py-1 bg-brutal-accent text-brutal-white border border-brutal-border text-[10px] font-bold text-center flex items-center justify-center gap-1">
                                <ScanIcon className="w-3 h-3"/> SCAN IMAGES
                            </div>
                             <div className="h-10 w-full bg-brutal-bg border border-brutal-border p-1 font-mono text-[8px]">
                                Scanned text result...
                            </div>
                             <div className="w-full py-1 bg-brutal-surface text-brutal-text border border-brutal-border text-[10px] font-bold text-center">
                                INSERT TEXT
                            </div>
                         </div>
                    </VisualBox>

                </SubSection>

                <SubSection title={content.step3SubBTitle}>
                    <p>{content.step3SubBDesc}</p>
                    <VisualBox label="Image Field">
                        <div className="w-full h-16 border-2 border-brutal-border bg-brutal-surface flex items-center justify-center pointer-events-none select-none">
                            <div className="flex items-center gap-2 opacity-70">
                                <UploadIcon className="w-4 h-4"/>
                                <span className="font-bold text-xs uppercase">Upload Image</span>
                            </div>
                        </div>
                        <div className="w-full mt-2 bg-brutal-surface border-2 border-brutal-border p-2 flex justify-between items-center shadow-brutal-sm pointer-events-none select-none">
                            <span className="font-mono text-xs truncate">lagu_misa.png</span>
                            <div className="flex gap-1">
                                <div className="p-1 border border-brutal-border hover:bg-brutal-accent/10"><PencilIcon className="w-3 h-3"/></div>
                                <div className="p-1 border border-brutal-border hover:bg-brutal-bg"><ContrastIcon className="w-3 h-3"/></div>
                                <div className="p-1 border border-brutal-border bg-red-500 text-white"><TrashIcon className="w-3 h-3"/></div>
                            </div>
                        </div>
                    </VisualBox>

                    <h5 className="font-bold border-b border-brutal-border inline-block mt-4 mb-1">{content.step3MultiCropTitle}</h5>
                    <p>{content.step3MultiCropDesc}</p>
                    <VisualBox label="Multi-Crop Editor">
                         <div className="w-full aspect-video bg-brutal-bg border-2 border-brutal-border relative">
                            {/* Fake Image Content */}
                            <div className="absolute inset-4 border-2 border-dashed border-brutal-border opacity-30"></div>
                            
                            {/* Crop Box 1 */}
                            <div className="absolute top-4 left-4 w-1/2 h-1/3 border-2 border-brutal-accent bg-brutal-accent/10">
                                <div className="absolute -top-2 -left-2 bg-brutal-accent text-white text-[10px] px-1">#1</div>
                            </div>

                            {/* Crop Box 2 */}
                             <div className="absolute bottom-4 right-4 w-1/3 h-1/3 border-2 border-brutal-accent bg-brutal-accent/10">
                                <div className="absolute -top-2 -left-2 bg-brutal-accent text-white text-[10px] px-1">#2</div>
                            </div>

                             {/* Controls */}
                            <div className="absolute top-0 right-0 p-2 flex gap-1">
                                <button className="bg-brutal-surface border border-brutal-border px-1 text-[10px] font-bold flex items-center gap-1"><CropIcon className="w-3 h-3"/> Add Box</button>
                            </div>
                        </div>
                    </VisualBox>

                    <p className="mt-2">{content.step3AddSlideDesc}</p>
                    <VisualBox label="Slide Management">
                        <div className="flex gap-2 w-full overflow-x-auto p-1">
                            <div className="px-3 py-1 bg-brutal-border text-brutal-bg border-2 border-brutal-border font-bold text-xs whitespace-nowrap">Slide 1</div>
                            <div className="px-3 py-1 bg-brutal-surface text-brutal-text border-2 border-brutal-border font-bold text-xs whitespace-nowrap">Slide 2</div>
                            <div className="w-6 h-6 bg-brutal-accent text-white border-2 border-brutal-border flex items-center justify-center shadow-brutal-sm"><PlusIcon className="w-4 h-4"/></div>
                        </div>
                    </VisualBox>
                    
                    <h5 className="font-bold border-b border-brutal-border inline-block mt-4 mb-1">{content.step3InvertTitle}</h5>
                    <p>{content.step3InvertDesc}</p>
                </SubSection>
            </Section>

            {/* Step 4: Done */}
            <Section title={content.step4Title} icon={<DownloadIcon className="w-6 h-6"/>}>
                <p>{content.step4Desc}</p>
                <VisualBox>
                     <button className="w-full max-w-xs py-3 px-6 text-base font-black uppercase bg-brutal-accent text-brutal-white border-4 border-brutal-border shadow-brutal flex items-center justify-center gap-2 pointer-events-none select-none">
                        <DownloadIcon className="w-5 h-5"/> Generate & Download
                    </button>
                </VisualBox>

                <div className="bg-brutal-surface text-brutal-text p-4 border-4 border-brutal-border mt-4 shadow-brutal">
                    <p className="font-black uppercase bg-red-500 text-brutal-white inline-block px-2 border-2 border-brutal-border mb-2">{content.importantTitle}</p>
                    <p className="font-medium">{content.importantDesc}</p>
                </div>
            </Section>
        </div>
    );
};
