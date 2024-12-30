import TaskModel from "../models/Task.model.js";

export async function saveTask(req, res, next) {
  try {
    const {boardId, } = req.body
    const newTask = new TaskModel({
projectId: req.query.projectId,
boardId: boardId.,
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
