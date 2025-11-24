
export type Language = 'indonesia' | 'jawa' | 'english';

export type MassType = 'harian' | 'mingguan' | 'manten' | 'memule' | 'natal' | 'kamisPutih' | 'jumatAgung' | 'malamPaskah' | 'dataEntry';

export interface PresentationData {
  presentationTitle?: string;
  [key: string]: string | string[] | undefined;
}
