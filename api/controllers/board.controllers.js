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
    const { projectId } = req.query;

    if (!projectId) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const boards = await BoardModel.find({
      projectId: projectId,
    });

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

export async function addBoardToArchive(req, res, next) {
  try {
    const board = await BoardModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: { archived: true },
      },
      { new: true, setDefaultsOnInsert: true }
    );

    if (!board) {
      return res.status(404).send({
        success: false,
        message: "Impossible d'archiver un tableau qui n'existe pas",
      });
    }

    const tasks = await TaskModel.find({ boardId: board._id });

    if (tasks?.length >= 1) {
      const bulkOps = tasks.map((task) => ({
        updateOne: {
          filter: { _id: task },
          update: { $set: { archived: true } },
        },
      }));

      await TaskModel.bulkWrite(bulkOps);
    }

    return res.status(200).send({
      success: true,
      message: "Le tableau ainsi que ses tâches ont été archivées avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function removeBoardFromArchive(req, res, next) {
  try {
    const board = await BoardModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: { archived: false },
      },
      { new: true, setDefaultsOnInsert: true }
    );

    if (!board) {
      return res.status(404).send({
        success: false,
        message: "Impossible de restaurer un tableau qui n'existe pas",
      });
    }

    const tasks = await TaskModel.find({ boardId: board._id });

    if (tasks?.length >= 1) {
      const bulkOps = tasks.map((task) => ({
        updateOne: {
          filter: { _id: task },
          update: { $set: { archived: false } },
        },
      }));

      await TaskModel.bulkWrite(bulkOps);
    }

    return res.status(200).send({
      success: true,
      message: "Le tableau ainsi que ses tâches ont été restaurés avec succès",
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Une erreur inattendue est survenue",
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
