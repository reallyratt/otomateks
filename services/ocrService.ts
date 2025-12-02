
declare const Tesseract: any;

export const performOcr = async (files: File[]): Promise<string> => {
    let fullText = '';
    
    // Process files sequentially
    for (const file of files) {
        try {
            const result = await Tesseract.recognize(
                file,
                'ind', // 'ind' for Indonesian, you can add 'eng' like 'ind+eng' if needed
                {
                    // logger: (m: any) => console.log(m) // Optional: for debugging
                }
            );
            
            const { data: { text } } = result;
            fullText += text.trim() + '\n\n';
            
        } catch (error) {
            console.error("OCR Error on file:", file.name, error);
            throw new Error(`Failed to scan ${file.name}`);
        }
    }

    return fullText.trim();
};
