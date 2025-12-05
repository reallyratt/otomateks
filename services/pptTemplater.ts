
import { PresentationData, Language } from '../types';

declare const JSZip: any;

const parser = new DOMParser();
const serializer = new XMLSerializer();

// Global text limit for all fields
const MAX_TEXT_LENGTH = 80;

// Define XML Namespaces to ensure valid file structure
const NS_CONTENT_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';
const NS_RELATIONSHIPS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const NS_PRESENTATIONML = 'http://purl.oclc.org/ooxml/presentationml/main';
const NS_DRAWINGML = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const NS_RELATIONSHIPS_OFFICE_DOC = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

interface EndingStyle {
    text: string;
    bold?: boolean;
    italic?: boolean;
}

/**
 * Converts a base64 data URL into a Uint8Array.
 */
const base64ToUint8Array = (base64: string): Uint8Array => {
    const base64Content = base64.split(',')[1];
    if (!base64Content) throw new Error("Invalid base64 string provided.");
    const binaryString = window.atob(base64Content);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

/**
 * Extracts the MIME type from a base64 data URL.
 */
const getMimeTypeFromBase64 = (base64: string): string => {
    const match = base64.match(/data:(.*?);base64,/);
    return match ? match[1] : 'image/png';
};

const getExtensionFromMime = (mime: string): string => {
    switch (mime) {
        case 'image/jpeg': return 'jpg';
        case 'image/jpg': return 'jpg';
        case 'image/png': return 'png';
        case 'image/gif': return 'gif';
        default: return 'png';
    }
};

/**
 * Smart Chunks a long string into smaller pieces based on punctuation and spaces.
 */
const chunkText = (text: string | undefined, maxLength: number): string[] => {
    if (!text) return [''];
    
    const trimmedText = text.trim();
    if (trimmedText.length <= maxLength) return [trimmedText];

    const chunks: string[] = [];
    let remainingText = trimmedText;

    while (remainingText.length > 0) {
        if (remainingText.length <= maxLength) {
            chunks.push(remainingText);
            break;
        }

        // Define the potential slice
        const slice = remainingText.substring(0, maxLength);
        
        let cutIndex = -1;

        // 1. Punctuation Strategy
        // Look for punctuation in the "safe zone" (e.g., last 30% of the chunk)
        // This prevents creating very short chunks just because a period appeared early.
        const lookback = Math.floor(maxLength * 0.3); 
        const searchStart = maxLength - lookback;
        const searchArea = slice.substring(searchStart);

        // Regex to find punctuation followed by a space or end of string.
        // We capture the punctuation mark to calculate offset correctly.
        const punctuationMatch = searchArea.match(/([.,:;!?])(\s|$)/);

        if (punctuationMatch && punctuationMatch.index !== undefined) {
            // Cut AFTER the punctuation mark.
            // searchStart + matchIndex + 1 (length of punctuation char)
            cutIndex = searchStart + punctuationMatch.index + 1;
        }

        // 2. Space Strategy (Fallback)
        if (cutIndex === -1) {
            const lastSpaceIndex = slice.lastIndexOf(' ');
            if (lastSpaceIndex !== -1) {
                cutIndex = lastSpaceIndex;
            }
        }

        // 3. Hard Cut Strategy (Last Resort for extremely long words)
        if (cutIndex === -1) {
            cutIndex = maxLength;
        }

        chunks.push(remainingText.substring(0, cutIndex).trim());
        remainingText = remainingText.substring(cutIndex).trim();
    }
    
    return chunks;
};


const getNextIdFactory = (prefix: string, regex: RegExp) => (doc: any, isZip = false): number => {
    let maxId = 0;
    const searchTarget = isZip ? doc.folder(prefix) : doc.querySelectorAll(prefix);
    
    searchTarget.forEach((item: any, key: any) => {
        const name = isZip ? item : item.getAttribute('Id');
        if(name && typeof name === 'string') {
            const match = name.match(regex);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxId) maxId = num;
            }
        }
    });
    return maxId + 1;
};


const getNextSlideNum = getNextIdFactory('ppt/slides', /slide(\d+)\.xml/);
const getNextRid = getNextIdFactory('Relationship', /rId(\d+)/);
const getNextMediaId = getNextIdFactory('ppt/media', /image(\d+)\./);

const getNextXmlSlideId = (doc: XMLDocument): number => {
    let maxId = 0;
    const sldIds = doc.querySelectorAll('sldId');
    sldIds.forEach(idNode => {
        const idVal = idNode.getAttribute('id');
        if (idVal) {
            const num = parseInt(idVal, 10);
            if (num > maxId) maxId = num;
        }
    });
    return Math.max(maxId + 1, 256);
};

// Helper to get elements by local name (ignoring namespace prefix issues in querySelector)
const getElementsByLocalName = (parent: Element | Document, localName: string): Element[] => {
    const result: Element[] = [];
    const nodes = parent.getElementsByTagName('*');
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].localName === localName) {
            result.push(nodes[i]);
        }
    }
    return result;
};

// Helper to get a direct child by local name
const getDirectChildByLocalName = (parent: Element, localName: string): Element | null => {
    for (let i = 0; i < parent.childNodes.length; i++) {
        const child = parent.childNodes[i] as Element;
        if (child.nodeType === 1 && child.localName === localName) {
            return child;
        }
    }
    return null;
};

