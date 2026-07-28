const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

/**
 * Returns paginated tasks belonging to the given user with optional filters.
 */
const getTasksForUser = async (userId, { page = 1, limit = 10, search, status, priority } = {}) => {
  const filter = { user: userId };

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }
  if (status) {
    filter.status = status;
  }
  if (priority) {
    filter.priority = priority;
  }

  const skip = (page - 1) * limit;
  const totalItems = await Task.countDocuments(filter);
  const tasks = await Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  const stats = await Task.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        todo: { $sum: { $cond: [{ $eq: ["$status", "To Do"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "Done"] },
                  { $ne: ["$dueDate", null] },
                  { $lt: ["$dueDate", new Date()] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    tasks,
    stats: stats[0] || { todo: 0, inProgress: 0, done: 0, overdue: 0 },
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPreviousPage: page > 1,
    },
  };
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
