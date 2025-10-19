import { PresentationData, Language } from '../types';

declare const JSZip: any;

const parser = new DOMParser();
const serializer = new XMLSerializer();
const MAX_TEXT_LENGTH = 140;

/**
 * Chunks a long string into smaller pieces, ensuring cuts happen at spaces.
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
        let cutIndex = remainingText.lastIndexOf(' ', maxLength);
        if (cutIndex === -1) cutIndex = maxLength;
        chunks.push(remainingText.substring(0, cutIndex));
        remainingText = remainingText.substring(cutIndex).trim();
    }
    return chunks;
};

/**
 * Chunks a main text and intelligently appends an ending. If the ending doesn't fit
 * on the last chunk of the main text, it creates a new, separate chunk for the ending.
 */
const chunkTextWithEnding = (text: string | undefined, ending: string, maxLength: number): string[] => {
    // If no text is provided, just return the ending, chunked if necessary.
    if (!text || text.trim() === '') {
        return chunkText(ending.trim(), maxLength);
    }

    const mainChunks = chunkText(text, maxLength);
    
    // This should not happen if text is not empty, but as a safeguard.
    if (mainChunks.length === 0) {
        return chunkText(ending.trim(), maxLength);
    }
    
    const lastChunk = mainChunks[mainChunks.length - 1];
    
    // Check if the ending can be appended to the last chunk
    if ((lastChunk + ending).length <= maxLength) {
        mainChunks[mainChunks.length - 1] = lastChunk + ending;
    } else {
        // Otherwise, add the ending as a new chunk (trimmed of leading whitespace)
        mainChunks.push(ending.trim());
    }

    return mainChunks;
};


/**
 * Finds the highest number used in slide filenames (e.g., slide1.xml, slide2.xml)
 * to determine the next available number for a new slide.
 */
const getNextSlideNum = (zip: any): number => {
    let maxNum = 0;
    zip.folder('ppt/slides').forEach((relativePath: string, file: any) => {
        if (file.name.endsWith('.xml')) {
            const match = relativePath.match(/slide(\d+)\.xml/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) maxNum = num;
            }
        }
    });
    return maxNum + 1;
};

/**
 * Finds the highest number used for relationship IDs (rId) in an XML document.
 */
const getNextRid = (doc: XMLDocument): number => {
    let maxRid = 0;
    const relationships = doc.querySelectorAll('Relationship');
    relationships.forEach(rel => {
        const id = rel.getAttribute('Id');
        if (id) {
            const match = id.match(/rId(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxRid) maxRid = num;
            }
        }
    });
    return maxRid + 1;
}

/**
 * Replaces all non-splittable placeholders in a given slide XML.
 */
// FIX: Refactored to use a callback with string.replace for safer and more efficient placeholder substitution. This avoids iterating over a modified collection and fixes the TypeScript error by removing the problematic code structure.
const replaceSimplePlaceholders = (slideXmlDoc: XMLDocument, data: PresentationData, splittableKey: string | null) => {
    const textNodes = slideXmlDoc.querySelectorAll('t');
    textNodes.forEach(node => {
        if (!node.textContent) return;

        node.textContent = node.textContent.replace(/{{([a-zA-Z0-9]+)}}/g, (match, keyName: keyof PresentationData) => {
            if (keyName === splittableKey) {
                return match; // Don't replace the splittable key, return original placeholder
            }
            
            const propertyValue = data[keyName];
            
            if (typeof propertyValue === 'string') {
                return propertyValue;
            }

            // For non-string types (like string[] for images) or undefined properties, replace with an empty string.
            return '';
        });
    });
};

/**
 * Replaces a specific placeholder with a given text chunk.
 */
const replaceChunkPlaceholder = (slideXmlDoc: XMLDocument, key: string, chunk: string) => {
    const textNodes = slideXmlDoc.querySelectorAll('t');
     textNodes.forEach(node => {
        if (node.textContent && node.textContent.includes(`{{${key}}}`)) {
             node.textContent = node.textContent.replace(`{{${key}}}`, chunk);
        }
    });
}

