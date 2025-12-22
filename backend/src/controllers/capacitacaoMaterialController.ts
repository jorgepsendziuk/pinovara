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
  ? '/var/pinovara/shared/uploads/capacitacao/materiais' 
  : '/Users/jorgepsendziuk/Documents/pinovara/uploads/capacitacao/materiais';

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
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/quicktime',
    'image/jpeg',
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas PDF, PPT, DOC, vídeos e imagens são aceitos.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

class CapacitacaoMaterialController {
  /**
   * POST /qualificacoes/:id/materiais
   */
  async uploadMaterial(req: AuthRequest, res: Response): Promise<void> {
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

      const idQualificacao = parseInt(req.params.id);
      if (isNaN(idQualificacao)) {
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

      // Verificar se a qualificação existe
      const qualificacao = await prisma.qualificacao.findUnique({
        where: { id: idQualificacao }
      });

      if (!qualificacao) {
        // Remover arquivo se qualificação não existe
        fs.unlinkSync(file.path);
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Qualificação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const material = await prisma.capacitacao_material.create({
        data: {
          id_qualificacao: idQualificacao,
          nome_arquivo: file.filename,
          nome_original: file.originalname,
          caminho_arquivo: path.join(UPLOAD_DIR, file.filename),
          tamanho_bytes: file.size,
          tipo_mime: file.mimetype,
          descricao: req.body.descricao || null,
          uploaded_by: req.user.id
        }
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Material enviado com sucesso',
        data: material,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CapacitacaoMaterialController] Error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro ao fazer upload de material',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /qualificacoes/:id/materiais
   */
  async listMateriais(req: AuthRequest, res: Response): Promise<void> {
    try {
      const idQualificacao = parseInt(req.params.id);
      if (isNaN(idQualificacao)) {
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

      const materiais = await prisma.capacitacao_material.findMany({
        where: { id_qualificacao: idQualificacao },
        orderBy: { created_at: 'desc' }
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: materiais,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CapacitacaoMaterialController] Error:', error);
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
   * GET /qualificacoes/:id/materiais/:materialId/download
   */
  async downloadMaterial(req: AuthRequest, res: Response): Promise<void> {
    try {
      const idQualificacao = parseInt(req.params.id);
      const materialId = parseInt(req.params.materialId);

      if (isNaN(idQualificacao) || isNaN(materialId)) {
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

      const material = await prisma.capacitacao_material.findFirst({
        where: {
          id: materialId,
          id_qualificacao: idQualificacao
        }
      });

      if (!material) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Material não encontrado',
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
      console.error('❌ [CapacitacaoMaterialController] Error:', error);
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

  /**
   * DELETE /qualificacoes/:id/materiais/:materialId
   */
  async deleteMaterial(req: AuthRequest, res: Response): Promise<void> {
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

      const idQualificacao = parseInt(req.params.id);
      const materialId = parseInt(req.params.materialId);

      if (isNaN(idQualificacao) || isNaN(materialId)) {
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

      const material = await prisma.capacitacao_material.findFirst({
        where: {
          id: materialId,
          id_qualificacao: idQualificacao
        }
      });

      if (!material) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Material não encontrado',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Remover arquivo do sistema de arquivos
      if (fs.existsSync(material.caminho_arquivo)) {
        fs.unlinkSync(material.caminho_arquivo);
      }

      // Remover registro do banco
      await prisma.capacitacao_material.delete({
        where: { id: materialId }
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Material excluído com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CapacitacaoMaterialController] Error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro ao excluir material',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const capacitacaoMaterialController = new CapacitacaoMaterialController();
export const uploadMaterial = upload.single('arquivo');

