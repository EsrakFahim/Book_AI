import { Router } from 'express';
import writer from '../../controllers/Writer/writer.controller.js';

const router = Router();


router.get("/", writer); // SSE route


export default router;
