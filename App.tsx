
import React, { useState, useCallback, useEffect } from 'react';
import { Language, PresentationData, MassType } from './types';
import { translations } from './i18n';
import { processTemplate } from './services/pptTemplater';
import { PresentationIcon, SparklesIcon, LoaderIcon, DownloadIcon, AlertTriangleIcon, ImageIcon, TextIcon, InfoIcon, ParagraphIcon, ArrowLeftIcon, ArrowRightIcon, SlidersIcon } from './components/icons';
import { FileUpload } from './components/FileUpload';
import { Modal } from './components/Modal';
import { TemplateCreationGuide } from './components/TemplateCreationGuide';
import { TutorialGuide } from './components/TutorialGuide';
import { DropdownMenu } from './components/DropdownMenu';
import { SettingsModal } from './components/SettingsModal';
import { DevlogModal } from './components/DevlogModal';
import { DataEntryWorkflow } from './components/DataEntryWorkflow';


type InputType = 'text' | 'image' | 'multi-image';
type FormField = {
    key: string;
    label: string;
    types: InputType[];
    optional?: boolean;
};

const formConfig: FormField[] = [
    { key: 'laguPembuka', label: 'Lagu Pembuka', types: ['text', 'multi-image'] },
    { key: 'tuhanKasihanilahKami1', label: 'Tuhan Kasihanilah Kami I', types: ['text'] },
    { key: 'tuhanKasihanilahKami2', label: 'Tuhan Kasihanilah Kami II', types: ['text'] },
    { key: 'tuhanKasihanilahKami3', label: 'Tuhan Kasihanilah Kami III', types: ['text'] },
    { key: 'doaKolekta', label: 'Doa Kolekta', types: ['text'] },
    { key: 'bacaan1', label: 'Bacaan I', types: ['text'] },
    { key: 'mazmurTanggapanRefren', label: 'Mazmur Tanggapan (Refren)', types: ['text', 'multi-image'] },
    { key: 'mazmurTanggapanAyat1', label: 'Mazmur Tanggapan (Ayat I)', types: ['text', 'multi-image'] },
    { key: 'mazmurTanggapanAyat2', label: 'Mazmur Tanggapan (Ayat II)', types: ['text', 'multi-image'] },
    { key: 'mazmurTanggapanAyat3', label: 'Mazmur Tanggapan (Ayat III)', types: ['text', 'multi-image'], optional: true },
    { key: 'bacaan2', label: 'Bacaan II', types: ['text'] },
    { key: 'baitPengantarInjilRefren', label: 'Bait Pengantar Injil (Refren)', types: ['multi-image'] },
    { key: 'baitPengantarInjilAyat', label: 'Bait Pengantar Injil (Ayat)', types: ['text', 'multi-image'] },
    { key: 'bacaanInjil', label: 'Bacaan Injil', types: ['text'] },
    { key: 'doaUmat1Imam', label: 'Doa Umat I (Imam)', types: ['text'] },
    { key: 'doaUmat2Lektor', label: 'Doa Umat II (Lektor)', types: ['text'] },
    { key: 'doaUmat3Lektor', label: 'Doa Umat III (Lektor)', types: ['text'] },
    { key: 'doaUmat4Lektor', label: 'Doa Umat IV (Lektor)', types: ['text'] },
    { key: 'doaUmat5Lektor', label: 'Doa Umat V (Lektor)', types: ['text'] },
    { key: 'doaUmat6Lektor', label: 'Doa Umat VI (Lektor)', types: ['text'] },
    { key: 'doaUmat7Lektor', label: 'Doa Umat VII (Lektor)', types: ['text'] },
    { key: 'doaUmat8Lektor', label: 'Doa Umat VIII (Lektor)', types: ['text'], optional: true },
    { key: 'doaUmat9Lektor', label: 'Doa Umat IX (Lektor)', types: ['text'], optional: true },
    { key: 'doaUmat10Lektor', label: 'Doa Umat X (Lektor)', types: ['text'], optional: true },
    { key: 'doaUmat11Imam', label: 'Doa Umat XI (Imam)', types: ['text'] },
    { key: 'doaUmatJawabanUmat', label: 'Doa Umat (Jawaban Umat)', types: ['text'] },
    { key: 'laguPersembahan', label: 'Lagu Persembahan', types: ['text', 'multi-image'] },
    { key: 'doaAtasPersembahan', label: 'Doa Atas Persembahan', types: ['text'] },
    { key: 'laguKomuni', label: 'Lagu Komuni', types: ['text', 'multi-image'] },
    { key: 'laguKomuni2', label: 'Lagu Komuni II', types: ['text', 'multi-image'], optional: true },
    { key: 'laguKomuni3', label: 'Lagu Komuni III', types: ['text', 'multi-image'], optional: true },
    { key: 'doaSesudahKomuni', label: 'Doa Sesudah Komuni', types: ['text'] },
    { key: 'laguPenutup', label: 'Lagu Penutup', types: ['text', 'multi-image'] },
];

