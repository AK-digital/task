import BoardModel from "../models/Board.model.js";
import ProjectModel from "../models/Project.model.js";

export async function saveBoard(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { title, color } = req.body;
    const projectId = req.query.projectId;

    if (!projectId || !title) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const project = await ProjectModel.findOne({
      _id: projectId,
    });

    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Impossible d'ajouter un tableau à un projet qui n'existe pas",
      });
    }

    const newBoard = new BoardModel({
      projectId: projectId,
      title: title,
      color: color,
    });

    const savedBoard = await newBoard.save();

    await ProjectModel.findOneAndUpdate(
      {
        _id: projectId,
        // Only author or guests can creates a board for a project
        $or: [{ author: authUser?._id }, { guests: authUser?._id }],
      },
      {
        $addToSet: {
          boards: savedBoard._id,
        },
      }
    );

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

export async function getBoard(req, res, next) {}

export async function getBoards(req, res, next) {}

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
      }
    );
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function deleteBoard(req, res, next) {
  try {
    const board = await BoardModel.findById({ _id: req.params.id });

    if (!board) {
      return res.status(404).send({
        success: false,
        message: "Impossible de supprimer un tableau qui n'existe pas",
      });
    }

    await ProjectModel.findByIdAndUpdate(
      {
        _id: board.projectId,
      },
      {
        $unset: {
          boards: board._id,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const deletedBoard = await BoardModel.findByIdAndDelete({
      _id: req.params.id,
    });

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
