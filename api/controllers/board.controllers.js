import BoardModel from "../models/Board.model.js";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";

export async function saveBoard(req, res, next) {
  try {
    const { title } = req.body;
    const projectId = req.query.projectId;

    if (!projectId || !title) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const newBoard = new BoardModel({
      projectId: projectId,
      title: title,
    });

    const savedBoard = await newBoard.save();

    const randomIndex = Math.floor(Math.random() * savedBoard?.colors.length);
    const randomColor = savedBoard?.colors[randomIndex];

    await BoardModel.findByIdAndUpdate(
      { _id: savedBoard._id },
      {
        $set: {
          color: randomColor,
        },
      },
      {
        new: true,
        setDefaultsOnInsert: true,
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

export async function getBoards(req, res, next) {
  try {
    const projectId = req.query.projectId;

    if (!projectId) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const boards = await BoardModel.find({ projectId: projectId });

    const boardsWithTasks = await Promise.all(
      boards.map(async (board) => {
        const tasks = await TaskModel.find({ boardId: board._id })
          .sort({ order: "asc" })
          .populate({
            path: "responsibles",
            select: "-password -role", // Exclure le champ `password` des responsibles
          })
          .populate({
            path: "author",
            select: "-password -role", // Exclure le champ `password` des responsibles
          })
          .populate({
            path: "description.author", // Accès à l'auteur de la description
            select: "-password -role", // Exclure les champs sensibles
          })
          .populate({
            path: "timeTracking.sessions.userId", // Accès à userId dans sessions
            select: "-password -role", // Exclure les champs sensibles
          })
          .exec();
        return { ...board.toObject(), tasks: tasks };
      })
    );

    if (!boards) {
      return res.status(404).send({
        success: false,
        message: "Aucun tableau n'a été trouvé pour ce projet",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Tableaux trouvés",
      data: boardsWithTasks,
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
