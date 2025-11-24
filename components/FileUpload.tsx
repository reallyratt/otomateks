
import React, { useState, useCallback } from 'react';
import { UploadIcon, XIcon, PencilIcon, ContrastIcon } from './icons';

interface FileUploadProps {
    onFileSelect: (file: any) => void;
    accept: string;
    label: string;
    multiple?: boolean;
    id: string;
    files?: File[];
    onFileRemove?: (fileName: string) => void;
    onInvertToggle?: (fileName: string) => void;
    invertedFiles?: Set<string>;
    isImage?: boolean;
    onFileEdit?: (fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
    onFileSelect, 
    accept, 
    label, 
    multiple = false, 
    id, 
    files = [], 
    onFileRemove,
    onInvertToggle,
    invertedFiles = new Set(),
    isImage = false,
    onFileEdit
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFileName, setPreviewFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            if (multiple) {
                onFileSelect(Array.from(e.target.files));
            } else if (e.target.files.length > 0) {
                onFileSelect(e.target.files[0]);
            }
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles) {
            if (multiple) {
                onFileSelect(Array.from(droppedFiles));
            } else if (droppedFiles.length > 0) {
                onFileSelect(droppedFiles[0]);
            }
        }
    }, [multiple, onFileSelect]);
    
    const handlePreview = (file: File) => {
        if (!isImage) return;
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setPreviewFileName(file.name);
    };
    
    const closePreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPreviewFileName(null);
    };

    const fileTypeDescription = (accept: string) => {
        if (accept.includes('.docx')) return 'DOCX file';
        if (accept.includes('.pptx')) return 'PPTX file';
        if (accept.includes('.xlsx')) return 'XLSX file';
        if (accept.includes('image')) return 'PNG, JPG, etc.';
        return 'File';
    };

    return (
        <div>
            <label
                htmlFor={id}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
                    ${isDragging ? 'border-[var(--accent-color-400)] bg-[var(--accent-color-500)]/10' : 'border-[var(--border-secondary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)]'}`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className={`w-8 h-8 mb-3 transition-colors ${isDragging ? 'text-[var(--accent-color-400)]' : 'text-[var(--text-secondary)]'}`} />
                    <p className={`mb-2 text-sm text-center ${isDragging ? 'text-[var(--accent-color-300)]' : 'text-[var(--text-secondary)]'}`}>
                        <span className="font-semibold text-[var(--accent-color-400)]">{label}</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                        {fileTypeDescription(accept)}
                    </p>
                </div>
                <input id={id} type="file" className="hidden" accept={accept} multiple={multiple} onChange={handleFileChange} />
            </label>
            {files.length > 0 && (
                <div className="mt-3 space-y-2 animate-[fadeIn_0.3s_ease-in-out]">
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] tracking-wider uppercase">Uploaded Files</h4>
                    <ul className="space-y-1">
                        {files.map(file => (
                            <li key={file.name} className="flex items-center justify-between bg-[var(--bg-tertiary)] p-2 rounded-md text-sm group">
                                <button 
                                    onClick={() => handlePreview(file)}
                                    className={`text-[var(--text-primary)] truncate pr-2 text-left ${isImage ? 'hover:text-[var(--accent-color-400)] hover:underline cursor-pointer' : ''}`}
                                    title={isImage ? "Click to preview" : file.name}
                                >
                                    {file.name}
                                </button>
                                <div className="flex items-center gap-1">
                                     {isImage && onFileEdit && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); onFileEdit(file.name); }}
                                            className="text-gray-400/70 hover:text-[var(--text-primary)] p-1.5 rounded-md hover:bg-gray-500/20 transition-all transform hover:scale-110 active:scale-100"
                                            aria-label={`Edit ${file.name}`}
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    
                                    {isImage && onInvertToggle && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); onInvertToggle(file.name); }}
                                            className={`p-1.5 rounded-md transition-all transform hover:scale-110 active:scale-100 ${
                                                invertedFiles.has(file.name)
                                                    ? 'bg-[var(--accent-color-500)] text-white'
                                                    : 'text-gray-400/70 hover:text-[var(--text-primary)] hover:bg-gray-500/20'
                                            }`}
                                            aria-label={`Invert colors for ${file.name}`}
                                            aria-pressed={invertedFiles.has(file.name)}
                                        >
                                            <ContrastIcon className="w-4 h-4" />
                                        </button>
                                    )}

                                    {onFileRemove && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); onFileRemove(file.name); }}
                                            className="text-red-500/70 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/20 transition-all transform hover:scale-110 active:scale-100"
                                            aria-label={`Remove ${file.name}`}
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {/* Image Preview Modal */}
            {previewUrl && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
                    onClick={closePreview}
                >
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                         <button 
                            onClick={closePreview}
                            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition z-50 bg-black/50 rounded-full"
                         >
                            <XIcon className="w-8 h-8" />
                         </button>
                         <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-w-[95vw] max-h-[95dvh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()} 
                        />
                         <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">{previewFileName}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
