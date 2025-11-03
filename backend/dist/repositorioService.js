"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositorioService = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Função auxiliar para converter BigInt para Number (evita erro de serialização JSON)
function convertBigInt(obj) {
    if (obj === null || obj === undefined)
        return obj;
    if (typeof obj === 'bigint')
        return Number(obj);
    if (Array.isArray(obj))
        return obj.map(convertBigInt);
    if (typeof obj === 'object') {
        var converted = {};
        for (var key in obj) {
            converted[key] = convertBigInt(obj[key]);
        }
        return converted;
    }
    return obj;
}
exports.repositorioService = {
    // Criar novo arquivo no repositório
    create: function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      INSERT INTO pinovara.repositorio_publico (\n        nome_arquivo,\n        nome_original,\n        caminho_arquivo,\n        tamanho_bytes,\n        tipo_mime,\n        extensao,\n        descricao,\n        categoria,\n        tags,\n        usuario_upload,\n        usuario_upload_id\n      ) VALUES (\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", "\n      ) RETURNING *;\n    "], ["\n      INSERT INTO pinovara.repositorio_publico (\n        nome_arquivo,\n        nome_original,\n        caminho_arquivo,\n        tamanho_bytes,\n        tipo_mime,\n        extensao,\n        descricao,\n        categoria,\n        tags,\n        usuario_upload,\n        usuario_upload_id\n      ) VALUES (\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", ",\n        ", "\n      ) RETURNING *;\n    "])), data.nome_arquivo, data.nome_original, data.caminho_arquivo, data.tamanho_bytes, data.tipo_mime, data.extensao, data.descricao, data.categoria, data.tags, data.usuario_upload, data.usuario_upload_id)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, convertBigInt(result[0])];
                }
            });
        });
    },
    // Atualizar metadados do arquivo
    update: function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, prisma.$executeRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      UPDATE pinovara.repositorio_publico\n      SET descricao = ", ",\n          categoria = ", ",\n          tags = ", ",\n          updated_at = NOW()\n      WHERE id = ", "\n    "], ["\n      UPDATE pinovara.repositorio_publico\n      SET descricao = ", ",\n          categoria = ", ",\n          tags = ", ",\n          updated_at = NOW()\n      WHERE id = ", "\n    "])), (_a = data.descricao) !== null && _a !== void 0 ? _a : null, (_b = data.categoria) !== null && _b !== void 0 ? _b : 'geral', (_c = data.tags) !== null && _c !== void 0 ? _c : [], id)];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, prisma.$queryRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      SELECT \n        rp.*,\n        to_char(rp.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') as created_at,\n        to_char(rp.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') as updated_at,\n        u.name as usuario_nome\n      FROM pinovara.repositorio_publico rp\n      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id\n      WHERE rp.id = ", "\n    "], ["\n      SELECT \n        rp.*,\n        to_char(rp.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') as created_at,\n        to_char(rp.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') as updated_at,\n        u.name as usuario_nome\n      FROM pinovara.repositorio_publico rp\n      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id\n      WHERE rp.id = ", "\n    "])), id)];
                    case 2:
                        result = _d.sent();
                        return [2 /*return*/, convertBigInt(result[0])];
                }
            });
        });
    },
    // Listar arquivos com filtros e paginação
    list: function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, filtros, sortBy, sortOrder, offset, whereConditions, queryParams, paramIndex, tagsArray, allowedSortFields, validSortBy, validSortOrder, countQuery, countResult, total, dataQuery, arquivos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = params.page, limit = params.limit, filtros = params.filtros, sortBy = params.sortBy, sortOrder = params.sortOrder;
                        offset = (page - 1) * limit;
                        whereConditions = 'WHERE rp.ativo = true';
                        queryParams = [];
                        paramIndex = 1;
                        if (filtros.categoria) {
                            whereConditions += " AND rp.categoria = $".concat(paramIndex);
                            queryParams.push(filtros.categoria);
                            paramIndex++;
                        }
                        if (filtros.search) {
                            whereConditions += " AND (\n        rp.nome_original ILIKE $".concat(paramIndex, " OR \n        rp.descricao ILIKE $").concat(paramIndex, " OR \n        EXISTS (\n          SELECT 1 FROM unnest(rp.tags) AS tag \n          WHERE tag ILIKE $").concat(paramIndex, "\n        )\n      )");
                            queryParams.push("%".concat(filtros.search, "%"));
                            paramIndex++;
                        }
                        if (filtros.tags) {
                            tagsArray = filtros.tags.split(',').map(function (tag) { return tag.trim(); });
                            whereConditions += " AND rp.tags && $".concat(paramIndex);
                            queryParams.push(tagsArray);
                            paramIndex++;
                        }
                        allowedSortFields = ['created_at', 'nome_original', 'tamanho_bytes', 'downloads', 'categoria'];
                        validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
                        validSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';
                        countQuery = "\n      SELECT COUNT(*) as total\n      FROM pinovara.repositorio_publico rp\n      ".concat(whereConditions, "\n    ");
                        return [4 /*yield*/, prisma.$queryRawUnsafe.apply(prisma, __spreadArray([countQuery], queryParams, false))];
                    case 1:
                        countResult = _a.sent();
                        total = convertBigInt(countResult[0].total);
                        dataQuery = "\n      SELECT\n        rp.id,\n        rp.nome_arquivo,\n        rp.nome_original,\n        rp.caminho_arquivo,\n        rp.tamanho_bytes,\n        rp.tipo_mime,\n        rp.extensao,\n        rp.descricao,\n        rp.categoria,\n        rp.tags,\n        rp.usuario_upload,\n        rp.usuario_upload_id,\n        rp.ativo,\n        rp.downloads,\n        to_char(rp.created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') as created_at,\n        to_char(rp.updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') as updated_at,\n        u.name as usuario_nome\n      FROM pinovara.repositorio_publico rp\n      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id\n      ".concat(whereConditions, "\n      ORDER BY rp.").concat(validSortBy, " ").concat(validSortOrder, "\n      LIMIT $").concat(paramIndex, " OFFSET $").concat(paramIndex + 1, "\n    ");
                        queryParams.push(limit, offset);
                        return [4 /*yield*/, prisma.$queryRawUnsafe.apply(prisma, __spreadArray([dataQuery], queryParams, false))];
                    case 2:
                        arquivos = _a.sent();
                        return [2 /*return*/, {
                                arquivos: convertBigInt(arquivos),
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: total,
                                    totalPages: Math.ceil(total / limit)
                                }
                            }];
                }
            });
        });
    },
    // Buscar arquivo por ID
    findById: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$queryRaw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      SELECT \n        rp.*,\n        u.name as usuario_nome\n      FROM pinovara.repositorio_publico rp\n      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id\n      WHERE rp.id = ", " AND rp.ativo = true\n    "], ["\n      SELECT \n        rp.*,\n        u.name as usuario_nome\n      FROM pinovara.repositorio_publico rp\n      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id\n      WHERE rp.id = ", " AND rp.ativo = true\n    "])), id)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0] || null];
                }
            });
        });
    },
    // Incrementar contador de downloads
    incrementDownloads: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$executeRaw(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n      UPDATE pinovara.repositorio_publico \n      SET downloads = downloads + 1 \n      WHERE id = ", "\n    "], ["\n      UPDATE pinovara.repositorio_publico \n      SET downloads = downloads + 1 \n      WHERE id = ", "\n    "])), id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    // Soft delete - marcar como inativo
    delete: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$executeRaw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      UPDATE pinovara.repositorio_publico \n      SET ativo = false \n      WHERE id = ", "\n    "], ["\n      UPDATE pinovara.repositorio_publico \n      SET ativo = false \n      WHERE id = ", "\n    "])), id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    // Obter estatísticas do repositório
    getEstatisticas: function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, categorias, arquivosRecentes, maisBaixados;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$queryRaw(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n      SELECT \n        COUNT(*)::int as total_arquivos,\n        COUNT(CASE WHEN ativo = true THEN 1 END)::int as arquivos_ativos,\n        COALESCE(SUM(tamanho_bytes), 0)::bigint as tamanho_total_bytes,\n        COALESCE(SUM(downloads), 0)::int as total_downloads,\n        COUNT(DISTINCT categoria)::int as total_categorias,\n        COUNT(DISTINCT usuario_upload_id)::int as total_usuarios\n      FROM pinovara.repositorio_publico\n    "], ["\n      SELECT \n        COUNT(*)::int as total_arquivos,\n        COUNT(CASE WHEN ativo = true THEN 1 END)::int as arquivos_ativos,\n        COALESCE(SUM(tamanho_bytes), 0)::bigint as tamanho_total_bytes,\n        COALESCE(SUM(downloads), 0)::int as total_downloads,\n        COUNT(DISTINCT categoria)::int as total_categorias,\n        COUNT(DISTINCT usuario_upload_id)::int as total_usuarios\n      FROM pinovara.repositorio_publico\n    "])))];
                    case 1:
                        stats = _a.sent();
                        return [4 /*yield*/, prisma.$queryRaw(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n      SELECT \n        categoria,\n        COUNT(*)::int as quantidade\n      FROM pinovara.repositorio_publico\n      WHERE ativo = true\n      GROUP BY categoria\n      ORDER BY quantidade DESC\n    "], ["\n      SELECT \n        categoria,\n        COUNT(*)::int as quantidade\n      FROM pinovara.repositorio_publico\n      WHERE ativo = true\n      GROUP BY categoria\n      ORDER BY quantidade DESC\n    "])))];
                    case 2:
                        categorias = _a.sent();
                        return [4 /*yield*/, prisma.$queryRaw(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n      SELECT \n        rp.nome_original,\n        rp.categoria,\n        rp.created_at,\n        u.name as usuario_nome\n      FROM pinovara.repositorio_publico rp\n      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id\n      WHERE rp.ativo = true\n      ORDER BY rp.created_at DESC\n      LIMIT 5\n    "], ["\n      SELECT \n        rp.nome_original,\n        rp.categoria,\n        rp.created_at,\n        u.name as usuario_nome\n      FROM pinovara.repositorio_publico rp\n      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id\n      WHERE rp.ativo = true\n      ORDER BY rp.created_at DESC\n      LIMIT 5\n    "])))];
                    case 3:
                        arquivosRecentes = _a.sent();
                        return [4 /*yield*/, prisma.$queryRaw(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n      SELECT \n        rp.nome_original,\n        rp.categoria,\n        rp.downloads,\n        u.name as usuario_nome\n      FROM pinovara.repositorio_publico rp\n      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id\n      WHERE rp.ativo = true\n      ORDER BY rp.downloads DESC\n      LIMIT 5\n    "], ["\n      SELECT \n        rp.nome_original,\n        rp.categoria,\n        rp.downloads,\n        u.name as usuario_nome\n      FROM pinovara.repositorio_publico rp\n      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id\n      WHERE rp.ativo = true\n      ORDER BY rp.downloads DESC\n      LIMIT 5\n    "])))];
                    case 4:
                        maisBaixados = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, stats[0]), { categorias: categorias, arquivosRecentes: arquivosRecentes, maisBaixados: maisBaixados })];
                }
            });
        });
    },
    // Obter categorias disponíveis
    getCategorias: function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$queryRaw(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n      SELECT DISTINCT categoria\n      FROM pinovara.repositorio_publico\n      WHERE ativo = true\n      ORDER BY categoria\n    "], ["\n      SELECT DISTINCT categoria\n      FROM pinovara.repositorio_publico\n      WHERE ativo = true\n      ORDER BY categoria\n    "])))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (row) { return row.categoria; })];
                }
            });
        });
    },
    // Obter tags mais usadas
    getTagsPopulares: function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var result;
            if (limit === void 0) { limit = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$queryRaw(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\n      SELECT \n        unnest(tags) as tag,\n        COUNT(*) as quantidade\n      FROM pinovara.repositorio_publico\n      WHERE ativo = true AND tags IS NOT NULL\n      GROUP BY unnest(tags)\n      ORDER BY quantidade DESC\n      LIMIT ", "\n    "], ["\n      SELECT \n        unnest(tags) as tag,\n        COUNT(*) as quantidade\n      FROM pinovara.repositorio_publico\n      WHERE ativo = true AND tags IS NOT NULL\n      GROUP BY unnest(tags)\n      ORDER BY quantidade DESC\n      LIMIT ", "\n    "])), limit)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12;
