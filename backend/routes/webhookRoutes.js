import express from "express";
import { dtdcTrackingWebhook } from "../controllers/orderController.js";

const router = express.Router();

// Public — DTDC's push-tracking system calls this directly (no user session).
// Authenticated via the ?token= shared secret instead of the usual JWT auth.
router.post("/dtdc/tracking", dtdcTrackingWebhook);

export default router;
