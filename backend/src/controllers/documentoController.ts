import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { documentoService } from '../services/documentoService';
import { AuthRequest } from '../middleware/auth';

// Mapeamento de tipos de documento para pastas
const TIPO_PASTAS: { [key: string]: string } = {
  'termo_adesao': 'termos-adesao',
  'relatorio': 'relatorios',
  'lista_presenca': 'listas-presenca',
  'foto': 'fotos',
};

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // O tipo_documento vem como campo do FormData, mas o multer processa o arquivo antes
    // Vamos usar uma pasta temporária e depois mover para a pasta correta
    const destino = `/var/pinovara/shared/uploads/temp`;
    
    // Criar pasta se não existir
    if (!fs.existsSync(destino)) {
      fs.mkdirSync(destino, { recursive: true });
    }
    
    cb(null, destino);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomStr = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nome = `temp-${timestamp}-${randomStr}${ext}`;
    cb(null, nome);
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
      const { tipo_documento, obs } = req.body;

      if (!file) {
        res.status(400).json({
          success: false,
          error: { message: 'Nenhum arquivo foi enviado' }
        });
        return;
      }

      // Validar tipo de documento
      if (!TIPO_PASTAS[tipo_documento]) {
        // Deletar arquivo temporário
        fs.unlinkSync(file.path);
        res.status(400).json({
          success: false,
          error: { message: 'Tipo de documento inválido' }
        });
        return;
      }

      // Mover arquivo da pasta temp para a pasta correta
      const pasta = TIPO_PASTAS[tipo_documento];
      const destinoFinal = `/var/pinovara/shared/uploads/${pasta}`;
      
      // Criar pasta destino se não existir
      if (!fs.existsSync(destinoFinal)) {
        fs.mkdirSync(destinoFinal, { recursive: true });
      }

      // Gerar nome final do arquivo
      const ext = path.extname(file.originalname);
      const timestamp = Date.now();
      const nomeOriginalLimpo = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
      const nomeArquivoFinal = `${tipo_documento}-org${organizacaoId}-${nomeOriginalLimpo}-${timestamp}${ext}`;
      const caminhoFinal = path.join(destinoFinal, nomeArquivoFinal);

      // Mover arquivo
      fs.renameSync(file.path, caminhoFinal);

      // Criar registro no banco
      const documento = await documentoService.create({
        id_organizacao: organizacaoId,
        tipo_documento,
        arquivo: nomeArquivoFinal,
        usuario_envio: req.user?.email || 'sistema',
        obs: obs || null,
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

      // Determinar pasta baseado no tipo
      const pasta = TIPO_PASTAS[documento.tipo_documento] || 'documentos';
      const filePath = path.join('/var/pinovara/shared/uploads', pasta, documento.arquivo);

      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: { message: 'Arquivo não encontrado no servidor' }
        });
        return;
      }

      // Fazer download
      res.download(filePath, documento.arquivo);
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

      // Determinar pasta baseado no tipo
      const pasta = TIPO_PASTAS[documento.tipo_documento] || 'documentos';
      const filePath = path.join('/var/pinovara/shared/uploads', pasta, documento.arquivo);

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

