"use strict";
/**
 * Utilitários para processar dados do ODK Collect
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractEmailFromCreatorUri = extractEmailFromCreatorUri;
exports.isValidCreatorUri = isValidCreatorUri;
/**
 * Extrai o email do campo _creator_uri_user do ODK
 *
 * Formato esperado: "uid:email@gmail.com|2025-09-25T17:29:50.601+0000"
 *
 * @param creatorUri - String do campo _creator_uri_user
 * @returns Email extraído em lowercase ou null se não encontrado
 *
 * @example
 * extractEmailFromCreatorUri("uid:gabigomesnas@gmail.com|2025-09-25T17:29:50.601+0000")
 * // Retorna: "gabigomesnas@gmail.com"
 *
 * extractEmailFromCreatorUri("uid:teste|2025-09-16T16:55:05.092+0000")
 * // Retorna: "teste"
 */
function extractEmailFromCreatorUri(creatorUri) {
    if (!creatorUri) {
        return null;
    }
    // Regex para capturar o valor entre "uid:" e "|"
    const match = creatorUri.match(/uid:([^|]+)\|/);
    if (!match || !match[1]) {
        return null;
    }
    return match[1].trim().toLowerCase();
}
/**
 * Valida se o formato do _creator_uri_user é válido
 *
 * @param creatorUri - String do campo _creator_uri_user
 * @returns true se o formato é válido
 */
function isValidCreatorUri(creatorUri) {
    if (!creatorUri) {
        return false;
    }
    return /^uid:.+\|\d{4}-\d{2}-\d{2}T/.test(creatorUri);
}
