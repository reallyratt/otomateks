

import { PresentationData, Language } from '../types';

declare const JSZip: any;

const parser = new DOMParser();
const serializer = new XMLSerializer();

// Global text limit for all fields
const MAX_TEXT_LENGTH = 130;

// Define XML Namespaces to ensure valid file structure
const NS_CONTENT_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';
const NS_RELATIONSHIPS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const NS_PRESENTATIONML = 'http://purl.oclc.org/ooxml/presentationml/main';
const NS_DRAWINGML = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const NS_RELATIONSHIPS_OFFICE_DOC = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

// Endings are now simple strings with HTML-like formatting
const endingsAsHtml: Record<Language, Record<number, string>> = {
    indonesia: {
        1: '<b><i>U: Amin</i></b>',
        2: 'Demikianlah sabda Tuhan...\n<b><i>U: Syukur kepada Allah</i></b>',
        3: '',
        4: 'Demikianlah Sabda Tuhan...\n<b><i>U: Terpujilah Kristus</i></b>',
        5: ''
    },
    jawa: {
        1: '<b><i>U: Amin</i></b>',
        2: '',
        3: 'Makaten sabda Dalem Gusti...\n<b><i>U: Sembah nyuwun konjuk ing Gusti</i></b>',
        4: '',
        5: 'Mangkono sabda Dalem Gusti...\n<b><i>U: Pinujia Sang Kristus</i></b>'
    },
    english: { 
        1: '', 2: '', 3: '', 4: '', 5: '' 
    }
};

// Map specific B keys to ending types
const endingMap: Record<string, number> = {
    'B05': 1,
    'B29': 1,
    'B33': 1,
    'B06': 2,  // Logic handled dynamically in processTemplate for language check
    'B011': 2, // Logic handled dynamically
    'B014': 4  // Logic handled dynamically
};


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
 * HTML-Aware Chunking function.
 * Splits text into chunks of maxLength visible characters.
 * Preserves open tags across splits.
 */
const chunkText = (text: string | undefined, maxLength: number): string[] => {
    if (!text) return [''];
    
    // Normalize newlines
    const rawText = text.trim();
    if (rawText.length === 0) return [''];
    
    // Quick check if raw length is small (even with tags, if it's < limit, it fits)
    if (rawText.length <= maxLength) return [rawText];

    const chunks: string[] = [];
    let currentChunk = '';
    let visibleLen = 0;
    
    // Stack to track open formatting tags: 'b', 'i', 'u'
    let openTags: string[] = [];
    
    // Tokenizer regex: match tags OR single characters
    // Capture group 1: full tag including <>
    // Capture group 2: tag name (b, i, u)
    const regex = /(<\/?([biu])(?:\s+[^>]*?)?>)|([\s\S])/gi;
    
    let match;
    let lastValidSplitIndex = -1; // Index in the `rawText` where we can split
    
    // Helper to get closing tag
    const getCloseTag = (tag: string) => `</${tag}>`;
    const getOpenTag = (tag: string) => `<${tag}>`;

    // We process the string by iterating tokens
    // Since simple regex iteration makes backtracking hard, we'll manually iterate char by char statefully
    
    let i = 0;
    while (i < rawText.length) {
        // Check for tag
        if (rawText[i] === '<') {
            const tagMatch = rawText.substring(i).match(/^<\/?([biu])(?:\s+[^>]*?)?>/i);
            if (tagMatch) {
                const fullTag = tagMatch[0];
                const tagName = tagMatch[1].toLowerCase();
                const isClosing = fullTag.startsWith('</');
                
                currentChunk += fullTag;
                
                if (isClosing) {
                    // Remove from stack if matches top (simple balancing)
                    // If not matching top, we just remove the last instance of it for resilience
                    const idx = openTags.lastIndexOf(tagName);
                    if (idx !== -1) {
                        openTags.splice(idx, 1);
                    }
                } else {
                    openTags.push(tagName);
                }
                
                i += fullTag.length;
                continue;
            }
        }
        
        // Regular character
        const char = rawText[i];
        currentChunk += char;
        visibleLen++;
        
        // Update potential split point if it's a separator
        if (/[\s.,;!?]/.test(char)) {
            // We record the length of currentChunk so we know where to slice
            lastValidSplitIndex = currentChunk.length;
        }

        i++;

        // CHECK LIMIT
        if (visibleLen >= maxLength) {
            // Need to split
            let splitPoint = -1;

            // 1. Punctuation/Space priority
            if (lastValidSplitIndex !== -1 && lastValidSplitIndex < currentChunk.length) {
                splitPoint = lastValidSplitIndex;
            } else {
                // Hard cut
                splitPoint = currentChunk.length;
            }
            
            // Extract the part for this slide
            let chunkContent = currentChunk.substring(0, splitPoint);
            let remainder = currentChunk.substring(splitPoint);
            
            // Close any tags open at the end of this chunk
            const closingTags = [...openTags].reverse().map(getCloseTag).join('');
            chunkContent += closingTags;
            
            chunks.push(chunkContent.trim());
            
            // Prepare next chunk
            // Re-open tags for the remainder
            const openingTags = openTags.map(getOpenTag).join('');
            currentChunk = openingTags + remainder.trimStart(); // Trim start of next chunk to avoid leading spaces
            
            // Reset counters (approximate visible len for remainder)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = currentChunk;
            visibleLen = tempDiv.textContent?.length || 0;
            
            lastValidSplitIndex = -1;
        }
    }
    
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
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
        
        // Regex for C01.., T01.., or PC01.. handles spaces: {{ C01 }}
        const match = fullText.match(/{{\s*([CT]|PC)([0-9]+(_\d+)?)\s*}}/);
        if (match) {
            const key = match[1] + match[2]; // e.g. "PC01", "C01_2"
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
        // Improved regex to handle spaces like {{ A01 }}
        const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/;
        const match = node.textContent.match(regex);
        if (match) {
            targets.push({ node, match, key: match[1] });
        }
    });

    for (const { node, match, key } of targets) {
        // Image keys (C), Thumbnail keys (T), Announcement Images (PC) are handled by image logic, skip simple text replacement.
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
            // If data is missing/undefined/null, remove the placeholder to avoid ugly {{KEY}} remaining
            node.textContent = node.textContent.replace(match[0], '');
        }
    }
};

