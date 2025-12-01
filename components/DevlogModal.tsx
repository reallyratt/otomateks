
import React from 'react';
import { SlidersIcon } from './icons';

const UpdateItem: React.FC<{ version: string; title: string; desc: string }> = ({ version, title, desc }) => (
    <div className="border-l-4 border-brutal-border pl-4 ml-1">
        <h4 className="font-black text-sm uppercase bg-brutal-bg text-brutal-text inline-block px-1 border border-brutal-border mb-1">
            Update {version}
        </h4>
        <h5 className="font-bold text-sm mb-1">{title}</h5>
        <p className="text-xs text-brutal-text/80">{desc}</p>
    </div>
);

export const DevlogModal: React.FC = () => {
    return (
        <div className="text-sm text-brutal-text space-y-6">
            <div className="bg-brutal-surface p-6 border-4 border-brutal-border shadow-brutal text-justify leading-relaxed space-y-4">
                <p>
                    <span className="font-bold bg-brutal-accent text-brutal-white px-1">Otomateks</span> adalah otomatisasi teks misa yang dikembangkan untuk membantu anggota Divisi Teks Misa KOMSOS Pugeran. Semuanya berawal dari keresahan sederhana. Permintaan teks misa yang sering datang mendadak, jumlah anggota yang sedikit, dan keterbatasan perangkat pada jam-jam yang mendadak tersebut. Otomateks hadir sebagai solusi agar pekerjaan yang sebelumnya repetitif dan lama bisa diselesaikan dengan cepat dan efisien.
                </p>
                <p>
                    Otomateks bekerja dengan cara user mengolah teks panduan dan gambar, lalu memproses semuanya secara otomatis menjadi PPt teks misa yang siap digunakan (tetap melalui tahap quality control) secara otomatis. Sistem ini dirancang agar dapat diakses dari berbagai perangkat, termasuk smartphone, sehingga siap membantu kapan pun anggota bertugas.
                </p>
                <p>
                    Jika Otomateks berhasil mencapai tujuannya, pembuatan teks misa kurang dari 10 menit, produktivitas meningkat, dan hasil yang konsisten. Maka proyek ini telah menyelesaikan misi utamanya yaitu mendukung pelayanan dan mempermudah tugas.
                </p>
            </div>

            <details className="group bg-brutal-surface border-4 border-brutal-border">
                <summary className="font-black uppercase p-4 cursor-pointer hover:bg-brutal-bg transition-colors flex justify-between items-center list-none">
                    <div className="flex items-center gap-2">
                         <SlidersIcon className="w-5 h-5" />
                         <span>Dev Log History</span>
                    </div>
                    <span className="border-2 border-brutal-border p-1 group-open:bg-brutal-accent group-open:text-brutal-white transition-colors">
                        <svg className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                    </span>
                </summary>
                <div className="p-4 border-t-4 border-brutal-border bg-brutal-bg space-y-6">
                    <UpdateItem 
                        version="1" 
                        title="Basic Text Field Integration" 
                        desc="The foundation of Otomateks, enabling dynamic text replacement for titles and body text using the A/B placeholder system." 
                    />
                    <UpdateItem 
                        version="2" 
                        title="Weekly Mass (Mingguan) Expansion" 
                        desc="Comprehensive support for Sunday masses, adding specific fields for Second Readings, Creed, and more complex liturgical structures." 
                    />
                    <UpdateItem 
                        version="3" 
                        title="Paragraphify Tool" 
                        desc="A quality-of-life feature to automatically fix broken line breaks from PDF copy-pastes, creating clean paragraphs instantly." 
                    />
                    <UpdateItem 
                        version="4" 
                        title="Daily Mass (Harian) Support" 
                        desc="Tailored configurations for Daily Masses, streamlining the workflow by hiding unnecessary fields like the Second Reading." 
                    />
                    <UpdateItem 
                        version="5" 
                        title="Image Field Insertion" 
                        desc="Users can now upload images directly into placeholders (C codes), allowing for sheet music and other visual elements to be embedded seamlessly." 
                    />
                    <UpdateItem 
                        version="6" 
                        title="Multi Crop & Invert Image" 
                        desc="Advanced image editor tools allowing users to split single images across multiple slides and invert colors for better contrast in dark templates." 
                    />
                    <UpdateItem 
                        version="7" 
                        title="Misa Memule & Special Fields" 
                        desc="Added dedicated support for Commemoration Masses, including specific fields like 'Pengantar' and custom Thumbnail placeholders." 
                    />
                    <UpdateItem 
                        version="8" 
                        title="New Brutalist UI" 
                        desc="A complete visual overhaul embracing a high-contrast, raw aesthetic with bold borders and sharp shadows for better clarity and style." 
                    />
                </div>
            </details>

            <div className="text-center pt-4 font-bold uppercase text-xs tracking-wider">
                Made with Love by <a href="https://www.instagram.com/reallyratt" target="_blank" rel="noopener noreferrer" className="bg-brutal-accent text-brutal-white px-1 hover:underline">@reallyratt</a>
            </div>
        </div>
    );
};