const defaultTitlesIndonesia: PresentationData = {
    laguPembukaTitle: '(umat berdiri) NYANYIAN PERARAKAN MASUK',
    tuhanKasihanilahKami1Title: 'TUHAN KASIHANILAH KAMI',
    tuhanKasihanilahKami2Title: 'TUHAN KASIHANILAH KAMI',
    tuhanKasihanilahKami3Title: 'TUHAN KASIHANILAH KAMI',
    doaKolektaTitle: '(umat berdiri) DOA KOLEKTA',
    bacaan1Title: '(umat duduk) BACAAN I | (Sumber)',
    mazmurTanggapanRefrenTitle: '(umat duduk) MAZMUR TANGGAPAN',
    mazmurTanggapanAyat1Title: '(umat duduk) MAZMUR TANGGAPAN',
    mazmurTanggapanAyat2Title: '(umat duduk) MAZMUR TANGGAPAN',
    mazmurTanggapanAyat3Title: '(umat duduk) MAZMUR TANGGAPAN',
    bacaan2Title: '(umat duduk) BACAAN II | (Sumber)',
    baitPengantarInjilRefrenTitle: '(umat berdiri) BAIT PENGANTAR INJIL',
    baitPengantarInjilAyatTitle: '(umat berdiri) BAIT PENGANTAR INJIL',
    bacaanInjilTitle: '(umat duduk) BACAAN INJIL | (Sumber)',
    doaUmat1ImamTitle: '(umat berdiri) DOA UMAT',
    doaUmat2LektorTitle: '(umat berdiri) DOA UMAT',
    doaUmat3LektorTitle: '(umat berdiri) DOA UMAT',
    doaUmat4LektorTitle: '(umat berdiri) DOA UMAT',
    doaUmat5LektorTitle: '(umat berdiri) DOA UMAT',
    doaUmat6LektorTitle: '(umat berdiri) DOA UMAT',
    doaUmat7LektorTitle: '(umat berdiri) DOA UMAT',
    doaUmat8LektorTitle: '(umat berdiri) DOA UMAT',
    doaUmat9LektorTitle: '(umat berdiri) DOA UMAT',
    doaUmat10LektorTitle: '(umat berdiri) DOA UMAT',
    doaUmat11ImamTitle: '(umat berdiri) DOA UMAT',
    doaUmatJawabanUmatTitle: '(umat berdiri) DOA UMAT',
    laguPersembahanTitle: '(umat duduk) NYANYIAN PERSEMBAHAN',
    doaAtasPersembahanTitle: '(umat berdiri) DOA ATAS PERSEMBAHAN',
    laguKomuniTitle: '(umat duduk) MADAH PUJIAN',
    laguKomuni2Title: '(umat duduk) MADAH PUJIAN',
    laguKomuni3Title: '(umat duduk) MADAH PUJIAN',
    doaSesudahKomuniTitle: '(umat berdiri) DOA SESUDAH KOMUNI',
    laguPenutupTitle: '(umat berdiri) NYANYIAN PERARAKAN KELUAR',
};

