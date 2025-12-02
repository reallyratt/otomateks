
import { Language } from './types';

export const translations: { [key: string]: { [key: string]: string } } = {
  english: {
    // Header
    appSubtitle: 'Otomatisasi Teks Misa Komsos Pugeran',
    // Menu
    menuTutorial: 'Tutorial',
    menuSettings: 'Settings',
    menuDevlog: 'About',
    // Main Page
    mainTitleLabel: 'Teks Misa Title',
    mainTitlePlaceholder: '[Year C] Weekly - English - Ordinary Sunday I (27 04 2007)',
    workspaceTitle: 'Workspace',
    nextButton: 'Next',
    backButton: 'Back',
    // Step 2
    uploadTemplateTitle: 'Upload Template',
    uploadTemplateLabel: 'Click to upload template',
    uploadTemplateSelected: 'Selected: {fileName}',
    // Step 3
    finalMessage: "Thank you for your work on this week’s Teks Misa! :D",
    generateButton: 'Generate & Download',
    generatingButton: 'Generating...',
    // Modals
    tutorialModalTitle: 'Tutorial',
    settingsModalTitle: 'Settings',
    devlogModalTitle: 'About Otomateks',
    templateCreationGuideTitle: "How to Create a PPTX Template",
    // Setup Page (Step 1)
    bahasa: 'Language',
    tipeMisa: 'Mass Type',
    mingguBiasa: 'Ordinary Mass',
    misaKhusus: 'Special Mass',
    hariRaya: 'Feast Day',
    lainnya: 'Other',
    dataEntry: 'Data Entry (from Excel)',
    // File Setup (Step 2)
    namaFile: 'File Name',
    ruangKerja: 'Workspace',
    // Settings Modal
    settingsLanguageLabel: 'App Language',
    settingsThemeLabel: 'Theme',
    settingsThemeLight: 'Light',
    settingsThemeDark: 'Dark',
    settingsAccentLabel: 'Accent Color',
  },
  indonesia: {
    // Header
    appSubtitle: 'Otomatisasi Teks Misa Komsos Pugeran',
    // Menu
    menuTutorial: 'Tutorial',
    menuSettings: 'Pengaturan',
    menuDevlog: 'Tentang',
    // Main Page
    mainTitleLabel: 'Judul Teks Misa',
    mainTitlePlaceholder: '[Tahun C] Mingguan - Bahasa Indonesia - Minggu Biasa I (27 04 2007)',
    workspaceTitle: 'Ruang Kerja',
    nextButton: 'Lanjut',
    backButton: 'Kembali',
    // Step 2
    uploadTemplateTitle: 'Unggah Template',
    uploadTemplateLabel: 'Klik untuk mengunggah template',
    uploadTemplateSelected: 'Terpilih: {fileName}',
    // Step 3
    finalMessage: 'Terima kasih yaa sudah bikin teks minggu ini :D',
    generateButton: 'Generate & Download',
    generatingButton: 'Membuat...',
    // Modals
    tutorialModalTitle: 'Tutorial',
    settingsModalTitle: 'Pengaturan',
    devlogModalTitle: 'Tentang Otomateks',
    templateCreationGuideTitle: "Cara Membuat Template PPTX",
    // Setup Page (Step 1)
    bahasa: 'Bahasa',
    tipeMisa: 'Tipe Misa',
    mingguBiasa: 'Minggu Biasa',
    misaKhusus: 'Misa Khusus',
    hariRaya: 'Hari Raya',
    lainnya: 'Lainnya',
    dataEntry: 'Data Entry (dari Excel)',
    // File Setup (Step 2)
    namaFile: 'Nama File',
    ruangKerja: 'Ruang Kerja',
    // Settings Modal
    settingsLanguageLabel: 'Bahasa Aplikasi',
    settingsThemeLabel: 'Tema',
    settingsThemeLight: 'Terang',
    settingsThemeDark: 'Gelap',
    settingsAccentLabel: 'Warna Aksen',
  }
};

