import TaskModel from "../models/Task.model.js";

export async function saveTask(req, res, next) {
  try {
    const projectId = req.query.projectId;
    const { boardId, text } = req.body;

    if (!boardId || !text) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const newTask = new TaskModel({
      projectId: projectId,
      boardId: boardId,
      text: text,
    });

    const savedTask = await newTask.save();

    return res.status(201).send({
      success: true,
      message: "Tâche créée avec succès",
      data: savedTask,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function getTasks(req, res, next) {
  try {
    const boardId = req.query.boardId;
    const tasks = await TaskModel.find({ boardId: boardId });

    if (!tasks) {
      return res.status(404).send({
        success: false,
        message: "Aucune tâche trouvé dans ce tableau",
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
