interface SyncResult {
    id_organizacao: number;
    nome: string;
    uri: string | null;
    fotos_sincronizadas: number;
    arquivos_sincronizados: number;
    erro_fotos?: string;
    erro_arquivos?: string;
}
interface SyncAllResult {
    total_organizacoes: number;
    organizacoes_com_uuid: number;
    organizacoes_sem_uuid: number;
    total_fotos: number;
    total_arquivos: number;
    sucessos: number;
    erros: number;
    resultados: SyncResult[];
}
declare const odkSyncService: {
    syncAll(): Promise<SyncAllResult>;
    getStats(): Promise<{
        total_organizacoes: number;
        com_uuid: number;
        sem_uuid: number;
        com_fotos_local: number;
        com_arquivos_local: number;
        sem_fotos_local: number;
        sem_arquivos_local: number;
    }>;
};
export default odkSyncService;
//# sourceMappingURL=odkSyncService.d.ts.map