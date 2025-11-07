
import { PresentationData, Language } from '../types';

declare const JSZip: any;

const parser = new DOMParser();
const serializer = new XMLSerializer();
const MAX_TEXT_LENGTH = 140;

// Define XML Namespaces to ensure valid file structure
const NS_CONTENT_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';
const NS_RELATIONSHIPS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const NS_PRESENTATIONML = 'http://purl.oclc.org/ooxml/presentationml/main';
const NS_DRAWINGML = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const NS_RELATIONSHIPS_OFFICE_DOC = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

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
    return match ? match[1] : 'application/octet-stream';
};


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
 * Chunks a main text and intelligently appends an ending.
 */
const chunkTextWithEnding = (text: string | undefined, ending: string, maxLength: number): string[] => {
    if (!text || text.trim() === '') {
        return chunkText(ending.trim(), maxLength);
    }
    const mainChunks = chunkText(text, maxLength);
    if (mainChunks.length === 0) {
        return chunkText(ending.trim(), maxLength);
    }
    const lastChunk = mainChunks[mainChunks.length - 1];
    if ((lastChunk + ending).length <= maxLength) {
        mainChunks[mainChunks.length - 1] = lastChunk + ending;
    } else {
        mainChunks.push(ending.trim());
    }
    return mainChunks;
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

const findImagePlaceholder = (slideXmlDoc: XMLDocument): { key: keyof PresentationData | null; shape: Element | null } => {
    const textNodes = slideXmlDoc.querySelectorAll('t');
    for (const node of textNodes) {
        if (node.textContent) {
            const match = node.textContent.match(/{{([a-zA-Z0-9]+Images)}}/);
            if (match) {
                const key = match[1] as keyof PresentationData;
                let parent = node.parentElement;
                while (parent) {
                    if (parent.nodeName === 'p:sp') {
                        return { key, shape: parent };
                    }
                    parent = parent.parentElement;
                }
            }
        }
    }
    return { key: null, shape: null };
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
    const txBody = shapeElement.querySelector('txBody');
    if (txBody) txBody.remove();

    let spPr = shapeElement.querySelector('spPr');
    if (!spPr) {
        spPr = doc.createElementNS(NS_PRESENTATIONML, 'p:spPr');
        shapeElement.insertBefore(spPr, shapeElement.firstChild);
    }
    
    const existingFill = spPr.querySelector('solidFill, gradFill, noFill, pattFill, blipFill');
    if (existingFill) existingFill.remove();

    let srcRect: Element | null = null;
    try {
        const ext = spPr.querySelector('xfrm ext');
        const shapeCx = ext?.getAttribute('cx');
        const shapeCy = ext?.getAttribute('cy');

        if (shapeCx && shapeCy) {
            const shapeWidth = parseInt(shapeCx, 10);
            const shapeHeight = parseInt(shapeCy, 10);
            
            if (shapeHeight > 0) {
                const shapeAspect = shapeWidth / shapeHeight;
                const { width: imageWidth, height: imageHeight } = await getImageDimensions(imageBase64);
                
                if (imageHeight > 0) {
                    const imageAspect = imageWidth / imageHeight;
                    if (Math.abs(shapeAspect - imageAspect) > 0.01) { // Ratios are different, calculate crop
                        srcRect = doc.createElementNS(NS_DRAWINGML, 'a:srcRect');
                        if (imageAspect > shapeAspect) { // Image is wider, crop sides
                            const newImageWidth = shapeAspect * imageHeight;
                            const cropFactor = (imageWidth - newImageWidth) / imageWidth;
                            const cropValue = Math.round((cropFactor / 2) * 100000);
                            if (cropValue > 0) {
                                srcRect.setAttribute('l', String(cropValue));
                                srcRect.setAttribute('r', String(cropValue));
                            }
                        } else { // Image is taller, crop top/bottom
                            const newImageHeight = imageWidth / shapeAspect;
                            const cropFactor = (imageHeight - newImageHeight) / imageHeight;
                            const cropValue = Math.round((cropFactor / 2) * 100000);
                             if (cropValue > 0) {
                                srcRect.setAttribute('t', String(cropValue));
                                srcRect.setAttribute('b', String(cropValue));
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.warn("Could not calculate image cropping, default stretching will be applied.", e);
        srcRect = null;
    }

    const blipFill = doc.createElementNS(NS_DRAWINGML, 'a:blipFill');
    const blip = doc.createElementNS(NS_DRAWINGML, 'a:blip');
    blip.setAttributeNS(NS_RELATIONSHIPS_OFFICE_DOC, 'r:embed', imageRId);
    blipFill.appendChild(blip);
    
    if (srcRect && srcRect.hasAttributes()) {
        blipFill.appendChild(srcRect);
    }
    
    const stretch = doc.createElementNS(NS_DRAWINGML, 'a:stretch');
    const fillRect = doc.createElementNS(NS_DRAWINGML, 'a:fillRect');
    stretch.appendChild(fillRect);
    blipFill.appendChild(stretch);
    spPr.appendChild(blipFill);
};

const addImageToPackage = async (zip: any, slideRelsXmlDoc: XMLDocument, contentTypesXmlDoc: XMLDocument, imageBase64: string): Promise<string> => {
    const mediaId = getNextMediaId(zip, true);
    const mimeType = getMimeTypeFromBase64(imageBase64);
    const extension = mimeType.split('/')[1] || 'png';
    const imageFileName = `image${mediaId}.${extension}`;
    const imagePath = `ppt/media/${imageFileName}`;
    const imageBytes = base64ToUint8Array(imageBase64);

    zip.file(imagePath, imageBytes, { binary: true });
    
    const newOverride = contentTypesXmlDoc.createElementNS(NS_CONTENT_TYPES, 'Override');
    newOverride.setAttribute('PartName', `/${imagePath}`);
    newOverride.setAttribute('ContentType', `image/${extension}`);
    contentTypesXmlDoc.querySelector('Types')?.appendChild(newOverride);
    
    const newRelId = `rId${getNextRid(slideRelsXmlDoc)}`;
    const newRel = slideRelsXmlDoc.createElementNS(NS_RELATIONSHIPS, 'Relationship');
    newRel.setAttribute('Id', newRelId);
    newRel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
    newRel.setAttribute('Target', `../media/${imageFileName}`);
    slideRelsXmlDoc.querySelector('Relationships')?.appendChild(newRel);

    return newRelId;
};

const replaceSimplePlaceholders = (slideXmlDoc: XMLDocument, data: PresentationData, ignoredKey: string | null) => {
    slideXmlDoc.querySelectorAll('t').forEach(node => {
        if (!node.textContent) return;
        node.textContent = node.textContent.replace(/{{([a-zA-Z0-9]+)}}/g, (match, keyName: keyof PresentationData) => {
            if (keyName === ignoredKey || keyName.endsWith('Images')) return match;
            const propertyValue = data[keyName];
            return typeof propertyValue === 'string' ? propertyValue : '';
        });
    });
};

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
        jawa: { /* ... */ }
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
        const slideXmlStr = await zip.file(slidePath).async('string');
        const slideXmlDoc = parser.parseFromString(slideXmlStr, 'application/xml');
        
        const slideRelsPath = slidePath.replace('slides/', 'slides/_rels/') + '.rels';
        const slideRelsStr = await zip.file(slideRelsPath)?.async('string') || `<Relationships xmlns="${NS_RELATIONSHIPS}"></Relationships>`;
        const slideRelsXmlDoc = parser.parseFromString(slideRelsStr, 'application/xml');

        // Check for Image Placeholders first
        const { key: imageKey, shape: imageShape } = findImagePlaceholder(slideXmlDoc);
        const images = (imageKey && data[imageKey] && Array.isArray(data[imageKey])) ? data[imageKey] as string[] : [];

        if (images.length > 0 && imageShape) {
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
        }

        // Check for Text Splitting
        let splittableKey: keyof PresentationData | null = null;
        let chunks: string[] = [];
        const textNodes = slideXmlDoc.querySelectorAll('t');
        for (const node of textNodes) {
            if (node.textContent) {
                const match = node.textContent.match(/{{([a-zA-Z0-9]+Text)}}/);
                if (match) {
                    const key = match[1] as keyof PresentationData;
                    const textValue = data[key];
                    if (typeof textValue === 'string') {
                        let ending = null;
                        if (key === 'bacaan1Text' || key === 'bacaan2Text') ending = endings[language].bacaan;
                        else if (key === 'bacaanInjilText') ending = endings[language].injil;
                        else if (key === 'doaKolektaText' || key === 'doaUmat11ImamText' || key === 'doaSesudahKomuniText' || key === 'doaAtasPersembahanText') ending = endings[language].kolekta;

                        if (textValue.length > MAX_TEXT_LENGTH || (ending && textValue.trim().length > 0)) {
                            splittableKey = key;
                            chunks = ending ? chunkTextWithEnding(textValue, ending, MAX_TEXT_LENGTH) : chunkText(textValue, MAX_TEXT_LENGTH);
                            break;
                        }
                    }
                }
            }
        }
        
        if (splittableKey && chunks.length > 1) {
             for (let i = 0; i < chunks.length; i++) {
                const isOriginalSlide = i === 0;
                const currentSlideXmlDoc = isOriginalSlide ? slideXmlDoc : parser.parseFromString(slideXmlStr, 'application/xml');

                replaceSimplePlaceholders(currentSlideXmlDoc, data, splittableKey);
                currentSlideXmlDoc.querySelectorAll('t').forEach(node => {
                    if (node.textContent?.includes(`{{${splittableKey}}}`)) {
                        node.textContent = node.textContent.replace(`{{${splittableKey}}}`, chunks[i]);
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
            // Simple slide
            if(splittableKey && chunks.length > 0) {
                 slideXmlDoc.querySelectorAll('t').forEach(node => {
                    if (node.textContent?.includes(`{{${splittableKey}}}`)) {
                        node.textContent = node.textContent.replace(`{{${splittableKey}}}`, chunks[0]);
                    }
                });
            }
            replaceSimplePlaceholders(slideXmlDoc, data, splittableKey);
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
