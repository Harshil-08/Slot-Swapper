import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  createEvent,
  getMyEvents,
  updateEvent,
  deleteEvent,
  updateEventStatus,
} from '../controllers/event.js';

const router = express.Router();

router.use(auth);

router.post('/', createEvent);
router.get('/my-events', getMyEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.patch('/:id/status', updateEventStatus);

export default router;
