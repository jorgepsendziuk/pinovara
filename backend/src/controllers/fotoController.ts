import { Request, Response } from 'express';
import { fotoService } from '../services/fotoService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração do Multer para upload de fotos
const UPLOAD_DIR = '/var/pinovara/shared/uploads/fotos';

// Garantir que o diretório existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
      .replace(/[^a-z0-9]/gi, '-')       // Substitui especiais por hífen
      .replace(/-+/g, '-')                // Remove hífens duplicados
      .replace(/^-|-$/g, '')              // Remove hífens início/fim
      .toLowerCase();
    
    const cleanName = `${baseName}${ext}`;
    cb(null, cleanName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'));
    }
  }
});

export const uploadMiddleware = upload.single('foto');

export const fotoController = {
  // Upload de foto
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo foi enviado'
        });
      }

      const organizacaoId = parseInt(req.params.id);
      const { obs } = req.body;
      const userEmail = (req as any).user?.email || 'sistema';

      const foto = await fotoService.create({
        foto: req.file.filename,
        obs,
        id_organizacao: organizacaoId,
        creator_uri_user: userEmail
      });

      res.json({
        success: true,
        data: foto
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload de foto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao fazer upload de foto'
      });
    }
  },

  // Listar fotos de uma organização
  async list(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const fotos = await fotoService.listByOrganizacao(organizacaoId);

      res.json({
        success: true,
        data: fotos
      });
    } catch (error: any) {
      console.error('Erro ao listar fotos:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao listar fotos'
      });
    }
  },

  // Visualizar foto (retorna a imagem para exibição)
  async view(req: Request, res: Response) {
    try {
      const fotoId = parseInt(req.params.fotoId);
      const foto = await fotoService.findById(fotoId);

      if (!foto || !foto.foto) {
        console.log(`❌ Foto ${fotoId} não encontrada no banco`);
        return res.status(404).json({
          success: false,
          error: 'Foto não encontrada'
        });
      }

      const filePath = path.join(UPLOAD_DIR, foto.foto);
      console.log(`🔍 Buscando arquivo: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        console.log(`❌ Arquivo não existe: ${filePath}`);
        return res.status(404).json({
          success: false,
          error: 'Arquivo não encontrado no servidor'
        });
      }

      console.log(`✅ Arquivo encontrado: ${foto.foto}`);

      // Detectar tipo MIME baseado na extensão
      const ext = path.extname(foto.foto).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };

      const contentType = mimeTypes[ext] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.sendFile(filePath);
    } catch (error: any) {
      console.error('Erro ao visualizar foto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao visualizar foto'
      });
    }
  },

  // Download de foto
  async download(req: Request, res: Response) {
    try {
      const fotoId = parseInt(req.params.fotoId);
      const foto = await fotoService.findById(fotoId);

      if (!foto || !foto.foto) {
        return res.status(404).json({
          success: false,
          error: 'Foto não encontrada'
        });
      }

      const filePath = path.join(UPLOAD_DIR, foto.foto);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Arquivo não encontrado no servidor'
        });
      }

      // Garantir que arquivo tenha extensão no download
      const nomeDownload = foto.foto.includes('.') ? foto.foto : `${foto.foto}.jpg`;
      res.download(filePath, nomeDownload);
    } catch (error: any) {
      console.error('Erro ao fazer download de foto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao fazer download de foto'
      });
    }
  },

  // Deletar foto
  async delete(req: Request, res: Response) {
    try {
      const fotoId = parseInt(req.params.fotoId);
      const foto = await fotoService.findById(fotoId);

      if (!foto) {
        return res.status(404).json({
          success: false,
          error: 'Foto não encontrada'
        });
      }

      // Deletar arquivo físico
      if (foto.foto) {
        const filePath = path.join(UPLOAD_DIR, foto.foto);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Deletar registro do banco
      await fotoService.delete(fotoId);

      res.json({
        success: true,
        message: 'Foto deletada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao deletar foto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao deletar foto'
      });
    }
  }
};

