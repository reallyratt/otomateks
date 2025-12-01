
import React, { useState, useCallback, useEffect } from 'react';
import { PresentationIcon, ExcelIcon, LoaderIcon, DownloadIcon, AlertTriangleIcon, CogIcon } from './icons';
import { FileUpload } from './FileUpload';
import { processDataEntryTemplate } from '../services/dataEntryGenerator';

declare const JSZip: any;
declare const XLSX: any;

interface DataEntryWorkflowProps {
    presentationTitle: string;
}

const getPlaceholdersFromPptx = async (file: File): Promise<string[]> => {
    const zip = await JSZip.loadAsync(file);
    const placeholders = new Set<string>();
    const slidePromises: Promise<string>[] = [];

    zip.folder('ppt/slides').forEach((relativePath: string, fileEntry: any) => {
        if (relativePath.endsWith('.xml')) {
            slidePromises.push(fileEntry.async('string'));
        }
    });

    const slideXmls = await Promise.all(slidePromises);

    for (const slideXml of slideXmls) {
        const matches = slideXml.match(/{{([a-zA-Z0-9_]+)}}/g);
        if (matches) {
            matches.forEach(match => {
                placeholders.add(match.replace(/[{}]/g, ''));
            });
        }
    }
    
    return Array.from(placeholders);
};

const getExcelData = async (file: File): Promise<{ headers: string[], data: any[][] }> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length === 0) {
        return { headers: [], data: [] };
    }
    
    const headers = (jsonData[0] as string[]).map(h => h || '');
    const data = jsonData.slice(1) as any[][];

    return { headers, data };
};


