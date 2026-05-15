import { Router, type IRouter } from "express";
import healthRouter from "./health";
import licensesRouter from "./licenses";
import authRouter from "./auth";
import adminRouter from "./admin";
import userDataRouter from "./user-data";

const router: IRouter = Router();

router.use(healthRouter);
router.use(licensesRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(userDataRouter);

export default router;