export const processTemplate = async (data: PresentationData, templateFile: File, language: Language) => {
    const endings = {
        indonesia: {
            bacaan: '\n\nL: Demikianlah sabda Tuhan...\nU: Syukur kepada Allah',
            injil: '\n\nI: Demikianlah Sabda Tuhan...\nU: Terpujilah Kristus',
            kolekta: '\n\nU: Amin',
            doaUmatImam: '\n\nU: Amin',
            doaSesudahKomuni: '\n\nU: Amin',
            doaAtasPersembahan: '\n\nU: Amin',
        },
        jawa: {
            bacaan: '\n\nL: Makaten sabda Dalem Gusti…\nU: Sembah Nuwun Konjuk Ing Gusti',
            injil: '\n\nL: Makaten sabda Dalem Gusti…\nU: Pinujia Sang Kristus',
            kolekta: '\n\nU: Amin',
            doaUmatImam: '\n\nU: Amin',
            doaSesudahKomuni: '\n\nU: Amin',
            doaAtasPersembahan: '\n\nU: Amin',
        }
    };
    
    const zip = await JSZip.loadAsync(templateFile);

    // 1. Read Core PPTX Structure Files
    const presXmlStr = await zip.file('ppt/presentation.xml').async('string');
    const presXmlDoc = parser.parseFromString(presXmlStr, 'application/xml');
    const presRelsXmlStr = await zip.file('ppt/_rels/presentation.xml.rels').async('string');
    const presRelsXmlDoc = parser.parseFromString(presRelsXmlStr, 'application/xml');
    const contentTypesXmlStr = await zip.file('[Content_Types].xml').async('string');
    const contentTypesXmlDoc = parser.parseFromString(contentTypesXmlStr, 'application/xml');
    
    const slideIdList = presXmlDoc.querySelector('sldIdLst');
    if (!slideIdList) throw new Error('Invalid presentation format: <p:sldIdLst> not found.');

    const originalSlideIds = Array.from(slideIdList.querySelectorAll('sldId'));
    let slideInsertionIndex = 0;

    for (const sldId of originalSlideIds) {
        slideInsertionIndex++;
        const rId = sldId.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
        if (!rId) continue;

        const rel = presRelsXmlDoc.querySelector(`Relationship[Id="${rId}"]`);
        if (!rel) continue;

        const slidePath = `ppt/${rel.getAttribute('Target')}`;
        const slideXmlStr = await zip.file(slidePath).async('string');
        const slideXmlDoc = parser.parseFromString(slideXmlStr, 'application/xml');

        // Find a placeholder that needs splitting or has a special ending
        let splittableKey: keyof PresentationData | null = null;
        let chunks: string[] = [];

        const textNodes = slideXmlDoc.querySelectorAll('t');
        for (const node of textNodes) {
            if (node.textContent) {
                const placeholders = node.textContent.match(/{{([a-zA-Z0-9]+)}}/g) || [];
                for (const placeholder of placeholders) {
                    const key = placeholder.replace(/[{}]/g, '') as keyof PresentationData;
                    const textValue = (data as any)[key];
                    
                    if (textValue && typeof textValue === 'string') {
                        const isLong = textValue.length > MAX_TEXT_LENGTH;
                        let needsChunking = isLong;
                        let specificEnding = null;

                        if (key === 'bacaan1Text' || key === 'bacaan2Text') {
                            specificEnding = endings[language].bacaan;
                        } else if (key === 'bacaanInjilText') {
                            specificEnding = endings[language].injil;
                        } else if (key === 'doaKolektaText') {
                            specificEnding = endings[language].kolekta;
                        } else if (key === 'doaUmat11ImamText') {
                            specificEnding = endings[language].doaUmatImam;
                        } else if (key === 'doaSesudahKomuniText') {
                            specificEnding = endings[language].doaSesudahKomuni;
                        } else if (key === 'doaAtasPersembahanText') {
                            specificEnding = endings[language].doaAtasPersembahan;
                        }

                        // A text needs special chunking if it requires an ending, even if it's short.
                        if (specificEnding && textValue.trim().length > 0) {
                            needsChunking = true;
                        }
                        
                        if (needsChunking) {
                            splittableKey = key;
                            if (specificEnding) {
                                chunks = chunkTextWithEnding(textValue, specificEnding, MAX_TEXT_LENGTH);
                            } else {
                                // This branch is only for long texts that don't have special endings.
                                chunks = chunkText(textValue, MAX_TEXT_LENGTH);
                            }
                            break; 
                        }
                    }
                }
            }
            if (splittableKey) break;
        }


        // If no splitting is needed for this slide, do a simple replacement and continue
        if (!splittableKey) {
            replaceSimplePlaceholders(slideXmlDoc, data, null);
            zip.file(slidePath, serializer.serializeToString(slideXmlDoc));
            continue;
        }

        // --- SLIDE DUPLICATION LOGIC ---
        
        // On the original slide, replace other placeholders and the first chunk
        replaceSimplePlaceholders(slideXmlDoc, data, splittableKey);
        replaceChunkPlaceholder(slideXmlDoc, splittableKey, chunks[0]);
        zip.file(slidePath, serializer.serializeToString(slideXmlDoc));
        
        // Get original slide rels
        const slideRelsPath = slidePath.replace('slides/', 'slides/_rels/') + '.rels';
        const slideRelsStr = await zip.file(slideRelsPath)?.async('string');


        // Duplicate the slide for the rest of the chunks
        for (let i = 1; i < chunks.length; i++) {
            const chunk = chunks[i];

            // A. Generate new IDs
            const newSlideNum = getNextSlideNum(zip);
            const newPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;
            const newSlideId = 256 + newSlideNum; // A common convention, not a strict rule

            // B. Create new slide file
            const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
            const newSlideXmlDoc = parser.parseFromString(slideXmlStr, 'application/xml'); // Clone from original
            replaceSimplePlaceholders(newSlideXmlDoc, data, splittableKey);
            replaceChunkPlaceholder(newSlideXmlDoc, splittableKey, chunk);
            zip.file(newSlidePath, serializer.serializeToString(newSlideXmlDoc));

            // C. Create new slide rels file (if original had one)
            if (slideRelsStr) {
                const newSlideRelsPath = newSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
                zip.file(newSlideRelsPath, slideRelsStr);
            }

            // D. Update [Content_Types].xml
            const newOverride = contentTypesXmlDoc.createElement('Override');
            newOverride.setAttribute('PartName', `/${newSlidePath}`);
            newOverride.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml');
            contentTypesXmlDoc.querySelector('Types')?.appendChild(newOverride);
            
            // E. Update ppt/_rels/presentation.xml.rels
            const newPresRel = presRelsXmlDoc.createElement('Relationship');
            newPresRel.setAttribute('Id', newPresRelId);
            newPresRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide');
            newPresRel.setAttribute('Target', `slides/slide${newSlideNum}.xml`);
            presRelsXmlDoc.querySelector('Relationships')?.appendChild(newPresRel);
            
            // F. Update ppt/presentation.xml to insert the new slide in order
            const newSldIdNode = presXmlDoc.createElementNS('http://purl.oclc.org/ooxml/presentationml/main', 'p:sldId');
            newSldIdNode.setAttribute('id', String(newSlideId));
            newSldIdNode.setAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'r:id', newPresRelId);
            
            const allCurrentSldIds = Array.from(slideIdList.querySelectorAll('sldId'));
            slideIdList.insertBefore(newSldIdNode, allCurrentSldIds[slideInsertionIndex]);
            slideInsertionIndex++;
        }
    }

    // Write updated core files back to zip
    zip.file('ppt/presentation.xml', serializer.serializeToString(presXmlDoc));
    zip.file('ppt/_rels/presentation.xml.rels', serializer.serializeToString(presRelsXmlDoc));
    zip.file('[Content_Types].xml', serializer.serializeToString(contentTypesXmlDoc));

    // Generate and download the final PPTX
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