import BoardModel from "../models/Board.model.js";
import BoardTemplateModel from "../models/BoardTemplate.model.js";
import TaskModel from "../models/Task.model.js";
import StatusModel from "../models/Status.model.js";
import PriorityModel from "../models/Priority.model.js";

export async function getBoardsTemplates(req, res, next) {
  try {
    const boardTemplates = await BoardTemplateModel.find();

    if (boardTemplates.length <= 0) {
      return res.status(404).send({
        success: false,
        message: "Aucun modèle trouvé",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Modèles récupérés avec succès",
      data: boardTemplates,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la récupération des modèles",
    });
  }
}

export async function saveBoardTemplate(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { name, boardId } = req.body;

    // Check if the required fields are provided
    if (!boardId || !name) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    const board = await BoardModel.findById({ _id: boardId });

    if (!board) {
      return res.status(404).send({
        success: false,
        message: "Impossible de créer le modèle d'un tableau qui n'existe pas",
      });
    }

    const newTemplate = new BoardTemplateModel({
      name: name,
      author: authUser?._id,
      boardId: boardId,
    });

    const savedTemplate = await newTemplate.save();

    return res.status(201).send({
      success: true,
      message: "Modèle de tableau enregistré avec succès",
      data: savedTemplate,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de l'enregistrement du modèle",
    });
  }
}

export async function useBoardTemplate(req, res, next) {
  try {
    const authUser = res.locals.user;

    const template = await BoardTemplateModel.findById({ _id: req.params.id })
      .populate("boardId")
      .exec();

    if (!template) {
      return res.status(404).send({
        success: false,
        message: "Modèle non trouvé",
      });
    }

    const newBoard = new BoardModel({
      projectId: req.query.projectId,
      title: template?.name,
      color: template?.boardId?.color,
    });

    const savedBoard = await newBoard.save();

    const status = await StatusModel.findOne({
      projectId: req.query.projectId,
      status: "waiting",
    });

    const priority = await PriorityModel.findOne({
      projectId: req.query.projectId,
      priority: "medium",
    });

    const tasks = await TaskModel.find({
      boardId: template?.boardId?._id,
    });

    if (tasks.length > 0) {
      tasks.forEach(async (task) => {
        const newTask = new TaskModel({
          projectId: req.query.projectId,
          boardId: savedBoard?._id,
          author: authUser?._id,
          text: task?.text,
          status: status?._id,
          priority: priority?._id,
        });

        await newTask.save();
      });
    }

    return res.status(201).send({
      success: true,
      message: "Modèle utilisé avec succès",
      data: savedBoard,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de l'enregistrement du modèle",
    });
  }
}

export async function deleteBoardTemplate(req, res, next) {
  try {
    const deletedTemplate = await BoardTemplateModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedTemplate) {
      return res.status(404).send({
        success: false,
        message: "Modèle non trouvé",
      });
    }

    await TaskModel.deleteMany({ boardId: deletedTemplate._id });

    return res.status(200).send({
      success: true,
      message: "Modèle supprimé avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message:
        err?.message ||
        "Une erreur s'est produite lors de la suppression du modèle",
    });
  }
}
