const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { validateTaskInput } = require("../utils/validators");
const taskService = require("../services/task.service");

/**
 * @route   GET /api/tasks?page=1&limit=10&search=&status=&priority=
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const { search, status, priority } = req.query;

  const result = await taskService.getTasksForUser(req.user._id, {
    page,
    limit,
    search,
    status,
    priority,
  });

  res.status(200).json({
    success: true,
    tasks: result.tasks,
    stats: result.stats,
    pagination: result.pagination,
  });
});

/**
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskByIdForUser(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: task });
});

/**
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const errors = validateTaskInput(req.body);
  if (errors.length) {
    throw new ApiError(400, errors.join(", "));
  }

  const task = await taskService.createTask(req.body, req.user._id);
  res.status(201).json({ success: true, message: "Task created", data: task });
});

/**
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  if (req.body.title !== undefined && !req.body.title.trim()) {
    throw new ApiError(400, "Title cannot be empty");
  }

  const task = await taskService.updateTask(req.params.id, req.body, req.user._id);
  res.status(200).json({ success: true, message: "Task updated", data: task });
});

/**
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: "Task deleted" });
});

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
