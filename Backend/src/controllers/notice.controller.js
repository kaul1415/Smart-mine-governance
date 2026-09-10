const prisma = require('../config/db');

const getNotices = async (req, res) => {
  try {
    const userDept = req.user?.department;
    const isSystemAdmin = req.user?.department === 'system' || req.user?.role === 'corporate_admin';

    const allNotices = await prisma.notice.findMany({
      orderBy: { publishedDate: 'desc' },
    });

    const filtered = allNotices.filter((notice) => {
      if (isSystemAdmin) return true;
      if (notice.visibility === 'All Departments' || !Array.isArray(notice.visibility)) return true;
      if (!userDept) return false;
      return notice.visibility.includes(userDept);
    });

    return res.status(200).json(filtered);
  } catch (error) {
    console.error('getNotices error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching notices' });
  }
};

module.exports = {
  getNotices,
};
