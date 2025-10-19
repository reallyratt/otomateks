import { Language } from './types';

export const translations: { [key: string]: { [key: string]: string } } = {
  english: {
    // Header
    appSubtitle: 'Mass Text Automation for Komsos Pugeran',
    // Menu
    menuSetup: 'Mass Setup',
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
    setupModalTitle: 'Mass Setup',
    tutorialModalTitle: 'Tutorial',
    settingsModalTitle: 'Settings',
    devlogModalTitle: 'Developer Log',
    templateCreationGuideTitle: "How to Create a PPTX Template",
    // Setup Modal
    languageLabel: 'Mass Language',
    massTypeLabel: 'Mass Type',
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
    menuSetup: 'Pengaturan Misa',
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
    finalMessage: 'Terima kasih atas pekerjaan Anda pada Teks Misa minggu ini! :D',
    generateButton: 'Buat & Unduh',
    generatingButton: 'Membuat...',
    // Modals
    setupModalTitle: 'Pengaturan Misa',
    tutorialModalTitle: 'Tutorial',
    settingsModalTitle: 'Pengaturan',
    devlogModalTitle: 'Log Pengembang',
    templateCreationGuideTitle: "Cara Membuat Template PPTX",
     // Setup Modal
    languageLabel: 'Bahasa Misa',
    massTypeLabel: 'Tipe Misa',
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
        welcome: "Welcome to Otomateks! This guide will walk you through creating a presentation from start to finish.",
        step1Title: "Step 1: Project Setup",
        step1Desc: "Before you start adding content, set up the basic details for your presentation.",
        step1TitleLabel: "1. Teks Misa Title",
        step1TitleDesc: "This is the main title for your project and will be the filename of the downloaded presentation. Fill this in first.",
        step1SetupLabel: "2. Language and Mass Type",
        step1SetupDesc: "Click the menu icon in the top-right corner and select Mass Setup. This opens a dialog where you can choose the language and type of mass. This affects the automatic endings added to certain prayers.",
        step2Title: "Step 2: The Workspace",
        step2Desc: "The Workspace is where you'll input all the text and images for the mass. It's divided into sections like \"Lagu Pembuka\", \"Bacaan I\", etc.",
        step2Features: "Special Features",
        step2SwitchLabel: "Text / Image Switch",
        step2SwitchDesc: "For sections that can be either text (like a song's lyrics) or an image (like a sheet music scan), you can toggle the input mode. Click the icon for the type of content you want to add.",
        step2SwitchNote: "Selecting the image icon will show an upload box.",
        step2ParaLabel: "Paragraphify",
        step2ParaDesc: "If you copy text from a PDF or another source, it might have unwanted line breaks. The Paragraphify button removes all line breaks within the text, turning it into a single, clean paragraph. This is especially useful for readings.",
        before: "Before:",
        after: "After:",
        step3Title: "Step 3: Upload Template",
        step3Desc1: "After filling out the workspace, click Next. In this step, you will upload the correct .pptx PowerPoint template for the selected Mass Type.",
        step3Desc2: "You can download the official templates from the link below. Make sure the template you upload matches the Mass Type you selected in the Setup menu.",
        currentSelection: "Current selection:",
        downloadTemplate: "Download Template",
        downloadSource: "Downloads are from komsosnas.parokipugeran.org",
        step4Title: "Step 4: Generate & Download",
        step4Desc1: "This is the final step! Once your content is ready and your template is uploaded, click the Generate & Download button.",
        step4Desc2: "The system will process everything and your browser will automatically download the finished .pptx file, ready to use!",
    },
    indonesia: {
        welcome: "Selamat datang di Otomateks! Panduan ini akan memandu Anda membuat presentasi dari awal hingga akhir.",
        step1Title: "Langkah 1: Pengaturan Proyek",
        step1Desc: "Sebelum Anda mulai menambahkan konten, atur detail dasar untuk presentasi Anda.",
        step1TitleLabel: "1. Judul Teks Misa",
        step1TitleDesc: "Ini adalah judul utama untuk proyek Anda dan akan menjadi nama file dari presentasi yang diunduh. Isi ini terlebih dahulu.",
        step1SetupLabel: "2. Bahasa dan Tipe Misa",
        step1SetupDesc: "Klik ikon menu di sudut kanan atas dan pilih Pengaturan Misa. Ini akan membuka dialog di mana Anda dapat memilih bahasa dan tipe misa. Ini memengaruhi akhiran otomatis yang ditambahkan pada doa-doa tertentu.",
        step2Title: "Langkah 2: Ruang Kerja",
        step2Desc: "Ruang Kerja adalah tempat Anda memasukkan semua teks dan gambar untuk misa. Ini dibagi menjadi beberapa bagian seperti \"Lagu Pembuka\", \"Bacaan I\", dll.",
        step2Features: "Fitur Khusus",
        step2SwitchLabel: "Tombol Teks / Gambar",
        step2SwitchDesc: "Untuk bagian yang bisa berupa teks (seperti lirik lagu) atau gambar (seperti pindaian partitur), Anda dapat mengganti mode input. Klik ikon untuk jenis konten yang ingin Anda tambahkan.",
        step2SwitchNote: "Memilih ikon gambar akan menampilkan kotak unggah.",
        step2ParaLabel: "Paragraphify",
        step2ParaDesc: "Jika Anda menyalin teks dari PDF atau sumber lain, mungkin ada jeda baris yang tidak diinginkan. Tombol Paragraphify menghapus semua jeda baris dalam teks, mengubahnya menjadi satu paragraf yang bersih. Ini sangat berguna untuk bacaan.",
        before: "Sebelum:",
        after: "Sesudah:",
        step3Title: "Langkah 3: Unggah Template",
        step3Desc1: "Setelah mengisi ruang kerja, klik Lanjut. Pada langkah ini, Anda akan mengunggah template PowerPoint .pptx yang benar untuk Tipe Misa yang dipilih.",
        step3Desc2: "Anda dapat mengunduh template resmi dari tautan di bawah ini. Pastikan template yang Anda unggah sesuai dengan Tipe Misa yang Anda pilih di menu Pengaturan Misa.",
        currentSelection: "Pilihan saat ini:",
        downloadTemplate: "Unduh Template",
        downloadSource: "Unduhan berasal dari komsosnas.parokipugeran.org",
        step4Title: "Langkah 4: Buat & Unduh",
        step4Desc1: "Ini adalah langkah terakhir! Setelah konten Anda siap dan template Anda diunggah, klik tombol Buat & Unduh.",
        step4Desc2: "Sistem akan memproses semuanya dan browser Anda akan secara otomatis mengunduh file .pptx yang sudah jadi, siap digunakan!",
    }
};