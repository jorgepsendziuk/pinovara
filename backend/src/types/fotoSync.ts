export interface FotoODK {
  uri: string;
  parent_auri: string;
  grupo: string | null;
  foto_obs: string | null;
  creation_date: Date;
  foto_blob: Buffer;
  tamanho_bytes: number;
  nome_arquivo: string;
}

export interface SyncResult {
  success: boolean;
  total_odk: number;
  ja_existentes: number;
  baixadas: number;
  erros: number;
  detalhes: SyncDetail[];
  mensagem: string;
}

export interface SyncDetail {
  uri: string;
  status: 'existente' | 'baixada' | 'erro';
  mensagem?: string;
  nome_arquivo?: string;
}

