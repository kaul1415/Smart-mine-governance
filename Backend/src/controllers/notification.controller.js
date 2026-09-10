const prisma = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const { sort, limit, read } = req.query;
    const where = {};
    if (read !== undefined) {
      where.read = read === 'true';
    }

    let orderBy = { timestamp: 'desc' };
    if (sort) {
      if (sort.startsWith('-')) {
        orderBy = { [sort.substring(1)]: 'desc' };
      } else {
        orderBy = { [sort]: 'asc' };
      }
    }

    const take = limit ? parseInt(limit, 10) : undefined;

    const notifs = await prisma.notification.findMany({
      where,
      orderBy,
      take,
    });

    return res.status(200).json(notifs);
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return res.status(200).json(updated);
  } catch (error) {
    console.error('markAsRead error:', error);
    return res.status(500).json({ message: error.message || 'Error updating notification' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      data: { read: true },
    });
    return res.status(204).send();
  } catch (error) {
    console.error('markAllAsRead error:', error);
    return res.status(500).json({ message: error.message || 'Error marking all notifications as read' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
