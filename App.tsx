
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
import { ImageEditorModal } from './components/ImageEditorModal';


type InputType = 'text' | 'image' | 'multi-image';
type FormField = {
    label: string;
    titleKey: string;
    textKey?: string;
    imageKey?: string;
    types: InputType[];
    optional?: boolean;
    section?: HarianSections;
};

// Updated Form Config: Fixed keys for Komuni 3 (A32) and Penutup (A34) to match standard numbering
const formConfig: FormField[] = [
    { label: 'Lagu Pembuka', titleKey: 'A01', textKey: 'B01', imageKey: 'C01', types: ['text', 'multi-image'], section: 'showLaguPembuka' },
    { label: 'Tuhan Kasihanilah Kami I', titleKey: 'A02', textKey: 'B02', types: ['text'], section: 'showTuhanKasihanilahKami' },
    { label: 'Tuhan Kasihanilah Kami II', titleKey: 'A03', textKey: 'B03', types: ['text'], section: 'showTuhanKasihanilahKami' },
    { label: 'Tuhan Kasihanilah Kami III', titleKey: 'A04', textKey: 'B04', types: ['text'], section: 'showTuhanKasihanilahKami' },
    { label: 'Doa Kolekta', titleKey: 'A05', textKey: 'B05', types: ['text'], section: 'showDoaKolekta' },
    { label: 'Bacaan I', titleKey: 'A06', textKey: 'B06', types: ['text'] },
    { label: 'Mazmur Tanggapan (Refren)', titleKey: 'A07', textKey: 'B07', imageKey: 'C07', types: ['text', 'multi-image'] },
    { label: 'Mazmur Tanggapan (Ayat I)', titleKey: 'A08', textKey: 'B08', imageKey: 'C08', types: ['text', 'multi-image'] },
    { label: 'Mazmur Tanggapan (Ayat II)', titleKey: 'A09', textKey: 'B09', imageKey: 'C09', types: ['text', 'multi-image'] },
    { label: 'Mazmur Tanggapan (Ayat III)', titleKey: 'A010', textKey: 'B010', imageKey: 'C010', types: ['text', 'multi-image'], optional: true },
    { label: 'Bacaan II', titleKey: 'A011', textKey: 'B011', types: ['text'], section: 'showBacaan2' },
    { label: 'Bait Pengantar Injil (Refren)', titleKey: 'A012', imageKey: 'C012', types: ['multi-image'] }, 
    { label: 'Bait Pengantar Injil (Ayat)', titleKey: 'A013', textKey: 'B013', imageKey: 'C013', types: ['text', 'multi-image'] },
    { label: 'Bacaan Injil', titleKey: 'A014', textKey: 'B014', types: ['text'] },
    
    // Doa Umat Section - Roman Numerals for Lektors
    { label: 'Doa Umat: Imam (Pembuka)', titleKey: 'A015', textKey: 'B015', types: ['text'], section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor I', titleKey: 'A016', textKey: 'B016', types: ['text'], section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor II', titleKey: 'A017', textKey: 'B017', types: ['text'], section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor III', titleKey: 'A018', textKey: 'B018', types: ['text'], section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor IV', titleKey: 'A019', textKey: 'B019', types: ['text'], section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor V', titleKey: 'A020', textKey: 'B020', types: ['text'], section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor VI', titleKey: 'A021', textKey: 'B021', types: ['text'], section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor VII', titleKey: 'A022', textKey: 'B022', types: ['text'], optional: true, section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor VIII', titleKey: 'A023', textKey: 'B023', types: ['text'], optional: true, section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor IX', titleKey: 'A024', textKey: 'B024', types: ['text'], optional: true, section: 'showDoaUmat' },
    { label: 'Doa Umat: Lektor X', titleKey: 'A025', textKey: 'B025', types: ['text'], optional: true, section: 'showDoaUmat' },
    { label: 'Doa Umat: Imam (Penutup)', titleKey: 'A026', textKey: 'B026', types: ['text'], section: 'showDoaUmat' },
    { label: 'Doa Umat: Jawaban Umat', titleKey: 'A27', textKey: 'B27', types: ['text'], section: 'showDoaUmat' },

    { label: 'Lagu Persembahan', titleKey: 'A28', textKey: 'B28', imageKey: 'C28', types: ['text', 'multi-image'], section: 'showLaguPersembahan' },
    { label: 'Doa Atas Persembahan', titleKey: 'A29', textKey: 'B29', types: ['text'] },
    { label: 'Lagu Komuni I', titleKey: 'A30', textKey: 'B30', imageKey: 'C30', types: ['text', 'multi-image'], section: 'showLaguKomuni' },
    { label: 'Lagu Komuni II', titleKey: 'A31', textKey: 'B31', imageKey: 'C31', types: ['text', 'multi-image'], optional: true, section: 'showLaguKomuni' },
    // Reverted keys to 32/34 to align with A30/A31 pattern, resolving title display issues
    { label: 'Lagu Komuni III', titleKey: 'A32', textKey: 'B32', imageKey: 'C32', types: ['text', 'multi-image'], optional: true, section: 'showLaguKomuni' },
    { label: 'Doa Sesudah Komuni', titleKey: 'A33', textKey: 'B33', types: ['text'], section: 'showDoaSesudahKomuni' },
    { label: 'Lagu Penutup', titleKey: 'A34', textKey: 'B34', imageKey: 'C34', types: ['text', 'multi-image'], section: 'showLaguPenutup' },
];

const defaultTitlesIndonesia: PresentationData = {
    A01: '(umat berdiri) NYANYIAN PERARAKAN MASUK',
    A02: 'TUHAN KASIHANILAH KAMI',
    A03: 'TUHAN KASIHANILAH KAMI',
    A04: 'TUHAN KASIHANILAH KAMI',
    A05: '(umat berdiri) DOA KOLEKTA',
    A06: '(umat duduk) BACAAN I | (Sumber)',
    A07: '(umat duduk) MAZMUR TANGGAPAN',
    A08: '(umat duduk) MAZMUR TANGGAPAN',
    A09: '(umat duduk) MAZMUR TANGGAPAN',
    A010: '(umat duduk) MAZMUR TANGGAPAN',
    A011: '(umat duduk) BACAAN II | (Sumber)',
    A012: '(umat berdiri) BAIT PENGANTAR INJIL',
    A013: '(umat berdiri) BAIT PENGANTAR INJIL',
    A014: '(umat duduk) BACAAN INJIL | (Sumber)',
    A015: '(umat berdiri) DOA UMAT',
    A016: '(umat berdiri) DOA UMAT',
    A017: '(umat berdiri) DOA UMAT',
    A018: '(umat berdiri) DOA UMAT',
    A019: '(umat berdiri) DOA UMAT',
    A020: '(umat berdiri) DOA UMAT',
    A021: '(umat berdiri) DOA UMAT',
    A022: '(umat berdiri) DOA UMAT',
    A023: '(umat berdiri) DOA UMAT',
    A024: '(umat berdiri) DOA UMAT',
    A025: '(umat berdiri) DOA UMAT',
    A026: '(umat berdiri) DOA UMAT',
    A27: '(umat berdiri) DOA UMAT',
    A28: '(umat duduk) NYANYIAN PERSEMBAHAN',
    A29: '(umat berdiri) DOA ATAS PERSEMBAHAN',
    A30: '(umat duduk) MADAH PUJIAN',
    A31: '(umat duduk) MADAH PUJIAN',
    A32: '(umat duduk) MADAH PUJIAN',
    A33: '(umat berdiri) DOA SESUDAH KOMUNI',
    A34: '(umat berdiri) NYANYIAN PERARAKAN KELUAR',
};

const defaultTitlesJawa: PresentationData = {
    A01: '(umat jumeneng) KIDUNG ARAK-ARAKAN MLEBET',
    A02: 'GUSTI NYUWUN KAWELASAN',
    A03: 'GUSTI NYUWUN KAWELASAN',
    A04: 'GUSTI NYUWUN KAWELASAN',
    A05: '(umat jumeneng) SEMBAHYANGAN KOLEKTA',
    A06: '(umat lenggah) WAOSAN I | (Sumber)',
    A07: '(umat lenggah) KIDUNG PANGLIMBANG',
    A08: '(umat lenggah) KIDUNG PANGLIMBANG',
    A09: '(umat lenggah) KIDUNG PANGLIMBANG',
    A010: '(umat lenggah) KIDUNG PANGLIMBANG',
    A011: '(umat lenggah) WAOSAN II | (Sumber)',
    A012: '(umat jumeneng) KIDUNG CECELA',
    A013: '(umat jumeneng) KIDUNG CECELA',
    A014: '(umat jumeneng) INJIL SUCI | (Sumber)',
    A015: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A016: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A017: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A018: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A019: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A020: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A021: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A022: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A023: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A024: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A025: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A026: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A27: '(umat jumeneng) SEMBAHYANGAN UMAT',
    A28: '(umat lenggah) KIDUNG CECAWIS PISUNGSUNG',
    A29: '(umat jumeneng) SEMBAHYANGAN CECAWIS PISUNGSUNG',
    A30: '(umat lenggah) KIDUNG PUJIAN',
    A31: '(umat lenggah) KIDUNG PUJIAN',
    A32: '(umat lenggah) KIDUNG PUJIAN',
    A33: '(umat jumeneng) SEMBAHYANGAN BAKDA KOMUNI',
    A34: '(umat jumeneng) KIDUNG PANUTUP',
};


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const invertImageBase64 = (base64String: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];     // red
                data[i + 1] = 255 - data[i + 1]; // green
                data[i + 2] = 255 - data[i + 2]; // blue
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };
        img.onerror = (err) => reject(err);
        img.src = base64String;
    });
};


const StepContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="animate-[fadeIn_0.5s_ease-in-out] p-1">{children}</div>
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
    
    // Image Handling State
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({});
    const [originalBase64Cache, setOriginalBase64Cache] = useState<{ [key: string]: { [fileName: string]: string } }>({});
    const [invertedImages, setInvertedImages] = useState<{ [key: string]: Set<string> }>({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<{ key: string; file: File } | null>(null);

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
        
        setPresentationData(prev => ({ ...newDefaults, presentationTitle: prev.presentationTitle || newTitle }));

    }, [massLanguage, massType]);

    useEffect(() => {
        const typeText = massType.charAt(0).toUpperCase() + massType.slice(1);
        const langText = massLanguage === 'indonesia' ? 'Bahasa Indonesia' : 'Bahasa Jawa';
        const newTitle = `[Tahun C] ${typeText} - ${langText} - Minggu Biasa I (27 04 07)`;
        setPresentationData(prev => ({ ...prev, presentationTitle: newTitle }));
    }, [massLanguage, massType]);

    useEffect(() => {
        const updateAllImages = async () => {
            const dataUpdates: { [key: string]: string[] } = {};
            
            for (const fieldKey of Object.keys(originalBase64Cache)) {
                const files = uploadedFiles[fieldKey] || [];
                if (files.length === 0) {
                    dataUpdates[fieldKey] = []; // Directly use the C key
                    continue;
                }

                const base64Array = await Promise.all(files.map(async (file) => {
                    const originalBase64 = originalBase64Cache[fieldKey]?.[file.name];
                    if (!originalBase64) return null;
                    if (invertedImages[fieldKey]?.has(file.name)) {
                        return await invertImageBase64(originalBase64);
                    }
                    return originalBase64;
                }));

                dataUpdates[fieldKey] = base64Array.filter(Boolean) as string[];
            }

            setPresentationData(prev => {
                const currentImagesJson: {[key: string]: any} = {};
                const updatedImagesJson: {[key: string]: any} = {};
                let hasChanged = false;

                for (const key in dataUpdates) {
                    currentImagesJson[key] = prev[key as keyof PresentationData];
                    updatedImagesJson[key] = dataUpdates[key];
                }
                
                if (JSON.stringify(currentImagesJson) !== JSON.stringify(updatedImagesJson)) {
                    hasChanged = true;
                }

                if (hasChanged) {
                    return { ...prev, ...dataUpdates };
                }
                return prev;
            });
        };

        updateAllImages();
    }, [uploadedFiles, invertedImages, originalBase64Cache]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPresentationData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (key: string, files: File | File[]) => {
        const fileArray = Array.isArray(files) ? files : [files];
        
        setUploadedFiles(prev => {
            const existingFiles = prev[key] || [];
            const newUniqueFiles = fileArray.filter(newFile => 
                !existingFiles.some(existing => existing.name === newFile.name)
            );
            return { ...prev, [key]: [...existingFiles, ...newUniqueFiles] };
        });

        if (fileArray.length === 0) {
             return;
        }

        const newCacheForKey: { [fileName: string]: string } = {};
        await Promise.all(fileArray.map(async (file) => {
            const base64 = await fileToBase64(file);
            newCacheForKey[file.name] = base64;
        }));

        setOriginalBase64Cache(prev => ({ 
            ...prev, 
            [key]: { ...(prev[key] || {}), ...newCacheForKey } 
        }));
    };

    const handleFileRemove = (key: string, fileNameToRemove: string) => {
        setUploadedFiles(prev => {
            const newFiles = (prev[key] || []).filter(f => f.name !== fileNameToRemove);
            return { ...prev, [key]: newFiles };
        });

        setOriginalBase64Cache(prev => {
            const newCache = { ...prev };
            if (newCache[key]) {
                const newKeyCache = { ...newCache[key] };
                delete newKeyCache[fileNameToRemove];
                newCache[key] = newKeyCache;
                
                if (Object.keys(newCache[key]).length === 0) {
                    delete newCache[key];
                }
            }
            return newCache;
        });

        setInvertedImages(prev => {
            const newInverted = { ...prev };
            if (newInverted[key]) {
                newInverted[key].delete(fileNameToRemove);
                if (newInverted[key].size === 0) {
                    delete newInverted[key];
                }
            }
            return newInverted;
        });
    };

    const handleInvertToggle = (key: string, fileName: string) => {
        setInvertedImages(prev => {
            const newInverted = { ...prev };
            const invertedSet = new Set(newInverted[key] || []);

            if (invertedSet.has(fileName)) {
                invertedSet.delete(fileName);
            } else {
                invertedSet.add(fileName);
            }

            if (invertedSet.size === 0) {
                delete newInverted[key];
            } else {
                newInverted[key] = invertedSet;
            }
            
            return newInverted;
        });
    };
    
    const handleFileEdit = (key: string, fileName: string) => {
        const fileToEdit = (uploadedFiles[key] || []).find(f => f.name === fileName);
        if (fileToEdit) {
            setEditingFile({ key, file: fileToEdit });
            setIsEditModalOpen(true);
        }
    };

    const handleEditSave = async (originalFile: File, newFiles: File[]) => {
        if (!editingFile) return;
        const { key } = editingFile;

        setUploadedFiles(prev => {
            const oldList = prev[key] || [];
            const index = oldList.findIndex(f => f.name === originalFile.name);
            if (index === -1) return prev;
            
            const updatedFilesForKey = [...oldList];
            // Replace the original file with the new files (can be multiple if slides were added)
            updatedFilesForKey.splice(index, 1, ...newFiles);
            
            return { ...prev, [key]: updatedFilesForKey };
        });

        // Update base64 cache
        const newCacheForKey: { [fileName: string]: string } = {};
        await Promise.all(newFiles.map(async (file) => {
            const base64 = await fileToBase64(file);
            newCacheForKey[file.name] = base64;
        }));
        
        setOriginalBase64Cache(prev => {
            const updatedCache = { ...(prev[key] || {}) };
            delete updatedCache[originalFile.name];
            return { ...prev, [key]: { ...updatedCache, ...newCacheForKey } };
        });

        // Clean up inverted state for the original file
        setInvertedImages(prev => {
            const newInverted = { ...prev };
            if (newInverted[key]) {
                newInverted[key].delete(originalFile.name);
                if (newInverted[key].size === 0) {
                    delete newInverted[key];
                }
            }
            return newInverted;
        });

        // Close modal
        setIsEditModalOpen(false);
        setEditingFile(null);
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
                                                return field.section ? harianOptionalSections[field.section] : true;
                                            })
                                            .map((field) => {
                                                const titleKey = field.titleKey;
                                                const textKey = field.textKey;
                                                const imageKey = field.imageKey;
                                                const uniqueFieldId = field.titleKey; // Use titleKey as unique ID

                                                const defaultMode = field.types.includes('text') ? 'text' : 'image';
                                                const currentMode = inputModes[uniqueFieldId] || defaultMode;
                                                const isMultiImage = field.types.includes('multi-image');

                                                return (
                                                <div key={uniqueFieldId} className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-primary)] space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-bold text-[var(--accent-color-400)]">{field.label}</h3>
                                                        {field.types.length > 1 && (
                                                            <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-md">
                                                                {field.types.includes('text') && (
                                                                    <button onClick={() => handleModeChange(uniqueFieldId, 'text')} className={`p-1.5 rounded transition ${currentMode === 'text' ? 'bg-[var(--accent-color-500)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`} aria-label="Switch to Text Mode"><TextIcon className="w-4 h-4"/></button>
                                                                )}
                                                                {(field.types.includes('image') || field.types.includes('multi-image')) && (
                                                                     <button onClick={() => handleModeChange(uniqueFieldId, 'image')} className={`p-1.5 rounded transition ${currentMode === 'image' ? 'bg-[var(--accent-color-500)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`} aria-label="Switch to Image Mode"><ImageIcon className="w-4 h-4"/></button>
                                                                )}
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
                                                        {currentMode === 'text' && textKey ? (
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
                                                            imageKey ? (
                                                                <div>
                                                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Image</label>
                                                                    <FileUpload
                                                                        id={imageKey}
                                                                        onFileSelect={(files) => handleFileChange(imageKey, files)}
                                                                        multiple={isMultiImage}
                                                                        accept="image/*"
                                                                        label="Click to upload"
                                                                        files={uploadedFiles[imageKey] || []}
                                                                        onFileRemove={(fileName) => handleFileRemove(imageKey, fileName)}
                                                                        onInvertToggle={(fileName) => handleInvertToggle(imageKey, fileName)}
                                                                        invertedFiles={invertedImages[imageKey]}
                                                                        isImage={true}
                                                                        onFileEdit={(fileName) => handleFileEdit(imageKey, fileName)}
                                                                    />
                                                                </div>
                                                            ) : <div className="text-sm text-yellow-500">Image upload not available for this field.</div>
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

            <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Image Multi-Crop Editor"
                maxWidth="max-w-6xl"
            >
                {editingFile && (
                    <ImageEditorModal
                        file={editingFile.file}
                        onSave={handleEditSave}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setEditingFile(null);
                        }}
                    />
                )}
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
