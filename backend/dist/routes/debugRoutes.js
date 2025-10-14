"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/roles-debug/:email', async (req, res) => {
    try {
        const { email } = req.params;
        if (email !== 'olivanrabelo@gmail.com') {
            return res.status(403).json({
                error: 'Debug endpoint apenas para olivanrabelo@gmail.com'
            });
        }
        console.log('🔍 [DEBUG] Starting roles debug for:', email);
        const userSimple = await prisma.users.findUnique({
            where: { email: email.toLowerCase() }
        });
        console.log('👤 [DEBUG] User found:', !!userSimple, userSimple?.id);
        if (!userSimple) {
            return res.json({ error: 'User not found', email });
        }
        const userRoles = await prisma.user_roles.findMany({
            where: { userId: userSimple.id }
        });
        console.log('🎭 [DEBUG] User roles found:', userRoles.length);
        const userRolesWithData = await prisma.user_roles.findMany({
            where: { userId: userSimple.id },
            include: {
                roles: {
                    include: {
                        modules: true
                    }
                }
            }
        });
        console.log('🔗 [DEBUG] User roles with joins:', userRolesWithData.length);
        const userComplete = await prisma.users.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                user_roles: {
                    include: {
                        roles: {
                            include: {
                                modules: true
                            }
                        }
                    }
                }
            }
        });
        console.log('📊 [DEBUG] Complete query user_roles:', userComplete?.user_roles?.length || 0);
        const tableInfo = await prisma.$queryRaw `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_roles' AND table_schema = 'pinovara'
      ORDER BY ordinal_position;
    `;
        console.log('🏗️ [DEBUG] Table structure:', tableInfo);
        const debugInfo = {
            email,
            user: {
                found: !!userSimple,
                id: userSimple?.id,
                active: userSimple?.active
            },
            userRoles: {
                direct: userRoles,
                withJoins: userRolesWithData,
                fromCompleteQuery: userComplete?.user_roles || []
            },
            tableStructure: tableInfo,
            timestamp: new Date().toISOString()
        };
        console.log('🎯 [DEBUG] Full debug info:', JSON.stringify(debugInfo, null, 2));
        res.json(debugInfo);
    }
    catch (error) {
        console.error('❌ [DEBUG] Error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
});
exports.default = router;
//# sourceMappingURL=debugRoutes.js.map