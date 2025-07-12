import notificationModel from '../models/notificationModel.js';

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await notificationModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
