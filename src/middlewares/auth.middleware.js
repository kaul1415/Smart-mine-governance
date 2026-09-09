const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/db');

// Default dev user when running in non-production and DB is empty or during prototype testing
const DEFAULT_DEV_USER = {
  id: 'usr-admin-01',
  email: 'admin@coalgov.gov.in',
  role: 'ADMIN',
};

/**
 * Middleware to verify JWT Access Token from Authorization Header (Bearer <token>)
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (
      !token ||
      token === 'undefined' ||
      token === 'null' ||
      token === '[object Object]' ||
      token.trim() === ''
    ) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.',
      });
    }

    const isDev = process.env.NODE_ENV !== 'production';

    // 1. Support mock/dev tokens during non-production development so stale browser tokens don't throw malformed errors
    if (
      isDev &&
      (token.startsWith('mock-token-') ||
        token.startsWith('mock-') ||
        token === 'dev-token' ||
        token.length < 30) // short non-JWT strings in dev
    ) {
      try {
        let devUser = null;
        try {
          devUser = await prisma.user.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
          });
        } catch {
          devUser = null;
        }

        const activeUser = devUser || DEFAULT_DEV_USER;
        req.user = {
          userId: activeUser.id,
          email: activeUser.email,
          role: activeUser.role,
        };
        return next();
      } catch (err) {
        req.user = {
          userId: DEFAULT_DEV_USER.id,
          email: DEFAULT_DEV_USER.email,
          role: DEFAULT_DEV_USER.role,
        };
        return next();
      }
    }

    // 2. Decode & verify JWT
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired.',
          code: 'TOKEN_EXPIRED',
        });
      }

      // In development mode, if a malformed/stale token is passed, recover with dev user instead of blocking UI
      if (isDev) {
        console.warn(`[Dev Auth] Token verification notice: ${jwtErr.message}. Falling back to active dev user.`);
        try {
          const devUser = await prisma.user.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
          });
          const activeUser = devUser || DEFAULT_DEV_USER;
          req.user = {
            userId: activeUser.id,
            email: activeUser.email,
            role: activeUser.role,
          };
          return next();
        } catch {
          req.user = {
            userId: DEFAULT_DEV_USER.id,
            email: DEFAULT_DEV_USER.email,
            role: DEFAULT_DEV_USER.role,
          };
          return next();
        }
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid or malformed token.',
      });
    }

    // 3. User verification against DB
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        if (isDev) {
          // In development, allow session using payload info even if user ID was reset in DB
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role || 'ADMIN',
          };
          return next();
        }

        return res.status(401).json({
          success: false,
          message: 'User account not found or deactivated.',
        });
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (dbError) {
      console.error('Database lookup error in verifyToken:', dbError.message);
      if (isDev) {
        // Fall back to decoded JWT claim in dev mode so temporary DB issues don't show invalid token errors
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role || 'ADMIN',
        };
        return next();
      }

      return res.status(500).json({
        success: false,
        message: 'Internal server error verifying user session.',
      });
    }
  } catch (error) {
    console.error('Unhandled error in verifyToken:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication processing error.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles Array of Role values permitted to access the endpoint
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
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
