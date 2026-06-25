import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
const router = Router();
const controller = new EmployeeController();
// All employee routes require authentication first, then resource authorization via Cerbos
router.get('/', authenticate, authorize('employee', 'list'), controller.list.bind(controller));
router.get('/:id', authenticate, authorize('employee', 'read'), controller.get.bind(controller));
router.post('/', authenticate, authorize('employee', 'create'), controller.create.bind(controller));
router.put('/:id', authenticate, authorize('employee', 'update'), controller.update.bind(controller));
router.delete('/:id', authenticate, authorize('employee', 'delete'), controller.delete.bind(controller));
export default router;