const defaultTitlesJawa: PresentationData = {
    laguPembukaTitle: '(umat jumeneng) KIDUNG ARAK-ARAKAN MLEBET',
    tuhanKasihanilahKami1Title: 'GUSTI NYUWUN KAWELASAN',
    tuhanKasihanilahKami2Title: 'GUSTI NYUWUN KAWELASAN',
    tuhanKasihanilahKami3Title: 'GUSTI NYUWUN KAWELASAN',
    doaKolektaTitle: '(umat jumeneng) SEMBAHYANGAN KOLEKTA',
    bacaan1Title: '(umat lenggah) WAOSAN I | (Sumber)',
    mazmurTanggapanRefrenTitle: '(umat lenggah) KIDUNG PANGLIMBANG',
    mazmurTanggapanAyat1Title: '(umat lenggah) KIDUNG PANGLIMBANG',
    mazmurTanggapanAyat2Title: '(umat lenggah) KIDUNG PANGLIMBANG',
    mazmurTanggapanAyat3Title: '(umat lenggah) KIDUNG PANGLIMBANG',
    bacaan2Title: '(umat lenggah) WAOSAN II | (Sumber)',
    baitPengantarInjilRefrenTitle: '(umat jumeneng) KIDUNG CECELA',
    baitPengantarInjilAyatTitle: '(umat jumeneng) KIDUNG CECELA',
    bacaanInjilTitle: '(umat jumeneng) INJIL SUCI | (Sumber)',
    doaUmat1ImamTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat2LektorTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat3LektorTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat4LektorTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat5LektorTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat6LektorTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat7LektorTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat8LektorTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat9LektorTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat10LektorTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmat11ImamTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    doaUmatJawabanUmatTitle: '(umat jumeneng) SEMBAHYANGAN UMAT',
    laguPersembahanTitle: '(umat lenggah) KIDUNG CECAWIS PISUNGSUNG',
    doaAtasPersembahanTitle: '(umat jumeneng) SEMBAHYANGAN CECAWIS PISUNGSUNG',
    laguKomuniTitle: '(umat lenggah) KIDUNG PUJIAN',
    laguKomuni2Title: '(umat lenggah) KIDUNG PUJIAN',
    laguKomuni3Title: '(umat lenggah) KIDUNG PUJIAN',
    doaSesudahKomuniTitle: '(umat jumeneng) SEMBAHYANGAN BAKDA KOMUNI',
    laguPenutupTitle: '(umat jumeneng) KIDUNG PANUTUP',
};


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const StepContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="animate-[fadeIn_0.5s_ease-in-out]">{children}</div>
);

type HarianSections = 'showLaguPembuka' | 'showTuhanKasihanilahKami' | 'showDoaKolekta' | 'showBacaan2' | 'showDoaUmat' | 'showLaguPersembahan' | 'showLaguKomuni' | 'showDoaSesudahKomuni' | 'showLaguPenutup';

const optionalSectionsConfig: { key: HarianSections; label: string }[] = [
    { key: 'showLaguPembuka', label: 'Lagu Pembuka' },
    { key: 'showTuhanKasihanilahKami', label: 'Tuhan Kasihanilah Kami' },
    { key: 'showDoaKolekta', label: 'Doa Kolekta' },
    { key: 'showBacaan2', label: 'Bacaan II' },
    { key: 'showDoaUmat', label: 'Doa Umat' },
    { key: 'showLaguPersembahan', label: 'Lagu Persembahan' },
    { key: 'showLaguKomuni', label: 'Lagu Komuni' },
    { key: 'showDoaSesudahKomuni', label: 'Doa Sesudah Komuni' },
    { key: 'showLaguPenutup', label: 'Lagu Penutup' },
];


