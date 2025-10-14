"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', authController_1.authController.login.bind(authController_1.authController));
router.post('/register', authController_1.authController.register.bind(authController_1.authController));
router.get('/verify', authController_1.authController.verify.bind(authController_1.authController));
router.get('/me', auth_1.authenticateToken, authController_1.authController.me.bind(authController_1.authController));
router.put('/profile', auth_1.authenticateToken, authController_1.authController.updateProfile.bind(authController_1.authController));
router.post('/logout', auth_1.authenticateToken, authController_1.authController.logout.bind(authController_1.authController));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map