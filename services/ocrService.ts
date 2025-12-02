
export const performOcr = async (file: File, apiKey: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Content = (reader.result as string).split(',')[1];
            
            const payload = {
                requests: [
                    {
                        image: { content: base64Content },
                        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
                    }
                ]
            };

            try {
                const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                
                if (data.error) {
                    reject(new Error(data.error.message || 'Vision API Error'));
                    return;
                }

                if (data.responses && data.responses[0] && data.responses[0].fullTextAnnotation) {
                    resolve(data.responses[0].fullTextAnnotation.text);
                } else if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
                    resolve(data.responses[0].textAnnotations[0].description);
                } else {
                    resolve(''); // No text found
                }

            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
    });
};
