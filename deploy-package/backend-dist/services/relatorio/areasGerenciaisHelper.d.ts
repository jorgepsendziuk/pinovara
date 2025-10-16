interface SubareaConfig {
    nome: string;
    praticas: Array<{
        numero: number;
        titulo: string;
        prefixoCampo: string;
    }>;
}
interface AreaConfig {
    nome: string;
    subareas: SubareaConfig[];
}
declare const AREAS_GERENCIAIS: AreaConfig[];
export declare function renderizarTodasAreasGerenciais(doc: any, organizacao: any): void;
export { AREAS_GERENCIAIS };
//# sourceMappingURL=areasGerenciaisHelper.d.ts.map