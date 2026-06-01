const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const { createError } = require('../middleware/errorHandler');
const mongoose = require('mongoose');


const getTasks = async (req, res, next) => {
  try {
    const { stage, priority, search } = req.query;
    const filter = { user: req.user._id };

    if (stage) filter.stage = stage;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 });

    const grouped = {
      todo: [],
      in_progress: [],
      done: [],
    };
    tasks.forEach((t) => grouped[t.stage].push(t));

    res.json({ tasks, grouped });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, description, stage, priority, dueDate } = req.body;

    // Set order to end of stage
    const lastTask = await Task.findOne({ user: req.user._id, stage: stage || 'todo' })
      .sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      stage: stage || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      user: req.user._id,
      order,
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return next(createError('Task not found.', 404));

    const allowed = ['title', 'description', 'stage', 'priority', 'dueDate', 'order'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return next(createError('Task not found.', 404));
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]);

    const result = { todo: 0, in_progress: 0, done: 0, total: 0 };
    stats.forEach(({ _id, count }) => {
      result[_id] = count;
      result.total += count;
    });

    res.json({ stats: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getStats };
