import BoardModel from "../models/Board.model.js";
import ProjectModel from "../models/Project.model.js";
import TaskModel from "../models/Task.model.js";
import MessageModel from "../models/Message.model.js";

export async function saveBoard(req, res, next) {
  try {
    const { title } = req.body;
    const projectId = req.query.projectId;

    if (!projectId || !title) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const boards = await BoardModel.find({
      projectId: projectId,
    });

    const hasBoards = boards?.length >= 1;

    const newBoard = new BoardModel({
      projectId: projectId,
      title: title,
      order: hasBoards ? boards.length + 1 : 1,
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
    const { projectId, archived } = req.query;

    if (!projectId) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    let boards;

    if (archived === "true") {
      boards = await BoardModel.find({
        projectId: projectId,
      });
    } else {
      boards = await BoardModel.find({
        projectId: projectId,
        archived: false,
      }).sort({ order: "asc" });
    }

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

    if (title.length <= 0) {
      return res.status(400).send({
        success: false,
        message: "Le titre du tableau ne peut pas être vide",
      });
    }

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

export async function updateBoardOrder(req, res, next) {
  try {
    const { boards } = req.body;

    if (boards?.length < 1) {
      return res
        .status(400)
        .send({ success: false, message: "Paramètres manquants" });
    }

    const bulkOps = boards.map((board) => ({
      updateOne: {
        filter: { _id: board._id },
        update: { $set: { order: board.order } },
      },
    }));

    const updatedBoards = await BoardModel.bulkWrite(bulkOps);

    return res.status(200).send({
      success: true,
      message: "Ordre des tableaux mis à jour avec succès",
      data: updatedBoards,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err?.message || "Une erreur inattendue est survenue",
    });
  }
}

export async function duplicateBoard(req, res, next) {
  try {
    const boardId = req.params.id;
    const projectId = req.query.projectId;

    if (!boardId || !projectId) {
      return res.status(400).send({
        success: false,
        message: "Paramètres manquants",
      });
    }

    // Récupérer le tableau original avec ses tâches
    const originalBoard = await BoardModel.findById(boardId);
    if (!originalBoard) {
      return res.status(404).send({
        success: false,
        message: "Tableau non trouvé",
      });
    }

    // Récupérer toutes les tâches du tableau original
    const originalTasks = await TaskModel.find({ boardId: boardId });

    // Créer le nouveau tableau
    const boards = await BoardModel.find({ projectId: projectId });
    const newBoard = new BoardModel({
      projectId: projectId,
      title: `${originalBoard.title} (copie)`,
      order: boards.length + 1,
      color: originalBoard.color,
    });

    const savedBoard = await newBoard.save();

    // Dupliquer toutes les tâches
    const taskPromises = originalTasks.map(async (originalTask) => {
      const newTask = new TaskModel({
        text: originalTask.text,
        description: originalTask.description,
        boardId: savedBoard._id,
        projectId: projectId,
        order: originalTask.order,
        // Ne pas copier les assignés, deadlines, etc. pour éviter la confusion
        // priority: originalTask.priority,
        // status: originalTask.status,
        // responsibles: originalTask.responsibles,
        // deadline: originalTask.deadline,
      });
      return await newTask.save();
    });

    const savedTasks = await Promise.all(taskPromises);

    // Récupérer le tableau dupliqué (pas besoin de populate car tasks n'est pas dans le schéma)
    const duplicatedBoard = await BoardModel.findById(savedBoard._id);

    return res.status(201).send({
      success: true,
      message: "Tableau dupliqué avec succès",
      data: duplicatedBoard,
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

    const tasks = await TaskModel.find({ boardId: deletedBoard._id });

    if (tasks?.length >= 1) {
      tasks.forEach(async (task) => {
        await TaskModel.findOneAndDelete({ _id: task._id });
        await MessageModel.findOneAndDelete({ taskId: task._id });
      });
    }

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
