export interface ArquivoODK {
  uri: string;
  parent_auri: string;
  grupo: string | null;
  arquivo_obs: string | null;
  creation_date: Date;
  arquivo_blob: Buffer;
  tamanho_bytes: number;
  nome_arquivo: string;
}

export interface ArquivoSyncResult {
  success: boolean;
  total_odk: number;
  ja_existentes: number;
  baixadas: number;
  erros: number;
  detalhes: ArquivoSyncDetail[];
  mensagem: string;
}

export interface ArquivoSyncDetail {
  uri: string;
  status: 'existente' | 'baixada' | 'erro';
  mensagem?: string;
  nome_arquivo?: string;
}
