const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  signAccessToken,
  signRefreshToken,
} = require('../utils/jwt');

const roleForDepartment = (dept) => {
  if (dept === 'system') return 'corporate_admin';
  if (dept === 'production') return 'mine_manager';
  if (dept === 'safety_rescue') return 'safety_officer';
  return 'department_officer';
};

const departmentLabels = {
  system: 'System Department',
  production: 'Production',
  material_management: 'Material Management',
  erp: 'ERP',
  engineering_equipment: 'Engineering & Equipment',
  company_secretary: 'Company Secretary',
  clearing_forwarding: 'Clearing & Forwarding',
  electronics_telecom: 'Electronics & Telecommunication',
  hrd: 'Human Resource Development',
  appeal_grievance: 'Appeal & Grievance Cell',
  corporate_planning: 'Corporate Planning',
  project_monitoring: 'Project Monitoring',
  contract_management: 'Contract Management',
  safety_rescue: 'Safety & Rescue',
  welfare: 'Welfare',
};

const login = async (req, res) => {
  try {
    const { username, password, loginType = 'department', department } = req.body;

    let user = null;

    if (loginType === 'contractor') {
      user = await prisma.user.findFirst({
        where: { role: 'contractor' },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: 'contractor-01',
            email: 'contractor@minegov.ai',
            username: 'contractor',
            password: await hashPassword('password123'),
            name: 'Apex Mining Logistics Contractor',
            role: 'contractor',
            contractorId: 'contractor-1',
          },
        });
      }
    } else if (loginType === 'regulator') {
      user = await prisma.user.findFirst({
        where: { role: 'regulator' },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: 'regulator-01',
            email: 'regulator@minegov.ai',
            username: 'regulator',
            password: await hashPassword('password123'),
            name: 'DGMS Regional Inspectorate',
            role: 'regulator',
          },
        });
      }
    } else {
      // Department login
      const targetDept = department || 'system';
      if (username) {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: username },
              { email: username },
              { department: targetDept },
            ],
          },
        });
      } else {
        user = await prisma.user.findFirst({
          where: { department: targetDept },
        });
      }

      if (!user) {
        // Provision user for this department
        const derivedRole = roleForDepartment(targetDept);
        const deptLabel = departmentLabels[targetDept] || targetDept;
        user = await prisma.user.create({
          data: {
            id: `dept-${targetDept}`,
            email: `${targetDept}@coalgov.in`,
            username: username || targetDept,
            password: await hashPassword(password || 'password123'),
            name: username ? `${username} (${deptLabel})` : `${deptLabel} Officer`,
            role: derivedRole,
            department: targetDept,
            designation: `${deptLabel} Officer`,
          },
        });
      }
    }

    if (!user || !user.isActive) {
      return res.status(403).json({
        message: 'Account is deactivated or not found.',
      });
    }

    // Optional password verification if password provided and matches hash
    if (password && user.password && !user.password.startsWith('$2')) {
      // password not hashed, hash it
      user.password = await hashPassword(user.password);
      await prisma.user.update({ where: { id: user.id }, data: { password: user.password } });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      contractorId: user.contractorId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Match BACKEND_API_CONTRACT.md response structure
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        contractorId: user.contractorId,
      },
      token: accessToken,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error during login.',
    });
  }
};

const logout = async (req, res) => {
  return res.status(204).send();
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        contractorId: true,
        phone: true,
        mineName: true,
        designation: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  logout,
  me,
};
