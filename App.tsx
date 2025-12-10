
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Language, PresentationData, MassType } from './types';
import { translations } from './i18n';
import { processTemplate } from './services/pptTemplater';
import { PresentationIcon, SparklesIcon, LoaderIcon, DownloadIcon, AlertTriangleIcon, ImageIcon, TextIcon, InfoIcon, ParagraphIcon, ArrowLeftIcon, ArrowRightIcon, SlidersIcon, ScanIcon, BoldIcon, ItalicIcon, UnderlineIcon, PlusIcon } from './components/icons';
import { FileUpload } from './components/FileUpload';
import { Modal } from './components/Modal';
import { TemplateCreationGuide } from './components/TemplateCreationGuide';
import { TutorialGuide } from './components/TutorialGuide';
import { DropdownMenu } from './components/DropdownMenu';
import { SettingsModal } from './components/SettingsModal';
import { DevlogModal } from './components/DevlogModal';
import { DataEntryWorkflow } from './components/DataEntryWorkflow';
import { ImageEditorModal } from './components/ImageEditorModal';
import { OcrModal } from './components/OcrModal';


type InputType = 'text' | 'image' | 'multi-image';
type FormField = {
    label: string;
    titleKey: string;
    textKey?: string;
    imageKey?: string;
    types: InputType[];
    optional?: boolean;
    section?: HarianSections;
    onlyFor?: MassType[];
};

// Updated Form Config - Fixed Fields
const formConfig: FormField[] = [
    { label: 'Thumbnail A', titleKey: 'A36', imageKey: 'C36', types: ['multi-image'], onlyFor: ['memule'] },
    { label: 'Pengantar', titleKey: 'A35', textKey: 'B35', types: ['text'], onlyFor: ['memule'] },
    
    { label: 'Lagu Pembuka', titleKey: 'A01', textKey: 'B01', imageKey: 'C01', types: ['text', 'image'], section: 'showLaguPembuka' },

    { label: 'Tuhan Kasihanilah Kami I', titleKey: 'A02', textKey: 'B02', types: ['text'], section: 'showTuhanKasihanilahKami' },
    { label: 'Tuhan Kasihanilah Kami II', titleKey: 'A03', textKey: 'B03', types: ['text'], section: 'showTuhanKasihanilahKami' },
    { label: 'Tuhan Kasihanilah Kami III', titleKey: 'A04', textKey: 'B04', types: ['text'], section: 'showTuhanKasihanilahKami' },
    { label: 'Doa Kolekta', titleKey: 'A05', textKey: 'B05', types: ['text'], section: 'showDoaKolekta' },
    { label: 'Bacaan I', titleKey: 'A06', textKey: 'B06', types: ['text'] },
    
    // Mazmur Tanggapan Handled via Custom Render
    // { label: 'Mazmur Tanggapan (Refren)', titleKey: 'A07', textKey: 'B07', imageKey: 'C07', types: ['text', 'multi-image'] },
    // { label: 'Mazmur Tanggapan (Ayat 1)', titleKey: 'A08', textKey: 'B08', imageKey: 'C08', types: ['text', 'image'] },
    // { label: 'Mazmur Tanggapan (Ayat 2)', titleKey: 'A09', textKey: 'B09', imageKey: 'C09', types: ['text', 'image'] },
    // { label: 'Mazmur Tanggapan (Ayat 3)', titleKey: 'A010', textKey: 'B010', imageKey: 'C010', types: ['text', 'image'] },

    { label: 'Bacaan II', titleKey: 'A011', textKey: 'B011', types: ['text'], section: 'showBacaan2' },
    
    // BPI Handled via Custom Render
    // { label: 'Bait Pengantar Injil (Refren)', titleKey: 'A012', imageKey: 'C012', types: ['multi-image'] },
    // { label: 'Bait Pengantar Injil (Ayat)', titleKey: 'A013', textKey: 'B013', imageKey: 'C013', types: ['text', 'image'] },
    
    { label: 'Bacaan Injil', titleKey: 'A014', textKey: 'B014', types: ['text'] },
    
    // Doa Umat Handled via Custom Render

    { label: 'Lagu Persembahan', titleKey: 'A28', textKey: 'B28', imageKey: 'C28', types: ['text', 'image'], section: 'showLaguPersembahan' },
    { label: 'Doa Atas Persembahan', titleKey: 'A29', textKey: 'B29', types: ['text'] },
    { label: 'Lagu Komuni', titleKey: 'A30', textKey: 'B30', imageKey: 'C30', types: ['text', 'image'], section: 'showLaguKomuni' },
    { label: 'Doa Sesudah Komuni', titleKey: 'A33', textKey: 'B33', types: ['text'], section: 'showDoaSesudahKomuni' },
    { label: 'Lagu Penutup', titleKey: 'A34', textKey: 'B34', imageKey: 'C34', types: ['text', 'image'], section: 'showLaguPenutup' },
    
    { label: 'Thumbnail B', titleKey: 'A37', imageKey: 'C37', types: ['multi-image'], onlyFor: ['memule'] },
];

const defaultTitlesIndonesia: PresentationData = {
    A36: 'Thumbnail A',
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
    A33: '(umat berdiri) DOA SESUDAH KOMUNI',
    A34: '(umat berdiri) NYANYIAN PERARAKAN KELUAR',
    A35: 'PENGANTAR',
    A37: 'Thumbnail B',
    Q01: 'Kolekte Pertama',
    Q02: 'Kolekte Kedua',
    Q03: 'APBU',
    Q04: 'Gerakan Peduli Pendidikan',
};

const defaultTitlesJawa: PresentationData = {
    A36: 'Thumbnail A',
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
    A33: '(umat jumeneng) SEMBAHYANGAN BAKDA KOMUNI',
    A34: '(umat jumeneng) KIDUNG PANUTUP',
    A35: 'PENGANTAR',
    A37: 'Thumbnail B',
    Q01: 'Kolekte Pertama',
    Q02: 'Kolekte Kedua',
    Q03: 'APBU',
    Q04: 'Gerakan Peduli Pendidikan',
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


const StepContainer: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`p-1 ${className || ''}`}>{children}</div>
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

