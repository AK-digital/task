import TaskModel from "../models/Task.model.js";

export async function saveTask(req, res, next) {
  try {
    const projectId = req.query.projectId;
    const { boardId, text } = req.body;

    const newTask = new TaskModel({
      projectId: projectId,
      boardId: boardId,
      text: text,
    });

    const savedTask = await newTask.save();
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
