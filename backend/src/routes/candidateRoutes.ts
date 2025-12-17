import { Router } from 'express';
import { addCandidateController, getCandidateByIdController } from '../presentation/controllers/candidateController';

const router = Router();

router.post('/', addCandidateController);

router.get('/:id', getCandidateByIdController);

export default router;
