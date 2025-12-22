import { Request, Response } from 'express';
import capacitacaoService from '../services/capacitacaoService';
import avaliacaoService from '../services/avaliacaoService';
import { CreateInscricaoData } from '../types/capacitacao';
import { CreateAvaliacaoData } from '../types/avaliacao';
import { HttpStatus } from '../types/api';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

class CapacitacaoPublicController {
  /**
   * GET /capacitacoes/public/:linkInscricao
   * Dados da capacitação para inscrição pública
   */
  async getByLinkInscricao(req: Request, res: Response): Promise<void> {
    try {
      const { linkInscricao } = req.params;

      if (!linkInscricao) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Link de inscrição é obrigatório',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const capacitacao = await capacitacaoService.getByLinkInscricao(linkInscricao);

      if (!capacitacao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Capacitação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: capacitacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /capacitacoes/public/:linkInscricao/inscricao
   * Criar inscrição pública
   */
  async createInscricaoPublica(req: Request, res: Response): Promise<void> {
    try {
      const { linkInscricao } = req.params;

      if (!linkInscricao) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Link de inscrição é obrigatório',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Buscar capacitação pelo link
      const capacitacao = await capacitacaoService.getByLinkInscricao(linkInscricao);

      if (!capacitacao || !capacitacao.id) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Capacitação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Criar inscrição (sem inscrito_por, pois é auto-inscrição)
      const inscricao = await capacitacaoService.createInscricao(
        capacitacao.id,
        req.body as CreateInscricaoData
      );

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Inscrição realizada com sucesso',
        data: inscricao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /capacitacoes/public/:linkAvaliacao
   * Dados da capacitação para avaliação pública
   */
  async getByLinkAvaliacao(req: Request, res: Response): Promise<void> {
    try {
      const { linkAvaliacao } = req.params;

      if (!linkAvaliacao) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Link de avaliação é obrigatório',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const capacitacao = await capacitacaoService.getByLinkAvaliacao(linkAvaliacao);

      if (!capacitacao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Capacitação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Buscar versão ativa do questionário
      const versaoAtiva = await avaliacaoService.getVersaoAtiva();

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          capacitacao,
          versao_avaliacao: versaoAtiva
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /capacitacoes/public/:linkAvaliacao/avaliacao
   * Submeter avaliação pública
   */
  async createAvaliacaoPublica(req: Request, res: Response): Promise<void> {
    try {
      const { linkAvaliacao } = req.params;

      if (!linkAvaliacao) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Link de avaliação é obrigatório',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Buscar capacitação pelo link
      const capacitacao = await capacitacaoService.getByLinkAvaliacao(linkAvaliacao);

      if (!capacitacao || !capacitacao.id) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Capacitação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Se fornecido email, tentar encontrar inscrição
      let idInscricao: number | undefined;
      if (req.body.email_participante && capacitacao.id) {
        const inscricoes = await capacitacaoService.listInscricoes(capacitacao.id);
        const inscricao = inscricoes.find(i => i.email === req.body.email_participante);
        if (inscricao && inscricao.id) {
          idInscricao = inscricao.id;
        }
      }

      // Criar avaliação
      const avaliacao = await avaliacaoService.createAvaliacao(
        capacitacao.id,
        req.body as CreateAvaliacaoData,
        idInscricao
      );

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Avaliação submetida com sucesso. Obrigado pela sua participação!',
        data: avaliacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /capacitacoes/public/:linkInscricao/materiais
   * Listar materiais públicos de uma capacitação
   */
  async listMateriaisPublicos(req: Request, res: Response): Promise<void> {
    try {
      const { linkInscricao } = req.params;

      if (!linkInscricao) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Link de inscrição é obrigatório',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar se a capacitação existe e tem o link correto
      const capacitacao = await prisma.capacitacao.findUnique({
        where: { link_inscricao: linkInscricao },
        include: {
          qualificacao: true
        }
      });

      if (!capacitacao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Capacitação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Listar materiais da qualificação
      const materiais = await prisma.capacitacao_material.findMany({
        where: {
          id_qualificacao: capacitacao.id_qualificacao
        },
        orderBy: { created_at: 'desc' }
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: materiais,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CapacitacaoPublicController] Error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro ao listar materiais',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * POST /capacitacoes/public/:linkInscricao/verificar-inscricao
   * Verificar se um email está inscrito
   */
  async verificarInscricao(req: Request, res: Response): Promise<void> {
    try {
      const { linkInscricao } = req.params;
      const { email } = req.body;

      if (!linkInscricao || !email) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Link de inscrição e email são obrigatórios',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const inscricao = await capacitacaoService.verificarInscricaoPorEmail(linkInscricao, email);

      if (!inscricao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Email não encontrado nas inscrições desta capacitação',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: inscricao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /capacitacoes/public/:linkInscricao/materiais/:materialId/download
   * Download público de material de uma capacitação
   */
  async downloadMaterialPublico(req: Request, res: Response): Promise<void> {
    try {
      const { linkInscricao, materialId } = req.params;

      if (!linkInscricao || !materialId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Link de inscrição e ID do material são obrigatórios',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const materialIdNum = parseInt(materialId);
      if (isNaN(materialIdNum)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID do material inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar se a capacitação existe e tem o link correto
      const capacitacao = await prisma.capacitacao.findUnique({
        where: { link_inscricao: linkInscricao },
        include: {
          qualificacao: true
        }
      });

      if (!capacitacao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Capacitação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar se o material pertence à qualificação da capacitação
      const material = await prisma.capacitacao_material.findFirst({
        where: {
          id: materialIdNum,
          id_qualificacao: capacitacao.id_qualificacao
        }
      });

      if (!material) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Material não encontrado ou não pertence a esta capacitação',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!fs.existsSync(material.caminho_arquivo)) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Arquivo não encontrado no servidor',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.setHeader('Content-Disposition', `attachment; filename="${material.nome_original}"`);
      res.setHeader('Content-Type', material.tipo_mime);
      res.sendFile(path.resolve(material.caminho_arquivo));
    } catch (error) {
      console.error('❌ [CapacitacaoPublicController] Error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro ao fazer download do material',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleError(error: any, res: Response): void {
    console.error('❌ [CapacitacaoPublicController] Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      const apiError = error as any;
      res.status(apiError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: apiError.message || 'Erro ao processar requisição',
          code: apiError.code,
          statusCode: apiError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro interno do servidor',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const capacitacaoPublicController = new CapacitacaoPublicController();

