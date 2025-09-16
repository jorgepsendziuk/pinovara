"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateData = exports.updatePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Schema para registro de usuário
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
    email: zod_1.z.string()
        .email('Email inválido')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .max(128, 'Senha deve ter no máximo 128 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial')
});
// Schema para login
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Email inválido')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(1, 'Senha é obrigatória')
});
// Schema para atualização de senha
exports.updatePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string()
        .min(1, 'Senha atual é obrigatória'),
    newPassword: zod_1.z.string()
        .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
        .max(128, 'Nova senha deve ter no máximo 128 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial')
});
// Função para validar dados
const validateData = (schema, data) => {
    try {
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errorMessages = error.errors.map(err => err.message).join(', ');
            throw new Error(`Dados inválidos: ${errorMessages}`);
        }
        throw new Error('Erro na validação dos dados');
    }
};
exports.validateData = validateData;
//# sourceMappingURL=validation.js.map