const App: React.FC = () => {
    const [massLanguage, setMassLanguage] = useState<Language>('indonesia');
    const [massType, setMassType] = useState<MassType>('mingguan');
    const [presentationData, setPresentationData] = useState<PresentationData>(defaultTitlesIndonesia);
    const [inputModes, setInputModes] = useState<{ [key: string]: 'text' | 'image' }>({});
    const [uploadedTemplate, setUploadedTemplate] = useState<File | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDevlogOpen, setIsDevlogOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    
    // Theming and Language State
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [accentColor, setAccentColor] = useState('sky');
    
    const [harianOptionalSections, setHarianOptionalSections] = useState({
        showLaguPembuka: false,
        showTuhanKasihanilahKami: false,
        showDoaKolekta: false,
        showBacaan2: false,
        showDoaUmat: false,
        showLaguPersembahan: false,
        showLaguKomuni: false,
        showDoaSesudahKomuni: false,
        showLaguPenutup: false,
    });
    
    const handleHarianToggle = (section: HarianSections) => {
        setHarianOptionalSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };


    const t = useCallback((key: string) => {
        return translations.indonesia[key] || key;
    }, []);

    const massOptions: { category: string; options: { id: MassType; label: string; enabled: boolean }[] }[] = [
        {
            category: t('mingguBiasa'),
            options: [
                { id: 'harian', label: 'Harian', enabled: true },
                { id: 'mingguan', label: 'Mingguan', enabled: true },
            ],
        },
        {
            category: t('misaKhusus'),
            options: [
                { id: 'manten', label: 'Misa Manten', enabled: false },
                { id: 'memule', label: 'Misa Memule', enabled: false },
            ],
        },
        {
            category: t('hariRaya'),
            options: [
                { id: 'natal', label: 'Natal', enabled: false },
                { id: 'kamisPutih', label: 'Kamis Putih', enabled: false },
                { id: 'jumatAgung', label: 'Jumat Agung', enabled: false },
                { id: 'malamPaskah', label: 'Malam Paskah', enabled: false },
            ]
        },
        {
            category: t('lainnya'),
            options: [
                 { id: 'dataEntry', label: t('dataEntry'), enabled: true },
            ]
        }
    ];

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);
    
    useEffect(() => {
        document.documentElement.dataset.accent = accentColor;
    }, [accentColor]);

     useEffect(() => {
        const newDefaults = massLanguage === 'jawa' ? defaultTitlesJawa : defaultTitlesIndonesia;
        const typeText = massType.charAt(0).toUpperCase() + massType.slice(1);
        const langText = massLanguage === 'indonesia' ? 'Bahasa Indonesia' : 'Bahasa Jawa';
        const newTitle = `[Tahun C] ${typeText} - ${langText} - Minggu Biasa I (27 04 07)`;
        
        // Only reset fields, keep the generated title
        setPresentationData(prev => ({ ...newDefaults, presentationTitle: prev.presentationTitle || newTitle }));

    }, [massLanguage, massType]);

    useEffect(() => {
        const typeText = massType.charAt(0).toUpperCase() + massType.slice(1);
        const langText = massLanguage === 'indonesia' ? 'Bahasa Indonesia' : 'Bahasa Jawa';
        const newTitle = `[Tahun C] ${typeText} - ${langText} - Minggu Biasa I (27 04 07)`;
        setPresentationData(prev => ({ ...prev, presentationTitle: newTitle }));
    }, [massLanguage, massType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPresentationData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (key: string, files: File | File[]) => {
        const fileArray = Array.isArray(files) ? files : [files];
        setUploadedFiles(prev => ({ ...prev, [key]: fileArray }));

        if (fileArray.length === 0) {
             setPresentationData(prev => ({ ...prev, [`${key}Images`]: [] }));
             return;
        }
        const base64Files = await Promise.all(fileArray.map(fileToBase64));
        setPresentationData(prev => ({ ...prev, [`${key}Images`]: base64Files }));
    };

    const handleFileRemove = async (key: string, fileNameToRemove: string) => {
        const newFiles = (uploadedFiles[key] || []).filter(f => f.name !== fileNameToRemove);
        setUploadedFiles(prev => ({ ...prev, [key]: newFiles }));

        if (newFiles.length === 0) {
            setPresentationData(prev => ({ ...prev, [`${key}Images`]: [] }));
            return;
        }
        const base64Files = await Promise.all(newFiles.map(fileToBase64));
        setPresentationData(prev => ({ ...prev, [`${key}Images`]: base64Files }));
    };

    const handleTemplateUpload = (file: File | File[]) => {
        const templateFile = Array.isArray(file) ? file[0] : file;
        if (templateFile) {
            setUploadedTemplate(templateFile);
        }
    }
    
    const handleTemplateRemove = () => {
        setUploadedTemplate(null);
    };

    const handleModeChange = (key: string, mode: 'text' | 'image') => {
        setInputModes(prev => ({...prev, [key]: mode}));
    }

    const handleParagraphify = (key: string) => {
        setPresentationData(prev => {
            const currentText = (prev as any)[key] || '';
            const paragraphedText = currentText.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
            return { ...prev, [key]: paragraphedText };
        });
    };

    const handleGenerate = useCallback(async () => {
        if (!uploadedTemplate) {
            setError("Please upload a PowerPoint template.");
            return;
        }
        if (!presentationData.presentationTitle || presentationData.presentationTitle.trim() === '') {
            setError("Please provide a title for the presentation.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            setStatusMessage("Reading template and processing content...");
            await processTemplate(presentationData, uploadedTemplate, massLanguage);
            setStatusMessage("Presentation downloaded successfully!");
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Generation failed: ${errorMessage}`);
            setStatusMessage('');
        } finally {
            setIsLoading(false);
        }
    }, [presentationData, uploadedTemplate, massLanguage]);
    
    const isGenerateDisabled = !uploadedTemplate || !presentationData.presentationTitle || isLoading;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-0 -left-1/4 w-96 h-96 sm:w-[32rem] sm:h-[32rem] lg:w-[48rem] lg:h-[48rem] bg-[var(--accent-color-500)]/30 rounded-full filter blur-3xl opacity-50 animate-[blob_7s_infinite]"></div>
                <div className="absolute bottom-0 -right-1/4 w-96 h-96 sm:w-[32rem] sm:h-[32rem] lg:w-[48rem] lg:h-[48rem] bg-pink-500/30 rounded-full filter blur-3xl opacity-50 animate-[blob_10s_infinite_4s]"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center p-4 sm:p-6 lg:p-8 min-h-screen overflow-y-auto hide-scrollbar">
                <div className="w-full max-w-4xl mx-auto">
                    <header className="flex justify-between items-start mb-8">
                        <div className="text-left">
                             <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color-400)] to-[var(--accent-color-300)] mb-2">
                                Otomateks
                            </h1>
                            <p className="text-lg text-[var(--text-secondary)]">
                                {t('appSubtitle')}
                            </p>
                        </div>
                        <DropdownMenu onTutorialClick={() => setIsTutorialOpen(true)} onSettingsClick={() => setIsSettingsOpen(true)} onDevlogClick={() => setIsDevlogOpen(true)} t={t} />
                    </header>

                    <main className="space-y-6">
                        {currentStep === 1 && (
                             <StepContainer>
                                <div className="bg-[var(--bg-secondary)] backdrop-blur-lg p-6 rounded-2xl border border-[var(--border-primary)] space-y-8">
                                    {/* Language Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-[var(--accent-color-400)]">
                                            {t('bahasa')}
                                        </h3>
                                        <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] p-1 rounded-lg">
                                            <button 
                                                onClick={() => setMassLanguage('indonesia')} 
                                                className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 ${massLanguage === 'indonesia' ? 'bg-[var(--accent-color-500)] text-white shadow-lg shadow-[var(--accent-color-500)]/20' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                                            >
                                                Indonesia
                                            </button>
                                            <button 
                                                onClick={() => setMassLanguage('jawa')} 
                                                className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 ${massLanguage === 'jawa' ? 'bg-[var(--accent-color-500)] text-white shadow-lg shadow-[var(--accent-color-500)]/20' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}
                                            >
                                                Jawa
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mass Type Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-[var(--accent-color-400)]">
                                            {t('tipeMisa')}
                                        </h3>
                                        <div className="space-y-4">
                                            {massOptions.map((group) => (
                                                <div key={group.category}>
                                                    <p className="text-sm font-bold text-[var(--text-secondary)] mb-2">{group.category}</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {group.options.map((option) => (
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
                                                                    onChange={() => setMassType(option.id as MassType)}
                                                                    disabled={!option.enabled}
                                                                    className="w-4 h-4 text-[var(--accent-color-500)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] focus:ring-[var(--accent-color-600)] disabled:opacity-50"
                                                                />
                                                                <span className="ml-3 text-sm font-medium text-[var(--text-primary)]">{option.label}</span>
                                                                {!option.enabled && <span className="ml-auto text-xs text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">Coming Soon</span>}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button onClick={() => setCurrentStep(2)} className="flex items-center justify-center p-3 rounded-lg font-semibold bg-[var(--accent-color-500)] text-white hover:bg-[var(--accent-color-600)] transition-all transform hover:scale-105" aria-label={t('nextButton')}>
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </StepContainer>
                        )}
                        
                        {currentStep === 2 && (
                             <StepContainer>
                                {massType === 'dataEntry' ? (
                                    <>
                                        <DataEntryWorkflow presentationTitle={presentationData.presentationTitle || ''} />
                                        <div className="flex justify-start pt-4">
                                            <button onClick={() => setCurrentStep(1)} className="flex items-center justify-center p-3 rounded-lg font-semibold bg-transparent border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)] transition-all" aria-label={t('backButton')}>
                                                <ArrowLeftIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-[var(--bg-secondary)] backdrop-blur-lg p-6 rounded-2xl border border-[var(--border-primary)] space-y-6">
                                        <div>
                                            <label htmlFor="presentationTitle" className="block text-lg font-bold text-[var(--accent-color-400)] mb-2">
                                                {t('namaFile')}
                                            </label>
                                            <input
                                                type="text"
                                                id="presentationTitle"
                                                name="presentationTitle"
                                                value={presentationData.presentationTitle || ''}
                                                onChange={handleInputChange}
                                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color-500)] focus:border-[var(--accent-color-500)] transition"
                                                placeholder={t('mainTitlePlaceholder')}
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-[var(--accent-color-400)] mb-2">
                                                {t('uploadTemplateTitle')}
                                            </h2>
                                            <FileUpload
                                                id="template-upload"
                                                onFileSelect={handleTemplateUpload}
                                                accept=".pptx"
                                                label={t('uploadTemplateLabel')}
                                                files={uploadedTemplate ? [uploadedTemplate] : []}
                                                onFileRemove={handleTemplateRemove}
                                            />
                                        </div>

                                        <div className="flex justify-between pt-6">
                                            <button onClick={() => setCurrentStep(1)} className="flex items-center justify-center p-3 rounded-lg font-semibold bg-transparent border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)] transition-all" aria-label={t('backButton')}>
                                                <ArrowLeftIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setCurrentStep(3)} 
                                                disabled={!uploadedTemplate}
                                                className={`flex items-center justify-center p-3 rounded-lg font-semibold text-white transition-all ${!uploadedTemplate ? 'bg-gray-500 cursor-not-allowed' : 'bg-[var(--accent-color-500)] hover:bg-[var(--accent-color-600)] transform hover:scale-105'}`} 
                                                aria-label={t('nextButton')}
                                            >
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </StepContainer>
                        )}
                        
                        {currentStep === 3 && massType !== 'dataEntry' && (
                            <StepContainer>
                                <div className="bg-[var(--bg-secondary)] backdrop-blur-lg p-6 rounded-2xl border border-[var(--border-primary)] space-y-6">
                                    {massType === 'harian' && (
                                        <details className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-primary)] group">
                                            <summary className="font-semibold text-[var(--accent-color-400)] cursor-pointer list-none flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <SlidersIcon className="w-4 h-4" />
                                                    Optional Sections
                                                </div>
                                                <svg className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </summary>
                                            <div className="mt-4 pt-4 border-t border-[var(--border-secondary)] grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {optionalSectionsConfig.map(section => (
                                                    <label key={section.key} className="flex items-center space-x-2 cursor-pointer text-sm">
                                                        <div className="relative">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer"
                                                                checked={harianOptionalSections[section.key]}
                                                                onChange={() => handleHarianToggle(section.key)}
                                                            />
                                                            <div className="w-10 h-6 rounded-full bg-[var(--bg-tertiary)] peer-checked:bg-[var(--accent-color-500)] transition-colors"></div>
                                                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                                                        </div>
                                                        <span className="text-[var(--text-secondary)]">{section.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </details>
                                    )}

                                    <div className="space-y-6">
                                        {formConfig
                                            .filter(field => {
                                                if (massType !== 'harian') return true;
                                                
                                                if (field.key === 'laguPembuka') return harianOptionalSections.showLaguPembuka;
                                                if (field.key.startsWith('tuhanKasihanilahKami')) return harianOptionalSections.showTuhanKasihanilahKami;
                                                if (field.key === 'doaKolekta') return harianOptionalSections.showDoaKolekta;
                                                if (field.key === 'bacaan2') return harianOptionalSections.showBacaan2;
                                                if (field.key.startsWith('doaUmat')) return harianOptionalSections.showDoaUmat;
                                                if (field.key === 'laguPersembahan') return harianOptionalSections.showLaguPersembahan;
                                                if (field.key.startsWith('laguKomuni')) return harianOptionalSections.showLaguKomuni;
                                                if (field.key === 'doaSesudahKomuni') return harianOptionalSections.showDoaSesudahKomuni;
                                                if (field.key === 'laguPenutup') return harianOptionalSections.showLaguPenutup;

                                                return true; // Show field if it's not in the optional list
                                            })
                                            .map((field) => {
                                                const titleKey = `${field.key}Title`;
                                                const textKey = `${field.key}Text`;
                                                const imagesKey = `${field.key}Images`;
                                                const defaultMode = field.types.includes('text') ? 'text' : 'image';
                                                const currentMode = inputModes[field.key] || defaultMode;
                                                const isMultiImage = field.types.includes('multi-image');

                                                return (
                                                <div key={field.key} className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-primary)] space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-bold text-[var(--accent-color-400)]">{field.label}</h3>
                                                        {field.types.length > 1 && (
                                                            <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-md">
                                                                <button onClick={() => handleModeChange(field.key, 'text')} className={`p-1.5 rounded transition ${currentMode === 'text' ? 'bg-[var(--accent-color-500)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`} aria-label="Switch to Text Mode"><TextIcon className="w-4 h-4"/></button>
                                                                <button onClick={() => handleModeChange(field.key, 'image')} className={`p-1.5 rounded transition ${currentMode === 'image' ? 'bg-[var(--accent-color-500)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`} aria-label="Switch to Image Mode"><ImageIcon className="w-4 h-4"/></button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <label htmlFor={titleKey} className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Title</label>
                                                            <input
                                                                type="text"
                                                                id={titleKey}
                                                                name={titleKey}
                                                                value={(presentationData as any)[titleKey] || ''}
                                                                onChange={handleInputChange}
                                                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md px-3 py-2 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent-color-500)] focus:border-[var(--accent-color-500)] transition"
                                                            />
                                                        </div>
                                                        {currentMode === 'text' ? (
                                                            <div>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <label htmlFor={textKey} className="block text-xs font-medium text-[var(--text-secondary)]">Text</label>
                                                                    <button onClick={() => handleParagraphify(textKey)} title="Paragraphify" className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition" aria-label="Paragraphify Text">
                                                                        <ParagraphIcon className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <textarea
                                                                    id={textKey}
                                                                    name={textKey}
                                                                    value={(presentationData as any)[textKey] || ''}
                                                                    onChange={handleInputChange}
                                                                    className="w-full h-32 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md px-3 py-2 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent-color-500)] focus:border-[var(--accent-color-500)] transition hide-scrollbar"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Image</label>
                                                                <FileUpload
                                                                    id={imagesKey}
                                                                    onFileSelect={(files) => handleFileChange(field.key, files)}
                                                                    multiple={isMultiImage}
                                                                    accept="image/*"
                                                                    label="Click to upload"
                                                                    files={uploadedFiles[field.key] || []}
                                                                    onFileRemove={(fileName) => handleFileRemove(field.key, fileName)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )})}
                                    </div>
                                     <div className="flex justify-between pt-4">
                                        <button onClick={() => setCurrentStep(2)} className="flex items-center justify-center p-3 rounded-lg font-semibold bg-transparent border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)] transition-all" aria-label={t('backButton')}>
                                            <ArrowLeftIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setCurrentStep(4)} className="flex items-center justify-center p-3 rounded-lg font-semibold bg-[var(--accent-color-500)] text-white hover:bg-[var(--accent-color-600)] transition-all transform hover:scale-105" aria-label={t('nextButton')}>
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </StepContainer>
                        )}

                        {currentStep === 4 && massType !== 'dataEntry' && (
                            <StepContainer>
                                 <div className="bg-[var(--bg-secondary)] backdrop-blur-lg p-6 rounded-2xl border border-[var(--border-primary)] text-center">
                                    <h2 className="text-2xl font-bold text-[var(--accent-color-400)] flex items-center gap-3 justify-center mb-4">{t('finalMessage')}</h2>
                                    <button 
                                        onClick={handleGenerate} 
                                        disabled={isGenerateDisabled}
                                        className={`w-full max-w-xs mx-auto py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out flex items-center justify-center gap-2
                                            ${isGenerateDisabled 
                                                ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                                                : 'bg-[var(--accent-color-500)] text-white hover:bg-[var(--accent-color-600)] shadow-lg shadow-[var(--accent-color-500)]/30 transform hover:scale-105'}`
                                        }>
                                        {isLoading ? <><LoaderIcon className="w-4 h-4" /> {t('generatingButton')}</> : <><DownloadIcon className="w-4 h-4"/> {t('generateButton')}</>}
                                    </button>
                                    <div className="flex justify-start pt-6">
                                        <button onClick={() => setCurrentStep(3)} className="flex items-center justify-center p-3 rounded-lg font-semibold bg-transparent border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)] transition-all" aria-label={t('backButton')}>
                                            <ArrowLeftIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                 <div className="h-10 text-center mt-6">
                                    {isLoading && (
                                        <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
                                            <LoaderIcon className="w-4 h-4"/>
                                            <p>{statusMessage}</p>
                                        </div>
                                    )}
                                    {!isLoading && statusMessage && !error && (
                                        <p className="text-green-400">{statusMessage}</p>
                                    )}
                                    {error && (
                                        <div className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                                            <AlertTriangleIcon className="w-4 h-4"/>
                                            <p>{error}</p>
                                        </div>
                                    )}
                                </div>
                            </StepContainer>
                        )}
                    </main>
                </div>
            </div>
            
            <Modal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} title="How to Create a PPTX Template">
                <TemplateCreationGuide />
            </Modal>

            <Modal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} title={t('tutorialModalTitle')}>
                <TutorialGuide massType={massType} appLanguage={'indonesia'}/>
            </Modal>

             <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title={t('settingsModalTitle')}>
                <SettingsModal
                    theme={theme}
                    onThemeChange={setTheme}
                    accentColor={accentColor}
                    onAccentColorChange={setAccentColor}
                    t={t}
                />
            </Modal>
            
            <Modal isOpen={isDevlogOpen} onClose={() => setIsDevlogOpen(false)} title={t('devlogModalTitle')}>
                <DevlogModal />
            </Modal>

             <style>{`
                :root {
                    --accent-color-100: #e0f2fe; --accent-color-200: #bae6fd; --accent-color-300: #7dd3fc; --accent-color-400: #38bdf8; --accent-color-500: #0ea5e9; --accent-color-600: #0284c7;
                }
                :root[data-accent="indigo"] {
                    --accent-color-100: #e0e7ff; --accent-color-200: #c7d2fe; --accent-color-300: #a5b4fc; --accent-color-400: #818cf8; --accent-color-500: #6366f1; --accent-color-600: #4f46e5;
                }
                :root[data-accent="pink"] {
                    --accent-color-100: #fce7f3; --accent-color-200: #fbcfe8; --accent-color-300: #f9a8d4; --accent-color-400: #f472b6; --accent-color-500: #ec4899; --accent-color-600: #db2777;
                }
                :root[data-accent="teal"] {
                    --accent-color-100: #ccfbf1; --accent-color-200: #99f6e4; --accent-color-300: #5eead4; --accent-color-400: #2dd4bf; --accent-color-500: #14b8a6; --accent-color-600: #0d9488;
                }
                :root[data-accent="green"] {
                    --accent-color-100: #dcfce7; --accent-color-200: #bbf7d0; --accent-color-300: #86efac; --accent-color-400: #4ade80; --accent-color-500: #22c55e; --accent-color-600: #16a34a;
                }
                 :root[data-accent="orange"] {
                    --accent-color-100: #ffedd5; --accent-color-200: #fed7aa; --accent-color-300: #fdba74; --accent-color-400: #fb923c; --accent-color-500: #f97316; --accent-color-600: #ea580c;
                }
                
                :root.dark {
                    --bg-primary: #0f172a;
                    --bg-secondary: rgba(30, 41, 59, 0.5);
                    --bg-tertiary: rgba(51, 65, 85, 0.5);
                    --bg-hover: rgba(71, 85, 105, 0.6);
                    --text-primary: #f1f5f9;
                    --text-secondary: #94a3b8;
                    --border-primary: rgba(51, 65, 85, 0.7);
                    --border-secondary: rgba(71, 85, 105, 0.5);
                }
                :root.light {
                    --bg-primary: #f1f5f9;
                    --bg-secondary: rgba(255, 255, 255, 0.5);
                    --bg-tertiary: rgba(226, 232, 240, 0.5);
                    --bg-hover: rgba(241, 245, 249, 0.7);
                    --text-primary: #0f172a;
                    --text-secondary: #475569;
                    --border-primary: rgba(203, 213, 225, 0.6);
                    --border-secondary: rgba(226, 232, 240, 0.7);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }

                .animate-\\[fadeIn_0\\.5s_ease-in-out\\] {
                    animation: fadeIn 0.5s ease-in-out;
                }
                 .animate-\\[blob_7s_infinite\\] {
                    animation: blob 7s infinite;
                }
                 .animate-\\[blob_10s_infinite_4s\\] {
                    animation: blob 10s infinite 4s;
                }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                body::-webkit-scrollbar { display: none; }
                body { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default App;
