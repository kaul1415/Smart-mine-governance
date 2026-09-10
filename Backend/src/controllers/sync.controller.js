const prisma = require('../config/db');

const syncItem = async (req, res) => {
  try {
    const { localId, type, payload } = req.body;
    let serverId = null;

    if (type === 'flag') {
      const count = await prisma.flag.count();
      const id = payload.id || `F-${1021 + count + 1}`;
      const created = await prisma.flag.create({
        data: {
          id,
          category: payload.category || 'Safety',
          mineId: payload.mineId || null,
          mineName: payload.mineName || 'Unknown Mine',
          location: payload.location || '',
          description: payload.description || '',
          severity: payload.severity || 'MEDIUM',
          status: payload.status || 'New',
          assignedAuthority: payload.assignedAuthority || 'Unassigned',
          reporterType: payload.reporterType || 'Field',
          isConfidential: !!payload.isConfidential,
          reporterName: payload.reporterName || req.user?.email || 'Field Reporter',
          evidenceCount: payload.evidenceCount || 0,
        },
      });
      serverId = created.id;
    } else if (type === 'observation') {
      serverId = `OBS-${Date.now()}`;
    } else if (type === 'attendance') {
      serverId = `ATT-${Date.now()}`;
    }

    return res.status(200).json({
      localId,
      status: 'Synced',
      serverId: serverId || `SRV-${Date.now()}`,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('syncItem error:', error);
    return res.status(500).json({ message: error.message || 'Error syncing item' });
  }
};

module.exports = {
  syncItem,
};
