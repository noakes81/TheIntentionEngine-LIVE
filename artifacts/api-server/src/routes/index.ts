import { Router, type IRouter } from "express";
import healthRouter from "./health";
import licensesRouter from "./licenses";
import authRouter from "./auth";
import adminRouter from "./admin";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(licensesRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(seedRouter);

export default router;