export const DataEntryWorkflow: React.FC<DataEntryWorkflowProps> = ({ presentationTitle }) => {
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    
    const [excelData, setExcelData] = useState<any[][] | null>(null);
    const [placeholders, setPlaceholders] = useState<string[] | null>(null);
    
    const [mappings, setMappings] = useState<{ [key: string]: string }>({});
    const [groupingColumn, setGroupingColumn] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');

    const handleMappingChange = (placeholder: string, column: string) => {
        const cleanedValue = column.toUpperCase().replace(/[^A-Z]/g, '');
        setMappings(prev => ({...prev, [placeholder]: cleanedValue}));
    };

    const handleGroupingColumnChange = (column: string) => {
        const cleanedValue = column.toUpperCase().replace(/[^A-Z]/g, '');
        setGroupingColumn(cleanedValue);
    };

    const parseFiles = useCallback(async () => {
        if (!templateFile || !excelFile) return;

        setIsParsing(true);
        setError(null);
        try {
            const [foundPlaceholders, excelInfo] = await Promise.all([
                getPlaceholdersFromPptx(templateFile),
                getExcelData(excelFile)
            ]);
            setPlaceholders(foundPlaceholders);
            setExcelData(excelInfo.data);
            setMappings({}); // Reset mappings

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to parse files.';
            setError(`Error parsing files: ${errorMessage}`);
            setPlaceholders(null);
            setExcelData(null);
        } finally {
            setIsParsing(false);
        }
    }, [templateFile, excelFile]);

    useEffect(() => {
        parseFiles();
    }, [parseFiles]);

    const handleGenerate = async () => {
        if (!templateFile || !excelData || !presentationTitle) {
            setError("Missing template, Excel data, or presentation title.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setStatusMessage("Processing data and generating slides...");

        try {
            await processDataEntryTemplate(
                templateFile,
                excelData,
                mappings,
                groupingColumn || null,
                1, // Default to 1 row per slide if no grouping
                presentationTitle
            );
            setStatusMessage("Presentation generated and downloaded successfully!");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Generation failed: ${errorMessage}`);
            setStatusMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    const showConfig = !isParsing && placeholders && excelData;
    const isGenerateDisabled = !showConfig || isLoading || !presentationTitle;

    return (
        <div className="space-y-6">
            <div className="bg-[#FFFFFF] p-6 border-4 border-[#000000] shadow-brutal-lg space-y-4">
                <h2 className="text-2xl font-black uppercase text-[#000000] flex items-center gap-3">
                    <span className="bg-[#0033FF] text-[#FFFFFF] p-2 border-2 border-[#000000]"><PresentationIcon className="w-5 h-5"/></span>
                    Upload Files
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileUpload
                        id="data-template-upload"
                        onFileSelect={(file) => setTemplateFile(Array.isArray(file) ? file[0] : file)}
                        accept=".pptx"
                        label={templateFile ? `Template: ${templateFile.name}` : 'Upload PPTX Template'}
                    />
                    <FileUpload
                        id="data-excel-upload"
                        onFileSelect={(file) => setExcelFile(Array.isArray(file) ? file[0] : file)}
                        accept=".xlsx"
                        label={excelFile ? `Data: ${excelFile.name}` : 'Upload XLSX Data'}
                    />
                </div>
            </div>

            {isParsing && <div className="flex justify-center items-center gap-2 text-[#000000] font-bold bg-[#F5EAD7] p-2 border border-[#000000] w-fit mx-auto"><LoaderIcon className="w-4 h-4"/> Parsing files...</div>}

            {showConfig && (
                <div className="bg-[#FFFFFF] p-6 border-4 border-[#000000] shadow-brutal-lg space-y-6 animate-[fadeIn_0.5s_ease-in-out]">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-[#000000] flex items-center gap-3 mb-4">
                             <span className="bg-[#0033FF] text-[#FFFFFF] p-2 border-2 border-[#000000]"><CogIcon className="w-5 h-5"/></span>
                            Configuration
                        </h2>

                        <div className="space-y-4 bg-[#F5EAD7] p-4 border-2 border-[#000000]">
                            <h3 className="font-bold text-[#000000] uppercase">Map Placeholders to Columns</h3>
                             <div className="space-y-3">
                                {placeholders.length > 0 ? placeholders.map(p => (
                                    <div key={p} className="grid grid-cols-3 items-center gap-4">
                                        <label htmlFor={`map-${p}`} className="text-sm font-bold text-right text-[#000000] bg-[#FFFFFF] px-1 border border-[#000000]">{`{{${p}}}`}</label>
                                        <span className="text-center text-[#000000] font-bold">→</span>
                                        <input
                                            type="text"
                                            id={`map-${p}`}
                                            value={mappings[p] || ''}
                                            onChange={(e) => handleMappingChange(p, e.target.value)}
                                            className="w-full bg-[#FFFFFF] border-2 border-[#000000] px-3 py-2 text-[#000000] text-sm focus:bg-yellow-50 focus:outline-none font-mono"
                                            placeholder="e.g., A"
                                            maxLength={2}
                                        />
                                    </div>
                                )) : <p className="text-sm text-[#000000] text-center">No placeholders like {'`{{example}}`'} found in the template.</p>}
                            </div>
                        </div>

                        <div className="space-y-4 bg-[#F5EAD7] p-4 border-2 border-[#000000] mt-4">
                            <h3 className="font-bold text-[#000000] uppercase">Grouping Options</h3>
                            <div>
                                <label htmlFor="grouping-column" className="block text-sm font-bold text-[#000000] mb-1">Grouping Column</label>
                                    <input
                                    type="text"
                                    id="grouping-column"
                                    value={groupingColumn}
                                    onChange={(e) => handleGroupingColumnChange(e.target.value)}
                                    className="w-full bg-[#FFFFFF] border-2 border-[#000000] px-3 py-2 text-[#000000] text-sm focus:bg-yellow-50 focus:outline-none font-mono"
                                    placeholder="e.g., B (optional)"
                                    maxLength={2}
                                />
                                <p className="text-xs text-[#000000] mt-1 font-mono">Starts a new slide for each non-empty cell. Subsequent empty rows are grouped onto the same slide. If left empty, each row becomes a separate slide.</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <button 
                            onClick={handleGenerate} 
                            disabled={isGenerateDisabled}
                            className={`w-full max-w-xs mx-auto py-3 px-6 text-lg font-black uppercase transition-all duration-300 ease-in-out flex items-center justify-center gap-2 border-4 border-[#000000] shadow-brutal
                                ${isGenerateDisabled 
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                                    : 'bg-[#0033FF] text-[#FFFFFF] hover:-translate-y-1 hover:shadow-brutal-lg'}`
                            }>
                            {isLoading ? <><LoaderIcon className="w-4 h-4"/> Generating...</> : <><DownloadIcon className="w-4 h-4"/> Generate & Download</>}
                        </button>
                    </div>
                </div>
            )}
            
            <div className="h-10 text-center mt-6 font-mono font-bold">
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-[#000000]">
                        <LoaderIcon className="w-4 h-4"/>
                        <p>{statusMessage}</p>
                    </div>
                )}
                {!isLoading && statusMessage && !error && (
                    <p className="text-[#000000] bg-[#0033FF]/20 px-2 border border-[#0033FF] inline-block">{statusMessage}</p>
                )}
                {error && (
                    <div className="flex items-center justify-center gap-2 text-red-600 bg-red-100 border-2 border-red-600 p-2 inline-block">
                        <AlertTriangleIcon className="w-4 h-4"/>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
