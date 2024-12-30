import BoardModel from "../models/Board.model";

export async function saveBoard(req, res, next) {
  try {
    const { title, color } = req.body;

    if (!title) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newBoard = new BoardModel({
      title: title,
      color: color,
    });

    await newBoard.save();
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
