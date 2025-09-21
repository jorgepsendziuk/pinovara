/**
 * Tipos relacionados às organizações
 */

export interface Organizacao {
  id: number;
  nome?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  estado?: number;
  municipio?: number;
  gpsLat?: number;
  gpsLng?: number;
  gpsAlt?: number;
  gpsAcc?: number;
  dataFundacao?: Date;
  inicio?: Date;
  fim?: Date;
  deviceid?: string;
  dataVisita?: Date;
  metaInstanceId?: string;
  metaInstanceName?: string;
  removido: boolean;
  idTecnico?: number;
}

export interface OrganizacaoCompleta extends Organizacao {
  abrangenciaPj: AbrangenciaPj[];
  abrangenciaSocio: AbrangenciaSocio[];
  arquivos: Arquivo[];
  fotos: Foto[];
  producoes: Producao[];
}

export interface AbrangenciaPj {
  id: number;
  razaoSocial?: string;
  sigla?: string;
  cnpjPj?: string;
  numSociosCaf?: number;
  numSociosTotal?: number;
  estado?: number;
  municipio?: number;
}

export interface AbrangenciaSocio {
  id: number;
  numSocios?: number;
  estado?: number;
  municipio?: number;
}

export interface Arquivo {
  id: number;
  arquivo?: string;
  obs?: string;
}

export interface Foto {
  id: number;
  grupo?: number;
  foto?: string;
  obs?: string;
}

export interface Producao {
  id: number;
  cultura?: string;
  anual?: number;
  mensal?: number;
}

export interface OrganizacaoFilters {
  nome?: string;
  cnpj?: string;
  estado?: number;
  municipio?: number;
  page?: number;
  limit?: number;
}

export interface OrganizacaoListResponse {
  organizacoes: Organizacao[];
  total: number;
  pagina: number;
  totalPaginas: number;
  limit: number;
}