export const processTemplate = async (data: PresentationData, templateFile: File, language: Language) => {
    const modifiedData = { ...data };
    
    // Resolve dynamic keys in endingMap based on language
    const currentEndingMap: Record<string, number> = {
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
    let previousSlideCache: { xml: string, rels: string } | null = null;
    
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

        // --- Dynamic Field Duplication ---
        
        // Special Logic for Mazmur (B08):
        // If template has B08, we want to see if we have B09 and B10 data. 
        // If we do, we treat them as expansions of B08.
        let expansionKey = null;
        
        const expandableFields = ['B01', 'B08', 'B013', 'B28', 'B30', 'B34'];
        expansionKey = expandableFields.find(key => slideXmlStr.includes(`{{${key}}}`));
        
        if (expansionKey) {
            // Extract the numeric/alpha part
            const baseSuffix = expansionKey.substring(1); // "01", "08", "013", etc
            const matchingKeys = Object.keys(modifiedData).filter(k => k.startsWith(`B${baseSuffix}_`));
            
            // Collect indices
            const indices: number[] = [];
            matchingKeys.forEach(k => {
                const parts = k.split('_');
                if (parts.length > 1) indices.push(parseInt(parts[1], 10));
            });
            
            // MAZMUR SPECIAL: If we found B08, also look for B09 and B10 in data and map them to indices 2 and 3
            // This allows static fields (Ayat 2, Ayat 3) to use the Ayat 1 template
            if (expansionKey === 'B08') {
                if (modifiedData['B09']) indices.push(2);
                if (modifiedData['B010']) indices.push(3);
                
                // Map B09/B10 content to B08_2/B08_3 in local data context later
            }

            indices.sort((a,b) => a-b);
            
            const allIndices = [1, ...indices];
            
            for (let i = 0; i < allIndices.length; i++) {
                const idx = allIndices[i];
                const isOriginalSlide = i === 0;
                
                // Map data for this slide instance
                const localData = { ...modifiedData };
                
                if (idx > 1) {
                    if (expansionKey === 'B08' && (idx === 2 || idx === 3)) {
                        // Special mapping for Mazmur
                        const sourceSuffix = idx === 2 ? '09' : '010';
                        const targetSuffix = '08';
                        
                        // Map A09->A08, B09->B08, C09->C08
                        ['A', 'B', 'C'].forEach(prefix => {
                            const sourceKey = `${prefix}${sourceSuffix}`;
                            const targetKey = `${prefix}${targetSuffix}`;
                            if (modifiedData[sourceKey] !== undefined) {
                                localData[targetKey] = modifiedData[sourceKey];
                            } else {
                                if (prefix === 'A') localData[targetKey] = modifiedData[targetKey]; 
                                else localData[targetKey] = ''; 
                            }
                        });

                    } else {
                        // Standard dynamic logic (B01_2 -> B01)
                        ['A', 'B', 'C'].forEach(prefix => {
                            const baseKey = `${prefix}${baseSuffix}`;
                            const targetKey = `${prefix}${baseSuffix}_${idx}`;
                            if (modifiedData[targetKey] !== undefined) {
                                localData[baseKey] = modifiedData[targetKey];
                            } else {
                                // If title (A) is missing for suffix, reuse base title
                                if (prefix === 'A') localData[baseKey] = modifiedData[baseKey]; 
                                else localData[baseKey] = ''; 
                            }
                        });
                    }
                }
                
                const processInnerSlide = async (baseXml: XMLDocument, finalRels: XMLDocument, data: PresentationData, isBase: boolean) => {
                     // Check for Text Splitting (B keys)
                    let splittableKey: string | null = null;
                    let chunks: string[] = [];
                    const textNodes = getElementsByLocalName(baseXml, 't');
                    
                    for (const node of textNodes) {
                        if (node.textContent) {
                            const match = node.textContent.match(/{{(B[0-9]+)}}/);
                            if (match) {
                                const key = match[1];
                                const textValue = data[key];
                                if (typeof textValue === 'string') {
                                    // Ending Logic Check
                                    const endingId = currentEndingMap[key];
                                    let effectiveText = textValue;
                                    let endingHtml = '';

                                    if (endingId) {
                                        endingHtml = endingsAsHtml[language][endingId];
                                    }

                                    // If text + ending fits without splitting, or if it needs splitting
                                    const rawTextLen = textValue.replace(/<[^>]+>/g, '').length;
                                    const rawEndingLen = endingHtml.replace(/<[^>]+>/g, '').length;
                                    
                                    if (rawTextLen > MAX_TEXT_LENGTH || (endingHtml && (rawTextLen + rawEndingLen > MAX_TEXT_LENGTH))) {
                                        splittableKey = key;
                                        chunks = chunkText(textValue, MAX_TEXT_LENGTH);
                                        
                                        // Append Ending Logic
                                        if (endingHtml) {
                                            const lastChunk = chunks[chunks.length - 1];
                                            const rawLast = lastChunk.replace(/<[^>]+>/g, '');
                                            // Check if ending fits on last slide
                                            if (rawLast.length + rawEndingLen + 1 <= MAX_TEXT_LENGTH) {
                                                chunks[chunks.length - 1] = lastChunk + '\n' + endingHtml;
                                            } else {
                                                // Create a new slide just for ending
                                                chunks.push(endingHtml);
                                            }
                                        }
                                        break;
                                    } else if (endingHtml) {
                                        // Fits in one slide, just append ending to data
                                        data[key] = textValue + '\n' + endingHtml;
                                    }
                                }
                            }
                        }
                    }

                    // Check for Image Placeholders
                    const { key: imgKey, shape: imgShape } = findImagePlaceholder(baseXml);
                    const imgList = (imgKey && data[imgKey] && Array.isArray(data[imgKey])) ? data[imgKey] as string[] : [];
                    
                    const baseXmlStr = serializer.serializeToString(baseXml);
                    const baseRelsStr = serializer.serializeToString(finalRels);

                    // Prioritize Multi-Image Loop if > 1 image
                    if (imgKey && imgList.length > 1) {
                         // Multi-Image Logic (One slide per image)
                        for (let j = 0; j < imgList.length; j++) {
                            const isFirstImg = j === 0;
                            // Clone for each image
                            const currentXml = parser.parseFromString(baseXmlStr, 'application/xml');
                            const currentRels = parser.parseFromString(baseRelsStr, 'application/xml');
                            
                            const curImgShape = findImagePlaceholder(currentXml).shape;
                            if (curImgShape) {
                                const imageBase64 = imgList[j];
                                const imageRId = await addImageToPackage(zip, currentRels, contentTypesXmlDoc, imageBase64);
                                await modifyShapeForImage(curImgShape, imageRId, imageBase64);
                            }

                            replaceSimplePlaceholders(currentXml, data, null);

                            if (isBase && isFirstImg) {
                                zip.file(slidePath, serializer.serializeToString(currentXml));
                                if (zip.file(slideRelsPath)) zip.file(slideRelsPath, serializer.serializeToString(currentRels));
                                newSlideIdNodes.push(sldId.cloneNode(true));
                            } else {
                                const newSlideNum = nextAvailableSlideNum++;
                                const newSlideId = nextAvailableSlideId++;
                                const newPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
                                const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
                                
                                zip.file(newSlidePath, serializer.serializeToString(currentXml));
                                const newSlideRelsPath = newSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
                                zip.file(newSlideRelsPath, serializer.serializeToString(currentRels));

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
                    } else if (splittableKey && chunks.length > 1) {
                        // Text Splitting Active
                        for (let c = 0; c < chunks.length; c++) {
                            const isFirstChunk = c === 0;
                            // Clean Clone for each chunk
                            const currentXml = parser.parseFromString(baseXmlStr, 'application/xml');
                            const currentRels = parser.parseFromString(baseRelsStr, 'application/xml');
                            
                            // Image Handling (First Image only if text splits, or none)
                            const curImgShape = findImagePlaceholder(currentXml).shape;
                            if (curImgShape) {
                                if (imgList.length > 0) {
                                    const imageBase64 = imgList[0];
                                    const imageRId = await addImageToPackage(zip, currentRels, contentTypesXmlDoc, imageBase64);
                                    await modifyShapeForImage(curImgShape, imageRId, imageBase64);
                                } else {
                                    if (curImgShape.parentNode) curImgShape.parentNode.removeChild(curImgShape);
                                }
                            }

                            // Text Handling
                            replaceSimplePlaceholders(currentXml, data, splittableKey);
                            getElementsByLocalName(currentXml, 't').forEach(node => {
                                if (node.textContent?.includes(`{{${splittableKey}}}`)) {
                                    const chunkVal = chunks[c];
                                    const hasFormatting = /<\/?(?:b|i|u)(?:\s+[^>]*?)?>/i.test(chunkVal);
                                    if (hasFormatting) {
                                        const parentRun = node.parentNode as Element;
                                        if (parentRun && parentRun.localName === 'r') {
                                            applyFormattedTextToRun(currentXml, parentRun, chunkVal);
                                        }
                                    } else {
                                        node.textContent = node.textContent.replace(`{{${splittableKey}}}`, chunkVal);
                                    }
                                }
                            });

                            if (isBase && isFirstChunk) {
                                zip.file(slidePath, serializer.serializeToString(currentXml));
                                // Save Rels
                                if (zip.file(slideRelsPath)) zip.file(slideRelsPath, serializer.serializeToString(currentRels));
                                else zip.file(slideRelsPath, serializer.serializeToString(currentRels)); // Ensure creation if missing but needed for img
                                newSlideIdNodes.push(sldId.cloneNode(true));
                            } else {
                                const newSlideNum = nextAvailableSlideNum++;
                                const newSlideId = nextAvailableSlideId++;
                                const newPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
                                const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
                                
                                zip.file(newSlidePath, serializer.serializeToString(currentXml));
                                const newSlideRelsPath = newSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
                                zip.file(newSlideRelsPath, serializer.serializeToString(currentRels));

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
                        // Standard Single Slide (Handle 0 or 1 image)
                        const currentXml = parser.parseFromString(baseXmlStr, 'application/xml');
                        const currentRels = parser.parseFromString(baseRelsStr, 'application/xml');
                        
                        const curImgShape = findImagePlaceholder(currentXml).shape;
                        if (curImgShape) {
                             if (imgList.length > 0) {
                                // Apply single image
                                const imageBase64 = imgList[0];
                                const imageRId = await addImageToPackage(zip, currentRels, contentTypesXmlDoc, imageBase64);
                                await modifyShapeForImage(curImgShape, imageRId, imageBase64);
                             } else {
                                if (curImgShape.parentNode) curImgShape.parentNode.removeChild(curImgShape);
                             }
                        }
                        
                        replaceSimplePlaceholders(currentXml, data, null);
                        
                        if (isBase) {
                            zip.file(slidePath, serializer.serializeToString(currentXml));
                            if (zip.file(slideRelsPath)) zip.file(slideRelsPath, serializer.serializeToString(currentRels)); // Save updated rels
                            newSlideIdNodes.push(sldId.cloneNode(true));
                        } else {
                             const newSlideNum = nextAvailableSlideNum++;
                             const newSlideId = nextAvailableSlideId++;
                             const newPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
                             const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
                             
                             zip.file(newSlidePath, serializer.serializeToString(currentXml));
                             const newSlideRelsPath = newSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
                             zip.file(newSlideRelsPath, serializer.serializeToString(currentRels));

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
                }
                
                // Call Process (First index handles original slide file)
                const currentSlideXmlDoc = isOriginalSlide ? slideXmlDoc : parser.parseFromString(slideXmlStr, 'application/xml');
                const currentSlideRelsXmlDoc = isOriginalSlide ? slideRelsXmlDoc : parser.parseFromString(slideRelsStr, 'application/xml');
                
                await processInnerSlide(currentSlideXmlDoc, currentSlideRelsXmlDoc, localData, isOriginalSlide);

                // SEPARATOR / REFREN SLIDE LOGIC
                // ... (rest of logic remains same)
                const isMazmurOrBPI = expansionKey === 'B08' || expansionKey === 'B013';
                
                if (isMazmurOrBPI && previousSlideCache) {
                    // Always insert Refren after Ayat, including the last one (following "refren > ayat I > refren > ayat II > refren")
                    
                    const refrenXmlDoc = parser.parseFromString(previousSlideCache.xml, 'application/xml');
                    const refrenRelsDoc = parser.parseFromString(previousSlideCache.rels, 'application/xml');
                    
                    const processRefrenCopy = async (xml: XMLDocument, rels: XMLDocument) => {
                         replaceSimplePlaceholders(xml, modifiedData, null);
                         
                         // Check for Image placeholder in the copied Refren slide and process it
                         const { key: refImgKey, shape: refImgShape } = findImagePlaceholder(xml);
                         
                         if (refImgKey && modifiedData[refImgKey] && refImgShape) {
                            const refImages = modifiedData[refImgKey] as string[];
                            if (refImages.length > 0) {
                                // For the duplicated refren, we take the first image (Refren should match the original)
                                const imageBase64 = refImages[0];
                                const imageRId = await addImageToPackage(zip, rels, contentTypesXmlDoc, imageBase64);
                                await modifyShapeForImage(refImgShape, imageRId, imageBase64);
                            } else {
                                if (refImgShape.parentNode) refImgShape.parentNode.removeChild(refImgShape);
                            }
                         } else if (refImgShape && refImgShape.parentNode) {
                             refImgShape.parentNode.removeChild(refImgShape);
                         }
                    };
                    
                    await processRefrenCopy(refrenXmlDoc, refrenRelsDoc);

                    const sepSlideNum = nextAvailableSlideNum++;
                    const sepSlideId = nextAvailableSlideId++;
                    const sepPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
                    const sepSlidePath = `ppt/slides/slide${sepSlideNum}.xml`;
                    const sepSlideRelsPath = sepSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
                    
                    zip.file(sepSlidePath, serializer.serializeToString(refrenXmlDoc));
                    zip.file(sepSlideRelsPath, serializer.serializeToString(refrenRelsDoc));

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
                } else if (!isMazmurOrBPI && i < allIndices.length - 1) {
                    // Standard Separator for other dynamic fields (Lagu Pembuka etc - usually just blank or duplicate title)
                    // Original logic: insert blank copy of current slide
                     const separatorSlideXmlDoc = parser.parseFromString(slideXmlStr, 'application/xml');
                    const separatorSlideRelsXmlDoc = parser.parseFromString(slideRelsStr, 'application/xml');
                    
                    const separatorData = { ...modifiedData };
                    const keysOnSlide = [];
                    const textNodes = getElementsByLocalName(separatorSlideXmlDoc, 't');
                    for (const node of textNodes) {
                        const match = node.textContent?.match(/{{([a-zA-Z0-9_]+)}}/);
                        if (match) keysOnSlide.push(match[1]);
                    }
                    keysOnSlide.forEach(k => separatorData[k] = '');

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
            
            // Cache current slide as previous for next loop (though for expansion loop we are inside one slide)
            previousSlideCache = { xml: slideXmlStr, rels: slideRelsStr };
            continue;
        }

        // Doa Umat Duplication Logic
        // ... (rest of file remains the same)
