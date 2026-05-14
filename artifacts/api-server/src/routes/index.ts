import { Router, type IRouter } from "express";
import healthRouter from "./health";
import licensesRouter from "./licenses";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(licensesRouter);
router.use(authRouter);

export default router;
