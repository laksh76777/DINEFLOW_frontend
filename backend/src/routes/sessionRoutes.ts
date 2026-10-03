import { Router } from 'express';
import { sessionController } from '../controllers/sessionController.js';

const router = Router();

// Customer joins or creates dining session with display name
router.post('/join', sessionController.joinTableSession);

// Get session details and active members
router.get('/:id', sessionController.getSessionDetails);

export default router;
