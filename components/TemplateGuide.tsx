
import React from 'react';

export const TemplateGuide: React.FC = () => {
    return (
        <div className="text-sm text-slate-300 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <p className="text-base">
                The new templating system is much simpler! You no longer need to use the Slide Master. Just create a presentation like you normally would and use placeholders for dynamic content.
            </p>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-sky-400">How It Works:</h3>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>Create a new presentation in PowerPoint or Google Slides.</li>
                    <li>Design your slides exactly how you want them to look: add backgrounds, logos, static text, etc.</li>
                    <li>
                        {/* FIX: Corrected JSX syntax for displaying placeholder text. */}
                        Wherever you need to insert text from the form, simply type a placeholder in a text box. The placeholder must be enclosed in double curly braces, like: <code className="bg-slate-700 px-1 py-0.5 rounded text-sky-300">{`{{placeholderName}}`}</code>.
                    </li>
                    <li>
                        {/* FIX: Corrected JSX syntax for displaying placeholder text. */}
                        The <code className="bg-slate-700 px-1 py-0.5 rounded text-sky-300">placeholderName</code> must match the ID of the field from the form. For example, to insert the text for "Bacaan I", you would type <code className="bg-slate-700 px-1 py-0.5 rounded text-sky-300">{`{{bacaan1Text}}`}</code> into a text box in your template.
                    </li>
                     <li>Save the presentation as a .pptx file. This is your template!</li>
                </ol>
            </div>

            <h3 className="text-lg font-semibold text-sky-400 pt-2">Example:</h3>
            <p>
                If you have a slide for the opening song, your text box in the template might look like this:
            </p>
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 font-mono text-xs text-slate-300">
                {/* FIX: Corrected JSX syntax for displaying placeholder text. */}
                <p className="text-cyan-400">{`{{laguPembukaTitle}}`}</p>
                <br />
                {/* FIX: Corrected JSX syntax for displaying placeholder text. */}
                <p>{`{{laguPembukaText}}`}</p>
            </div>

             <div className="bg-yellow-900/50 text-yellow-300 p-4 rounded-lg border border-yellow-700 space-y-2">
                <h4 className="font-bold">Current Limitations</h4>
                <ul className="list-disc list-inside text-xs space-y-1">
                    <li>
                        <strong>Image Placeholders:</strong> The system does not currently support replacing images. For slides with images (like songs), it's recommended to handle them manually for now.
                    </li>
                    <li>
                        <strong>Automatic Text Splitting:</strong> The engine does not automatically split very long text passages across multiple slides. If you have a long reading, please split it manually across two or more slides in your template.
                    </li>
                </ul>
            </div>
            
             <p className="pt-2 text-xs text-slate-400">
                A full list of available placeholder keys can be found next to the input labels in the main form.
            </p>
        </div>
    );
};
