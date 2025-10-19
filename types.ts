export type Language = 'indonesia' | 'jawa' | 'english';

export type MassType = 'biasa' | 'manten' | 'memule' | 'kamisPutih' | 'jumatAgung' | 'paskah' | 'natal';

export interface PresentationData {
  presentationTitle?: string;

  laguPembukaTitle?: string;
  laguPembukaText?: string;
  laguPembukaImages?: string[];

  tuhanKasihanilahKami1Title?: string;
  tuhanKasihanilahKami1Text?: string;
  tuhanKasihanilahKami2Title?: string;
  tuhanKasihanilahKami2Text?: string;
  tuhanKasihanilahKami3Title?: string;
  tuhanKasihanilahKami3Text?: string;

  doaKolektaTitle?: string;
  doaKolektaText?: string;
  
  bacaan1Title?: string;
  bacaan1Text?: string;

  mazmurTanggapanRefrenTitle?: string;
  mazmurTanggapanRefrenText?: string;
  mazmurTanggapanRefrenImages?: string[];

  mazmurTanggapanAyat1Title?: string;
  mazmurTanggapanAyat1Text?: string;
  mazmurTanggapanAyat1Images?: string[];

  mazmurTanggapanAyat2Title?: string;
  mazmurTanggapanAyat2Text?: string;
  mazmurTanggapanAyat2Images?: string[];

  mazmurTanggapanAyat3Title?: string;
  mazmurTanggapanAyat3Text?: string;
  mazmurTanggapanAyat3Images?: string[];

  bacaan2Title?: string;
  bacaan2Text?: string;

  baitPengantarInjilRefrenTitle?: string;
  baitPengantarInjilRefrenImages?: string[];

  baitPengantarInjilAyatTitle?: string;
  baitPengantarInjilAyatText?: string;
  baitPengantarInjilAyatImages?: string[];
  
  bacaanInjilTitle?: string;
  bacaanInjilText?: string;

  doaUmat1ImamTitle?: string;
  doaUmat1ImamText?: string;
  doaUmat2LektorTitle?: string;
  doaUmat2LektorText?: string;
  doaUmat3LektorTitle?: string;
  doaUmat3LektorText?: string;
  doaUmat4LektorTitle?: string;
  doaUmat4LektorText?: string;
  doaUmat5LektorTitle?: string;
  doaUmat5LektorText?: string;
  doaUmat6LektorTitle?: string;
  doaUmat6LektorText?: string;
  doaUmat7LektorTitle?: string;
  doaUmat7LektorText?: string;
  doaUmat8LektorTitle?: string;
  doaUmat8LektorText?: string;
  doaUmat9LektorTitle?: string;
  doaUmat9LektorText?: string;
  doaUmat10LektorTitle?: string;
  doaUmat10LektorText?: string;
  doaUmat11ImamTitle?: string;
  doaUmat11ImamText?: string;

  doaUmatJawabanUmatTitle?: string;
  doaUmatJawabanUmatText?: string;

  laguPersembahanTitle?: string;
  laguPersembahanText?: string;
  laguPersembahanImages?: string[];
  
  doaAtasPersembahanTitle?: string;
  doaAtasPersembahanText?: string;

  laguKomuniTitle?: string;
  laguKomuniText?: string;
  laguKomuniImages?: string[];

  laguKomuni2Title?: string;
  laguKomuni2Text?: string;
  laguKomuni2Images?: string[];

  laguKomuni3Title?: string;
  laguKomuni3Text?: string;
  laguKomuni3Images?: string[];

  doaSesudahKomuniTitle?: string;
  doaSesudahKomuniText?: string;
  
  laguPenutupTitle?: string;
  laguPenutupText?: string;
  laguPenutupImages?: string[];
}