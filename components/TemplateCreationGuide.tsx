import React from 'react';

const Highlight: React.FC<{children: React.ReactNode}> = ({ children }) => <span className="font-semibold bg-brutal-accent text-brutal-white px-1">{children}</span>;

export const TemplateCreationGuide: React.FC = () => {
    return (
        <div className="text-sm text-brutal-text space-y-4">
            <p className="text-base font-medium">
                Welcome to the Otomateks templating system! You no longer need to use the Slide Master. Simply create a presentation like you normally would and use special placeholders for dynamic content.
            </p>

            <div className="space-y-3">
                <h3 className="text-lg font-bold uppercase border-b-2 border-brutal-border inline-block">How It Works: Basic Placeholders</h3>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>Create a new presentation in PowerPoint or Google Slides.</li>
                    <li>Design your slides exactly how you want them to look: add backgrounds, logos, static text, etc.</li>
                    <li>
                        Wherever you need to insert dynamic content from the form, type a placeholder in a text box. The placeholder must be enclosed in double curly braces, like: <code className="bg-brutal-bg px-1 border border-brutal-border font-mono">{`{{A01}}`}</code>.
                    </li>
                    <li>
                        The placeholders use a simple ID system:
                        <ul className="list-disc list-inside pl-4 mt-1">
                            <li><code className="bg-brutal-bg px-1 border border-brutal-border font-mono">A...</code> keys are for Titles.</li>
                            <li><code className="bg-brutal-bg px-1 border border-brutal-border font-mono">B...</code> keys are for Text bodies.</li>
                            <li><code className="bg-brutal-bg px-1 border border-brutal-border font-mono">C...</code> keys are for Images.</li>
                        </ul>
                    </li>
                    <li>
                        For example, for the Opening Song, use <code className="bg-brutal-bg px-1 border border-brutal-border font-mono">{`{{A01}}`}</code> for the title and <code className="bg-brutal-bg px-1 border border-brutal-border font-mono">{`{{B01}}`}</code> for the lyrics.
                    </li>
                     <li>Save the presentation as a .pptx file. This is your template!</li>
                </ol>
            </div>

            <h3 className="text-lg font-bold uppercase border-b-2 border-brutal-border inline-block pt-2">Example Slide:</h3>
            <div className="bg-brutal-surface p-3 border-2 border-brutal-border font-mono text-xs text-brutal-text shadow-brutal-sm">
                <p className="font-bold bg-brutal-bg inline-block px-1 border border-brutal-border">{`{{A01}}`}</p>
                <br />
                <br />
                <p className="border border-dashed border-brutal-border p-1">{`{{B01}}`}</p>
            </div>

             <div className="bg-brutal-bg text-brutal-text p-4 border-2 border-brutal-border space-y-3 mt-6">
                <h3 className="text-lg font-bold uppercase">Advanced Features</h3>
                
                <div className="space-y-2">
                    <h4 className="font-bold border-b border-brutal-border inline-block">1. Image Placeholders</h4>
                    <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                        <li>
                            To insert an image, create any shape (a text box, rectangle, etc.) and type an image placeholder inside it, e.g., <code className="bg-brutal-surface px-1 border border-brutal-border font-mono">{`{{C01}}`}</code>.
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
                    <h4 className="font-bold border-b border-brutal-border inline-block">2. Automatic Text Splitting</h4>
                    <ul className="list-disc list-inside text-xs space-y-1 pl-2">
                        <li>
                            Long texts (like readings) are <Highlight>automatically split</Highlight> across multiple slides. No manual work needed!
                        </li>
                        <li>
                            The system is smart enough to add liturgical endings (e.g., "Demikianlah Sabda Tuhan...") only to the very last slide of the sequence based on the field ID.
                        </li>
                    </ul>
                </div>
            </div>
            
             <p className="pt-2 text-xs font-bold text-center">
                A full list of available placeholder keys can be found in the app's main form. Happy creating!
            </p>
        </div>
    );
};