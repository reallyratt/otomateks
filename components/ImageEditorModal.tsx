
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CropIcon, TrashIcon, XIcon, PlusIcon } from './icons';

interface Rect {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Slide {
    id: number;
    rects: Rect[];
}

interface ImageEditorModalProps {
    file: File;
    onSave: (originalFile: File, newFiles: File[]) => void;
    onClose: () => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ file, onSave, onClose }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [slides, setSlides] = useState<Slide[]>([{ id: 1, rects: [] }]);
    const [activeSlideId, setActiveSlideId] = useState(1);
    const [nextSlideId, setNextSlideId] = useState(2);
    const [nextRectId, setNextRectId] = useState(1);
    
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
            id: nextRectId,
            x: 20,
            y: 20,
            width: 200,
            height: 100
        };
        setSlides(prevSlides =>
            prevSlides.map(slide =>
                slide.id === activeSlideId
                    ? { ...slide, rects: [...slide.rects, newRect] }
                    : slide
            )
        );
        setNextRectId(prev => prev + 1);
    };

    const handleAddSlide = () => {
        // Automatically add a default rect to the new slide so it isn't empty (and ignored)
        const newRect: Rect = {
            id: nextRectId,
            x: 20,
            y: 20,
            width: 200,
            height: 100
        };
        
        const newSlide: Slide = { id: nextSlideId, rects: [newRect] };
        setSlides(prev => [...prev, newSlide]);
        setActiveSlideId(nextSlideId);
        setNextSlideId(prev => prev + 1);
        setNextRectId(prev => prev + 1);
    };

    const handleSwitchSlide = (id: number) => {
        setActiveSlideId(id);
    };

    const handleDeleteSlide = (e: React.MouseEvent, idToDelete: number) => {
        e.stopPropagation();
        if (slides.length <= 1) return;

        const newSlides = slides.filter(s => s.id !== idToDelete);
        setSlides(newSlides);

        if (activeSlideId === idToDelete) {
            setActiveSlideId(newSlides[0]?.id || 0);
        }
    };
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, rectId: number, type: 'move' | 'resize-br') => {
        e.stopPropagation();
        const activeSlide = slides.find(s => s.id === activeSlideId);
        const rect = activeSlide?.rects.find(r => r.id === rectId);
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
        
        setSlides(prevSlides =>
            prevSlides.map(slide => {
                if (slide.id !== activeSlideId) return slide;
                
                const newRects = slide.rects.map(r => {
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
                    
                    if (newX < 0) newX = 0;
                    if (newY < 0) newY = 0;
                    if (newWidth < 20) newWidth = 20;
                    if (newHeight < 20) newHeight = 20;
                    if (newX + newWidth > containerBounds.width) newWidth = containerBounds.width - newX;
                    if (newY + newHeight > containerBounds.height) newHeight = containerBounds.height - newY;

                    return { ...r, x: newX, y: newY, width: newWidth, height: newHeight };
                });
                return { ...slide, rects: newRects };
            })
        );
    }, [activeSlideId]);

    const handleMouseUp = useCallback(() => {
        interactionRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);
    
    const handleDeleteRect = (e: React.MouseEvent, idToDelete: number) => {
        e.stopPropagation();
        setSlides(prevSlides =>
            prevSlides.map(slide =>
                slide.id === activeSlideId
                    ? { ...slide, rects: slide.rects.filter(r => r.id !== idToDelete) }
                    : slide
            )
        );
    };

    const handleSave = async () => {
        if (!imageRef.current) {
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

        const newFiles: File[] = [];
        // Ensure robust original name extraction
        const lastDotIndex = file.name.lastIndexOf('.');
        const originalName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;

        // Iterate through all slides. The order in array corresponds to creation order.
        for (const [index, slide] of slides.entries()) {
            if (slide.rects.length === 0) continue;

            const sortedRects = [...slide.rects]; // Use creation order

            let totalHeight = 0;
            let maxWidth = 0;
            sortedRects.forEach(rect => {
                totalHeight += rect.height;
                if (rect.width > maxWidth) maxWidth = rect.width;
            });

            const finalCanvasWidth = maxWidth * scaleX;
            const finalCanvasHeight = totalHeight * scaleY;

            if (finalCanvasWidth === 0 || finalCanvasHeight === 0) continue;

            const canvas = document.createElement('canvas');
            canvas.width = finalCanvasWidth;
            canvas.height = finalCanvasHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;

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
                const newFileName = `${originalName}_slide_${index + 1}.png`;
                const newFile = new File([blob], newFileName, { type: 'image/png' });
                newFiles.push(newFile);
            }
        }
        
        if (newFiles.length > 0) {
            onSave(file, newFiles);
        } else {
            onClose();
        }
    };

    const activeSlideRects = slides.find(s => s.id === activeSlideId)?.rects || [];

    return (
        <div className="flex flex-col h-[80vh] sm:h-[85vh]">
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border-secondary)] bg-[var(--bg-primary)] rounded-t-lg">
                <p className="text-sm text-[var(--text-secondary)]">Draw crop boxes for the active slide. Content will be stitched top-to-bottom.</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAddRect}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-transparent border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)] transition-all"
                    >
                        <CropIcon className="w-4 h-4" /> Add Crop Area
                    </button>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-hidden bg-[var(--bg-primary)] relative flex items-center justify-center">
                <div ref={containerRef} className="relative inline-block shadow-2xl" style={{ touchAction: 'none' }}>
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="Edit preview"
                        className="max-w-full max-h-[calc(80vh-8rem)] object-contain block select-none pointer-events-none"
                    />
                    {activeSlideRects.map((rect, index) => (
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
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent-color-500)] text-white text-xs font-bold px-1.5 py-0.5 rounded-full pointer-events-none">
                                {index + 1}
                            </div>
                            <button 
                                onClick={(e) => handleDeleteRect(e, rect.id)}
                                className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center transition transform hover:scale-110 z-20"
                                aria-label="Delete crop area"
                            >
                                <TrashIcon className="w-3 h-3" />
                            </button>
                            <div
                                onMouseDown={(e) => handleMouseDown(e, rect.id, 'resize-br')}
                                className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--accent-color-400)] rounded-full cursor-se-resize border-2 border-[var(--bg-primary)] z-20"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0 flex flex-col gap-3 p-4 border-t border-[var(--border-secondary)] bg-[var(--bg-primary)] rounded-b-lg">
                 <div className="flex items-center gap-2">
                    <div className="flex-grow flex items-center gap-2 overflow-x-auto py-3 hide-scrollbar">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                onClick={() => handleSwitchSlide(slide.id)}
                                className={`relative flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-md transition-all border ${
                                    activeSlideId === slide.id 
                                    ? 'bg-[var(--accent-color-500)] text-white border-[var(--accent-color-500)]' 
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-secondary)] hover:bg-[var(--bg-hover)]'
                                }`}
                            >
                                Slide {index + 1}
                                {slides.length > 1 && (
                                    <button 
                                        onClick={(e) => handleDeleteSlide(e, slide.id)}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center transition transform hover:scale-110"
                                        aria-label={`Delete Slide ${index + 1}`}
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleAddSlide}
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-transparent border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)] transition-all"
                        aria-label="Add New Slide"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-secondary)]">
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
        </div>
    );
};
