declare const JSZip: any;

const parser = new DOMParser();
const serializer = new XMLSerializer();

// Define XML Namespaces
const NS_CONTENT_TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';
const NS_RELATIONSHIPS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const NS_PRESENTATIONML = 'http://purl.oclc.org/ooxml/presentationml/main';
const NS_RELATIONSHIPS_OFFICE_DOC = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';


const columnToIndex = (col: string | null | undefined): number => {
    if (!col) return -1;
    let index = 0;
    const upperCol = col.toUpperCase().trim();
    if (!/^[A-Z]+$/.test(upperCol)) return -1;

    for (let i = 0; i < upperCol.length; i++) {
        index *= 26;
        index += (upperCol.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return index - 1;
};

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


export const processDataEntryTemplate = async (
    templateFile: File,
    excelData: any[][],
    mappings: { [key: string]: string },
    syncedColumn: string | null,
    linesPerSlide: number,
    presentationTitle: string
) => {
    // 1. Process Data
    let processedData = [...excelData];
    if (syncedColumn) {
        const syncColumnIndex = columnToIndex(syncedColumn);
        if (syncColumnIndex !== -1) {
            let lastValue = '';
            processedData = processedData.map(row => {
                const newRow = [...row];
                if (newRow.length <= syncColumnIndex) return newRow;
                const cellValue = newRow[syncColumnIndex];
                if (cellValue === null || cellValue === undefined || String(cellValue).trim() === '') {
                    newRow[syncColumnIndex] = lastValue;
                } else {
                    lastValue = String(cellValue);
                }
                return newRow;
            });
        }
    }

    // 2. Group Data
    const groupedData: any[][][] = [];
    for (let i = 0; i < processedData.length; i += linesPerSlide) {
        groupedData.push(processedData.slice(i, i + linesPerSlide));
    }
    
    const zip = await JSZip.loadAsync(templateFile);

    // 3. Load Core PPTX files
    const presXmlStr = await zip.file('ppt/presentation.xml').async('string');
    const presXmlDoc = parser.parseFromString(presXmlStr, 'application/xml');
    const presRelsXmlStr = await zip.file('ppt/_rels/presentation.xml.rels').async('string');
    const presRelsXmlDoc = parser.parseFromString(presRelsXmlStr, 'application/xml');
    const contentTypesXmlStr = await zip.file('[Content_Types].xml').async('string');
    const contentTypesXmlDoc = parser.parseFromString(contentTypesXmlStr, 'application/xml');
    
    const slideIdList = presXmlDoc.querySelector('sldIdLst');
    if (!slideIdList) throw new Error('<p:sldIdLst> not found.');

    // 4. Get Template Slide (assuming the first slide is the template)
    const firstSldId = slideIdList.querySelector('sldId');
    if (!firstSldId) throw new Error('No slides found in the template.');
    const rId = firstSldId.getAttributeNS(NS_RELATIONSHIPS_OFFICE_DOC, 'id');
    const rel = presRelsXmlDoc.querySelector(`Relationship[Id="${rId}"]`);
    if (!rel) throw new Error('Relationship for the first slide not found.');
    
    const templateSlidePath = `ppt/${rel.getAttribute('Target')}`;
    const templateSlideXmlStr = await zip.file(templateSlidePath).async('string');
    const templateSlideRelsPath = templateSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
    const templateSlideRelsStr = await zip.file(templateSlideRelsPath)?.async('string');

    // Clear existing slides from the list
    while (slideIdList.firstChild) {
        slideIdList.removeChild(slideIdList.firstChild);
    }
    
    let nextAvailableSlideNum = getNextSlideNum(zip);
    let nextAvailableSlideId = getNextXmlSlideId(presXmlDoc);

    // 5. Loop and Generate new slides
    for (const group of groupedData) {
        const newSlideNum = nextAvailableSlideNum++;
        const newSlideId = nextAvailableSlideId++;
        const newPresRelId = `rId${getNextRid(presRelsXmlDoc)}`;

        const newSlideXmlDoc = parser.parseFromString(templateSlideXmlStr, 'application/xml');
        const textNodes = newSlideXmlDoc.querySelectorAll('t');
        
        textNodes.forEach(node => {
            if (!node.textContent) return;
            node.textContent = node.textContent.replace(/{{([a-zA-Z0-9_]+)}}/g, (match, placeholder) => {
                const columnLetter = mappings[placeholder];
                if (!columnLetter) return match; // Keep placeholder if not mapped

                const columnIndex = columnToIndex(columnLetter);
                if (columnIndex === -1) return match; // Keep placeholder if column letter is invalid

                const values = group
                    .map(row => (row && row.length > columnIndex) ? row[columnIndex] : null)
                    .filter(val => val !== null && val !== undefined)
                    .map(String);
                
                return values.join('\n');
            });
        });
        
        // Add new slide files and relationships
        const newSlidePath = `ppt/slides/slide${newSlideNum}.xml`;
        zip.file(newSlidePath, serializer.serializeToString(newSlideXmlDoc));
        if (templateSlideRelsStr) {
            const newSlideRelsPath = newSlidePath.replace('slides/', 'slides/_rels/') + '.rels';
            zip.file(newSlideRelsPath, templateSlideRelsStr);
        }

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
        slideIdList.appendChild(newSldIdNode);
    }
    
    // 6 & 7. Sanitize and Re-number (optional but good practice)
    // The current loop already creates sequentially numbered slides.
    // We just need to remove the original template files if they are not overwritten.
    const allFiles = Object.keys(zip.files);
    const generatedSlideFiles = new Set();
    for(let i=1; i < nextAvailableSlideNum; i++) {
        generatedSlideFiles.add(`ppt/slides/slide${i}.xml`);
    }
    allFiles.forEach(fileName => {
        if (fileName.startsWith('ppt/slides/slide') && !generatedSlideFiles.has(fileName)) {
            zip.remove(fileName);
            zip.remove(fileName.replace('slides/', 'slides/_rels/') + '.rels');
        }
    });

    // Write back modified core XML files
    zip.file('ppt/presentation.xml', serializer.serializeToString(presXmlDoc));
    zip.file('ppt/_rels/presentation.xml.rels', serializer.serializeToString(presRelsXmlDoc));
    zip.file('[Content_Types].xml', serializer.serializeToString(contentTypesXmlDoc));
    
    // 8. Generate and Download
    const newPptxBlob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(newPptxBlob);
    link.download = `${presentationTitle || 'Presentation'}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};