const prisma = require('../config/db');
const { recordAuditLog } = require('../services/auditLogger');

const getCorrectiveActions = async (req, res) => {
  try {
    const { overdue, flagId, mineId } = req.query;
    const where = {};

    if (overdue === 'true') where.isOverdue = true;
    if (flagId) where.flagId = flagId;
    if (mineId) where.mineId = mineId;

    const actions = await prisma.correctiveAction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(actions);
  } catch (error) {
    console.error('getCorrectiveActions error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching corrective actions' });
  }
};

const getCorrectiveActionById = async (req, res) => {
  try {
    const { id } = req.params;
    const action = await prisma.correctiveAction.findUnique({
      where: { id },
    });

    if (!action) {
      return res.status(404).json({ message: 'Corrective action not found' });
    }

    return res.status(200).json(action);
  } catch (error) {
    console.error('getCorrectiveActionById error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching corrective action' });
  }
};

const createCorrectiveAction = async (req, res) => {
  try {
    const payload = req.body;
    const count = await prisma.correctiveAction.count();
    const id = payload.id || `CA-${1042 + count + 1}`;

    let mineName = payload.mineName;
    if (!mineName && payload.mineId) {
      const mine = await prisma.mine.findUnique({ where: { id: payload.mineId } });
      if (mine) mineName = mine.name;
    }

    const created = await prisma.correctiveAction.create({
      data: {
        id,
        flagId: payload.flagId || null,
        issue: payload.issue || '',
        recommendation: payload.recommendation || '',
        mineId: payload.mineId || null,
        mineName: mineName || 'Unknown Mine',
        assignedTo: payload.assignedTo || 'Unassigned',
        priority: payload.priority || 'MEDIUM',
        dueDate: payload.dueDate || null,
        status: payload.status || 'Open',
        isOverdue: !!payload.isOverdue,
        evidence: payload.evidence || [],
        comments: payload.comments || [],
      },
    });

    if (created.mineId) {
      await prisma.mine.update({
        where: { id: created.mineId },
        data: { openCorrectiveActions: { increment: 1 } },
      }).catch(() => {});
    }

    // Log audit trail for corrective action
    await recordAuditLog({
      user: req.user,
      actorType: 'user',
      action: 'Created corrective action',
      entity: created.id,
      entityId: created.flagId || created.mineId || created.id,
      metadata: { issue: created.issue, priority: created.priority, assignedTo: created.assignedTo },
    });

    // Also log on the flag ticket if linked
    if (created.flagId) {
      await recordAuditLog({
        user: req.user,
        actorType: 'user',
        action: `Created corrective action ${created.id}`,
        entity: created.flagId,
        entityId: created.id,
      });
    }

    return res.status(201).json(created);
  } catch (error) {
    console.error('createCorrectiveAction error:', error);
    return res.status(500).json({ message: error.message || 'Error creating corrective action' });
  }
};

const updateCorrectiveAction = async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body;

    const oldAction = await prisma.correctiveAction.findUnique({ where: { id } });

    const action = await prisma.correctiveAction.update({
      where: { id },
      data: patch,
    });

    // If status changed to Completed/Closed, decrement mine open count
    if (patch.status && ['Completed', 'Closed', 'Resolved'].includes(patch.status) && oldAction && !['Completed', 'Closed', 'Resolved'].includes(oldAction.status) && action.mineId) {
      await prisma.mine.update({
        where: { id: action.mineId },
        data: { openCorrectiveActions: { decrement: 1 } },
      }).catch(() => {});
    }

    let actionText = 'Updated corrective action';
    if (patch.status) actionText = `Updated status to ${patch.status}`;
    else if (patch.assignedTo) actionText = `Assigned corrective action to ${patch.assignedTo}`;
    else if (patch.priority) actionText = `Updated priority to ${patch.priority}`;

    await recordAuditLog({
      user: req.user,
      actorType: 'user',
      action: actionText,
      entity: id,
      entityId: action.flagId || action.mineId || id,
      metadata: patch,
    });

    return res.status(200).json(action);
  } catch (error) {
    console.error('updateCorrectiveAction error:', error);
    return res.status(500).json({ message: error.message || 'Error updating corrective action' });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = req.body;

    const action = await prisma.correctiveAction.findUnique({ where: { id } });
    if (!action) {
      return res.status(404).json({ message: 'Corrective action not found' });
    }

    const commentAuthor = comment.author || req.user?.name || req.user?.username || 'User';

    const newComment = {
      id: `c${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: commentAuthor,
      text: comment.text || '',
    };

    const existingComments = Array.isArray(action.comments) ? action.comments : [];
    const updatedComments = [...existingComments, newComment];

    await prisma.correctiveAction.update({
      where: { id },
      data: { comments: updatedComments },
    });

    await recordAuditLog({
      user: commentAuthor,
      actorType: 'user',
      action: 'Added comment',
      entity: id,
      entityId: action.flagId || action.mineId || id,
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({ message: error.message || 'Error adding comment' });
  }
};

module.exports = {
  getCorrectiveActions,
  getCorrectiveActionById,
  createCorrectiveAction,
  updateCorrectiveAction,
  addComment,
};
