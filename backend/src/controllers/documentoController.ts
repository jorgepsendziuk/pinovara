import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { documentoService } from '../services/documentoService';
import { AuthRequest } from '../middleware/auth';

// Pasta única para todos os arquivos
const UPLOAD_DIR = '/var/pinovara/shared/uploads/arquivos';

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Criar pasta se não existir
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const organizacaoId = req.params.id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nomeOriginalLimpo = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    const nomeArquivoFinal = `org${organizacaoId}-${nomeOriginalLimpo}-${timestamp}${ext}`;
    cb(null, nomeArquivoFinal);
  }
});

// Filtro de arquivos permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas PDF, JPG, PNG, DOC e DOCX são aceitos.'));
  }
};

// Configurar upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

class DocumentoController {
  // Upload de documento
  async uploadDocumento(req: AuthRequest, res: Response): Promise<void> {
    try {
      const organizacaoId = parseInt(req.params.id);
      const file = req.file;
      const { obs } = req.body;

      if (!file) {
        res.status(400).json({
          success: false,
          error: { message: 'Nenhum arquivo foi enviado' }
        });
        return;
      }

      // Gerar URI único para o arquivo
      const timestamp = Date.now();
      const uri = `uuid:${organizacaoId}-${timestamp}-${Math.random().toString(36).substring(7)}`;
      
      // Contar arquivos existentes para definir ordinal_number
      const count = await documentoService.count(organizacaoId);

      // Criar registro no banco
      const documento = await documentoService.create({
        id_organizacao: organizacaoId,
        arquivo: file.filename,
        usuario_envio: req.user?.email || 'sistema',
        obs: obs || null,
        uri: uri,
        ordinal_number: count + 1,
      });

      res.status(201).json({
        success: true,
        data: documento,
      });
    } catch (error) {
      console.error('Erro ao fazer upload de documento:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao fazer upload de documento' }
      });
    }
  }

  // Listar documentos de uma organização
  async listDocumentos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const organizacaoId = parseInt(req.params.id);

      const documentos = await documentoService.findByOrganizacao(organizacaoId);

      res.json({
        success: true,
        data: documentos,
      });
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao listar documentos' }
      });
    }
  }

  // Download de documento
  async downloadDocumento(req: AuthRequest, res: Response): Promise<void> {
    try {
      const documentoId = parseInt(req.params.docId);

      const documento = await documentoService.findById(documentoId);

      if (!documento) {
        res.status(404).json({
          success: false,
          error: { message: 'Documento não encontrado' }
        });
        return;
      }

      // Caminho do arquivo na pasta única
      const filePath = path.join(UPLOAD_DIR, documento.arquivo!);

      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: { message: 'Arquivo não encontrado no servidor' }
        });
        return;
      }

      // Fazer download
      res.download(filePath, documento.arquivo!);
    } catch (error) {
      console.error('Erro ao fazer download de documento:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao fazer download de documento' }
      });
    }
  }

  // Deletar documento
  async deleteDocumento(req: AuthRequest, res: Response): Promise<void> {
    try {
      const documentoId = parseInt(req.params.docId);

      const documento = await documentoService.findById(documentoId);

      if (!documento) {
        res.status(404).json({
          success: false,
          error: { message: 'Documento não encontrado' }
        });
        return;
      }

      // Caminho do arquivo na pasta única
      const filePath = path.join(UPLOAD_DIR, documento.arquivo!);

      // Deletar arquivo físico se existir
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Deletar registro do banco
      await documentoService.delete(documentoId);

      res.json({
        success: true,
        message: 'Documento deletado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao deletar documento' }
      });
    }
  }
}

export const documentoController = new DocumentoController();

