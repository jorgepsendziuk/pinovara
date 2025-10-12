import { ArquivoODK, ArquivoSyncResult } from '../types/arquivoSync';
export declare const arquivoSyncService: {
    /**
     * Sincroniza arquivos do ODK para uma organização
     */
    syncArquivosFromODK(organizacaoId: number, userEmail: string): Promise<ArquivoSyncResult>;
    /**
     * Busca arquivos do ODK via dblink
     */
    getArquivosODK(organizacaoUri: string | null): Promise<ArquivoODK[]>;
    /**
     * Salva blob como arquivo no disco
     */
    salvarBlobComoArquivo(blob: Buffer, nomeOriginal: string): Promise<void>;
    /**
     * Verifica se arquivo já existe no disco
     */
    verificarArquivoExiste(nomeArquivo: string): Promise<boolean>;
    /**
     * Garante que o diretório de upload existe
     */
    garantirDiretorioExiste(): Promise<void>;
    /**
     * Lista arquivos disponíveis no ODK (sem baixar)
     */
    listarArquivosDisponiveis(organizacaoId: number): Promise<ArquivoODK[]>;
};
//# sourceMappingURL=arquivoSyncService.d.ts.map