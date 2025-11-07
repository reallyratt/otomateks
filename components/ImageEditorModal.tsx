
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CropIcon, TrashIcon } from './icons';

interface Rect {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageEditorModalProps {
    file: File;
    onSave: (originalFile: File, newFiles: File[]) => void;
    onClose: () => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ file, onSave, onClose }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [rects, setRects] = useState<Rect[]>([]);
    const [nextId, setNextId] = useState(1);
    
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const interactionRef = useRef<{
        type: 'move' | 'resize-br' | null;
        rectId: number | null;
        startX: number;
        startY: number;
        startRectX: number;
        startRectY: number;
        startRectW: number;
        startRectH: number;
    } | null>(null);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleAddRect = () => {
        const newRect: Rect = {
            id: nextId,
            x: 10,
            y: 10,
            width: 200,
            height: 50
        };
        setRects(prev => [...prev, newRect]);
        setNextId(prev => prev + 1);
    };
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, rectId: number, type: 'move' | 'resize-br') => {
        e.stopPropagation();
        const rect = rects.find(r => r.id === rectId);
        if (!rect) return;

        interactionRef.current = {
            type,
            rectId,
            startX: e.clientX,
            startY: e.clientY,
            startRectX: rect.x,
            startRectY: rect.y,
            startRectW: rect.width,
            startRectH: rect.height,
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!interactionRef.current || !containerRef.current) return;
        
        const { type, rectId, startX, startY, startRectX, startRectY, startRectW, startRectH } = interactionRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const containerBounds = containerRef.current.getBoundingClientRect();
        
        setRects(prevRects => prevRects.map(r => {
            if (r.id !== rectId) return r;
            
            let newX = r.x;
            let newY = r.y;
            let newWidth = r.width;
            let newHeight = r.height;

            if (type === 'move') {
                newX = startRectX + dx;
                newY = startRectY + dy;
            } else if (type === 'resize-br') {
                newWidth = startRectW + dx;
                newHeight = startRectH + dy;
            }
            
            // Boundary checks
            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newWidth < 20) newWidth = 20;
            if (newHeight < 20) newHeight = 20;
            if (newX + newWidth > containerBounds.width) newWidth = containerBounds.width - newX;
            if (newY + newHeight > containerBounds.height) newHeight = containerBounds.height - newY;

            return { ...r, x: newX, y: newY, width: newWidth, height: newHeight };
        }));

    }, []);

    const handleMouseUp = useCallback(() => {
        interactionRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);
    
    const handleDeleteRect = (e: React.MouseEvent, idToDelete: number) => {
        e.stopPropagation();
        setRects(prev => prev.filter(r => r.id !== idToDelete));
    };

    const handleSave = async () => {
        if (!imageRef.current || rects.length === 0) {
            onClose();
            return;
        }

        const imageElement = imageRef.current;
        const naturalWidth = imageElement.naturalWidth;
        const naturalHeight = imageElement.naturalHeight;
        const displayedWidth = imageElement.width;
        const displayedHeight = imageElement.height;
        const scaleX = naturalWidth / displayedWidth;
        const scaleY = naturalHeight / displayedHeight;
        
        const sortedRects = [...rects].sort((a, b) => a.y - b.y);

        let totalHeight = 0;
        let maxWidth = 0;
        sortedRects.forEach(rect => {
            totalHeight += rect.height;
            if (rect.width > maxWidth) {
                maxWidth = rect.width;
            }
        });

        const finalCanvasWidth = maxWidth * scaleX;
        const finalCanvasHeight = totalHeight * scaleY;

        if (finalCanvasWidth === 0 || finalCanvasHeight === 0) {
            onClose();
            return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = finalCanvasWidth;
        canvas.height = finalCanvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let currentY = 0;

        for (const rect of sortedRects) {
            const sx = rect.x * scaleX;
            const sy = rect.y * scaleY;
            const sWidth = rect.width * scaleX;
            const sHeight = rect.height * scaleY;

            ctx.drawImage(imageElement, sx, sy, sWidth, sHeight, 0, currentY, sWidth, sHeight);
            currentY += sHeight;
        }

        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || `image_crop_${Date.now()}`;
            const newFileName = `${originalName}_combined.png`;
            const newCombinedFile = new File([blob], newFileName, { type: 'image/png' });
            onSave(file, [newCombinedFile]);
        } else {
            onClose();
        }
    };

    return (
        <div className="flex flex-col h-[75vh]">
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border-secondary)] bg-[var(--bg-primary)] rounded-t-lg">
                <p className="text-sm text-[var(--text-secondary)]">Draw boxes to crop parts of the image.</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAddRect}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-transparent border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)] transition-all"
                    >
                        <CropIcon className="w-4 h-4" /> Add Crop Area
                    </button>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-auto bg-[var(--bg-primary)] relative flex items-center justify-center">
                <div ref={containerRef} className="relative inline-block" style={{ touchAction: 'none' }}>
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="Edit preview"
                        className="max-w-full max-h-full block select-none pointer-events-none"
                    />
                    {rects.map((rect, index) => (
                        <div
                            key={rect.id}
                            onMouseDown={(e) => handleMouseDown(e, rect.id, 'move')}
                            className="absolute border-2 border-[var(--accent-color-400)] bg-[var(--accent-color-500)]/20 cursor-move"
                            style={{
                                left: `${rect.x}px`,
                                top: `${rect.y}px`,
                                width: `${rect.width}px`,
                                height: `${rect.height}px`,
                                zIndex: 10 + index
                            }}
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent-color-500)] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {index + 1}
                            </div>
                            <button 
                                onClick={(e) => handleDeleteRect(e, rect.id)}
                                className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center transition transform hover:scale-110"
                                aria-label="Delete crop area"
                            >
                                <TrashIcon className="w-3 h-3" />
                            </button>
                            <div
                                onMouseDown={(e) => handleMouseDown(e, rect.id, 'resize-br')}
                                className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--accent-color-400)] rounded-full cursor-se-resize border-2 border-[var(--bg-primary)]"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t border-[var(--border-secondary)] bg-[var(--bg-primary)] rounded-b-lg">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold rounded-md bg-transparent border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)] transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-semibold rounded-md bg-[var(--accent-color-500)] text-white hover:bg-[var(--accent-color-600)] transition-all transform hover:scale-105"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};
