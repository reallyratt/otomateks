
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
    disableImageTools?: boolean;
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
    onFileEdit,
    disableImageTools = false
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
        if (accept.includes('.docx')) return 'DOCX';
        if (accept.includes('.pptx')) return 'PPTX';
        if (accept.includes('.xlsx')) return 'XLSX';
        if (accept.includes('image')) return 'PNG, JPG';
        return 'FILE';
    };

    return (
        <div>
            <label
                htmlFor={id}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-32 border-4 border-brutal-border cursor-pointer transition-all duration-200
                    ${isDragging ? 'bg-brutal-accent/20 scale-95' : 'bg-brutal-surface hover:bg-brutal-bg hover:-translate-y-1 hover:shadow-brutal'}`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className={`w-8 h-8 mb-3 text-brutal-text`} />
                    <p className={`mb-2 text-sm text-center font-bold uppercase text-brutal-text`}>
                        <span className="bg-brutal-border text-brutal-bg px-1">{label}</span> or drag
                    </p>
                    <p className="text-xs font-mono border border-brutal-border px-1 bg-brutal-bg text-brutal-text">
                        {fileTypeDescription(accept)}
                    </p>
                </div>
                <input id={id} type="file" className="hidden" accept={accept} multiple={multiple} onChange={handleFileChange} />
            </label>
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-black uppercase border-b-2 border-brutal-border inline-block text-brutal-text">Uploaded Files</h4>
                    <ul className="space-y-2">
                        {files.map(file => (
                            <li key={file.name} className="flex items-center justify-between bg-brutal-surface border-2 border-brutal-border p-2 shadow-brutal-sm group hover:translate-x-1 transition-transform animate-slideIn">
                                <button 
                                    onClick={() => handlePreview(file)}
                                    className={`text-brutal-text font-bold truncate pr-2 text-left text-sm ${isImage ? 'hover:underline cursor-pointer' : ''}`}
                                    title={isImage ? "Click to preview" : file.name}
                                >
                                    {file.name}
                                </button>
                                <div className="flex items-center gap-2">
                                     {isImage && onFileEdit && !disableImageTools && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); onFileEdit(file.name); }}
                                            className="text-brutal-text border-2 border-brutal-border p-1 hover:bg-brutal-accent hover:text-brutal-white transition-colors"
                                            aria-label={`Edit ${file.name}`}
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    
                                    {isImage && onInvertToggle && !disableImageTools && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); onInvertToggle(file.name); }}
                                            className={`p-1 border-2 border-brutal-border transition-colors ${
                                                invertedFiles.has(file.name)
                                                    ? 'bg-brutal-border text-brutal-bg'
                                                    : 'bg-brutal-surface text-brutal-text hover:bg-brutal-bg'
                                            }`}
                                            aria-label={`Invert colors for ${file.name}`}
                                        >
                                            <ContrastIcon className="w-4 h-4" />
                                        </button>
                                    )}

                                    {onFileRemove && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); onFileRemove(file.name); }}
                                            className="text-brutal-white bg-red-600 border-2 border-brutal-border p-1 hover:bg-red-700 transition-colors"
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-brutal-bg/90 p-4 animate-fadeIn"
                    onClick={closePreview}
                >
                    <div className="relative border-4 border-brutal-border bg-brutal-surface p-2 shadow-brutal-lg max-w-[95vw] max-h-[95dvh] flex flex-col items-center animate-slideUp">
                         <button 
                            onClick={closePreview}
                            className="absolute -top-6 -right-6 p-2 text-brutal-bg bg-brutal-border border-2 border-brutal-surface shadow-[2px_2px_0px_var(--brutal-border)] hover:scale-110 transition z-50"
                         >
                            <XIcon className="w-6 h-6" />
                         </button>
                         <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-w-full max-h-[85dvh] w-auto h-auto object-contain border-2 border-brutal-border"
                            onClick={(e) => e.stopPropagation()} 
                        />
                         <p className="mt-2 text-brutal-text font-mono font-bold text-sm bg-brutal-accent text-brutal-white px-2 border-2 border-brutal-border">{previewFileName}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
