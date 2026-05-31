const express = require('express');
const { body, param } = require('express-validator');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.get('/', getTasks);
router.get('/stats', getStats);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description').optional().isLength({ max: 2000 }).withMessage('Description too long'),
    body('stage').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid stage'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  ],
  createTask
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')
      .isLength({ max: 200 }).withMessage('Title too long'),
    body('description').optional().isLength({ max: 2000 }).withMessage('Description too long'),
    body('stage').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid stage'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
  ],
  updateTask
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID')],
  deleteTask
);

module.exports = router;
