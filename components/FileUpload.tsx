import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
    onFileSelect: (file: any) => void;
    accept: string;
    label: string;
    multiple?: boolean;
    id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, label, multiple = false, id }) => {
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

    return (
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
                    {accept === '.docx' ? 'DOCX file' : (accept === '.pptx' ? 'PPTX file' : 'PNG, JPG, etc.')}
                </p>
            </div>
            <input id={id} type="file" className="hidden" accept={accept} multiple={multiple} onChange={handleFileChange} />
        </label>
    );
};