const toRoman = (num: number): string => {
    const roman = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let str = '';
    for (let i of Object.keys(roman)) {
        const q = Math.floor(num / roman[i as keyof typeof roman]);
        num -= q * roman[i as keyof typeof roman];
        str += i.repeat(q);
    }
    return str;
};


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
    
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [accentColor, setAccentColor] = useState('#0033FF'); // Default Blue
    
    // Image Handling State
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({});
    const [originalBase64Cache, setOriginalBase64Cache] = useState<{ [key: string]: { [fileName: string]: string } }>({});
    const [invertedImages, setInvertedImages] = useState<{ [key: string]: Set<string> }>({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<{ key: string; file: File } | null>(null);

    // OCR State
    const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
    const [ocrTargetKey, setOcrTargetKey] = useState<string | null>(null);
    
    // Accordion State
    const [isOptionalSectionsOpen, setIsOptionalSectionsOpen] = useState(false);

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

    // Pengumuman State
    const [pengumumanConfig, setPengumumanConfig] = useState({
        openingFileName: '',
        closingFileName: '',
        openingTemplate: null as File | null,
        closingTemplate: null as File | null
    });
    const [announcementCount, setAnnouncementCount] = useState(1);

    // Wedding (Perkawinan) State
    const [weddingCount, setWeddingCount] = useState(1);
    const [weddingPhotoModes, setWeddingPhotoModes] = useState<{ [key: number]: boolean }>({ 1: true });
    
    // Update CSS Variable when accentColor changes
    useEffect(() => {
        document.documentElement.style.setProperty('--color-accent', accentColor);
    }, [accentColor]);
    
    // Auto-fill TS keys with "dengan"
    useEffect(() => {
        setPresentationData(prev => {
            const newData = { ...prev };
            let hasChanges = false;
            for (let i = 1; i <= weddingCount; i++) {
                const tsKey = `TS${i.toString().padStart(2, '0')}`;
                if (!newData[tsKey]) {
                    newData[tsKey] = 'dengan';
                    hasChanges = true;
                }
            }
            return hasChanges ? newData : prev;
        });
    }, [weddingCount]);

    // Handle initial defaults
    useEffect(() => {
        const defaults = massLanguage === 'jawa' ? defaultTitlesJawa : defaultTitlesIndonesia;
        setPresentationData(prev => ({ ...prev, ...defaults }));
    }, [massLanguage]);

    const handleHarianToggle = (section: HarianSections) => {
        setHarianOptionalSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleWeddingModeToggle = (index: number) => {
        setWeddingPhotoModes(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };


    const t = useCallback((key: string) => {
        return translations.indonesia[key] || key;
    }, []);

    // ... (massOptions logic, useEffects for titles, image processing logic remain same)
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
                { id: 'memule', label: 'Misa Memule', enabled: true },
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
                 { id: 'pengumuman', label: t('pengumuman'), enabled: true },
                 { id: 'dataEntry', label: t('dataEntry'), enabled: true },
            ]
        }
    ];

     useEffect(() => {
        const newDefaults = massLanguage === 'jawa' ? defaultTitlesJawa : defaultTitlesIndonesia;
        if (massType === 'pengumuman') {
            const langSuffix = massLanguage === 'indonesia' ? 'Indonesia' : 'Jawa';
            setPengumumanConfig(prev => ({
                ...prev,
                openingFileName: `Opening_${langSuffix}`,
                closingFileName: `Closing_${langSuffix}`
            }));
            setPresentationData(prev => ({ ...newDefaults, presentationTitle: `Opening_${langSuffix}` }));
        } else {
            const typeText = massType.charAt(0).toUpperCase() + massType.slice(1);
            const langText = massLanguage === 'indonesia' ? 'Bahasa Indonesia' : 'Bahasa Jawa';
            const newTitle = `[Tahun C] ${typeText} - ${langText} - Minggu Biasa I (27 04 07)`;
            setPresentationData(prev => ({ ...newDefaults, presentationTitle: prev.presentationTitle || newTitle }));
        }
    }, [massLanguage, massType]);

    useEffect(() => {
        if (massType !== 'pengumuman') {
            const typeText = massType.charAt(0).toUpperCase() + massType.slice(1);
            const langText = massLanguage === 'indonesia' ? 'Bahasa Indonesia' : 'Bahasa Jawa';
            const newTitle = `[Tahun C] ${typeText} - ${langText} - Minggu Biasa I (27 04 07)`;
            setPresentationData(prev => ({ ...prev, presentationTitle: newTitle }));
        }
    }, [massLanguage, massType]);

    useEffect(() => {
        const updateAllImages = async () => {
            const dataUpdates: { [key: string]: string[] } = {};
            
            for (const fieldKey of Object.keys(originalBase64Cache)) {
                const files = uploadedFiles[fieldKey] || [];
                if (files.length === 0) {
                    dataUpdates[fieldKey] = [];
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
        
        // Special logic for Doa Umat Lektor 1 (A016)
        if (name === 'A016') {
             // Logic to update other Lektors if needed can be added here
             // Auto-copy Lektor 1 title to others if they are empty or match default
             // This is handled in render/state update, but simple prop update here.
             setPresentationData(prev => {
                 const newData = { ...prev, [name]: value };
                 for (let i = 2; i <= 10; i++) {
                     const idx = 15 + i; // Lektor 2 starts at 17
                     const key = `A0${idx}`;
                     // If other lektor title is empty or same as old Lektor 1, update it
                     if (!prev[key] || prev[key] === prev['A016']) {
                         newData[key] = value;
                     }
                 }
                 return newData;
             });
             return;
        }

        setPresentationData(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePengumumanInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'opening' | 'closing') => {
        const { value } = e.target;
        if (field === 'opening') {
            setPengumumanConfig(prev => ({ ...prev, openingFileName: value }));
        } else {
            setPengumumanConfig(prev => ({ ...prev, closingFileName: value }));
        }
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

        if (fileArray.length === 0) return;

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
                if (Object.keys(newCache[key]).length === 0) delete newCache[key];
            }
            return newCache;
        });

        setInvertedImages(prev => {
            const newInverted = { ...prev };
            if (newInverted[key]) {
                newInverted[key].delete(fileNameToRemove);
                if (newInverted[key].size === 0) delete newInverted[key];
            }
            return newInverted;
        });
    };

    const handleInvertToggle = (key: string, fileName: string) => {
        setInvertedImages(prev => {
            const newInverted = { ...prev };
            const invertedSet = new Set(newInverted[key] || []);
            if (invertedSet.has(fileName)) invertedSet.delete(fileName);
            else invertedSet.add(fileName);

            if (invertedSet.size === 0) delete newInverted[key];
            else newInverted[key] = invertedSet;
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
            updatedFilesForKey.splice(index, 1, ...newFiles);
            return { ...prev, [key]: updatedFilesForKey };
        });

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

        setInvertedImages(prev => {
            const newInverted = { ...prev };
            if (newInverted[key]) {
                newInverted[key].delete(originalFile.name);
                if (newInverted[key].size === 0) delete newInverted[key];
            }
            return newInverted;
        });

        setIsEditModalOpen(false);
        setEditingFile(null);
    };


    const handleTemplateUpload = (file: File | File[]) => {
        const templateFile = Array.isArray(file) ? file[0] : file;
        if (templateFile) setUploadedTemplate(templateFile);
    }
    
    const handleTemplateRemove = () => {
        setUploadedTemplate(null);
    };
    
    const handlePengumumanTemplateUpload = (file: File | File[], type: 'opening' | 'closing') => {
        const templateFile = Array.isArray(file) ? file[0] : file;
        if (templateFile) {
            if (type === 'opening') setPengumumanConfig(prev => ({ ...prev, openingTemplate: templateFile }));
            else setPengumumanConfig(prev => ({ ...prev, closingTemplate: templateFile }));
        }
    };
    
    const handlePengumumanTemplateRemove = (type: 'opening' | 'closing') => {
        if (type === 'opening') setPengumumanConfig(prev => ({ ...prev, openingTemplate: null }));
        else setPengumumanConfig(prev => ({ ...prev, closingTemplate: null }));
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
    
    const handleFormat = (key: string, tag: 'b' | 'i' | 'u') => {
        const inputElement = document.getElementById(key) as HTMLInputElement | HTMLTextAreaElement;
        if (!inputElement) return;

        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        const value = inputElement.value;

        if (start === null || end === null || start === end) return;

        const selectedText = value.substring(start, end);
        const beforeText = value.substring(0, start);
        const afterText = value.substring(end);

        const newText = `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`;

        setPresentationData(prev => ({ ...prev, [key]: newText }));

        setTimeout(() => {
            inputElement.focus();
            inputElement.setSelectionRange(start, end + tag.length * 2 + 5); 
        }, 0);
    };


    const handleOcrClick = (key: string) => {
        setOcrTargetKey(key);
        setIsOcrModalOpen(true);
    };

    const handleOcrInsert = (text: string) => {
        if (ocrTargetKey) {
            setPresentationData(prev => {
                const currentText = (prev as any)[ocrTargetKey] || '';
                return { ...prev, [ocrTargetKey]: currentText + (currentText ? '\n\n' : '') + text };
            });
        }
        setIsOcrModalOpen(false);
        setOcrTargetKey(null);
    };


    const handleGenerate = useCallback(async () => {
        if (massType === 'pengumuman') {
             if (!pengumumanConfig.openingTemplate && !pengumumanConfig.closingTemplate) {
                 setError("Please upload at least one template (Opening or Closing).");
                 return;
             }
             setIsLoading(true);
             setError(null);
             setStatusMessage("Generating Pengumuman...");

             try {
                 const promises = [];
                 if (pengumumanConfig.openingTemplate) {
                     const openingData = { ...presentationData, presentationTitle: pengumumanConfig.openingFileName };
                     promises.push(processTemplate(openingData, pengumumanConfig.openingTemplate, massLanguage));
                 }
                 if (pengumumanConfig.closingTemplate) {
                     const closingData = { ...presentationData, presentationTitle: pengumumanConfig.closingFileName };
                     promises.push(processTemplate(closingData, pengumumanConfig.closingTemplate, massLanguage));
                 }
                 
                 await Promise.all(promises);
                 setStatusMessage("Announcements downloaded successfully!");
             } catch(err) {
                 console.error(err);
                 const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                 setError(`Generation failed: ${errorMessage}`);
             } finally {
                 setIsLoading(false);
             }
             return;
        }

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
    }, [presentationData, uploadedTemplate, massLanguage, massType, pengumumanConfig]);
    
    const isGenerateDisabled = (massType === 'pengumuman' 
        ? (!pengumumanConfig.openingTemplate && !pengumumanConfig.closingTemplate) 
        : (!uploadedTemplate || !presentationData.presentationTitle)) || isLoading;

    // --- RENDER HELPERS ---
    
    const renderContentToolbar = (
        currentMode: 'text' | 'image', 
        textKey: string | undefined,
        onModeChange?: (m: 'text' | 'image') => void,
        showTools: boolean = true
    ) => (
        <div className="flex justify-between items-center mb-2 mt-3 border-b-2 border-brutal-border pb-1">
            <div className="flex gap-2 items-center">
                 <label className="text-xs font-bold uppercase text-brutal-text bg-brutal-bg px-1 border border-brutal-border">
                    {currentMode === 'text' ? 'Text Content' : 'Image Content'}
                </label>
                {/* Formatting Tools - Only show if Text Key exists (Body field) and Mode is Text */}
                 {currentMode === 'text' && showTools && textKey && (
                    <div className="flex gap-1">
                        <button onClick={() => handleFormat(textKey, 'b')} className="p-1 border border-brutal-border hover:bg-brutal-border hover:text-brutal-bg transition text-brutal-text" title="Bold"><BoldIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleFormat(textKey, 'i')} className="p-1 border border-brutal-border hover:bg-brutal-border hover:text-brutal-bg transition text-brutal-text" title="Italic"><ItalicIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleFormat(textKey, 'u')} className="p-1 border border-brutal-border hover:bg-brutal-border hover:text-brutal-bg transition text-brutal-text" title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleOcrClick(textKey)} className="p-1 border border-brutal-border hover:bg-brutal-border hover:text-brutal-bg transition text-brutal-text" title="Scan Image"><ScanIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleParagraphify(textKey)} className="p-1 border border-brutal-border hover:bg-brutal-border hover:text-brutal-bg transition text-brutal-text" title="Paragraphify"><ParagraphIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
           
            {onModeChange && (
                <div className="flex gap-1 bg-brutal-surface">
                    <button onClick={() => onModeChange('text')} className={`p-1 border border-brutal-border font-bold text-xs uppercase transition ${currentMode === 'text' ? 'bg-brutal-border text-brutal-bg' : 'bg-brutal-surface text-brutal-text'}`} aria-label="Text Mode"><TextIcon className="w-4 h-4" /></button>
                    <button onClick={() => onModeChange('image')} className={`p-1 border border-brutal-border font-bold text-xs uppercase transition ${currentMode === 'image' ? 'bg-brutal-border text-brutal-bg' : 'bg-brutal-surface text-brutal-text'}`} aria-label="Image Mode"><ImageIcon className="w-4 h-4" /></button>
                </div>
            )}
        </div>
    );

    const renderDoaUmatSectionStatic = () => {
        return (
            <div className="bg-brutal-surface p-4 border-4 border-brutal-border space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b-4 border-brutal-border pb-2">
                    <h3 className="text-lg font-black uppercase bg-brutal-accent text-brutal-white px-2 border-2 border-brutal-border">DOA UMAT</h3>
                </div>

                {/* Imam Pembuka */}
                 <div className="space-y-1">
                    <label htmlFor="A015" className="block text-xs font-bold uppercase text-brutal-text">Imam (Pembuka)</label>
                     <input type="text" id="A015" name="A015" value={(presentationData as any)['A015'] || ''} onChange={handleInputChange} className="w-full bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none mb-2 text-brutal-text"/>
                    <textarea id="B015" name="B015" value={(presentationData as any)['B015'] || ''} onChange={handleInputChange} className="w-full h-24 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none hide-scrollbar text-brutal-text" placeholder="Teks Imam Pembuka"/>
                </div>

                {/* Fixed Lektors 1-10 */}
                {Array.from({ length: 10 }).map((_, idx) => {
                    const lektorIndex = 16 + idx;
                    const titleKey = `A0${lektorIndex}`;
                    const textKey = `B0${lektorIndex}`;

                    return (
                        <div key={titleKey} className="pl-4 border-l-4 border-brutal-border space-y-2 py-2">
                             <h4 className="font-bold text-sm uppercase bg-brutal-bg inline-block px-1 border border-brutal-border">Lektor {toRoman(idx + 1)}</h4>
                             
                             <div>
                                <label className="block text-xs font-bold uppercase text-brutal-text">Title</label>
                                <input type="text" name={titleKey} value={(presentationData as any)[titleKey] || ''} onChange={handleInputChange} className="w-full bg-brutal-bg border-2 border-brutal-border p-1 font-mono text-xs focus:bg-brutal-surface focus:outline-none text-brutal-text"/>
                             </div>

                             <div>
                                {renderContentToolbar('text', textKey, undefined)}
                                <textarea name={textKey} value={(presentationData as any)[textKey] || ''} onChange={handleInputChange} className="w-full h-24 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none hide-scrollbar text-brutal-text"/>
                             </div>
                        </div>
                    );
                })}

                 {/* Static Jawaban Umat (A27, B27) */}
                 <div className="pl-4 border-l-4 border-brutal-border space-y-2 py-2 mt-4 bg-brutal-bg/10">
                     <h4 className="font-bold text-sm uppercase bg-brutal-bg inline-block px-1 border border-brutal-border">Jawaban Umat</h4>
                     
                     <div>
                        <label className="block text-xs font-bold uppercase text-brutal-text">Title</label>
                        <input type="text" name="A27" value={(presentationData as any)['A27'] || ''} onChange={handleInputChange} className="w-full bg-brutal-bg border-2 border-brutal-border p-1 font-mono text-xs focus:bg-brutal-surface focus:outline-none text-brutal-text"/>
                     </div>

                     <div>
                        {renderContentToolbar('text', 'B27', undefined)}
                        <textarea name="B27" value={(presentationData as any)['B27'] || ''} onChange={handleInputChange} className="w-full h-24 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none hide-scrollbar text-brutal-text" placeholder="Kabulkanlah doa kami ya Tuhan..."/>
                     </div>
                </div>

                {/* Imam Penutup */}
                 <div className="space-y-1 mt-4 border-t-4 border-brutal-border pt-4">
                    <label htmlFor="A026" className="block text-xs font-bold uppercase text-brutal-text">Imam (Penutup)</label>
                     <input type="text" id="A026" name="A026" value={(presentationData as any)['A026'] || ''} onChange={handleInputChange} className="w-full bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none mb-2 text-brutal-text"/>
                    <textarea id="B026" name="B026" value={(presentationData as any)['B026'] || ''} onChange={handleInputChange} className="w-full h-24 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none hide-scrollbar text-brutal-text" placeholder="Teks Imam Penutup"/>
                </div>
            </div>
        );
    }
    
    const renderMazmurSectionStatic = () => {
        // Mazmur Tanggapan (Refren) - A07, B07, C07
        const refrenTitleKey = 'A07';
        const refrenTextKey = 'B07';
        const refrenImageKey = 'C07';
        const refrenMode = inputModes[refrenTitleKey] || 'text'; // Default to text, user can toggle if config allows

        return (
            <div className="bg-brutal-surface p-4 border-4 border-brutal-border space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b-4 border-brutal-border pb-2">
                    <h3 className="text-lg font-black uppercase bg-brutal-accent text-brutal-white px-2 border-2 border-brutal-border">MAZMUR TANGGAPAN</h3>
                </div>

                {/* Refren Section (Imam Pembuka Style) */}
                 <div className="space-y-1">
                    <label htmlFor={refrenTitleKey} className="block text-xs font-bold uppercase text-brutal-text">Refren</label>
                    <input type="text" id={refrenTitleKey} name={refrenTitleKey} value={(presentationData as any)[refrenTitleKey] || ''} onChange={handleInputChange} className="w-full bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none mb-2 text-brutal-text"/>
                    
                    {renderContentToolbar(refrenMode, refrenTextKey, (m) => handleModeChange(refrenTitleKey, m))}
                    
                    {refrenMode === 'text' ? (
                         <textarea id={refrenTextKey} name={refrenTextKey} value={(presentationData as any)[refrenTextKey] || ''} onChange={handleInputChange} className="w-full h-24 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none hide-scrollbar text-brutal-text"/>
                    ) : (
                         <FileUpload id={refrenImageKey} onFileSelect={(files) => handleFileChange(refrenImageKey, files)} multiple={true} accept="image/*" label="UPLOAD IMAGE" files={uploadedFiles[refrenImageKey] || []} onFileRemove={(fileName) => handleFileRemove(refrenImageKey, fileName)} onInvertToggle={(fileName) => handleInvertToggle(refrenImageKey, fileName)} invertedFiles={invertedImages[refrenImageKey]} isImage={true} onFileEdit={(fileName) => handleFileEdit(refrenImageKey, fileName)}/>
                    )}
                </div>

                {/* Ayat 1-3 Section (Lektor Style) */}
                {[1, 2, 3].map((num) => {
                    const ayatIndex = 7 + num; // A08, A09, A010
                    const titleKey = `A0${ayatIndex}`; // e.g. A08
                    const textKey = `B0${ayatIndex}`;
                    const imageKey = `C0${ayatIndex}`;
                    const currentMode = inputModes[titleKey] || 'text';

                    return (
                        <div key={titleKey} className="pl-4 border-l-4 border-brutal-border space-y-2 py-2">
                             <h4 className="font-bold text-sm uppercase bg-brutal-bg inline-block px-1 border border-brutal-border">Ayat {num}</h4>
                             
                             <div>
                                <label className="block text-xs font-bold uppercase text-brutal-text">Title</label>
                                <input type="text" name={titleKey} value={(presentationData as any)[titleKey] || ''} onChange={handleInputChange} className="w-full bg-brutal-bg border-2 border-brutal-border p-1 font-mono text-xs focus:bg-brutal-surface focus:outline-none text-brutal-text"/>
                             </div>

                             <div>
                                {renderContentToolbar(currentMode, textKey, (m) => handleModeChange(titleKey, m))}
                                {currentMode === 'text' ? (
                                    <textarea name={textKey} value={(presentationData as any)[textKey] || ''} onChange={handleInputChange} className="w-full h-24 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none hide-scrollbar text-brutal-text"/>
                                ) : (
                                    <FileUpload id={imageKey} onFileSelect={(files) => handleFileChange(imageKey, files)} multiple={false} accept="image/*" label="UPLOAD IMAGE" files={uploadedFiles[imageKey] || []} onFileRemove={(fileName) => handleFileRemove(imageKey, fileName)} onInvertToggle={(fileName) => handleInvertToggle(imageKey, fileName)} invertedFiles={invertedImages[imageKey]} isImage={true} onFileEdit={(fileName) => handleFileEdit(imageKey, fileName)}/>
                                )}
                             </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    const renderBPISectionStatic = () => {
        // BPI Refren (A012, C012)
        const refrenTitleKey = 'A012';
        const refrenImageKey = 'C012';
        // BPI Ayat (A013, B013, C013)
        const ayatTitleKey = 'A013';
        const ayatTextKey = 'B013';
        const ayatImageKey = 'C013';
        const ayatMode = inputModes[ayatTitleKey] || 'text';

        return (
             <div className="bg-brutal-surface p-4 border-4 border-brutal-border space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b-4 border-brutal-border pb-2">
                    <h3 className="text-lg font-black uppercase bg-brutal-accent text-brutal-white px-2 border-2 border-brutal-border">BAIT PENGANTAR INJIL</h3>
                </div>

                {/* Refren Section (Imam Pembuka Style) */}
                 <div className="space-y-1">
                    <label htmlFor={refrenTitleKey} className="block text-xs font-bold uppercase text-brutal-text">Refren</label>
                    <input type="text" id={refrenTitleKey} name={refrenTitleKey} value={(presentationData as any)[refrenTitleKey] || ''} onChange={handleInputChange} className="w-full bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none mb-2 text-brutal-text"/>
                    {/* BPI Refren is typically Image only based on config but here we just render Image Upload */}
                    <div className="mt-2">
                        <FileUpload id={refrenImageKey} onFileSelect={(files) => handleFileChange(refrenImageKey, files)} multiple={true} accept="image/*" label="UPLOAD IMAGE (REFREN)" files={uploadedFiles[refrenImageKey] || []} onFileRemove={(fileName) => handleFileRemove(refrenImageKey, fileName)} onInvertToggle={(fileName) => handleInvertToggle(refrenImageKey, fileName)} invertedFiles={invertedImages[refrenImageKey]} isImage={true} onFileEdit={(fileName) => handleFileEdit(refrenImageKey, fileName)}/>
                    </div>
                </div>
                
                 {/* Ayat Section (Imam Pembuka Style) - Top Level, no indentation */}
                 <div className="space-y-1 pt-4 border-t-4 border-brutal-border">
                    <label htmlFor={ayatTitleKey} className="block text-xs font-bold uppercase text-brutal-text">Ayat</label>
                    <input type="text" id={ayatTitleKey} name={ayatTitleKey} value={(presentationData as any)[ayatTitleKey] || ''} onChange={handleInputChange} className="w-full bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none mb-2 text-brutal-text"/>
                    
                    {renderContentToolbar(ayatMode, ayatTextKey, (m) => handleModeChange(ayatTitleKey, m))}
                    
                    {ayatMode === 'text' ? (
                         <textarea id={ayatTextKey} name={ayatTextKey} value={(presentationData as any)[ayatTextKey] || ''} onChange={handleInputChange} className="w-full h-24 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none hide-scrollbar text-brutal-text"/>
                    ) : (
                         <FileUpload id={ayatImageKey} onFileSelect={(files) => handleFileChange(ayatImageKey, files)} multiple={false} accept="image/*" label="UPLOAD IMAGE (AYAT)" files={uploadedFiles[ayatImageKey] || []} onFileRemove={(fileName) => handleFileRemove(ayatImageKey, fileName)} onInvertToggle={(fileName) => handleInvertToggle(ayatImageKey, fileName)} invertedFiles={invertedImages[ayatImageKey]} isImage={true} onFileEdit={(fileName) => handleFileEdit(ayatImageKey, fileName)}/>
                    )}
                </div>
            </div>
        );
    }

    const renderStaticField = (fieldId: string) => {
        const field = formConfig.find(f => f.titleKey === fieldId);
        if (!field) return null;
        
        // Check if section logic applies (Harian optional sections)
        if (massType === 'harian' && field.section && !harianOptionalSections[field.section]) return null;
        if (field.onlyFor && !field.onlyFor.includes(massType)) return null;

        const titleKey = field.titleKey;
        const textKey = field.textKey;
        const imageKey = field.imageKey;
        const defaultMode = field.types.includes('text') ? 'text' : 'image';
        const currentMode = inputModes[titleKey] || defaultMode;
        const isMultiImage = field.types.includes('multi-image');

        return (
            <div key={titleKey} className="bg-brutal-surface p-4 border-4 border-brutal-border space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b-4 border-brutal-border pb-2">
                    <h3 className="text-lg font-black uppercase bg-brutal-accent text-brutal-white px-2 border-2 border-brutal-border">{field.label}</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor={titleKey} className="block text-xs font-bold uppercase text-brutal-text">Title</label>
                        <input type="text" id={titleKey} name={titleKey} value={(presentationData as any)[titleKey] || ''} onChange={handleInputChange} className="w-full bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none text-brutal-text"/>
                    </div>
                    
                    {/* Unified Toolbar Placement - Only for body content */}
                    {(field.types.length > 1 || currentMode === 'text') && (
                        renderContentToolbar(currentMode, textKey, field.types.length > 1 ? (m) => handleModeChange(titleKey, m) : undefined)
                    )}

                    {currentMode === 'text' && textKey ? (
                        <div className="animate-fadeIn">
                            <textarea id={textKey} name={textKey} value={(presentationData as any)[textKey] || ''} onChange={handleInputChange} className="w-full h-32 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none hide-scrollbar text-brutal-text"/>
                        </div>
                    ) : (
                        imageKey ? (
                            <div className="animate-fadeIn">
                                <FileUpload id={imageKey} onFileSelect={(files) => handleFileChange(imageKey, files)} multiple={isMultiImage} accept="image/*" label="UPLOAD IMAGE" files={uploadedFiles[imageKey] || []} onFileRemove={(fileName) => handleFileRemove(imageKey, fileName)} onInvertToggle={(fileName) => handleInvertToggle(imageKey, fileName)} invertedFiles={invertedImages[imageKey]} isImage={true} onFileEdit={(fileName) => handleFileEdit(imageKey, fileName)}/>
                            </div>
                        ) : <div className="text-sm font-bold bg-red-100 border-2 border-red-500 text-red-700 p-2">Image upload not available for this field.</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen bg-brutal-bg text-brutal-text font-sans relative overflow-hidden ${theme}`}>
            {/* Header and Step 1, 2 remain the same ... */}
            <div className="relative z-10 flex flex-col items-center p-4 sm:p-6 lg:p-8 min-h-screen overflow-y-auto hide-scrollbar">
                <div className="w-full max-w-4xl mx-auto">
                    <header className="flex justify-between items-start mb-8 bg-brutal-surface border-4 border-brutal-border p-4 shadow-brutal">
                        <div className="text-left">
                             <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter mb-2 text-brutal-text">
                                Otomateks
                            </h1>
                            <p className="text-lg font-bold bg-brutal-accent text-brutal-white inline-block px-2 border-2 border-brutal-border">
                                {t('appSubtitle')}
                            </p>
                        </div>
                        <DropdownMenu onTutorialClick={() => setIsTutorialOpen(true)} onSettingsClick={() => setIsSettingsOpen(true)} onDevlogClick={() => setIsDevlogOpen(true)} t={t} />
                    </header>

                    <main className="space-y-6">
                        {currentStep === 1 && (
                             <StepContainer key="step1" className="animate-fadeIn">
                                {/* Step 1 content (same as before) */}
                                <div className="bg-brutal-surface p-6 border-4 border-brutal-border shadow-brutal-lg space-y-8">
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black uppercase border-b-4 border-brutal-border inline-block text-brutal-text">
                                            {t('bahasa')}
                                        </h3>
                                        <div className="flex gap-4">
                                            <button onClick={() => setMassLanguage('indonesia')} className={`w-full px-4 py-3 text-sm font-bold border-4 border-brutal-border transition-all ${massLanguage === 'indonesia' ? 'bg-brutal-border text-brutal-bg shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-brutal-surface text-brutal-text shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg'}`}>INDONESIA</button>
                                            <button onClick={() => setMassLanguage('jawa')} className={`w-full px-4 py-3 text-sm font-bold border-4 border-brutal-border transition-all ${massLanguage === 'jawa' ? 'bg-brutal-border text-brutal-bg shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-brutal-surface text-brutal-text shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg'}`}>JAWA</button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black uppercase border-b-4 border-brutal-border inline-block text-brutal-text">{t('tipeMisa')}</h3>
                                        <div className="space-y-4">
                                            {massOptions.map((group) => (
                                                <div key={group.category}>
                                                    <p className="text-sm font-bold uppercase mb-2 bg-brutal-bg text-brutal-text inline-block px-2 border-2 border-brutal-border">{group.category}</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {group.options.map((option) => (
                                                            <label key={option.id} className={`flex items-center p-3 border-4 border-brutal-border transition-all cursor-pointer ${!option.enabled ? 'opacity-50 cursor-not-allowed bg-gray-200' : 'hover:bg-brutal-accent/10'} ${massType === option.id ? 'bg-brutal-border text-brutal-bg' : 'bg-brutal-surface text-brutal-text'}`}>
                                                                <input type="radio" name="massType" value={option.id} checked={massType === option.id} onChange={() => setMassType(option.id as MassType)} disabled={!option.enabled} className="w-5 h-5 accent-brutal-accent mr-3 border-2 border-brutal-border" />
                                                                <span className="text-sm font-bold uppercase">{option.label}</span>
                                                                {!option.enabled && <span className="ml-auto text-xs font-bold bg-brutal-accent text-brutal-white border-2 border-brutal-border px-2 py-0.5">SOON</span>}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button onClick={() => setCurrentStep(2)} className="flex items-center justify-center px-6 py-3 font-bold bg-brutal-accent text-brutal-white border-4 border-brutal-border shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all" aria-label={t('nextButton')}>
                                            <ArrowRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </StepContainer>
                        )}
                        
                        {currentStep === 2 && (
                             <StepContainer key="step2" className="animate-fadeIn">
                                {/* Step 2 Content (Pengumuman split vs Standard) */}
                                {massType === 'dataEntry' ? (
                                    <>
                                        <DataEntryWorkflow presentationTitle={presentationData.presentationTitle || ''} />
                                        <div className="flex justify-start pt-4">
                                            <button onClick={() => setCurrentStep(1)} className="flex items-center justify-center px-6 py-3 font-bold bg-brutal-surface text-brutal-text border-4 border-brutal-border shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all" aria-label={t('backButton')}><ArrowLeftIcon className="w-5 h-5" /></button>
                                        </div>
                                    </>
                                ) : massType === 'pengumuman' ? (
                                    <div className="bg-brutal-surface p-6 border-4 border-brutal-border shadow-brutal-lg space-y-6">
                                        {/* Opening */}
                                        <div className="space-y-4 border-b-4 border-brutal-border pb-6">
                                            <h2 className="text-xl font-black uppercase mb-2 text-brutal-text bg-brutal-bg inline-block px-2 border-2 border-brutal-border">{t('pengumumanPembuka')}</h2>
                                            <div><label htmlFor="openingFileName" className="block text-sm font-bold uppercase mb-2 text-brutal-text">{t('namaFile')}</label><input type="text" id="openingFileName" value={pengumumanConfig.openingFileName} onChange={(e) => handlePengumumanInputChange(e, 'opening')} className="w-full bg-brutal-surface border-4 border-brutal-border p-3 font-bold focus:bg-brutal-bg focus:outline-none focus:shadow-brutal-sm transition-all text-brutal-text" /></div>
                                            <div><FileUpload id="opening-template-upload" onFileSelect={(f) => handlePengumumanTemplateUpload(f, 'opening')} accept=".pptx" label={t('uploadTemplateOpening')} files={pengumumanConfig.openingTemplate ? [pengumumanConfig.openingTemplate] : []} onFileRemove={() => handlePengumumanTemplateRemove('opening')} /></div>
                                        </div>
                                        {/* Closing */}
                                        <div className="space-y-4">
                                            <h2 className="text-xl font-black uppercase mb-2 text-brutal-text bg-brutal-bg inline-block px-2 border-2 border-brutal-border">{t('pengumumanPenutup')}</h2>
                                            <div><label htmlFor="closingFileName" className="block text-sm font-bold uppercase mb-2 text-brutal-text">{t('namaFile')}</label><input type="text" id="closingFileName" value={pengumumanConfig.closingFileName} onChange={(e) => handlePengumumanInputChange(e, 'closing')} className="w-full bg-brutal-surface border-4 border-brutal-border p-3 font-bold focus:bg-brutal-bg focus:outline-none focus:shadow-brutal-sm transition-all text-brutal-text" /></div>
                                            <div><FileUpload id="closing-template-upload" onFileSelect={(f) => handlePengumumanTemplateUpload(f, 'closing')} accept=".pptx" label={t('uploadTemplateClosing')} files={pengumumanConfig.closingTemplate ? [pengumumanConfig.closingTemplate] : []} onFileRemove={() => handlePengumumanTemplateRemove('closing')} /></div>
                                        </div>
                                        <div className="flex justify-between pt-6">
                                            <button onClick={() => setCurrentStep(1)} className="flex items-center justify-center px-6 py-3 font-bold bg-brutal-surface text-brutal-text border-4 border-brutal-border shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all" aria-label={t('backButton')}><ArrowLeftIcon className="w-5 h-5" /></button>
                                            <button onClick={() => setCurrentStep(3)} disabled={!pengumumanConfig.openingTemplate && !pengumumanConfig.closingTemplate} className={`flex items-center justify-center px-6 py-3 font-bold border-4 border-brutal-border shadow-brutal transition-all ${(!pengumumanConfig.openingTemplate && !pengumumanConfig.closingTemplate) ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-brutal-accent text-brutal-white hover:-translate-y-1 hover:shadow-brutal-lg'}`} aria-label={t('nextButton')}><ArrowRightIcon className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-brutal-surface p-6 border-4 border-brutal-border shadow-brutal-lg space-y-6">
                                        <div><label htmlFor="presentationTitle" className="block text-xl font-black uppercase mb-2 text-brutal-text">{t('namaFile')}</label><input type="text" id="presentationTitle" name="presentationTitle" value={presentationData.presentationTitle || ''} onChange={handleInputChange} className="w-full bg-brutal-surface border-4 border-brutal-border p-3 font-bold focus:bg-brutal-bg focus:outline-none focus:shadow-brutal-sm transition-all text-brutal-text" placeholder={t('mainTitlePlaceholder')} /></div>
                                        <div><h2 className="text-xl font-black uppercase mb-2 text-brutal-text">{t('uploadTemplateTitle')}</h2><FileUpload id="template-upload" onFileSelect={handleTemplateUpload} accept=".pptx" label={t('uploadTemplateLabel')} files={uploadedTemplate ? [uploadedTemplate] : []} onFileRemove={handleTemplateRemove} /></div>
                                        <div className="flex justify-between pt-6">
                                            <button onClick={() => setCurrentStep(1)} className="flex items-center justify-center px-6 py-3 font-bold bg-brutal-surface text-brutal-text border-4 border-brutal-border shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all" aria-label={t('backButton')}><ArrowLeftIcon className="w-5 h-5" /></button>
                                            <button onClick={() => setCurrentStep(3)} disabled={!uploadedTemplate} className={`flex items-center justify-center px-6 py-3 font-bold border-4 border-brutal-border shadow-brutal transition-all ${!uploadedTemplate ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-brutal-accent text-brutal-white hover:-translate-y-1 hover:shadow-brutal-lg'}`} aria-label={t('nextButton')}><ArrowRightIcon className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                )}
                            </StepContainer>
                        )}
                        
                        {currentStep === 3 && massType !== 'dataEntry' && (
                            <StepContainer key="step3" className="animate-fadeIn">
                                <div className="bg-brutal-surface p-6 border-4 border-brutal-border shadow-brutal-lg space-y-6">
                                    {massType === 'pengumuman' ? (
                                        <>
                                             {/* Pengumuman logic omitted for brevity, keeping same */}
                                             <div className="space-y-6">
                                                {Array.from({ length: announcementCount }).map((_, index) => {
                                                    const pKey = `P${(index + 1).toString().padStart(2, '0')}`;
                                                    const pcKey = `PC${(index + 1).toString().padStart(2, '0')}`;
                                                    const currentMode = inputModes[pKey] || 'text';

                                                    return (
                                                        <div key={pKey} className="bg-brutal-surface p-4 border-4 border-brutal-border space-y-4 animate-fadeIn">
                                                            <div className="flex justify-between items-center border-b-4 border-brutal-border pb-2">
                                                                <h3 className="text-lg font-black uppercase bg-brutal-accent text-brutal-white px-2 border-2 border-brutal-border">
                                                                    PENGUMUMAN {toRoman(index + 1)}
                                                                </h3>
                                                            </div>
                                                            <div className="animate-fadeIn">
                                                                {renderContentToolbar(currentMode, pKey, (m) => handleModeChange(pKey, m))}
                                                                {currentMode === 'text' ? (
                                                                    <>
                                                                        <textarea id={pKey} name={pKey} value={(presentationData as any)[pKey] || ''} onChange={handleInputChange} className="w-full h-32 bg-brutal-bg border-2 border-brutal-border p-2 font-mono text-sm focus:bg-brutal-surface focus:outline-none hide-scrollbar text-brutal-text"/>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FileUpload id={pcKey} onFileSelect={(files) => handleFileChange(pcKey, files)} multiple={false} accept="image/*" label="UPLOAD IMAGE" files={uploadedFiles[pcKey] || []} onFileRemove={(fileName) => handleFileRemove(pcKey, fileName)} isImage={true} disableImageTools={true} />
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex justify-center mt-4">
                                                <button onClick={() => setAnnouncementCount(prev => prev + 1)} className="w-full py-4 bg-brutal-accent text-brutal-white border-4 border-brutal-border shadow-brutal flex items-center justify-center gap-2 hover:bg-brutal-border hover:text-brutal-bg transition-colors active:translate-y-1 active:shadow-none font-black uppercase text-lg" title="Add Announcement Slide">
                                                    <PlusIcon className="w-6 h-6" /> Add Slide
                                                </button>
                                            </div>
                                            {/* (Kolekte and Wedding sections omitted for brevity) */}
                                        </>
                                    ) : (
                                    <div className="space-y-6">
                                         {massType === 'harian' && (
                                            <div className="bg-brutal-surface p-4 border-4 border-brutal-border">
                                                <button onClick={() => setIsOptionalSectionsOpen(!isOptionalSectionsOpen)} className="w-full font-bold uppercase cursor-pointer flex justify-between items-center hover:bg-brutal-bg p-2 -m-2 text-brutal-text">
                                                    <div className="flex items-center gap-2"><SlidersIcon className="w-5 h-5" />Optional Sections</div>
                                                    <span className={`border-2 border-brutal-border p-1 transition-colors ${isOptionalSectionsOpen ? 'bg-brutal-border text-brutal-bg' : ''}`}><svg className={`w-4 h-4 transition-transform duration-200 ${isOptionalSectionsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg></span>
                                                </button>
                                                <div className={`grid transition-all duration-300 ease-in-out ${isOptionalSectionsOpen ? 'grid-rows-[1fr] mt-4 border-t-4 border-brutal-border pt-4' : 'grid-rows-[0fr]'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                            {optionalSectionsConfig.map(section => (
                                                                <label key={section.key} className="flex items-center space-x-2 cursor-pointer text-sm font-bold">
                                                                    <input type="checkbox" className="w-5 h-5 border-2 border-brutal-border accent-brutal-border rounded-none focus:ring-0" checked={harianOptionalSections[section.key]} onChange={() => handleHarianToggle(section.key)} />
                                                                    <span className="text-brutal-text uppercase">{section.label}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* MANUALLY ORDERED SECTIONS FOR LITURGICAL FLOW */}
                                        
                                        {/* 1. Misa Memule Extra Fields */}
                                        {massType === 'memule' && renderStaticField('A36')} {/* Thumbnail A */}
                                        {massType === 'memule' && renderStaticField('A35')} {/* Pengantar */}

                                        {/* 2. Lagu Pembuka (Static) */}
                                        {renderStaticField('A01')}

                                        {/* 3. Tuhan Kasihanilah Kami (Static) */}
                                        {(massType !== 'harian' || harianOptionalSections.showTuhanKasihanilahKami) && (
                                            <>
                                                {renderStaticField('A02')}
                                                {renderStaticField('A03')}
                                                {renderStaticField('A04')}
                                            </>
                                        )}

                                        {/* 4. Doa Kolekta (Static) */}
                                        {(massType !== 'harian' || harianOptionalSections.showDoaKolekta) && renderStaticField('A05')}

                                        {/* 5. Bacaan I (Static) */}
                                        {renderStaticField('A06')}

                                        {/* 6. Mazmur Tanggapan (Custom Static Section) */}
                                        {renderMazmurSectionStatic()}

                                        {/* 8. Bacaan II (Static) */}
                                        {(massType !== 'harian' || harianOptionalSections.showBacaan2) && renderStaticField('A011')}

                                        {/* 9. Bait Pengantar Injil (Custom Static Section) */}
                                        {renderBPISectionStatic()}

                                        {/* 11. Bacaan Injil (Static) */}
                                        {renderStaticField('A014')}

                                        {/* 12. Doa Umat (Custom Static Section with Lektors I-X) */}
                                        {(massType !== 'harian' || harianOptionalSections.showDoaUmat) && 
                                            renderDoaUmatSectionStatic()
                                        }

                                        {/* 13. Lagu Persembahan (Static) */}
                                        {renderStaticField('A28')}

                                        {/* 14. Doa Atas Persembahan (Static) */}
                                        {renderStaticField('A29')}

                                        {/* 15. Lagu Komuni (Static) */}
                                        {renderStaticField('A30')}

                                        {/* 16. Doa Sesudah Komuni (Static) */}
                                        {(massType !== 'harian' || harianOptionalSections.showDoaSesudahKomuni) && renderStaticField('A33')}

                                        {/* 17. Lagu Penutup (Static) */}
                                        {renderStaticField('A34')}
                                        
                                        {/* 18. Thumbnail B (Memule Only) */}
                                        {massType === 'memule' && renderStaticField('A37')}

                                    </div>
                                    )}
                                     <div className="flex justify-between pt-4">
                                        <button onClick={() => setCurrentStep(2)} className="flex items-center justify-center px-6 py-3 font-bold bg-brutal-surface text-brutal-text border-4 border-brutal-border shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all" aria-label={t('backButton')}>
                                            <ArrowLeftIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setCurrentStep(4)} className="flex items-center justify-center px-6 py-3 font-bold bg-brutal-accent text-brutal-white border-4 border-brutal-border shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all" aria-label={t('nextButton')}>
                                            <ArrowRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </StepContainer>
                        )}
                        
                        {/* Step 4 ... */}
                         {currentStep === 4 && massType !== 'dataEntry' && (
                            <StepContainer key="step4" className="animate-fadeIn">
                                 <div className="bg-brutal-surface p-8 border-4 border-brutal-border shadow-brutal-lg text-center">
                                    <h2 className="text-3xl font-black uppercase mb-6 text-brutal-text">{t('finalMessage')}</h2>
                                    <button 
                                        onClick={handleGenerate} 
                                        disabled={isGenerateDisabled}
                                        className={`w-full max-w-sm mx-auto py-4 px-6 text-xl font-black uppercase border-4 border-brutal-border shadow-brutal transition-all flex items-center justify-center gap-2
                                            ${isGenerateDisabled 
                                                ? 'bg-gray-400 cursor-not-allowed text-brutal-text' 
                                                : 'bg-brutal-accent text-brutal-white hover:-translate-y-2 hover:shadow-brutal-lg'}`
                                        }>
                                        {isLoading ? <><LoaderIcon className="w-6 h-6 animate-spin" /> {t('generatingButton')}</> : <><DownloadIcon className="w-6 h-6"/> {t('generateButton')}</>}
                                    </button>
                                    <div className="flex justify-start pt-8">
                                        <button onClick={() => setCurrentStep(3)} className="flex items-center justify-center px-6 py-3 font-bold bg-brutal-surface text-brutal-text border-4 border-brutal-border shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all" aria-label={t('backButton')}>
                                            <ArrowLeftIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                 <div className="h-10 text-center mt-6 font-mono font-bold">
                                    {isLoading && (
                                        <div className="flex items-center justify-center gap-2 text-brutal-text">
                                            <LoaderIcon className="w-4 h-4 animate-spin"/>
                                            <p>{statusMessage}</p>
                                        </div>
                                    )}
                                    {!isLoading && statusMessage && !error && (
                                        <p className="text-brutal-text bg-brutal-accent/20 border-2 border-brutal-accent inline-block px-2">{statusMessage}</p>
                                    )}
                                    {error && (
                                        <div className="flex items-center justify-center gap-2 text-red-600 bg-red-100 border-2 border-red-600 p-2 inline-block">
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

            <Modal
                isOpen={isOcrModalOpen}
                onClose={() => setIsOcrModalOpen(false)}
                title="Basic Image to Text"
                maxWidth="max-w-4xl"
            >
                <OcrModal 
                    onInsert={handleOcrInsert} 
                    onClose={() => setIsOcrModalOpen(false)} 
                />
            </Modal>
        </div>
    );
};

export default App;
