// routes/tasks.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { studentOnly, allRoles, checkProjectAccess } = require('../middleware/roles');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskHistory
} = require('../controllers/taskController');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(studentOnly, createTask)
  .get(allRoles, getTasks);

router.route('/:id')
  .get(allRoles, getTask)
  .put(studentOnly, updateTask)
  .delete(studentOnly, deleteTask);

router.put('/:id/status', studentOnly, updateTaskStatus);
router.get('/:id/history', allRoles, getTaskHistory);

module.exports = router;

