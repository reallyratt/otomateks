
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
                                <span className="text-[var(--text-primary)] truncate pr-2">{file.name}</span>
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
        </div>
    );
};
