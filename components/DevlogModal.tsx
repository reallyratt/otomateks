import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3">
        <h3 className="text-xl font-semibold text-[var(--accent-color-400)] border-b border-[var(--border-primary)] pb-2 mb-3">
            {title}
        </h3>
        <div className="text-[var(--text-secondary)] space-y-4 text-sm leading-relaxed">
            {children}
        </div>
    </div>
);

const Code: React.FC<{children: React.ReactNode}> = ({ children }) => <code className="bg-[var(--bg-tertiary)] px-1.5 py-1 rounded text-[var(--accent-color-300)] font-mono text-xs">{children}</code>;
const Highlight: React.FC<{children: React.ReactNode}> = ({ children }) => <span className="text-[var(--text-primary)] font-semibold">{children}</span>;


export const DevlogModal: React.FC = () => {
    return (
        <div className="text-sm text-[var(--text-secondary)] space-y-8 max-h-[70vh] overflow-y-auto pr-4 hide-scrollbar">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color-400)] to-[var(--accent-color-300)]">
                    Otomateks: The Journey
                </h2>
                <p className="mt-2">A look behind the scenes of the Mass Text Automation tool.</p>
            </div>

            <Section title="Project Genesis & Core Tech">
                <p>
                    <Highlight>Otomateks</Highlight> was born from a simple need: to streamline the creation of weekly Mass presentation slides for Komsos Pugeran. The process was manual, repetitive, and prone to errors. The goal was to build a web app where a user could input all the necessary texts and images, upload a standard PowerPoint template, and receive a perfectly formatted, ready-to-use presentation in seconds.
                </p>
                <p>
                    The entire application is built on modern web technologies:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2">
                    <li><Highlight>React & TypeScript:</Highlight> For a robust, type-safe, and component-based user interface.</li>
                    <li><Highlight>Tailwind CSS:</Highlight> For rapid, utility-first styling, enabling the creation of a clean and customizable design system.</li>
                    <li><Highlight>JSZip:</Highlight> This is the secret sauce. A <Code>.pptx</Code> file is essentially a zip archive containing a collection of XML and media files. JSZip allows us to unzip the uploaded template in the browser, directly manipulate the XML content of the slides, and then re-zip it into a new <Code>.pptx</Code> file for download. No server-side processing needed!</li>
                </ul>
            </Section>
            
            <Section title="Key Feature Milestones">
                <div>
                    <h4 className="font-bold text-base text-[var(--text-primary)] mb-2">V1: The Templating Engine</h4>
                    <p>The core challenge was replacing placeholder text within the PowerPoint template. The system was designed to find any text enclosed in double curly braces, like <Code>{`{{bacaan1Text}}`}</Code>, and substitute it with the corresponding text from the web form. This formed the foundation of the entire automation process.</p>
                </div>
                 <div>
                    <h4 className="font-bold text-base text-[var(--text-primary)] mb-2">V2: Advanced Text Handling & Slide Duplication</h4>
                    <p>A major hurdle appeared with long texts, such as the readings or homilies, which wouldn't fit on a single slide. This led to the development of the "smart chunking" and "slide duplication" logic.</p>
                    <p>
                        When a text exceeds a certain character limit, the system automatically:
                    </p>
                     <ol className="list-decimal list-inside pl-4 space-y-2 mt-2">
                        <li>Splits the text into reasonably sized chunks, being careful to break only at spaces.</li>
                        <li>Adds required liturgical endings (e.g., "Demikianlah Sabda Tuhan...") to the final chunk.</li>
                        <li>Places the first chunk into the original slide from the template.</li>
                        <li>Dynamically <Highlight>clones</Highlight> that slide for each additional chunk of text.</li>
                        <li>Intelligently modifies the core <Code>presentation.xml</Code> and related files to insert these new slides seamlessly into the presentation order.</li>
                    </ol>
                     <p>This was the most complex part of the project, turning a simple text replacer into a powerful document generator.</p>
                </div>

                <div>
                    <h4 className="font-bold text-base text-[var(--text-primary)] mb-2">V3: UI/UX Revolution</h4>
                    <p>With the core logic in place, focus shifted to user experience. The single, long form was replaced with a guided, multi-step process. This is when the customization features were introduced:</p>
                     <ul className="list-disc list-inside pl-4 space-y-2">
                        <li><Highlight>Internationalization (i18n):</Highlight> The entire app's text was moved into a centralized translation file, allowing for an easy switch between English and Indonesian.</li>
                        <li><Highlight>Dynamic Theming:</Highlight> Using CSS Custom Properties (variables), I built a system for Light/Dark modes and user-selectable Accent Colors. This provides a personalized feel without sacrificing performance.</li>
                         <li><Highlight>Frosted Glass UI:</Highlight> A complete visual overhaul introduced the semi-transparent, blurred background effect for a modern and cohesive aesthetic.</li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-bold text-base text-[var(--text-primary)] mb-2">V4: Quality of Life & Media</h4>
                    <p>The final touches involved adding more user-friendly features. An image upload option was added for sections like songs, along with a custom drag-and-drop file component. Comprehensive guides and this very Devlog were created to make the app as easy to use as possible.</p>
                </div>
            </Section>

            <Section title="What's Next?">
                <p>The journey isn't over! Future plans include:</p>
                 <ul className="list-disc list-inside pl-4 space-y-2">
                    <li>Activating the other Mass Types (Manten, Paskah, Natal) with their unique templates and logic.</li>
                    <li>Implementing true image replacement within templates.</li>
                    <li>Continuously refining the UI and improving performance.</li>
                </ul>
            </Section>

             <div className="text-center pt-4 border-t border-[var(--border-primary)]">
                <p>Thank you for using Otomateks and for your interest in its development!</p>
                  <p className="mt-4 text-xs">
                    - <a href="https://www.instagram.com/reallyratt" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color-400)] font-bold hover:underline">@reallyratt</a>
                </p>
            </div>

        </div>
    );
};