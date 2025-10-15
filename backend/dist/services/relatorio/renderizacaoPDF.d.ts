export declare const respostaMap: {
    [key: number]: string;
};
export declare const corRespostaMap: {
    [key: number]: string;
};
export declare function renderizarCabecalhoArea(doc: any, nomeArea: string): void;
export declare function renderizarSubarea(doc: any, titulo: string): void;
export declare function renderizarTabelaPraticas(doc: any, praticas: Array<{
    numero: number;
    titulo: string;
    resposta: number | null;
    comentario: string | null;
    proposta: string | null;
}>): void;
export declare function renderizarAreaGerencial(doc: any, nomeArea: string, subareas: Array<{
    nome: string;
    praticas: Array<{
        numero: number;
        titulo: string;
        resposta: number | null;
        comentario: string | null;
        proposta: string | null;
    }>;
}>): void;
//# sourceMappingURL=renderizacaoPDF.d.ts.map