// Update: find placeholder that starts with C, T, or PC (Image), allow whitespace and split text
const findImagePlaceholder = (slideXmlDoc: XMLDocument): { key: string | null; shape: Element | null } => {
    const shapes = getElementsByLocalName(slideXmlDoc, 'sp');
    for (const shape of shapes) {
        const textNodes = getElementsByLocalName(shape, 't');
        let fullText = '';
        for (const node of textNodes) {
             fullText += node.textContent || '';
        }
        
        // Regex for C01.., T01.., or PC01..
        const match = fullText.match(/{{\s*([CT]|PC)([0-9]+)\s*}}/);
        if (match) {
            const key = match[1] + match[2]; // e.g. "PC01"
            return { key, shape };
        }
    }
    return { key: null, shape: null };
};

const removeShapeContainingText = (slideXmlDoc: XMLDocument, textToFind: string) => {
    const shapes = getElementsByLocalName(slideXmlDoc, 'sp');
    for (const shape of shapes) {
        const textNodes = getElementsByLocalName(shape, 't');
        let fullText = '';
        for (const node of textNodes) {
             fullText += node.textContent || '';
        }
        
        if (fullText.includes(textToFind)) {
            if (shape.parentNode) {
                shape.parentNode.removeChild(shape);
            }
            return; // Assume only one such shape per slide for optimization
        }
    }
};


const getImageDimensions = (base64: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error('Could not load image to get dimensions.'));
        img.src = base64;
    });
};

