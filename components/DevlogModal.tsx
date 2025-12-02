
import React from 'react';
import { SlidersIcon } from './icons';

const UpdateItem: React.FC<{ version: string; title: string; items: string[] }> = ({ version, title, items }) => (
    <div className="border-l-4 border-brutal-border pl-4 ml-1">
        <h4 className="font-black text-sm uppercase bg-brutal-bg text-brutal-text inline-block px-1 border border-brutal-border mb-1">
            Update {version}
        </h4>
        <h5 className="font-bold text-sm mb-1">{title}</h5>
        <ul className="list-disc list-inside text-xs text-brutal-text/80 space-y-0.5">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
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
                        title="Text Field" 
                        items={[
                            "Basic text field with chunk system",
                            "Added Paragraphify",
                            "Otomateks generation system"
                        ]} 
                    />
                    <UpdateItem 
                        version="2" 
                        title="Structures" 
                        items={[
                            "Added clean structures configuration, setup, workspace, and generation",
                            "Added a top corner button that shows tutorial, setting, and devlog",
                            "Added tutorial page",
                            "Added setting page accent, theme",
                            "Added devlog page"
                        ]} 
                    />
                    <UpdateItem 
                        version="3" 
                        title="Tipe Misa part I" 
                        items={[
                            "Added 'Misa Mingguan' workspace",
                            "Added 'Misa Harian' workspace",
                            "Added 'Bahasa Misa' setting",
                            "Added automatic text for Bahasa Indonesia and Bahasa Jawa",
                            "Updated Otomateks generation system",
                            "Updated tutorial page"
                        ]} 
                    />
                    <UpdateItem 
                        version="4" 
                        title="Image Insertion" 
                        items={[
                            "Added image insertion on vary parts of text fields",
                            "Added remove button on uploaded files",
                            "Added Invert Image button on image files",
                            "Added preview image when the file name clicked",
                            "Added MultiCrop button on image files",
                            "Added Crop Area system",
                            "Added Multiple Slides system",
                            "Updated Otomateks generation system"
                        ]} 
                    />
                    <UpdateItem 
                        version="5" 
                        title="Fixed UI" 
                        items={[
                            "Updated UI from frostglass to Brutalist UI",
                            "Updated Setting page",
                            "Updated Tutorial page",
                            "Updated Devlog page (renamed to About)"
                        ]} 
                    />
                    <UpdateItem 
                        version="6" 
                        title="Tipe Misa part II" 
                        items={[
                            "Added 'Misa Memule' workspace",
                            "Added 'Misa Manten' workspace",
                            "Added text editor (bold, italic, underline)",
                            "Updated Otomateks generation system"
                        ]} 
                    />
                </div>
            </details>

            <div className="text-center pt-4 font-bold uppercase text-xs tracking-wider">
                Made with Love by <a href="https://www.instagram.com/reallyratt" target="_blank" rel="noopener noreferrer" className="bg-brutal-accent text-brutal-white px-1 hover:underline">@reallyratt</a>
            </div>
        </div>
    );
};
