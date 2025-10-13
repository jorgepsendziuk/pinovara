"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractEmailFromCreatorUri = extractEmailFromCreatorUri;
exports.isValidCreatorUri = isValidCreatorUri;
function extractEmailFromCreatorUri(creatorUri) {
    if (!creatorUri) {
        return null;
    }
    const match = creatorUri.match(/uid:([^|]+)\|/);
    if (!match || !match[1]) {
        return null;
    }
    return match[1].trim().toLowerCase();
}
function isValidCreatorUri(creatorUri) {
    if (!creatorUri) {
        return false;
    }
    return /^uid:.+\|\d{4}-\d{2}-\d{2}T/.test(creatorUri);
}
//# sourceMappingURL=odkHelper.js.map