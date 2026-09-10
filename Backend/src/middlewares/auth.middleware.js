const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/db');

/**
 * Middleware to verify JWT Access Token from Authorization Header (Bearer <token>)
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message: 'Access denied. Malformed token header.',
      });
    }

    const decoded = verifyAccessToken(token);

    // Verify user is still active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        department: true,
        contractorId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'User account not found or deactivated.',
      });
    }

    req.user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      contractorId: user.contractorId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Access token expired.',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      message: 'Invalid or malformed token.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * System Department carries organization-wide, admin-level access regardless of role.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized. Authentication required.',
      });
    }

    // System department has organization-wide admin access
    if (req.user.department === 'system' || req.user.role === 'corporate_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Requires one of roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
};
