const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

let notifications = [];

router.use(authMiddleware);

router.get('/', (req, res) => {
  const userNotifs = notifications
    .filter(n => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ data: userNotifs });
});

router.put('/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (notif) {
    notif.read = true;
  }
  res.json({ data: { success: true } });
});

router.put('/read-all', (req, res) => {
  notifications.forEach(n => {
    if (n.userId === req.user.id) n.read = true;
  });
  res.json({ data: { success: true } });
});

router.delete('/:id', (req, res) => {
  const index = notifications.findIndex(n => n.id === req.params.id && n.userId === req.user.id);
  if (index !== -1) {
    notifications.splice(index, 1);
  }
  res.json({ data: { success: true } });
});

const createNotification = (userId, data) => {
  const notif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ...data,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(notif);
  return notif;
};

module.exports = router;
module.exports.createNotification = createNotification;