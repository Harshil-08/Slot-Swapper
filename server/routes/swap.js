import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  getSwappableSlots,
  createSwapRequest,
  respondToSwapRequest,
  getMySwapRequests,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/swap.js';

const router = express.Router();

router.use(auth);

router.get('/swappable-slots', getSwappableSlots);
router.post('/request', createSwapRequest);
router.post('/response/:requestId', respondToSwapRequest);
router.get('/my-requests', getMySwapRequests);

router.get('/notifications', getMyNotifications);
router.patch('/notifications/:notificationId/read', markNotificationRead);
router.patch('/notifications/read-all', markAllNotificationsRead);

export default router;
