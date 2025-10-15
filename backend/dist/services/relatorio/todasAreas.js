"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GESTAO_FINANCEIRA = exports.GESTAO_PESSOAS = exports.GOVERNANCA_ORGANIZACIONAL = void 0;
var praticasDefinicoes_1 = require("./praticasDefinicoes");
Object.defineProperty(exports, "GOVERNANCA_ORGANIZACIONAL", { enumerable: true, get: function () { return praticasDefinicoes_1.GOVERNANCA_ORGANIZACIONAL; } });
Object.defineProperty(exports, "GESTAO_PESSOAS", { enumerable: true, get: function () { return praticasDefinicoes_1.GESTAO_PESSOAS; } });
exports.GESTAO_FINANCEIRA = {
    nome: 'GESTÃO FINANCEIRA',
    subareas: [
        {
            nome: 'Balanço Patrimonial',
            praticas: [
                { numero: 1, titulo: 'Possui contabilidade realizada por um contador?', campoResposta: 'gf_balanco_1_resposta', campoComentario: 'gf_balanco_1_comentario', campoProposta: 'gf_balanco_1_proposta' },
                { numero: 2, titulo: 'Possui Balanço Patrimonial atualizado?', campoResposta: 'gf_balanco_2_resposta', campoComentario: 'gf_balanco_2_comentario', campoProposta: 'gf_balanco_2_proposta' },
                { numero: 3, titulo: 'Realiza Análise de Balanço?', campoResposta: 'gf_balanco_3_resposta', campoComentario: 'gf_balanco_3_comentario', campoProposta: 'gf_balanco_3_proposta' },
                { numero: 4, titulo: 'Utiliza Balancetes Mensais para orientação financeira?', campoResposta: 'gf_balanco_4_resposta', campoComentario: 'gf_balanco_4_comentario', campoProposta: 'gf_balanco_4_proposta' }
            ]
        },
        {
            nome: 'Controle de Contas a Receber e a Pagar',
            praticas: [
                { numero: 5, titulo: 'Possui sistema/programa informatizado para gestão?', campoResposta: 'gf_contas_5_resposta', campoComentario: 'gf_contas_5_comentario', campoProposta: 'gf_contas_5_proposta' },
                { numero: 6, titulo: 'Possui algum tipo de Plano Orçamentário?', campoResposta: 'gf_contas_6_resposta', campoComentario: 'gf_contas_6_comentario', campoProposta: 'gf_contas_6_proposta' },
                { numero: 7, titulo: 'Possui metas financeiras?', campoResposta: 'gf_contas_7_resposta', campoComentario: 'gf_contas_7_comentario', campoProposta: 'gf_contas_7_proposta' },
                { numero: 8, titulo: 'Possui controle e registro dos valores a receber?', campoResposta: 'gf_contas_8_resposta', campoComentario: 'gf_contas_8_comentario', campoProposta: 'gf_contas_8_proposta' },
                { numero: 9, titulo: 'Possui controle de obrigações perante fornecedores?', campoResposta: 'gf_contas_9_resposta', campoComentario: 'gf_contas_9_comentario', campoProposta: 'gf_contas_9_proposta' },
                { numero: 10, titulo: 'Possui controle de obrigações perante colaboradores?', campoResposta: 'gf_contas_10_resposta', campoComentario: 'gf_contas_10_comentario', campoProposta: 'gf_contas_10_proposta' },
                { numero: 11, titulo: 'Possui controle de obrigações perante o fisco?', campoResposta: 'gf_contas_11_resposta', campoComentario: 'gf_contas_11_comentario', campoProposta: 'gf_contas_11_proposta' },
                { numero: 12, titulo: 'Possui controle de obrigações perante associados fornecedores?', campoResposta: 'gf_contas_12_resposta', campoComentario: 'gf_contas_12_comentario', campoProposta: 'gf_contas_12_proposta' },
                { numero: 13, titulo: 'Possui controle de pagamento de empréstimos e financiamentos?', campoResposta: 'gf_contas_13_resposta', campoComentario: 'gf_contas_13_comentario', campoProposta: 'gf_contas_13_proposta' }
            ]
        },
        {
            nome: 'Fluxo de Caixa',
            praticas: [
                { numero: 14, titulo: 'Possui controle de caixa (DFC)?', campoResposta: 'gf_caixa_14_resposta', campoComentario: 'gf_caixa_14_comentario', campoProposta: 'gf_caixa_14_proposta' },
                { numero: 15, titulo: 'Possui controle do dinheiro e caixa documental?', campoResposta: 'gf_caixa_15_resposta', campoComentario: 'gf_caixa_15_comentario', campoProposta: 'gf_caixa_15_proposta' },
                { numero: 16, titulo: 'Possui controle da conta no banco?', campoResposta: 'gf_caixa_16_resposta', campoComentario: 'gf_caixa_16_comentario', campoProposta: 'gf_caixa_16_proposta' }
            ]
        },
        {
            nome: 'Controle de Estoques',
            praticas: [
                { numero: 17, titulo: 'Possui controle periódico físico e financeiro dos estoques?', campoResposta: 'gf_estoque_17_resposta', campoComentario: 'gf_estoque_17_comentario', campoProposta: 'gf_estoque_17_proposta' },
                { numero: 18, titulo: 'Possui procedimentos de controle de compras?', campoResposta: 'gf_estoque_18_resposta', campoComentario: 'gf_estoque_18_comentario', campoProposta: 'gf_estoque_18_proposta' },
                { numero: 19, titulo: 'Possui procedimentos de pesquisa de mercado antes das compras?', campoResposta: 'gf_estoque_19_resposta', campoComentario: 'gf_estoque_19_comentario', campoProposta: 'gf_estoque_19_proposta' }
            ]
        },
        {
            nome: 'Demonstração de Resultados',
            praticas: [
                { numero: 20, titulo: 'Possui Demonstração de Resultado?', campoResposta: 'gf_resultado_20_resposta', campoComentario: 'gf_resultado_20_comentario', campoProposta: 'gf_resultado_20_proposta' },
                { numero: 21, titulo: 'Utiliza a Demonstração de Resultado para orientação financeira?', campoResposta: 'gf_resultado_21_resposta', campoComentario: 'gf_resultado_21_comentario', campoProposta: 'gf_resultado_21_proposta' }
            ]
        },
        {
            nome: 'Análise de Viabilidade Econômica',
            praticas: [
                { numero: 22, titulo: 'Elaborou a Análise de Viabilidade Econômica (AVE)?', campoResposta: 'gf_analise_22_resposta', campoComentario: 'gf_analise_22_comentario', campoProposta: 'gf_analise_22_proposta' },
                { numero: 23, titulo: 'Vem utilizando as orientações da AVE?', campoResposta: 'gf_analise_23_resposta', campoComentario: 'gf_analise_23_comentario', campoProposta: 'gf_analise_23_proposta' },
                { numero: 24, titulo: 'A AVE vem sendo atualizada?', campoResposta: 'gf_analise_24_resposta', campoComentario: 'gf_analise_24_comentario', campoProposta: 'gf_analise_24_proposta' }
            ]
        },
        {
            nome: 'Obrigações Fiscais Legais',
            praticas: [
                { numero: 25, titulo: 'Está cumprindo com todas as obrigações legais e fiscais?', campoResposta: 'gf_fiscal_25_resposta', campoComentario: 'gf_fiscal_25_comentario', campoProposta: 'gf_fiscal_25_proposta' },
                { numero: 26, titulo: 'Atualiza frequentemente a relação de obrigações legais e fiscais?', campoResposta: 'gf_fiscal_26_resposta', campoComentario: 'gf_fiscal_26_comentario', campoProposta: 'gf_fiscal_26_proposta' }
            ]
        }
    ]
};
//# sourceMappingURL=todasAreas.js.map