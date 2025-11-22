import React from 'react';

const Highlight: React.FC<{children: React.ReactNode}> = ({ children }) => <span className="font-semibold text-[var(--accent-color-300)]">{children}</span>;

export const TemplateCreationGuide: React.FC = () => {
    return (
        <div className="text-sm text-[var(--text-secondary)] space-y-4 max-h-[70vh] overflow-y-auto pr-4 hide-scrollbar">
            <p className="text-base">
                Welcome to the Otomateks templating system! You no longer need to use the Slide Master. Simply create a presentation like you normally would and use special placeholders for dynamic content.
            </p>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--accent-color-400)]">How It Works: Basic Placeholders</h3>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>Create a new presentation in PowerPoint or Google Slides.</li>
                    <li>Design your slides exactly how you want them to look: add backgrounds, logos, static text, etc.</li>
                    <li>
                        Wherever you need to insert dynamic content from the form, type a placeholder in a text box. The placeholder must be enclosed in double curly braces, like: <code className="bg-[var(--bg-tertiary)] px-1 py-0.5 rounded text-[var(--accent-color-300)]">{`{{placeholderName}}`}</code>.
                    </li>
                    <li>
                        The <code className="bg-[var(--bg-tertiary)] px-1 py-0.5 rounded text-[var(--accent-color-300)]">placeholderName</code> must match the ID of the field from the form. For example, to insert the title for "Bacaan I", you would type <code className="bg-[var(--bg-tertiary)] px-1 py-0.5 rounded text-[var(--accent-color-300)]">{`{{bacaan1Title}}`}</code>. For the text content, use <code className="bg-[var(--bg-tertiary)] px-1 py-0.5 rounded text-[var(--accent-color-300)]">{`{{bacaan1Text}}`}</code>.
                    </li>
                     <li>Save the presentation as a .pptx file. This is your template!</li>
                </ol>
            </div>

            <h3 className="text-lg font-semibold text-[var(--accent-color-400)] pt-2">Example Slide:</h3>
            <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-primary)] font-mono text-xs text-[var(--text-secondary)]">
                <p className="text-[var(--accent-color-400)]">{`{{laguPembukaTitle}}`}</p>
                <br />
                <p>{`{{laguPembukaText}}`}</p>
            </div>

             <div className="bg-[var(--accent-color-500)]/10 text-[var(--accent-color-300)] p-4 rounded-lg border border-[var(--accent-color-500)]/30 space-y-3 mt-6">
                <h3 className="text-lg font-semibold text-[var(--accent-color-400)]">Advanced Features</h3>
                
                <div className="space-y-2">
                    <h4 className="font-bold text-[var(--text-primary)]">1. Image Placeholders</h4>
                    <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                        <li>
                            To insert an image, create any shape (a text box, rectangle, etc.) and type an image placeholder inside it, e.g., <code className="bg-[var(--bg-tertiary)] px-1 py-0.5 rounded text-[var(--accent-color-300)]">{`{{laguPembukaImages}}`}</code>.
                        </li>
                        <li>
                            The app replaces the <Highlight>entire shape</Highlight> with your uploaded image, fitting it perfectly while maintaining the aspect ratio.
                        </li>
                         <li>
                            <Highlight>Multi-Image Magic:</Highlight> If you upload several images for one placeholder, the slide is automatically duplicated for each image.
                        </li>
                    </ul>
                </div>

                <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-[var(--text-primary)]">2. Automatic Text Splitting</h4>
                    <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                        <li>
                            Long texts (like readings) are <Highlight>automatically split</Highlight> across multiple slides. No manual work needed!
                        </li>
                        <li>
                            The system is smart enough to add liturgical endings (e.g., "Demikianlah Sabda Tuhan...") only to the very last slide of the sequence.
                        </li>
                    </ul>
                </div>
            </div>
            
             <p className="pt-2 text-xs text-slate-400 text-center">
                A full list of available placeholder keys can be found in the app's main form. Happy creating!
            </p>
        </div>
    );
};
