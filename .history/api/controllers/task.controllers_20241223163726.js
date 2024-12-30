import TaskModel from "../models/Task.model.js";

export async function saveTask(req, res, next) {
  try {
    const { boardId, text } = req.body;

    const newTask = new TaskModel({
      projectId: req.query.projectId,
      boardId: boardId,
      text: text,
    });

    await newTask.save();
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
