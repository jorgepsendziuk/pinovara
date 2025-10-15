export interface Pratica {
    numero: number;
    titulo: string;
    campoResposta: string;
    campoComentario: string;
    campoProposta: string;
}
export interface Subarea {
    nome: string;
    praticas: Pratica[];
}
export interface AreaGerencial {
    nome: string;
    subareas: Subarea[];
}
export declare const GOVERNANCA_ORGANIZACIONAL: AreaGerencial;
export declare const GESTAO_PESSOAS: AreaGerencial;
//# sourceMappingURL=praticasDefinicoes.d.ts.map