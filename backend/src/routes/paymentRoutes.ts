import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';

const router = Router();

// Phase 12: Bill calculations & multi-mode split breakdown (Full, Own items, Equal, Custom)
router.get('/bill/:sessionId', paymentController.getBillSummary);

// Phase 13: DineFlow Pay Simulated Endpoints
router.post('/demo/create', paymentController.createDemoPayment);
router.post('/demo/confirm', paymentController.confirmDemoPayment);

// Phase 13: Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Phase 12: Official PDF Tax Invoice
router.get('/invoice/:sessionId', paymentController.downloadInvoicePdf);

// Backwards-compatible legacy route
router.post('/simulate', paymentController.simulatePayment);

export const paymentRoutes = router;
