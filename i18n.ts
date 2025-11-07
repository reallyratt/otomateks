import { Language } from './types';

export const translations: { [key: string]: { [key: string]: string } } = {
  english: {
    // Header
    appSubtitle: 'Otomatisasi Teks Misa Komsos Pugeran',
    // Menu
    menuTutorial: 'Tutorial',
    menuSettings: 'Settings',
    menuDevlog: 'Devlog',
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
    devlogModalTitle: 'Developer Log',
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
    menuDevlog: 'Devlog',
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
    devlogModalTitle: 'Log Pengembang',
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
    english: {
        welcome: "Welcome to Otomateks! This page contains a guide to creating mass texts, an explanation of all available features, and warnings and recommendations for text creation. Please read carefully.",
        step1Title: "Step 1: Configuration",
        step1Desc: "In this section, you are asked to choose what text you want to work on.",
        step1LangTitle: "1. Language",
        step1LangDesc: "In accordance with HKTY Pugeran Church, settings are available for Indonesian and Javanese language masses. This setting will affect the default text fields (all text automatically available in Otomateks) and the congregation's responses.",
        step1TypeTitle: "2. Mass Type",
        step1TypeDesc: "There are many types of masses you can choose to create the mass text. You can choose according to the text you want to work on!",
        step2Title: "Step 2: Setup",
        step2Desc: "Here you must fill in the crucial parts that affect your file's condition.",
        step2FileNameTitle: "1. File Name",
        step2FileNameDesc: "You are asked to fill in the file name. Don't worry, because of the configuration you have previously selected, the title has been adjusted. You just need to fill in the name of the week from the text you are creating, and the date of the mass.",
        step2UploadTitle: "2. Upload Template",
        step2UploadDesc1: "Here you are asked to upload the PPT template that will be used by the system as the main template. Make sure not to choose the wrong template.",
        step2UploadDesc2: "You can access the template itself here:",
        step2UploadDesc3: "Specifically for the daily mass template, it has been adjusted to the most basic configuration. If you have additional fields like 'Opening Song' you can use the weekly template.",
        templateLinkText: "Download Template",
        step3Title: "Step 3: Start Working",
        step3Desc1: "You can fill in the existing fields according to their respective sections. Here you can fill in fields as text, as well as images. Unfortunately, for now the feature to add images cannot be used yet.",
        step3Desc2: "There are also several features you can access, such as automatically turning text into a paragraph by activating the {{icon}} icon. Also Image-to-text, and invert image which are currently under development.",
        step4Title: "Step 4: Done!",
        step4Desc: "Here you just click the Generate & Download button, and the mass text you created will be automatically generated! You can directly send the text to the 'Output Files' Mass Text Division Group.",
        step4Warning: "Remember, if you want to upload directly to KOMSOSNAS, you must open the PPT file on Windows / Mac and click Repair so that the text can be accessed normally.",
    },
    indonesia: {
        welcome: "Selamat datang di Otomateks! laman ini berisi panduan membuat teks misa, penjelasan semua fitur yang ada, dan peringatan serta himbauan dalam pembuatan teks. Tolong dibaca dengan seksama, yaa.",
        
        step1Title: "Step 1: Konfigurasi",
        step1Desc: "Pada bagian ini, kamu diminta buat memilih teks apa yang mau kamu kerjakan.",
        step1LangTitle: "1. Bahasa",
        step1LangDesc: "Sesuai dengan Gereja HKTY Pugeran, tersedia pengaturan untuk misa Bahasa indonesia dan Bahasa Jawa. pengaturan ini akan memengaruhi default text field (semua teks yang otomatis tersedia dalam Otomateks) dan jawaban umat.",
        step1TypeTitle: "2. Tipe Misa",
        step1TypeDesc: "Ada banyak tipe misa yang bisa kamu pilih untuk membuat teks misa. Bisa kamu pilih sesuai dengan teks yang mau kamu kerjakan!",

        step2Title: "Step 2: Setup",
        step2Desc: "Disini kamu harus mengisi bagian krusial yang berpengaruh dengan kondisi file kamu.",
        step2FileNameTitle: "1. Nama File",
        step2FileNameDesc: "Kamu diminta untuk mengisikan nama file. Tenang saja, karena konfigurasi yang sudah kamu pilih sebelumnya, judul sudah disesuaikan. Kamu tinggal mengisi nama minggu dari teks yang kamu buat, dan tanggal misa.",
        step2UploadTitle: "2. Unggah Template",
        step2UploadDesc1: "Disini kamu diminta untuk mengunggah template PPT yang nantinya akan digunakan sistem sebagai template utama. Jangan sampai salah memilih template, yaa.",
        step2UploadDesc2: "Untuk templatenya sendiri bisa kamu akses disini:",
        step2UploadDesc3: "Khusus untuk template misa harian, sudah disesuaikan dengan konfigurasi paling dasar. Jika kamu ada tambahan field seperti \"Lagu Pembuka\" kamu bisa menggunakan template mingguan.",
        templateLinkText: "Unduh Template",

        step3Title: "Step 3: Mulai Mengerjakan",
        step3Desc1: "Kamu bisa mengisikan filed-field yang ada sesuai dengan bagiannya masing-masing. Disini kamu bisa mengisikan filed sebagai teks, juga gambar. Sayangnya, untuk saat ini fitur menambahkan gambar masih belum bisa digunakan.",
        step3Desc2: "Ada pun beberapa fitur yang bisa kamu akses, seperti secara otomatis menjadikan teks menjadi paragraf dengan mengaktifkan icon {{icon}}. juga Image-to-text, dan invert image yang untuk saat ini masih dalam tahap pengembangan",

        step4Title: "Step 4: Selesai!",
        step4Desc: "Disini kamu tinggal klik tombol Generate & Download, dan secara otomatis teks misa yang kamu buat sudah jadi!. Kamu bisa langsung mengirimkan teks tersebut ke Grup Divisi Teks Misa \"Output Files\".",
        step4Warning: "Ingat, jika kamu mau langsung unggah ke KOMSOSNAS, kamu wajib membuak file PPT di Windows / Mac dan klik Repair supaya teksnya dapat diakses dengan normal.",
    }
};
