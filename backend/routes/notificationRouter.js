// backend/routes/notificationRouter.js

import express from 'express';
import authUser from '../middlewares/authUser.js';
import notificationModel from '../models/notificationModel.js';

const router = express.Router();

// GET notifications for logged-in user
router.get('/', authUser, async (req, res) => {
  try {
    const notifications = await notificationModel.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
});

// DELETE a notification by ID for logged-in user
router.delete('/:id', authUser, async (req, res) => {
  try {
    const notificationId = req.params.id;
    // Make sure the notification belongs to the logged-in user
    const notification = await notificationModel.findOne({ _id: notificationId, userId: req.userId });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    await notificationModel.findByIdAndDelete(notificationId);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
