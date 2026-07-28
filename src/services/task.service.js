const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

/**
 * Returns all tasks belonging to the given user, newest first.
 */
const getTasksForUser = async (userId) => {
  return Task.find({ user: userId }).sort({ createdAt: -1 });
};

/**
 * Returns a single task, but only if it belongs to the given user.
 * Throws 404 if missing, 403 if it exists but belongs to someone else.
 */
const getTaskByIdForUser = async (taskId, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.user.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized to access this task");
  }

  return task;
};

const createTask = async ({ title, description, status, priority, dueDate }, userId) => {
  return Task.create({ title, description, status, priority, dueDate, user: userId });
};

const updateTask = async (taskId, updates, userId) => {
  const task = await getTaskByIdForUser(taskId, userId);

  const allowed = ["title", "description", "status", "priority", "dueDate"];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      task[key] = updates[key];
    }
  }

  await task.save();
  return task;
};

const deleteTask = async (taskId, userId) => {
  const task = await getTaskByIdForUser(taskId, userId); // enforces ownership
  await task.deleteOne();
};

module.exports = {
  getTasksForUser,
  getTaskByIdForUser,
  createTask,
  updateTask,
  deleteTask,
};
