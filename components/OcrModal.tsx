
import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { ArrowUpIcon, ArrowDownIcon, TrashIcon, LoaderIcon, ScanIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';
import { performOcr } from '../services/ocrService';

interface OcrModalProps {
    onInsert: (text: string) => void;
    onClose: () => void;
    apiKey: string;
}

interface UploadedOcrFile {
    id: string;
    file: File;
    previewUrl: string;
}

export const OcrModal: React.FC<OcrModalProps> = ({ onInsert, onClose, apiKey }) => {
    const [step, setStep] = useState<'upload' | 'edit'>('upload');
    const [files, setFiles] = useState<UploadedOcrFile[]>([]);
    const [extractedText, setExtractedText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (newFiles: File | File[]) => {
        const fileArray = Array.isArray(newFiles) ? newFiles : [newFiles];
        const newOcrFiles = fileArray.map(f => ({
            id: Math.random().toString(36).substr(2, 9),
            file: f,
            previewUrl: URL.createObjectURL(f)
        }));
        setFiles(prev => [...prev, ...newOcrFiles]);
    };

    const handleRemoveFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...files];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex >= 0 && targetIndex < newFiles.length) {
            [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
            setFiles(newFiles);
        }
    };

    const processFiles = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setError(null);

        try {
            const results = await Promise.all(
                files.map(f => performOcr(f.file, apiKey))
            );
            const combinedText = results.join('\n\n');
            setExtractedText(combinedText);
            setStep('edit');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process images');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b-4 border-brutal-border bg-brutal-surface">
                <h3 className="text-xl font-black uppercase flex items-center gap-2 text-brutal-text">
                    <ScanIcon className="w-6 h-6"/> Image to Text (OCR)
                </h3>
            </div>

            <div className="flex-grow p-6 overflow-y-auto bg-brutal-bg text-brutal-text">
                {step === 'upload' ? (
                    <div className="space-y-6">
                        <FileUpload
                            id="ocr-upload"
                            accept="image/*"
                            label="Upload Images"
                            multiple={true}
                            onFileSelect={handleFileSelect}
                        />

                        {files.length > 0 && (
                            <div className="space-y-2">
                                {files.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-4 bg-brutal-surface p-2 border-2 border-brutal-border shadow-brutal-sm">
                                        <img src={item.previewUrl} alt="Preview" className="w-16 h-16 object-cover border border-brutal-border" />
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold truncate text-sm">{item.file.name}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => moveFile(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 border-2 border-brutal-border hover:bg-brutal-border hover:text-brutal-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ArrowUpIcon className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => moveFile(index, 'down')}
                                                disabled={index === files.length - 1}
                                                className="p-1 border-2 border-brutal-border hover:bg-brutal-border hover:text-brutal-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ArrowDownIcon className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => handleRemoveFile(item.id)}
                                                className="p-1 border-2 border-brutal-border bg-red-500 text-white hover:bg-red-700 transition-colors ml-2"
                                            >
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-2 text-sm font-bold">
                                {error}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col space-y-2">
                        <label className="text-sm font-bold uppercase">Edit Extracted Text</label>
                        <textarea
                            className="flex-grow w-full bg-brutal-surface border-4 border-brutal-border p-4 font-mono text-sm focus:outline-none focus:shadow-brutal"
                            value={extractedText}
                            onChange={(e) => setExtractedText(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t-4 border-brutal-border bg-brutal-surface flex justify-between">
                {step === 'upload' ? (
                    <>
                         <button onClick={onClose} className="px-4 py-2 font-bold border-2 border-brutal-border hover:bg-brutal-bg transition-colors text-brutal-text">
                            Cancel
                        </button>
                        <button 
                            onClick={processFiles}
                            disabled={files.length === 0 || isProcessing}
                            className={`flex items-center gap-2 px-6 py-2 font-bold border-4 border-brutal-border shadow-brutal transition-all
                                ${files.length === 0 || isProcessing ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-brutal-accent text-brutal-white hover:-translate-y-1 hover:shadow-brutal-lg'}
                            `}
                        >
                            {isProcessing ? <><LoaderIcon className="w-4 h-4"/> Processing...</> : <><ScanIcon className="w-4 h-4"/> Process Images</>}
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setStep('upload')} className="flex items-center gap-2 px-4 py-2 font-bold border-2 border-brutal-border hover:bg-brutal-bg transition-colors text-brutal-text">
                            <ArrowLeftIcon className="w-4 h-4"/> Back
                        </button>
                        <button 
                            onClick={() => { onInsert(extractedText); onClose(); }}
                            className="flex items-center gap-2 px-6 py-2 font-bold border-4 border-brutal-border shadow-brutal bg-brutal-accent text-brutal-white hover:-translate-y-1 hover:shadow-brutal-lg transition-all"
                        >
                            Insert Text <ArrowRightIcon className="w-4 h-4"/>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
