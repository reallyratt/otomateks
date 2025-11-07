
import React, { useState, useCallback } from 'react';
import { UploadIcon, XIcon } from './icons';

interface FileUploadProps {
    onFileSelect: (file: any) => void;
    accept: string;
    label: string;
    multiple?: boolean;
    id: string;
    files?: File[];
    onFileRemove?: (fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, label, multiple = false, id, files = [], onFileRemove }) => {
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
        const files = e.dataTransfer.files;
        if (files) {
            if (multiple) {
                onFileSelect(Array.from(files));
            } else if (files.length > 0) {
                onFileSelect(files[0]);
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
                                {onFileRemove && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); onFileRemove(file.name); }}
                                        className="text-red-500/70 hover:text-red-400 p-1 rounded-full hover:bg-red-500/20 transition-all transform scale-90 opacity-70 group-hover:scale-100 group-hover:opacity-100"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