export const tutorialContent = {
    indonesia: {
        welcome: "Selamat datang di Otomateks! Kamu akan dipandu untuk membuat teks misa dengan tools ini. Nanti selain panduan cara membuat teks misa, akan ada juga penjelasan fitur-fitur yang ada, juga himbauan-himbauan dalam pembuatan teks. Tolong dibaca dengan seksama, yaa! :p",
        
        step1Title: "Step 1: Konfigurasi",
        
        step1SubATitle: "Bahasa",
        step1SubADesc: "Sesuai dengan Gereja HKTY Pugeran, tersedia pengaturan untuk misa Bahasa Indonesia dan Bahasa Jawa. Pengaturan ini akan memengaruhi default text field. Default text field adalah kata-kata yang muncul secara otomatis di teks misa nanti, seperti jawaban umat “Terpujilah Kristus”.",
        
        step1SubBTitle: "Tipe Misa",
        step1SubBDesc: "Bagian ini gak kalah penting, karena tipe misa akan menjadi cikal bakal text field yang nantinya bisa kamu isi sesuai dengan kebutuhan. Contoh: Jika tipe misa harian, tidak ada text field Bacaan Kedua, sedangkan text field tersebut ada di tipe misa mingguan.",

        step2Title: "Step 2: Setup",
        step2Intro: "Bagian ini adalah bagian yang sangat krusial, karena bagian ini berisi hal mendasar yang bisa mengacaukan seluruh proses jika salah pencet.",

        step2SubATitle: "Nama File",
        step2SubADesc: "Kamu diminta untuk mengisikan nama file. Sebelumnya nama file sudah otomatis terisi sesuai dengan konfigurasi yang sudah kamu lakukan tadi, jadi kamu hanya perlu menyesuaikan sedikit, seperti nama minggu dan tanggal.",

        step2SubBTitle: "Unggah Template",
        step2SubBDesc: "Bagian ini adalah tempat kamu mengunggah template teks misa yang nantinya akan diproses secara otomatis menjadi teks misa. Jangan lupa untuk memasukkan template yang sesuai dengan tipe misa yang sudah kamu pilih sebelumnya. Kamu bisa klik tombol di bawah untuk mendapatkan template yang sesuai!",
        downloadTemplateBtn: "Unduh Template",

        step3Title: "Step 3: Mulai Mengerjakan",
        step3Intro: "Kamu bisa mengisikan field-field yang ada sesuai dengan bagiannya masing-masing.",

        step3SubATitle: "Text Field",
        step3SubADesc: "Text Field adalah bagian paling dasar di Otomateks, dimana kamu bisa memasukkan keseluruhan teks dan nantinya secara otomatis akan diubah menjadi bagian-bagian kecil dan secara otomatis pula diletakkan ke template yang sudah kamu upload sebelumnya.",
        
        step3ParaTitle: "Paragraphify",
        step3ParaDesc: "Dalam Text Field ada pula fitur Paragraphify. Fitur ini digunakan untuk mengubah teks dengan banyak baris (biasanya dari file PDF) menjadi satu paragraf utuh. Hal ini bertujuan untuk membuat teks yang dimasukkan menjadi lebih optimal.",

        step3OcrTitle: "Image-to-Text",
        step3OcrDesc: "Selain paragraphify ada pula fitur lain. Salah satunya adalah Image-to-Text. Fitur ini berfungsi untuk mengubah gambar menjadi teks. Kamu dapat mengunggah gambar (bisa 2 atau lebih) dan mengubahnya menjadi teks. Sebelum memindahkannya ke text field, kamu bisa mengedit beberapa teks dan klik tombol “INSERT TEXT”",

        step3SubBTitle: "Image Field",
        step3SubBDesc: "Image Field berfungsi jika kamu ingin memasukkan gambar ke dalam teks misa. Image field ini hanya tersedia di beberapa bagian yang umumnya berupa gambar seperti lagu-lagu. Kamu bisa langsung mengunggah gambar, bisa satu gambar ataupun banyak gambar sekaligus. Adapun beberapa fitur yang bisa kamu akses setelah ada gambar yang terunggah.",

        step3MultiCropTitle: "Multi-Crop",
        step3MultiCropDesc: "Seperti yang terlihat, ada tombol pensil. Tombol ini berfungsi untuk memotong gambar, namun lebih kompleks. Ada tombol ADD BOX, tombol ini berfungsi untuk menambahkan area potong. Kamu bisa mengatur posisi serta ukurannya. Jika kamu ingin menambahkan 2 area potong dalam 1 slide, kamu bisa menambahkan lagi area potong dan menyesuaikannya. Angka paling kecil dalam area potong adalah yang berada paling atas, semakin besar semakin ke bawah (gambar disusun vertikal).",
        
        step3AddSlideDesc: "Selanjutnya ada tombol + di bawah kanan, tombol ini berfungsi untuk menambahkan gambar di slide baru. Jadi dengan gambar yang sama, kamu bisa membuatnya menjadi banyak slide. Contoh penggunaan fitur ini adalah pada teks lagu utuh. Misal bait 1 dimasukkan sebagai slide 1, dan bait 2 dimasukkan sebagai slide 2. Jangan lupa klik tombol Save untuk menyimpan semua perubahan yang kamu lakukan. Perubahan yang disimpan bersifat permanen pada gambar.",

        step3InvertTitle: "Invert Image",
        step3InvertDesc: "Fitur ini berfungsi untuk membalik warna gambar. Biasanya fitur ini digunakan untuk teks lagu yang memiliki latar belakang putih dan teks hitam. Hal ini dilakukan dengan tujuan untuk menyelaraskan gambar dengan template teks misa.",

        step4Title: "Step 4: Selesai!",
        step4Desc: "Di sini kamu tinggal klik tombol Generate & Download. Maka teks misa yang kamu buat sudah jadi! Kamu bisa langsung mengirimkan teks tersebut ke Grup Divisi Teks Misa “Output Files” atau dikirim ke Cay untuk nantinya di-upload ke NAS.",
        
        importantTitle: "Penting!",
        importantDesc: "Ingat, jika kamu mau langsung unggah ke KOMSOSNAS, kamu wajib membuka file PPT di Windows/mac dan klik Repair supaya teks misa dapat diakses dengan normal."
    },
    english: {
         welcome: "Welcome to Otomateks! This tool guides you through creating mass texts. Read on for a guide, feature explanations, and important tips. Please read carefully! :p",
        
        step1Title: "Step 1: Configuration",
        
        step1SubATitle: "Language",
        step1SubADesc: "Following HKTY Pugeran standards, settings are available for Indonesian and Javanese masses. This affects default text fields (words appearing automatically) like the congregation response \"Terpujilah Kristus\".",
        
        step1SubBTitle: "Mass Type",
        step1SubBDesc: "This part is crucial as the mass type determines the text fields available for you to fill. Example: Daily mass has no Second Reading field, while Weekly mass does.",

        step2Title: "Step 2: Setup",
        step2Intro: "This section contains fundamental settings that can mess up the process if set incorrectly.",

        step2SubATitle: "File Name",
        step2SubADesc: "You need to fill in the file name. It's auto-filled based on your config, so you just need to adjust slightly, like the Sunday name and date.",

        step2SubBTitle: "Upload Template",
        step2SubBDesc: "Upload the PPT template here. It will be processed automatically. Don't forget to use the template matching your selected mass type. Click below to get the correct template!",
        downloadTemplateBtn: "Download Template",

        step3Title: "Step 3: Start Working",
        step3Intro: "Fill in the fields according to their sections.",

        step3SubATitle: "Text Field",
        step3SubADesc: "The Text Field is the most basic part, where you input text. It will be automatically chunked and placed into your uploaded template.",
        
        step3ParaTitle: "Paragraphify",
        step3ParaDesc: "The Paragraphify feature converts multi-line text (usually from PDFs) into a single paragraph. This optimizes the text layout.",

        step3OcrTitle: "Image-to-Text",
        step3OcrDesc: "Another feature is Image-to-Text. It converts images into text. You can upload multiple images to extract text. Before inserting into the field, you can edit the text and click \"INSERT TEXT\".",

        step3SubBTitle: "Image Field",
        step3SubBDesc: "Use Image Field to insert images, typically for songs. You can upload one or multiple images. Several features are available once images are uploaded.",

        step3MultiCropTitle: "Multi-Crop",
        step3MultiCropDesc: "The pencil button opens the Multi-Crop editor. Use ADD BOX to define crop areas. You can position and resize them. To add 2 crops in 1 slide, add another box. The smallest number is top-most.",
        
        step3AddSlideDesc: "The + button adds a new slide for the same image, allowing you to split one image across multiple slides (e.g., Verse 1 on Slide 1, Verse 2 on Slide 2). Don't forget to click Save!",

        step3InvertTitle: "Invert Image",
        step3InvertDesc: "Inverts image colors. Useful for sheet music with white backgrounds and black text to match the dark mass template.",

        step4Title: "Step 4: Done!",
        step4Desc: "Click Generate & Download. Your mass text is ready! Send it to the Mass Text Division \"Output Files\" group or to Cay for NAS upload.",
        
        importantTitle: "Important!",
        importantDesc: "If uploading directly to KOMSOSNAS, you MUST open the PPT on Windows/Mac and click Repair to ensure it accesses normally."
    }
};
