import BoardModel from "../models/Board.model.js";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";

export async function saveBoard(req, res, next) {
  try {
    const { title, color } = req.body;
    const projectId = req.query.projectId;

    if (!projectId || !title) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newBoard = new BoardModel({
      projectId: projectId,
      title: title,
      color: color,
    });

    const savedBoard = await newBoard.save();

    return res.status(201).send({
      success: true,
      message: "Tableau créée avec succès",
      data: savedBoard,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function getBoards(req, res, next) {
  try {
    const projectId = req.query.projectId;

    if (!projectId) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const boards = await BoardModel.find({ projectId: projectId });

    if (!boards) {
      return res.status(404).send({
        success: false,
        message: "Aucun tableau n'a été trouvé pour ce projet",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tableaux trouvés",
      data: boards,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function updateBoard(req, res, next) {
  try {
    const { title, color } = req.body;

    if (!title && !color) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const updatedBoard = await BoardModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          title: title,
          color: color,
        },
      },
      { new: true, setDefaultsOnInsert: true }
    );

    if (!updatedBoard) {
      return res.status(404).send({
        success: false,
        message: "Impossible de modifier un tableau qui n'existe pas",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tableau modifié avec succès",
      data: updatedBoard,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function deleteBoard(req, res, next) {
  try {
    const deletedBoard = await BoardModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedBoard) {
      return res.status(404).send({
        success: false,
        message: "Impossible de supprimer un tableau qui n'existe pas",
      });
    }

    await TaskModel.deleteMany({ boardId: deletedBoard._id });

    return res.status(200).send({
      success: true,
      message: "Tableau supprimé avec succès",
      data: deletedBoard,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}
