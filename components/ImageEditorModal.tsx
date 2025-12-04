
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
    
    // --- Mouse Handlers ---

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

    // --- Touch Handlers (Mobile) ---

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, rectId: number, type: 'move' | 'resize-br') => {
        e.stopPropagation();
        // Prevent default only if necessary, but here we might need dragging
        // If we prevent default, page scrolling stops. For drag/drop usually we want to stop scroll.
        // e.preventDefault(); 
        
        const activeSlide = slides.find(s => s.id === activeSlideId);
        const rect = activeSlide?.rects.find(r => r.id === rectId);
        if (!rect) return;
        
        const touch = e.touches[0];

        interactionRef.current = {
            type,
            rectId,
            startX: touch.clientX,
            startY: touch.clientY,
            startRectX: rect.x,
            startRectY: rect.y,
            startRectW: rect.width,
            startRectH: rect.height,
        };
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!interactionRef.current || !containerRef.current) return;
        
        // Prevent scrolling while dragging/resizing
        if (e.cancelable) e.preventDefault();
        
        const touch = e.touches[0];
        const { type, rectId, startX, startY, startRectX, startRectY, startRectW, startRectH } = interactionRef.current;
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
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
    };

    const handleTouchEnd = () => {
        interactionRef.current = null;
    };
    
    const handleDeleteRect = (e: React.MouseEvent | React.TouchEvent, idToDelete: number) => {
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
        const lastDotIndex = file.name.lastIndexOf('.');
        const originalName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;

        for (const [index, slide] of slides.entries()) {
            if (slide.rects.length === 0) continue;

            const sortedRects = [...slide.rects]; 

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
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b-4 border-brutal-border bg-brutal-surface">
                <p className="text-sm font-bold uppercase bg-brutal-accent text-brutal-white px-2 border-2 border-brutal-border">DRAW BOXES. STITCHES DOWN.</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAddRect}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase bg-brutal-surface border-2 border-brutal-border text-brutal-text hover:bg-brutal-border hover:text-brutal-bg transition-colors"
                    >
                        <CropIcon className="w-4 h-4" /> Add Box
                    </button>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-hidden bg-brutal-bg relative flex items-center justify-center border-b-4 border-brutal-border" 
                 onTouchMove={(e) => {
                     // If interacting with a box, prevent default to stop scrolling
                     if (interactionRef.current) e.preventDefault();
                 }}>
                <div 
                    ref={containerRef} 
                    className="relative inline-block border-4 border-brutal-border shadow-brutal bg-brutal-surface" 
                    style={{ touchAction: 'none' }}
                    onMouseMove={handleMouseMove} // Mouse fallback
                    onMouseUp={handleMouseUp}     // Mouse fallback
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="Edit preview"
                        className="max-w-full max-h-[calc(80vh-10rem)] w-auto h-auto object-contain block select-none pointer-events-none"
                    />
                    {activeSlideRects.map((rect, index) => (
                        <div
                            key={rect.id}
                            onMouseDown={(e) => handleMouseDown(e, rect.id, 'move')}
                            onTouchStart={(e) => handleTouchStart(e, rect.id, 'move')}
                            className="absolute border-4 border-brutal-accent cursor-move bg-brutal-accent/20"
                            style={{
                                left: `${rect.x}px`,
                                top: `${rect.y}px`,
                                width: `${rect.width}px`,
                                height: `${rect.height}px`,
                                zIndex: 10 + index
                            }}
                        >
                            <div className="absolute -top-4 -left-4 bg-brutal-accent text-brutal-white text-xs font-black px-2 py-1 border-2 border-brutal-border pointer-events-none">
                                #{index + 1}
                            </div>
                            <button 
                                onClick={(e) => handleDeleteRect(e, rect.id)}
                                onTouchEnd={(e) => handleDeleteRect(e, rect.id)}
                                className="absolute -top-4 -right-4 w-6 h-6 bg-red-600 text-brutal-white border-2 border-brutal-border flex items-center justify-center hover:bg-red-800 z-20"
                                aria-label="Delete crop area"
                            >
                                <TrashIcon className="w-3 h-3" />
                            </button>
                            <div
                                onMouseDown={(e) => handleMouseDown(e, rect.id, 'resize-br')}
                                onTouchStart={(e) => handleTouchStart(e, rect.id, 'resize-br')}
                                className="absolute -bottom-2 -right-2 w-4 h-4 bg-brutal-surface border-2 border-brutal-border cursor-se-resize z-20"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0 flex flex-col gap-3 p-4 bg-brutal-surface">
                 <div className="flex items-center gap-2">
                    <div className="flex-grow flex items-center gap-2 overflow-x-auto py-2 hide-scrollbar">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                onClick={() => handleSwitchSlide(slide.id)}
                                className={`relative flex-shrink-0 px-4 py-2 text-sm font-bold uppercase border-2 border-brutal-border transition-all ${
                                    activeSlideId === slide.id 
                                    ? 'bg-brutal-border text-brutal-bg' 
                                    : 'bg-brutal-surface text-brutal-text hover:bg-brutal-bg'
                                }`}
                            >
                                Slide {index + 1}
                                {slides.length > 1 && (
                                    <button 
                                        onClick={(e) => handleDeleteSlide(e, slide.id)}
                                        className="absolute -top-3 -right-2 w-5 h-5 bg-red-500 text-brutal-white border border-brutal-border flex items-center justify-center hover:bg-red-700"
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
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-brutal-accent border-2 border-brutal-border text-brutal-white hover:opacity-80 transition-opacity shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        aria-label="Add New Slide"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold uppercase bg-brutal-surface border-2 border-brutal-border text-brutal-text hover:bg-brutal-bg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-bold uppercase bg-brutal-accent border-2 border-brutal-border text-brutal-white shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
