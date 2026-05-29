import { Router } from "express";
import { stripeController } from "../controllers/stripeController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/create-checkout-session", authMiddleware, stripeController.createCheckoutSession);
router.post("/sync-checkout-session", authMiddleware, stripeController.syncCheckoutSession);
router.post("/create-portal-session", authMiddleware, stripeController.createPortalSession);
router.get("/subscription", authMiddleware, stripeController.getSubscription);
router.get("/payment-methods", authMiddleware, stripeController.getPaymentMethods);
router.get("/billing-history", authMiddleware, stripeController.getBillingHistory);
router.post("/update-payment-method", authMiddleware, stripeController.updatePaymentMethod);

export default router;
