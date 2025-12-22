import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { HttpStatus } from '../types/api';

const prisma = new PrismaClient();

// Configurar diretório de uploads
const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/var/pinovara/shared/uploads/capacitacao/evidencias' 
  : '/Users/jorgepsendziuk/Documents/pinovara/uploads/capacitacao/evidencias';

// Configurar storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Criar pasta se não existir
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true, mode: 0o755 });
      }
      // Verificar permissão de escrita
      fs.accessSync(UPLOAD_DIR, fs.constants.W_OK);
      cb(null, UPLOAD_DIR);
    } catch (error) {
      console.error(`Erro ao configurar diretório de upload ${UPLOAD_DIR}:`, error);
      cb(new Error(`Sem permissão para escrever no diretório de upload. Contate o administrador do sistema.`), '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de arquivos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas PDF e imagens são aceitos.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

class CapacitacaoEvidenciaController {
  /**
   * POST /capacitacoes/:id/evidencias
   */
  async uploadEvidencia(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Usuário não autenticado',
            statusCode: HttpStatus.UNAUTHORIZED
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const idCapacitacao = parseInt(req.params.id);
      if (isNaN(idCapacitacao)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const file = (req as any).file;
      if (!file) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Nenhum arquivo foi enviado',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar se a capacitação existe
      const capacitacao = await prisma.capacitacao.findUnique({
        where: { id: idCapacitacao }
      });

      if (!capacitacao) {
        // Remover arquivo se capacitação não existe
        fs.unlinkSync(file.path);
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

      const tipo = req.body.tipo || (file.mimetype.startsWith('image/') ? 'foto' : 'outro');

      const evidencia = await prisma.capacitacao_evidencia.create({
        data: {
          id_capacitacao: idCapacitacao,
          tipo: tipo,
          nome_arquivo: file.filename,
          caminho_arquivo: path.join(UPLOAD_DIR, file.filename),
          descricao: req.body.descricao || null,
          data_evidencia: req.body.data_evidencia ? new Date(req.body.data_evidencia) : null,
          local_evidencia: req.body.local_evidencia || null,
          uploaded_by: req.user.id
        }
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Evidência enviada com sucesso',
        data: evidencia,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CapacitacaoEvidenciaController] Error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro ao fazer upload de evidência',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /capacitacoes/:id/evidencias
   */
  async listEvidencias(req: AuthRequest, res: Response): Promise<void> {
    try {
      const idCapacitacao = parseInt(req.params.id);
      const tipo = req.query.tipo as string;

      if (isNaN(idCapacitacao)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const where: any = { id_capacitacao: idCapacitacao };
      if (tipo) {
        where.tipo = tipo;
      }

      const evidencias = await prisma.capacitacao_evidencia.findMany({
        where,
        orderBy: { created_at: 'desc' }
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: evidencias,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CapacitacaoEvidenciaController] Error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro ao listar evidências',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /capacitacoes/:id/evidencias/:evidenciaId/download
   */
  async downloadEvidencia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const idCapacitacao = parseInt(req.params.id);
      const evidenciaId = parseInt(req.params.evidenciaId);

      if (isNaN(idCapacitacao) || isNaN(evidenciaId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const evidencia = await prisma.capacitacao_evidencia.findFirst({
        where: {
          id: evidenciaId,
          id_capacitacao: idCapacitacao
        }
      });

      if (!evidencia) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Evidência não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!fs.existsSync(evidencia.caminho_arquivo)) {
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

      const mimeType = evidencia.caminho_arquivo.endsWith('.pdf') 
        ? 'application/pdf' 
        : 'image/jpeg';

      res.setHeader('Content-Disposition', `inline; filename="${evidencia.nome_arquivo}"`);
      res.setHeader('Content-Type', mimeType);
      res.sendFile(path.resolve(evidencia.caminho_arquivo));
    } catch (error) {
      console.error('❌ [CapacitacaoEvidenciaController] Error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro ao fazer download da evidência',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * DELETE /capacitacoes/:id/evidencias/:evidenciaId
   */
  async deleteEvidencia(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Usuário não autenticado',
            statusCode: HttpStatus.UNAUTHORIZED
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const idCapacitacao = parseInt(req.params.id);
      const evidenciaId = parseInt(req.params.evidenciaId);

      if (isNaN(idCapacitacao) || isNaN(evidenciaId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const evidencia = await prisma.capacitacao_evidencia.findFirst({
        where: {
          id: evidenciaId,
          id_capacitacao: idCapacitacao
        }
      });

      if (!evidencia) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Evidência não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Remover arquivo do sistema de arquivos
      if (fs.existsSync(evidencia.caminho_arquivo)) {
        fs.unlinkSync(evidencia.caminho_arquivo);
      }

      // Remover registro do banco
      await prisma.capacitacao_evidencia.delete({
        where: { id: evidenciaId }
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Evidência excluída com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CapacitacaoEvidenciaController] Error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro ao excluir evidência',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const capacitacaoEvidenciaController = new CapacitacaoEvidenciaController();
export const uploadEvidencia = upload.single('arquivo');

