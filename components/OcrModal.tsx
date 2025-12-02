
import React, { useState, useRef } from 'react';
import { FileUpload } from './FileUpload';
import { performOcr } from '../services/ocrService';
import { ArrowUpIcon, ArrowDownIcon, ScanIcon, DownloadIcon, LoaderIcon } from './icons';

interface OcrModalProps {
    onInsert: (text: string) => void;
    onClose: () => void;
}

export const OcrModal: React.FC<OcrModalProps> = ({ onInsert, onClose }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [scannedText, setScannedText] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleFileSelect = (newFiles: File | File[]) => {
        const fileArray = Array.isArray(newFiles) ? newFiles : [newFiles];
        setFiles(prev => [...prev, ...fileArray]);
    };

    const handleRemoveFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.name !== fileName));
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...files];
        if (direction === 'up' && index > 0) {
            [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
        } else if (direction === 'down' && index < newFiles.length - 1) {
            [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
        }
        setFiles(newFiles);
    };

    const handleScan = async () => {
        if (files.length === 0) return;
        
        setIsProcessing(true);
        setStatusMessage("Initializing Tesseract Engine...");
        
        try {
            setStatusMessage("Scanning images... Please wait.");
            const text = await performOcr(files);
            setScannedText(prev => prev + (prev ? '\n\n' : '') + text);
            setStatusMessage("Scan complete!");
        } catch (err) {
            console.error(err);
            setStatusMessage("Error during scan.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-[80vh] sm:h-[85vh] text-brutal-text">
             <div className="flex-shrink-0 p-4 border-b-4 border-brutal-border bg-brutal-surface">
                <p className="text-sm font-bold uppercase bg-brutal-accent text-brutal-white px-2 border-2 border-brutal-border inline-block">UPLOAD IMAGE. BOOM! TEXT.</p>
            </div>

            <div className="flex-grow p-4 overflow-y-auto bg-brutal-bg space-y-6">
                
                {/* Upload Section */}
                <div className="space-y-2">
                    <FileUpload
                        id="ocr-upload"
                        onFileSelect={handleFileSelect}
                        accept="image/*"
                        label="Upload Images"
                        multiple={true}
                    />
                </div>

                {/* File List Section */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-brutal-surface border-2 border-brutal-border p-2 shadow-brutal-sm gap-2">
                                    <span className="truncate text-sm font-mono flex-grow pr-2">{file.name}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button 
                                            onClick={() => moveFile(index, 'up')} 
                                            disabled={index === 0}
                                            className="w-8 h-8 flex items-center justify-center border-2 border-brutal-border hover:bg-brutal-bg disabled:opacity-30 transition-colors"
                                        >
                                            <ArrowUpIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => moveFile(index, 'down')} 
                                            disabled={index === files.length - 1}
                                            className="w-8 h-8 flex items-center justify-center border-2 border-brutal-border hover:bg-brutal-bg disabled:opacity-30 transition-colors"
                                        >
                                            <ArrowDownIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveFile(file.name)}
                                            className="w-8 h-8 flex items-center justify-center border-2 border-brutal-border bg-red-600 text-white hover:bg-red-700 ml-2 transition-colors"
                                        >
                                             <span className="font-bold text-xs">X</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            onClick={handleScan}
                            disabled={isProcessing}
                            className={`w-full py-2 font-bold uppercase border-2 border-brutal-border shadow-brutal flex items-center justify-center gap-2 mt-2
                                ${isProcessing ? 'bg-gray-300 cursor-not-allowed' : 'bg-brutal-accent text-brutal-white hover:-translate-y-1 hover:shadow-brutal-lg'}`}
                        >
                            {isProcessing ? <><LoaderIcon className="w-4 h-4 animate-spin"/> Processing...</> : <><ScanIcon className="w-4 h-4"/> Scan Images</>}
                        </button>
                        {statusMessage && <p className="text-xs font-mono text-center bg-brutal-surface border-2 border-brutal-border p-1">{statusMessage}</p>}
                    </div>
                )}

                {/* Result Section */}
                <div className="space-y-2">
                    <textarea 
                        value={scannedText}
                        onChange={(e) => setScannedText(e.target.value)}
                        placeholder="Scanned text will appear here. You can edit it before inserting."
                        className="w-full h-40 bg-brutal-surface border-2 border-brutal-border p-2 font-mono text-sm focus:outline-none resize-y"
                    />
                </div>
            </div>

            <div className="flex-shrink-0 p-4 border-t-4 border-brutal-border bg-brutal-surface flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-bold uppercase bg-brutal-surface border-2 border-brutal-border text-brutal-text hover:bg-brutal-bg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => { onInsert(scannedText); onClose(); }}
                    disabled={!scannedText}
                    className="px-4 py-2 text-sm font-bold uppercase bg-brutal-accent border-2 border-brutal-border text-brutal-white shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Insert Text
                </button>
            </div>
        </div>
    );
};