const modifyShapeForImage = async (shapeElement: Element, imageRId: string, imageBase64: string) => {
    const doc = shapeElement.ownerDocument;
    
    // Find and remove txBody (Text Body)
    const txBody = getDirectChildByLocalName(shapeElement, 'txBody');
    if (txBody) shapeElement.removeChild(txBody);

    // Find spPr (Shape Properties) or create it
    let spPr = getDirectChildByLocalName(shapeElement, 'spPr');
    if (!spPr) {
        spPr = doc.createElementNS(NS_PRESENTATIONML, 'p:spPr');
        shapeElement.insertBefore(spPr, shapeElement.firstChild);
    }
    
    // Remove any existing fill to ensure transparency/correct rendering
    const fillTypes = ['noFill', 'solidFill', 'gradFill', 'blipFill', 'pattFill', 'grpFill'];
    for (let i = spPr.childNodes.length - 1; i >= 0; i--) {
        const child = spPr.childNodes[i] as Element;
        if (child.nodeType === 1 && fillTypes.includes(child.localName)) {
            spPr.removeChild(child);
        }
    }
    
    // Remove shape outline by replacing it with a "noFill" line
    const line = getDirectChildByLocalName(spPr, 'ln');
    if (line) {
        while (line.firstChild) line.removeChild(line.firstChild);
        const noFill = doc.createElementNS(NS_DRAWINGML, 'a:noFill');
        line.appendChild(noFill);
    }

    const blipFill = doc.createElementNS(NS_DRAWINGML, 'a:blipFill');
    const blip = doc.createElementNS(NS_DRAWINGML, 'a:blip');
    
    blip.setAttribute('r:embed', imageRId);
    blipFill.appendChild(blip);
    
    // Logic to fit image within shape bounds (contain)
    const stretch = doc.createElementNS(NS_DRAWINGML, 'a:stretch');
    const fillRect = doc.createElementNS(NS_DRAWINGML, 'a:fillRect');
    
    try {
        const xfrm = getDirectChildByLocalName(spPr, 'xfrm');
        const ext = xfrm ? getDirectChildByLocalName(xfrm, 'ext') : null;
        
        const shapeCx = ext?.getAttribute('cx');
        const shapeCy = ext?.getAttribute('cy');

        if (shapeCx && shapeCy) {
            const shapeWidth = parseInt(shapeCx, 10);
            const shapeHeight = parseInt(shapeCy, 10);
            
            if (shapeWidth > 0 && shapeHeight > 0) {
                const shapeAspect = shapeWidth / shapeHeight;
                const { width: imageWidth, height: imageHeight } = await getImageDimensions(imageBase64);
                
                if (imageWidth > 0 && imageHeight > 0) {
                    const imageAspect = imageWidth / imageHeight;
                    
                    if (Math.abs(shapeAspect - imageAspect) > 0.01) { 
                        if (imageAspect > shapeAspect) { 
                            const newImageHeight = shapeWidth / imageAspect;
                            const margin = (shapeHeight - newImageHeight) / 2;
                            const marginPercent = Math.round((margin / shapeHeight) * 100000);
                            if (marginPercent > 0) {
                                fillRect.setAttribute('t', String(marginPercent));
                                fillRect.setAttribute('b', String(marginPercent));
                            }
                        } else { 
                            const newImageWidth = shapeHeight * imageAspect;
                            const margin = (shapeWidth - newImageWidth) / 2;
                            const marginPercent = Math.round((margin / shapeWidth) * 100000);
                             if (marginPercent > 0) {
                                fillRect.setAttribute('l', String(marginPercent));
                                fillRect.setAttribute('r', String(marginPercent));
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.warn("Could not calculate image fitting, default stretching will be applied.", e);
    }
    
    stretch.appendChild(fillRect);
    blipFill.appendChild(stretch);

    const successors = ['ln', 'effectLst', 'scene3d', 'sp3d', 'extLst'];
    let nextSibling = null;
    for (const name of successors) {
        nextSibling = getDirectChildByLocalName(spPr, name);
        if (nextSibling) break;
    }

    if (nextSibling) {
        spPr.insertBefore(blipFill, nextSibling);
    } else {
        spPr.appendChild(blipFill);
    }
};


const addImageToPackage = async (zip: any, slideRelsXmlDoc: XMLDocument, contentTypesXmlDoc: XMLDocument, imageBase64: string): Promise<string> => {
    const mediaId = getNextMediaId(zip, true);
    const mimeType = getMimeTypeFromBase64(imageBase64);
    const extension = getExtensionFromMime(mimeType);
    const imageFileName = `image${mediaId}.${extension}`;
    const imagePath = `ppt/media/${imageFileName}`;
    const imageBytes = base64ToUint8Array(imageBase64);

    zip.file(imagePath, imageBytes, { binary: true });
    
    const newOverride = contentTypesXmlDoc.createElementNS(NS_CONTENT_TYPES, 'Override');
    newOverride.setAttribute('PartName', `/${imagePath}`);
    newOverride.setAttribute('ContentType', mimeType);
    contentTypesXmlDoc.querySelector('Types')?.appendChild(newOverride);
    
    const newRelId = `rId${getNextRid(slideRelsXmlDoc)}`;
    const newRel = slideRelsXmlDoc.createElementNS(NS_RELATIONSHIPS, 'Relationship');
    newRel.setAttribute('Id', newRelId);
    newRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
    newRel.setAttribute('Target', `../media/${imageFileName}`);
    slideRelsXmlDoc.querySelector('Relationships')?.appendChild(newRel);

    return newRelId;
};

// --- Rich Text Processing ---

interface StyledSegment {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
}

const parseStyledText = (text: string): StyledSegment[] => {
    const segments: StyledSegment[] = [];
    // Regex to find tags: <b>...</b>, <i>...</i>, <u>...</u> case insensitive
    const regex = /(<\/?(?:b|i|u)(?:\s+[^>]*?)?>)/gi;
    const parts = text.split(regex);
    
    let currentBold = false;
    let currentItalic = false;
    let currentUnderline = false;

    for (const part of parts) {
        const lowerPart = part.toLowerCase();
        
        if (lowerPart === '<b>') { currentBold = true; continue; }
        if (lowerPart === '</b>') { currentBold = false; continue; }
        if (lowerPart === '<i>') { currentItalic = true; continue; }
        if (lowerPart === '</i>') { currentItalic = false; continue; }
        if (lowerPart === '<u>') { currentUnderline = true; continue; }
        if (lowerPart === '</u>') { currentUnderline = false; continue; }
        
        if (part !== '') {
            segments.push({
                text: part,
                bold: currentBold,
                italic: currentItalic,
                underline: currentUnderline
            });
        }
    }
    return segments;
};

const applyFormattedTextToRun = (doc: XMLDocument, runNode: Element, textValue: string) => {
    const parentP = runNode.parentNode as Element;
    if (!parentP || parentP.localName !== 'p') return;

    // Clone the run properties (rPr) from the template so we inherit styles (e.g. font, size, color)
    const originalRPr = getDirectChildByLocalName(runNode, 'rPr');
    
    const segments = parseStyledText(textValue);
    
    // We will insert new runs before the current run, then remove the current run
    for (const segment of segments) {
        const newRun = doc.createElementNS(NS_DRAWINGML, 'a:r');
        
        // Setup Properties
        let newRPr: Element;
        if (originalRPr) {
            newRPr = originalRPr.cloneNode(true) as Element;
            newRPr.removeAttribute('dirty');
            newRPr.removeAttribute('err');
        } else {
            newRPr = doc.createElementNS(NS_DRAWINGML, 'a:rPr');
        }

        // Apply formatting overrides. 
        if (segment.bold) newRPr.setAttribute('b', '1');
        if (segment.italic) newRPr.setAttribute('i', '1');
        if (segment.underline) newRPr.setAttribute('u', 'sng'); // 'sng' = single underline
        
        newRun.appendChild(newRPr);
        
        const newT = doc.createElementNS(NS_DRAWINGML, 'a:t');
        newT.textContent = segment.text;
        newRun.appendChild(newT);
        
        parentP.insertBefore(newRun, runNode);
    }
    
    parentP.removeChild(runNode);
};


const replaceSimplePlaceholders = (slideXmlDoc: XMLDocument, data: PresentationData, ignoredKey: string | null) => {
    const textNodes = getElementsByLocalName(slideXmlDoc, 't');
    
    // Collect targets first to avoid mutation issues during iteration
    const targets: { node: Element, match: RegExpMatchArray, key: string }[] = [];

    textNodes.forEach(node => {
        if (!node.textContent) return;
        const regex = /{{([a-zA-Z0-9]+)}}/;
        const match = node.textContent.match(regex);
        if (match) {
            targets.push({ node, match, key: match[1] });
        }
    });

    for (const { node, match, key } of targets) {
        if (key === ignoredKey || key.startsWith('C') || key.startsWith('T') || key.startsWith('PC')) continue;

        const propertyValue = data[key];
        if (typeof propertyValue === 'string') {
            const hasFormatting = /<\/?(?:b|i|u)(?:\s+[^>]*?)?>/i.test(propertyValue);
            
            // If the text has formatting tags, we need to do the rich text replacement logic
            // We need to find the parent <a:r> of this <a:t>
            const parentRun = node.parentNode as Element;
            if (hasFormatting && parentRun && parentRun.localName === 'r') {
                applyFormattedTextToRun(slideXmlDoc, parentRun, propertyValue);
            } else {
                // Standard text replacement
                node.textContent = node.textContent.replace(match[0], propertyValue);
            }
        } else {
            node.textContent = node.textContent.replace(match[0], '');
        }
    }
};

const addFormattedEnding = (doc: XMLDocument, textNode: Element, endingLines: EndingStyle[]) => {
    let pNode = textNode.parentNode;
    while(pNode && (pNode as Element).localName !== 'p') {
        pNode = pNode.parentNode;
    }
    if (!pNode || (pNode as Element).localName !== 'p') return;
    
    const txBody = pNode.parentNode as Element;
    if (!txBody) return; // Must be inside a txBody

    // Clone pPr (Paragraph Properties) from the original text to maintain alignment/indentation
    const pPr = getDirectChildByLocalName(pNode as Element, 'pPr');
    
    // 1. Add Spacer Paragraph (Empty Line)
    const spacerP = doc.createElementNS(NS_DRAWINGML, 'a:p');
    if (pPr) spacerP.appendChild(pPr.cloneNode(true));
    // Add empty text run to ensure height
    const spacerR = doc.createElementNS(NS_DRAWINGML, 'a:r');
    const spacerT = doc.createElementNS(NS_DRAWINGML, 'a:t');
    spacerT.textContent = ' '; 
    spacerR.appendChild(spacerT);
    spacerP.appendChild(spacerR);
    txBody.appendChild(spacerP);

    // 2. Add Ending Lines
    endingLines.forEach(line => {
        const lineP = doc.createElementNS(NS_DRAWINGML, 'a:p');
        if (pPr) lineP.appendChild(pPr.cloneNode(true));
        
        const r = doc.createElementNS(NS_DRAWINGML, 'a:r');
        
        // Handle Style (Bold/Italic)
        const rPr = doc.createElementNS(NS_DRAWINGML, 'a:rPr');
        const sourceR = textNode.parentNode as Element;
        const sourceRPr = getDirectChildByLocalName(sourceR, 'rPr');
        
        let targetRPr: Element;

        if (sourceRPr) {
             targetRPr = sourceRPr.cloneNode(true) as Element;
             targetRPr.removeAttribute('dirty'); // Clean dirty flag
             
             if (line.bold) targetRPr.setAttribute('b', '1'); 
             else targetRPr.removeAttribute('b');
             
             if (line.italic) targetRPr.setAttribute('i', '1'); 
             else targetRPr.removeAttribute('i');
        } else {
             targetRPr = rPr;
             if (line.bold) targetRPr.setAttribute('b', '1');
             if (line.italic) targetRPr.setAttribute('i', '1');
        }
        r.appendChild(targetRPr);

        const t = doc.createElementNS(NS_DRAWINGML, 'a:t');
        t.textContent = line.text;
        r.appendChild(t);
        lineP.appendChild(r);
        txBody.appendChild(lineP);
    });
}

export const processTemplate = async (data: PresentationData, templateFile: File, language: Language) => {
    const endings: Record<Language, Record<number, EndingStyle[]>> = {
        indonesia: {
            1: [{ text: 'U: Amin', bold: true, italic: true }],
            2: [
                { text: 'Demikianlah sabda Tuhan...', bold: false, italic: false },
                { text: 'U: Syukur kepada Allah', bold: true, italic: true }
            ],
            3: [],
            4: [
                 { text: 'Demikianlah Sabda Tuhan...', bold: false, italic: false },
                 { text: 'U: Terpujilah Kristus', bold: true, italic: true }
            ],
            5: []
        },
        jawa: {
            1: [{ text: 'U: Amin', bold: true, italic: true }],
            2: [],
            3: [
                { text: 'Makaten sabda Dalem Gusti...', bold: false, italic: false },
                { text: 'U: Sembah nyuwun konjuk ing Gusti', bold: true, italic: true }
            ],
            4: [],
            5: [
                { text: 'Mangkono sabda Dalem Gusti...', bold: false, italic: false },
                { text: 'U: Pinujia Sang Kristus', bold: true, italic: true }
            ]
        },
        english: { 
            1: [], 2: [], 3: [], 4: [], 5: [] 
        }
    };
    
    // Map specific B keys to ending types
    const endingMap: Record<string, number> = {
        'B05': 1,
        'B29': 1,
        'B33': 1,
        'B06': language === 'indonesia' ? 2 : 3,
        'B011': language === 'indonesia' ? 2 : 3,
        'B014': language === 'indonesia' ? 4 : 5
    };

    const zip = await JSZip.loadAsync(templateFile);
    const presXmlStr = await zip.file('ppt/presentation.xml').async('string');
    const presXmlDoc = parser.parseFromString(presXmlStr, 'application/xml');
    const presRelsXmlStr = await zip.file('ppt/_rels/presentation.xml.rels').async('string');
    const presRelsXmlDoc = parser.parseFromString(presRelsXmlStr, 'application/xml');
    const contentTypesXmlStr = await zip.file('[Content_Types].xml').async('string');
    const contentTypesXmlDoc = parser.parseFromString(contentTypesXmlStr, 'application/xml');
    
    const slideIdList = presXmlDoc.querySelector('sldIdLst');
    if (!slideIdList) throw new Error('Invalid presentation format: <p:sldIdLst> not found.');

    let nextAvailableSlideNum = getNextSlideNum(zip, true);
    let nextAvailableSlideId = getNextXmlSlideId(presXmlDoc);

    const newSlideIdNodes = [];
    
    for (const sldId of Array.from(slideIdList.querySelectorAll('sldId'))) {
        const rId = sldId.getAttributeNS(NS_RELATIONSHIPS_OFFICE_DOC, 'id');
        const rel = rId ? presRelsXmlDoc.querySelector(`Relationship[Id="${rId}"]`) : null;
        if (!rel) {
            newSlideIdNodes.push(sldId.cloneNode(true));
            continue;
        }

        const slidePath = `ppt/${rel.getAttribute('Target')}`;
        let slideXmlStr = await zip.file(slidePath).async('string');
        const slideXmlDoc = parser.parseFromString(slideXmlStr, 'application/xml');
        
        const slideRelsPath = slidePath.replace('slides/', 'slides/_rels/') + '.rels';
        const slideRelsStr = await zip.file(slideRelsPath)?.async('string') || `<Relationships xmlns="${NS_RELATIONSHIPS}"></Relationships>`;
        const slideRelsXmlDoc = parser.parseFromString(slideRelsStr, 'application/xml');

        // Check for Image Placeholders (C or T keys)
        const { key: imageKey, shape: imageShape } = findImagePlaceholder(slideXmlDoc);
        const images = (imageKey && data[imageKey] && Array.isArray(data[imageKey])) ? data[imageKey] as string[] : [];

        if (imageKey && imageShape) {
             if (images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const isOriginalSlide = i === 0;
                    const currentSlideXmlDoc = isOriginalSlide ? slideXmlDoc : parser.parseFromString(slideXmlStr, 'application/xml');
                    const currentSlideRelsXmlDoc = isOriginalSlide ? slideRelsXmlDoc : parser.parseFromString(slideRelsStr, 'application/xml');
                    const currentShape = isOriginalSlide ? imageShape : findImagePlaceholder(currentSlideXmlDoc).shape;

                    if (currentShape) {
                        const imageBase64 = images[i];
                        const imageRId = await addImageToPackage(zip, currentSlideRelsXmlDoc, contentTypesXmlDoc, imageBase64);
                        await modifyShapeForImage(currentShape, imageRId, imageBase64);
                    }
                    
                    replaceSimplePlaceholders(currentSlideXmlDoc, data, null);
                    
                    if (isOriginalSlide) {
                        zip.file(slidePath, serializer.serializeToString(currentSlideXmlDoc));
                        zip.file(slideRelsPath, serializer.serializeToString(currentSlideRelsXmlDoc));
                        newSlideIdNodes.push(sldId.cloneNode(true));
                    } else {
                        const newSlideNum = nextAvailableSlideNum++;
                        const newSlideId = nextAvailableSlideId++;
                        const newPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
                        const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
                        const newSlideRelsPath = newSlidePath.replace('slides/', 'slides/_rels/') + '.rels';

                        zip.file(newSlidePath, serializer.serializeToString(currentSlideXmlDoc));
                        zip.file(newSlideRelsPath, serializer.serializeToString(currentSlideRelsXmlDoc));

                        const newOverride = contentTypesXmlDoc.createElementNS(NS_CONTENT_TYPES, 'Override');
                        newOverride.setAttribute('PartName', `/${newSlidePath}`);
                        newOverride.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml');
                        contentTypesXmlDoc.querySelector('Types')?.appendChild(newOverride);
                        
                        const newPresRel = presRelsXmlDoc.createElementNS(NS_RELATIONSHIPS, 'Relationship');
                        newPresRel.setAttribute('Id', newPresRelId);
                        newPresRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide');
                        newPresRel.setAttribute('Target', `slides/slide${newSlideNum}.xml`);
                        presRelsXmlDoc.querySelector('Relationships')?.appendChild(newPresRel);
                        
                        const newSldIdNode = presXmlDoc.createElementNS(NS_PRESENTATIONML, 'p:sldId');
                        newSldIdNode.setAttribute('id', String(newSlideId));
                        newSldIdNode.setAttributeNS(NS_RELATIONSHIPS_OFFICE_DOC, 'r:id', newPresRelId);
                        newSlideIdNodes.push(newSldIdNode);
                    }
                }
                continue;
             } else {
                 if (imageShape.parentNode) {
                     imageShape.parentNode.removeChild(imageShape);
                     slideXmlStr = serializer.serializeToString(slideXmlDoc);
                 }
             }
        }
        
        // Check for Pengumuman (P keys) or Wedding (UP/UPS keys) Duplication
        const pPlaceholderMatch = slideXmlStr.match(/{{(P01|PC01)}}/); 
        const weddingPlaceholderMatch = slideXmlStr.match(/{{(UP01|UPS01|W01)}}/);
        
        if (pPlaceholderMatch || weddingPlaceholderMatch) {
            let keysToProcess: string[] = [];
            
            if (pPlaceholderMatch) {
                // Find indices from both P (Text) and PC (Image) keys
                const pKeys = Object.keys(data).filter(k => /^P\d+$/.test(k));
                const pcKeys = Object.keys(data).filter(k => /^PC\d+$/.test(k));
                
                const indices = new Set<string>();
                [...pKeys, ...pcKeys].forEach(k => {
                    const match = k.match(/(\d+)$/);
                    if (match) indices.add(match[1]);
                });
                keysToProcess = Array.from(indices).sort().map(i => `Announce_${i}`);
            } else if (weddingPlaceholderMatch) {
                // Find all keys that look like UP01, UPS01, UP02, etc. and extract unique indices
                const weddingKeys = Object.keys(data).filter(k => /^(UP|UPS)\d+$/.test(k));
                const indices = new Set<string>();
                weddingKeys.forEach(k => {
                    const match = k.match(/(\d+)$/);
                    if (match) indices.add(match[1]);
                });
                keysToProcess = Array.from(indices).sort().map(i => `Wedding_${i}`); // Dummy keys for loop
            }

            if (keysToProcess.length > 0) {
                for (let i = 0; i < keysToProcess.length; i++) {
                    const isOriginalSlide = i === 0;
                    
                    const currentSlideXmlDoc = (isOriginalSlide) ? slideXmlDoc : parser.parseFromString(slideXmlStr, 'application/xml');
                    const currentSlideRelsXmlDoc = (isOriginalSlide) ? slideRelsXmlDoc : parser.parseFromString(slideRelsStr, 'application/xml');
                    
                    let localData: PresentationData = { ...data };
                    
                    // Variables to handle P-key text splitting inside duplication
                    let splittableKey: string | null = null;
                    let textChunks: string[] = [];

                    if (pPlaceholderMatch) {
                         const indexStr = keysToProcess[i].split('_')[1]; // e.g. "01", "02"
                         const textKey = `P${indexStr}`;
                         const imageKey = `PC${indexStr}`;

                         const textContent = data[textKey];
                         const imageContent = (data[imageKey] && Array.isArray(data[imageKey])) ? data[imageKey] : null;

                         // Map current index data to 01 placeholders
                         if (imageContent && imageContent.length > 0) {
                            // IMAGE MODE
                            localData['PC01'] = imageContent;
                            localData['P01'] = ''; // Clear text placeholder
                            
                            const { shape: currentShape } = findImagePlaceholder(currentSlideXmlDoc);
                            if (currentShape) {
                                const imageBase64 = imageContent[0];
                                const imageRId = await addImageToPackage(zip, currentSlideRelsXmlDoc, contentTypesXmlDoc, imageBase64);
                                await modifyShapeForImage(currentShape, imageRId, imageBase64);
                            }

                            removeShapeContainingText(currentSlideXmlDoc, "PENGUMUMAN PAROKI MINGGU INI");
                         } else {
                            // TEXT MODE
                            let finalContent = textContent as string || '';
                            const hasFormatting = /<\/?(?:b|i|u)(?:\s+[^>]*?)?>/i.test(finalContent);
                            
                            // Check if splitting is needed for this specific announcement slide
                            if (!hasFormatting && finalContent.length > MAX_TEXT_LENGTH) {
                                splittableKey = 'P01';
                                localData['P01'] = finalContent; // Placeholder, will be replaced by chunking logic below
                                textChunks = chunkText(finalContent, MAX_TEXT_LENGTH);
                            } else {
                                localData['P01'] = finalContent;
                            }
                            
                            // Remove Image Placeholder Shape
                            const { shape: imageShape } = findImagePlaceholder(currentSlideXmlDoc);
                            if (imageShape && imageShape.parentNode) {
                                imageShape.parentNode.removeChild(imageShape);
                            }
                         }
                    } else if (weddingPlaceholderMatch) {
                        const indexStr = keysToProcess[i].split('_')[1]; // e.g. "01", "02"
                        const photoKey = `T${indexStr}`;
                        const hasPhoto = data[photoKey] && Array.isArray(data[photoKey]) && data[photoKey].length > 0;

                        ['UP', 'VP', 'UW', 'VW', 'UPS', 'VPS', 'UWS', 'VWS', 'T', 'W', 'TS'].forEach(prefix => {
                            const sourceKey = `${prefix}${indexStr}`;
                            const targetKey = `${prefix}01`;
                            
                            if (hasPhoto) {
                                if (['UPS', 'VPS', 'UWS', 'VWS', 'TS'].includes(prefix)) {
                                    localData[targetKey] = ''; 
                                    return;
                                }
                            } else {
                                if (['UP', 'VP', 'UW', 'VW', 'T'].includes(prefix)) {
                                    localData[targetKey] = '';
                                    return;
                                }
                            }

                            if (data[sourceKey] !== undefined) {
                                localData[targetKey] = data[sourceKey];
                            } else {
                                localData[targetKey] = ''; 
                            }
                        });
                    }
                    
                    // IF we have chunks, we need to create sub-slides for this announcement
                    if (splittableKey && textChunks.length > 0) {
                        for (let c = 0; c < textChunks.length; c++) {
                            const isSubSlideOriginal = isOriginalSlide && c === 0;
                            const subSlideXmlDoc = isSubSlideOriginal ? currentSlideXmlDoc : parser.parseFromString(serializer.serializeToString(currentSlideXmlDoc), 'application/xml');

                            replaceSimplePlaceholders(subSlideXmlDoc, localData, splittableKey);
                            
                            getElementsByLocalName(subSlideXmlDoc, 't').forEach(node => {
                                if (node.textContent?.includes(`{{${splittableKey}}}`)) {
                                    node.textContent = node.textContent.replace(`{{${splittableKey}}}`, textChunks[c]);
                                }
                            });

                            if (isSubSlideOriginal) {
                                zip.file(slidePath, serializer.serializeToString(subSlideXmlDoc));
                                zip.file(slideRelsPath, serializer.serializeToString(currentSlideRelsXmlDoc));
                                newSlideIdNodes.push(sldId.cloneNode(true));
                            } else {
                                const newSlideNum = nextAvailableSlideNum++;
                                const newSlideId = nextAvailableSlideId++;
                                const newPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
                                const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
                                const newSlideRelsPath = newSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
                                
                                zip.file(newSlidePath, serializer.serializeToString(subSlideXmlDoc));
                                zip.file(newSlideRelsPath, serializer.serializeToString(currentSlideRelsXmlDoc));

                                const newOverride = contentTypesXmlDoc.createElementNS(NS_CONTENT_TYPES, 'Override');
                                newOverride.setAttribute('PartName', `/${newSlidePath}`);
                                newOverride.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml');
                                contentTypesXmlDoc.querySelector('Types')?.appendChild(newOverride);
                                
                                const newPresRel = presRelsXmlDoc.createElementNS(NS_RELATIONSHIPS, 'Relationship');
                                newPresRel.setAttribute('Id', newPresRelId);
                                newPresRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide');
                                newPresRel.setAttribute('Target', `slides/slide${newSlideNum}.xml`);
                                presRelsXmlDoc.querySelector('Relationships')?.appendChild(newPresRel);
                                
                                const newSldIdNode = presXmlDoc.createElementNS(NS_PRESENTATIONML, 'p:sldId');
                                newSldIdNode.setAttribute('id', String(newSlideId));
                                newSldIdNode.setAttributeNS(NS_RELATIONSHIPS_OFFICE_DOC, 'r:id', newPresRelId);
                                newSlideIdNodes.push(newSldIdNode);
                            }
                        }

                    } else {
                        // STANDARD HANDLING (No Text Splitting in this duplication loop)
                        replaceSimplePlaceholders(currentSlideXmlDoc, localData, null);

                        if (isOriginalSlide) {
                             zip.file(slidePath, serializer.serializeToString(currentSlideXmlDoc));
                             zip.file(slideRelsPath, serializer.serializeToString(currentSlideRelsXmlDoc));
                             newSlideIdNodes.push(sldId.cloneNode(true));
                        } else {
                            const newSlideNum = nextAvailableSlideNum++;
                            const newSlideId = nextAvailableSlideId++;
                            const newPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
                            const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
                            const newSlideRelsPath = newSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
                            
                            zip.file(newSlidePath, serializer.serializeToString(currentSlideXmlDoc));
                            zip.file(newSlideRelsPath, serializer.serializeToString(currentSlideRelsXmlDoc));

                            const newOverride = contentTypesXmlDoc.createElementNS(NS_CONTENT_TYPES, 'Override');
                            newOverride.setAttribute('PartName', `/${newSlidePath}`);
                            newOverride.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml');
                            contentTypesXmlDoc.querySelector('Types')?.appendChild(newOverride);
                            
                            const newPresRel = presRelsXmlDoc.createElementNS(NS_RELATIONSHIPS, 'Relationship');
                            newPresRel.setAttribute('Id', newPresRelId);
                            newPresRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide');
                            newPresRel.setAttribute('Target', `slides/slide${newSlideNum}.xml`);
                            presRelsXmlDoc.querySelector('Relationships')?.appendChild(newPresRel);
                            
                            const newSldIdNode = presXmlDoc.createElementNS(NS_PRESENTATIONML, 'p:sldId');
                            newSldIdNode.setAttribute('id', String(newSlideId));
                            newSldIdNode.setAttributeNS(NS_RELATIONSHIPS_OFFICE_DOC, 'r:id', newPresRelId);
                            newSlideIdNodes.push(newSldIdNode);
                        }
                    }

                    // SEPARATOR SLIDE LOGIC FOR PENGUMUMAN
                    if (pPlaceholderMatch && i < keysToProcess.length - 1) {
                        const separatorSlideXmlDoc = parser.parseFromString(slideXmlStr, 'application/xml');
                        const separatorSlideRelsXmlDoc = parser.parseFromString(slideRelsStr, 'application/xml');
                        
                        const separatorData: PresentationData = { ...data, P01: '' };
                        const { shape: sepImageShape } = findImagePlaceholder(separatorSlideXmlDoc);
                        if (sepImageShape && sepImageShape.parentNode) {
                            sepImageShape.parentNode.removeChild(sepImageShape);
                        }
                        
                        replaceSimplePlaceholders(separatorSlideXmlDoc, separatorData, null);

                        const sepSlideNum = nextAvailableSlideNum++;
                        const sepSlideId = nextAvailableSlideId++;
                        const sepPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
                        const sepSlidePath = `ppt/slides/slide${sepSlideNum}.xml`;
                        const sepSlideRelsPath = sepSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
                        
                        zip.file(sepSlidePath, serializer.serializeToString(separatorSlideXmlDoc));
                        zip.file(sepSlideRelsPath, serializer.serializeToString(separatorSlideRelsXmlDoc));

                        const sepOverride = contentTypesXmlDoc.createElementNS(NS_CONTENT_TYPES, 'Override');
                        sepOverride.setAttribute('PartName', `/${sepSlidePath}`);
                        sepOverride.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml');
                        contentTypesXmlDoc.querySelector('Types')?.appendChild(sepOverride);
                        
                        const sepPresRel = presRelsXmlDoc.createElementNS(NS_RELATIONSHIPS, 'Relationship');
                        sepPresRel.setAttribute('Id', sepPresRelId);
                        sepPresRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide');
                        sepPresRel.setAttribute('Target', `slides/slide${sepSlideNum}.xml`);
                        presRelsXmlDoc.querySelector('Relationships')?.appendChild(sepPresRel);
                        
                        const sepSldIdNode = presXmlDoc.createElementNS(NS_PRESENTATIONML, 'p:sldId');
                        sepSldIdNode.setAttribute('id', String(sepSlideId));
                        sepSldIdNode.setAttributeNS(NS_RELATIONSHIPS_OFFICE_DOC, 'r:id', sepPresRelId);
                        newSlideIdNodes.push(sepSldIdNode);
                    }
                }
                continue;
            }
        }


        // Check for Text Splitting (B keys)
        let splittableKey: string | null = null;
        let chunks: string[] = [];
        const textNodes = getElementsByLocalName(slideXmlDoc, 't');
        
        for (const node of textNodes) {
            if (node.textContent) {
                const match = node.textContent.match(/{{(B[0-9]+)}}/);
                if (match) {
                    const key = match[1];
                    const textValue = data[key];
                    if (typeof textValue === 'string') {
                        // Check for rich text formatting
                        const hasFormatting = /<\/?(?:b|i|u)(?:\s+[^>]*?)?>/i.test(textValue);
                        
                        if (!hasFormatting) {
                            if (textValue.length > MAX_TEXT_LENGTH) {
                                splittableKey = key;
                                chunks = chunkText(textValue, MAX_TEXT_LENGTH);
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        if (splittableKey && chunks.length > 1) {
             for (let i = 0; i < chunks.length; i++) {
                const isOriginalSlide = i === 0;
                const isLastSlide = i === chunks.length - 1;
                const currentSlideXmlDoc = isOriginalSlide ? slideXmlDoc : parser.parseFromString(slideXmlStr, 'application/xml');

                replaceSimplePlaceholders(currentSlideXmlDoc, data, splittableKey);
                
                getElementsByLocalName(currentSlideXmlDoc, 't').forEach(node => {
                    if (node.textContent?.includes(`{{${splittableKey}}}`)) {
                        node.textContent = node.textContent.replace(`{{${splittableKey}}}`, chunks[i]);
                        
                        if (isLastSlide) {
                             const endingType = endingMap[splittableKey as string];
                             if (endingType) {
                                 const style = endings[language][endingType];
                                 if (style && style.length > 0) {
                                     addFormattedEnding(currentSlideXmlDoc, node, style);
                                 }
                             }
                        }
                    }
                });

                if (isOriginalSlide) {
                    zip.file(slidePath, serializer.serializeToString(currentSlideXmlDoc));
                    newSlideIdNodes.push(sldId.cloneNode(true));
                } else {
                    const newSlideNum = nextAvailableSlideNum++;
                    const newSlideId = nextAvailableSlideId++;
                    const newPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
                    const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
                    
                    zip.file(newSlidePath, serializer.serializeToString(currentSlideXmlDoc));
                    if (zip.file(slideRelsPath)) zip.file(newSlidePath.replace('slides/', 'slides/_rels/') + '.rels', await zip.file(slideRelsPath).async('string'));

                    const newOverride = contentTypesXmlDoc.createElementNS(NS_CONTENT_TYPES, 'Override');
                    newOverride.setAttribute('PartName', `/${newSlidePath}`);
                    newOverride.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml');
                    contentTypesXmlDoc.querySelector('Types')?.appendChild(newOverride);
                    
                    const newPresRel = presRelsXmlDoc.createElementNS(NS_RELATIONSHIPS, 'Relationship');
                    newPresRel.setAttribute('Id', newPresRelId);
                    newPresRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide');
                    newPresRel.setAttribute('Target', `slides/slide${newSlideNum}.xml`);
                    presRelsXmlDoc.querySelector('Relationships')?.appendChild(newPresRel);
                    
                    const newSldIdNode = presXmlDoc.createElementNS(NS_PRESENTATIONML, 'p:sldId');
                    newSldIdNode.setAttribute('id', String(newSlideId));
                    newSldIdNode.setAttributeNS(NS_RELATIONSHIPS_OFFICE_DOC, 'r:id', newPresRelId);
                    newSlideIdNodes.push(newSldIdNode);
                }
            }
        } else {
            // Simple slide (no splitting required)
            const tNodes = getElementsByLocalName(slideXmlDoc, 't');
            const endingTargets: { node: Element, endingStyle: EndingStyle[] }[] = [];
            
            tNodes.forEach(node => {
               const match = node.textContent?.match(/{{(B[0-9]+)}}/);
               if (match) {
                   const key = match[1];
                   const endingType = endingMap[key];
                   if (endingType) {
                       const style = endings[language][endingType];
                       if (style && style.length > 0) {
                           endingTargets.push({ node, endingStyle: style });
                       }
                   }
               }
            });

            replaceSimplePlaceholders(slideXmlDoc, data, splittableKey);

            endingTargets.forEach(({ node, endingStyle }) => {
                addFormattedEnding(slideXmlDoc, node, endingStyle);
            });

            zip.file(slidePath, serializer.serializeToString(slideXmlDoc));
            newSlideIdNodes.push(sldId.cloneNode(true));
        }
    }

    while (slideIdList.firstChild) slideIdList.removeChild(slideIdList.firstChild);
    newSlideIdNodes.forEach(node => slideIdList.appendChild(node));
    
    zip.file('ppt/presentation.xml', serializer.serializeToString(presXmlDoc));
    zip.file('ppt/_rels/presentation.xml.rels', serializer.serializeToString(presRelsXmlDoc));
    zip.file('[Content_Types].xml', serializer.serializeToString(contentTypesXmlDoc));

    const newPptxBlob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(newPptxBlob);
    link.download = `${data.presentationTitle || 'Presentation'}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
