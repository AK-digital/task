import BoardModel from "../models/Board.model";
import ProjectModel from "../models/Project.model";

export async function saveBoard(req, res, next) {
  try {
    const authUser = res.locals.user;
    const { projectId, title, color } = req.body;

    if (!projectId || !title) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newBoard = new BoardModel({
      title: title,
      color: color,
    });

    const savedBoard = await newBoard.save();

    await ProjectModel.findOneAndUpdate({
      _id: projectId,
      $or: [{ author: authUser?._id }],
    });

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

export async function updateBoard(req, res, next) {}

export async function deleteBoard(req, res, next) {}
